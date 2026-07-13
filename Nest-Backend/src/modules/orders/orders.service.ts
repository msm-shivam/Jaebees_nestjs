import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike } from 'typeorm';
import { plainToInstance } from 'class-transformer';
import { Order, OrderStatus } from './entities/order.entity';
import { OrderItem } from './entities/order-item.entity';
import { User } from '../users/entities/user.entity';
import { NotificationsService } from '../notifications/notifications.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { CancelOrderDto } from './dto/cancel-order.dto';
import {
  OrderResponseDto,
  OrderItemResponseDto,
} from './dto/order-response.dto';
import { OrderListQueryDto } from './dto/order-list-query.dto';
import { Cart } from '../cart/entities/cart.entity';
import { CartItem } from '../cart/entities/cart-item.entity';
import { Inventory } from '../inventory/entities/inventory.entity';
import { ProductVariant } from '../product-variants/entities/product-variant.entity';
import { StockAlert } from '../inventory-plus/entities/stock-alert.entity';
import { AddressesService } from '../addresses/addresses.service';
import { WarehousesService } from '../warehouses/warehouses.service';
import { DeliverySettingsService } from '../delivery-settings/delivery-settings.service';
import { DeliveryChargesService } from '../delivery-charges/delivery-charges.service';
import { ShipmentsService } from '../shipments/shipments.service';
import { paginate } from '../../common/utils/pagination.util';
import { AuditLogService } from '../security-compliance/services/audit-log.service';
import { FirebaseService } from '../firebase/firebase.service';
import { FcmUserType } from '../firebase/entities/fcm-token.entity';
import { AdminNotificationService } from '../notifications/admin-notification.service';
import { AdminNotificationType } from '../notifications/entities/admin-notification.entity';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order)
    private readonly orderRepo: Repository<Order>,
    @InjectRepository(OrderItem)
    private readonly orderItemRepo: Repository<OrderItem>,
    @InjectRepository(Cart)
    private readonly cartRepo: Repository<Cart>,
    @InjectRepository(CartItem)
    private readonly cartItemRepo: Repository<CartItem>,
    @InjectRepository(Inventory)
    private readonly inventoryRepo: Repository<Inventory>,
    @InjectRepository(ProductVariant)
    private readonly variantRepo: Repository<ProductVariant>,
    @InjectRepository(StockAlert)
    private readonly alertRepo: Repository<StockAlert>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    private readonly addressesService: AddressesService,
    private readonly warehousesService: WarehousesService,
    private readonly deliverySettingsService: DeliverySettingsService,
    private readonly deliveryChargesService: DeliveryChargesService,
    private readonly shipmentsService: ShipmentsService,
    private readonly notificationsService: NotificationsService,
    private readonly auditLogService: AuditLogService,
    private readonly firebaseService: FirebaseService,
    private readonly adminNotificationService: AdminNotificationService,
  ) { }

  async createOrder(
    userId: string,
    dto: CreateOrderDto,
  ): Promise<{ message: string; data: OrderResponseDto }> {
    if (!userId) {
      throw new BadRequestException('User ID is missing or invalid.');
    }
    const cart = await this.cartRepo.findOne({
      where: { userId },
      relations: { items: true },
    });
    if (!cart) throw new BadRequestException('Cart not found.');
    if (!cart.items || cart.items.length === 0) {
      throw new BadRequestException('Cart is empty.');
    }

    const address = await this.addressesService.findById(dto.shippingAddressId);
    if (address.userId !== userId) {
      throw new BadRequestException('Address does not belong to user.');
    }

    for (const cartItem of cart.items) {
      const variant = await this.variantRepo.findOne({
        where: { id: cartItem.variantId },
      });
      if (!variant) {
        throw new BadRequestException(
          `Variant ${cartItem.variantId} not found.`,
        );
      }

      const inventory = await this.inventoryRepo.findOne({
        where: { variantId: cartItem.variantId },
      });
      if (!inventory) {
        throw new BadRequestException(
          `Inventory missing for variant ${cartItem.variantId}.`,
        );
      }
      if (cartItem.quantity > inventory.availableQuantity) {
        throw new BadRequestException(
          `Insufficient stock for variant ${cartItem.variantId}.`,
        );
      }
    }

    const warehouse = await this.warehousesService.findNearest(
      address.latitude,
      address.longitude,
    );

    const distanceKm = this.haversine(
      address.latitude,
      address.longitude,
      warehouse.latitude,
      warehouse.longitude,
    );

    const settings = await this.deliverySettingsService.getActive();

    if (!this.deliverySettingsService.isServiceable(distanceKm, settings)) {
      throw new BadRequestException('Delivery not available in your area.');
    }

    const subtotal = Number(cart.subtotal);
    const shippingAmount = this.deliverySettingsService.calculateCharge(
      distanceKm,
      subtotal,
      settings,
    );
    const activeCharges = await this.deliveryChargesService.getActiveCharges();
    const { deliveryCharge, codCharge, handlingCharge } =
      this.deliveryChargesService.calculateCharges(subtotal, activeCharges);
    const taxAmount = 0;
    const discountAmount = 0;
    const totalAmount =
      subtotal +
      shippingAmount +
      deliveryCharge +
      codCharge +
      handlingCharge +
      taxAmount -
      discountAmount;

    const orderNumber = await this.generateOrderNumber();

    const order = this.orderRepo.create({
      orderNumber,
      userId,
      status: OrderStatus.PENDING,
      subtotal,
      discountAmount,
      shippingAmount,
      deliveryCharge,
      codCharge,
      handlingCharge,
      shippingAddressId: dto.shippingAddressId,
      warehouseId: warehouse.id,
      distanceKm,
      taxAmount,
      totalAmount,
      notes: dto.notes ?? null,
    });
    const savedOrder = await this.orderRepo.save(order);

    const orderItems: OrderItem[] = [];
    for (const cartItem of cart.items) {
      const variant = await this.variantRepo.findOne({
        where: { id: cartItem.variantId },
        relations: { product: true },
      });

      const lineTotal = Number(cartItem.lineTotal);
      orderItems.push(
        this.orderItemRepo.create({
          orderId: savedOrder.id,
          productId: variant!.productId,
          variantId: cartItem.variantId,
          productName: variant!.product?.name ?? 'Unknown Product',
          sku: variant!.sku,
          quantity: cartItem.quantity,
          unitPrice: Number(cartItem.unitPrice),
          totalPrice: lineTotal,
        }),
      );

      const inventory = await this.inventoryRepo.findOne({
        where: { variantId: cartItem.variantId },
      });
      if (inventory) {
        inventory.availableQuantity -= cartItem.quantity;
        await this.inventoryRepo.save(inventory);

        // Auto-create alert if stock falls to or below threshold
        const threshold =
          inventory.reorderPoint > 0
            ? inventory.reorderPoint
            : inventory.lowStockThreshold;
        if (inventory.availableQuantity <= threshold) {
          const existing = await this.alertRepo.findOne({
            where: {
              variantId: inventory.variantId,
              isResolved: false,
              alertType:
                inventory.availableQuantity <= 0 ? 'OUT_OF_STOCK' : 'LOW_STOCK',
            },
          });
          if (!existing) {
            await this.alertRepo.save(
              this.alertRepo.create({
                variantId: inventory.variantId,
                thresholdQuantity: threshold,
                currentQuantity: inventory.availableQuantity,
                alertType:
                  inventory.availableQuantity <= 0
                    ? 'OUT_OF_STOCK'
                    : 'LOW_STOCK',
              }),
            );
            const alertLabel =
              inventory.availableQuantity <= 0 ? 'OUT_OF_STOCK' : 'LOW_STOCK';
            await this.adminNotificationService.create({
              type: AdminNotificationType.INVENTORY,
              title: `${alertLabel.replace('_', ' ')} Alert`,
              message: `Variant ${cartItem.variantId} (SKU: ${variant?.sku ?? 'N/A'}) is ${alertLabel === 'OUT_OF_STOCK' ? 'out of stock' : 'low on stock'} (available: ${inventory.availableQuantity}, threshold: ${threshold})`,
              data: { variantId: inventory.variantId, availableQuantity: inventory.availableQuantity, threshold, alertType: alertLabel },
            });
          }
        }
      }
    }
    await this.orderItemRepo.save(orderItems);

    await this.shipmentsService.createShipment(savedOrder.id, warehouse.id);

    await this.cartItemRepo.remove(cart.items);
    cart.subtotal = 0;
    cart.totalItems = 0;
    await this.cartRepo.save(cart);

    const result = (await this.orderRepo.findOne({
      where: { id: savedOrder.id },
      relations: {
        items: {
          product: { images: true },
          variant: { attributes: { attribute: true, attributeValue: true } },
        },
        user: true,
      },
    })) as Order;

    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (user) {
      await this.notificationsService.sendOrderConfirmation({
        to: user.email,
        userId: user.id,
        orderNumber: savedOrder.orderNumber,
        firstName: user.firstName,
      });
      await this.firebaseService.sendPushToUser(
        userId,
        FcmUserType.CUSTOMER,
        {
          title: 'Order Confirmed',
          body: `Your order ${savedOrder.orderNumber} has been placed successfully.`,
          data: { orderId: savedOrder.id, orderNumber: savedOrder.orderNumber },
        },
      );
    }

    await this.adminNotificationService.create({
      type: AdminNotificationType.ORDER,
      title: 'New Order',
      message: `Order ${savedOrder.orderNumber} placed by ${user?.firstName ?? 'Unknown'} (${user?.email ?? 'N/A'})`,
      data: { orderId: savedOrder.id, orderNumber: savedOrder.orderNumber, userId },
    });

    return {
      message: 'Order created successfully.',
      data: this.toResponse(result),
    };
  }

  async getMyOrders(userId: string, query: OrderListQueryDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;

    const where: Record<string, unknown> = { userId };
    if (query.status) where.status = query.status;

    const [items, total] = await this.orderRepo.findAndCount({
      where,
      relations: {
        items: {
          product: { images: true },
          variant: { attributes: { attribute: true, attributeValue: true } },
        },
        user: true,
      },
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return paginate(
      items.map((item) => this.toResponse(item)),
      total,
      page,
      limit,
    );
  }

  async getMyOrder(userId: string, orderId: string): Promise<OrderResponseDto> {
    const order = await this.orderRepo.findOne({
      where: { id: orderId, userId },
      relations: {
        items: {
          product: { images: true },
          variant: { attributes: { attribute: true, attributeValue: true } },
        },
        user: true,
      },
    });
    if (!order) throw new NotFoundException('Order not found.');
    return this.toResponse(order);
  }

  async getAllOrders(query: OrderListQueryDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;

    const where: Record<string, unknown> = {};
    if (query.status) where.status = query.status;

    const [items, total] = await this.orderRepo.findAndCount({
      where,
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
      relations: {
        items: {
          product: { images: true },
          variant: { attributes: { attribute: true, attributeValue: true } },
        },
        user: true,
      },
    });

    const [totalOrders, pending, processing, shipped, delivered, cancelled] =
      await Promise.all([
        this.orderRepo.count(),
        this.orderRepo.count({ where: { status: OrderStatus.PENDING } }),
        this.orderRepo.count({ where: { status: OrderStatus.PROCESSING } }),
        this.orderRepo.count({ where: { status: OrderStatus.SHIPPED } }),
        this.orderRepo.count({ where: { status: OrderStatus.DELIVERED } }),
        this.orderRepo.count({ where: { status: OrderStatus.CANCELLED } }),
      ]);

    return {
      ...paginate(
        items.map((item) => this.toResponse(item)),
        total,
        page,
        limit,
      ),
      totalOrders,
      pending,
      processing,
      shipped,
      delivered,
      cancelled,
    };
  }

  async getOrder(orderId: string): Promise<OrderResponseDto> {
    const order = await this.orderRepo.findOne({
      where: { id: orderId },
      relations: {
        items: {
          product: { images: true },
          variant: { attributes: { attribute: true, attributeValue: true } },
        },
        user: true,
      },
    });
    if (!order) throw new NotFoundException('Order not found.');
    return this.toResponse(order);
  }

  async updateStatus(
    orderId: string,
    dto: UpdateOrderStatusDto,
    adminId: string
  ): Promise<{ message: string; data: OrderResponseDto }> {
    const order = await this.orderRepo.findOne({
      where: { id: orderId },
      relations: { user: true },
    });
    if (!order) throw new NotFoundException('Order not found.');

    const oldStatus = order.status;
    order.status = dto.status;
    const saved = await this.orderRepo.save(order);

    if (order.user) {
      await this.firebaseService.sendPushToUser(
        order.user.id,
        FcmUserType.CUSTOMER,
        {
          title: 'Order Status Updated',
          body: `Your order ${saved.orderNumber} is now ${saved.status}.`,
          data: { orderId: saved.id, orderNumber: saved.orderNumber, status: saved.status },
        },
      );
      await this.notificationsService.sendOrderStatusUpdate({
        to: order.user.email,
        userId: order.user.id,
        firstName: order.user.firstName,
        orderNumber: saved.orderNumber,
        oldStatus,
        newStatus: saved.status,
        orderUrl: `${process.env.FRONTEND_URL || ''}/orders/${saved.id}`,
      });
    }

    await this.adminNotificationService.create({
      type: AdminNotificationType.ORDER,
      title: 'Order Status Updated',
      message: `Order ${saved.orderNumber} status changed to ${saved.status}`,
      data: { orderId: saved.id, orderNumber: saved.orderNumber, status: saved.status, updatedBy: adminId },
    });

    // Reload with full relations for response
    const result = await this.orderRepo.findOne({
      where: { id: orderId },
      relations: {
        items: {
          product: { images: true },
          variant: { attributes: { attribute: true, attributeValue: true } },
        },
        user: true,
      },
    });
    return {
      message: 'Order status updated successfully.',
      data: this.toResponse(result!),
    };
  }

  async cancelOrder(
    orderId: string,
    adminId: string,
    dto?: CancelOrderDto,
    isAdmin = false,

  ): Promise<{ message: string; data: OrderResponseDto }> {
    const order = await this.orderRepo.findOne({
      where: { id: orderId },
      relations: {
        items: {
          product: { images: true },
          variant: { attributes: { attribute: true, attributeValue: true } },
        },
        user: true,
      },
    });
    if (!order) throw new NotFoundException('Order not found.');

    if (!isAdmin) {
      const cancellable = [OrderStatus.PENDING, OrderStatus.CONFIRMED];
      if (!cancellable.includes(order.status)) {
        throw new BadRequestException(
          'Order can only be cancelled when status is PENDING or CONFIRMED.',
        );
      }
    }

    const oldStatus = order.status;
    order.status = OrderStatus.CANCELLED;
    if (dto?.reason) {
      order.notes = dto.reason;
    }
    const saved = await this.orderRepo.save(order);

    const items = await this.orderItemRepo.find({ where: { orderId } });
    for (const item of items) {
      const inventory = await this.inventoryRepo.findOne({
        where: { variantId: item.variantId },
      });
      if (inventory) {
        inventory.availableQuantity += item.quantity;
        await this.inventoryRepo.save(inventory);
      }
    }

    if (order.user) {
      await this.firebaseService.sendPushToUser(
        order.user.id,
        FcmUserType.CUSTOMER,
        {
          title: 'Order Cancelled',
          body: `Your order ${saved.orderNumber} has been cancelled.`,
          data: { orderId: saved.id, orderNumber: saved.orderNumber },
        },
      );
      await this.notificationsService.sendOrderStatusUpdate({
        to: order.user.email,
        userId: order.user.id,
        firstName: order.user.firstName,
        orderNumber: saved.orderNumber,
        oldStatus,
        newStatus: OrderStatus.CANCELLED,
        orderUrl: `${process.env.FRONTEND_URL || ''}/orders/${saved.id}`,
      });
    }

    await this.adminNotificationService.create({
      type: AdminNotificationType.ORDER,
      title: 'Order Cancelled',
      message: `Order ${saved.orderNumber} was cancelled${order.user ? ` by ${order.user.firstName} ${order.user.lastName}` : ''}${dto?.reason ? `: ${dto.reason}` : ''}`,
      data: { orderId: saved.id, orderNumber: saved.orderNumber, reason: dto?.reason ?? null, cancelledBy: adminId },
    });

    return {
      message: 'Order cancelled successfully.',
      data: this.toResponse(saved),
    };
  }

  private haversine(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number,
  ): number {
    const R = 6371;
    const dLat = this.toRad(lat2 - lat1);
    const dLon = this.toRad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRad(lat1)) *
      Math.cos(this.toRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return Math.round(R * c * 100) / 100;
  }

  private toRad(deg: number): number {
    return (deg * Math.PI) / 180;
  }

  async generateOrderNumber(): Promise<string> {
    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, '0');
    const d = String(now.getDate()).padStart(2, '0');
    const prefix = `ORD-${y}${m}${d}-`;

    const todayOrders = await this.orderRepo.find({
      where: { orderNumber: ILike(`${prefix}%`) },
      order: { createdAt: 'DESC' },
    });

    let nextSeq = 1;
    if (todayOrders.length > 0) {
      const lastNum = parseInt(todayOrders[0].orderNumber.slice(-6), 10);
      if (!isNaN(lastNum)) nextSeq = lastNum + 1;
    }

    return `${prefix}${String(nextSeq).padStart(6, '0')}`;
  }

  private toResponse(order: Order): OrderResponseDto {
    const userName = order.user
      ? `${order.user.firstName} ${order.user.lastName}`
      : '';
    return plainToInstance(
      OrderResponseDto,
      {
        ...order,
        userName,
        items: (order.items ?? []).map((item) => {
          let imageUrl: string | undefined;
          if (item.product?.images?.length) {
            const primary = item.product.images.find((img) => img.isPrimary);
            imageUrl = primary
              ? primary.imageUrl
              : item.product.images[0].imageUrl;
          }
          if (!imageUrl) {
            imageUrl = 'https://placehold.co/200x200?text=No+Image';
          }
          const variantName = item.variant?.attributes
            ?.map((a) => a.attributeValue?.value ?? '')
            .filter(Boolean)
            .join(' / ');
          return plainToInstance(
            OrderItemResponseDto,
            { ...item, imageUrl, variantName },
            { excludeExtraneousValues: true },
          );
        }),
      },
      { excludeExtraneousValues: true },
    );
  }
}
