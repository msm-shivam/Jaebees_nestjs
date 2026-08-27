import {
  BadRequestException,
  Injectable,
  NotFoundException,
  Inject,
  forwardRef,
  Logger,
  OnModuleInit,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike, DataSource } from 'typeorm';
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
import { Payment } from '../payments/entities/payment.entity';
import { PaymentStatus } from '../payments/entities/payment-status.enum';
import { Warehouse } from '../warehouses/entities/warehouse.entity';
import { RefundsService } from '../payments/services/refunds.service';
import { AddressesService } from '../addresses/addresses.service';
import { WarehousesService } from '../warehouses/warehouses.service';
import { DeliverySettingsService } from '../delivery-settings/delivery-settings.service';
import { DeliveryChargesService } from '../delivery-charges/delivery-charges.service';
import { ShipmentsService } from '../shipments/shipments.service';
import { ShipmentStatus } from '../shipments/entities/shipment-status.enum';
import { paginate } from '../../common/utils/pagination.util';
import { AuditLogService } from '../security-compliance/services/audit-log.service';
import { FirebaseService } from '../firebase/firebase.service';
import { FcmUserType } from '../firebase/entities/fcm-token.entity';
import { AdminNotificationService } from '../notifications/admin-notification.service';
import { AdminNotificationType } from '../notifications/entities/admin-notification.entity';

@Injectable()
export class OrdersService implements OnModuleInit {
  private readonly logger = new Logger(OrdersService.name);

  async onModuleInit() {
    try {
      await this.dataSource.query(
        `ALTER TYPE "public"."orders_status_enum" ADD VALUE IF NOT EXISTS 'DISPATCHED'`,
      );
    } catch (e) { }
    try {
      await this.dataSource.query(
        `ALTER TYPE "public"."shipments_status_enum" ADD VALUE IF NOT EXISTS 'SHIPPED'`,
      );
    } catch (e) { }
    try {
      await this.dataSource.query(
        `ALTER TYPE "public"."shipment_tracking_logs_status_enum" ADD VALUE IF NOT EXISTS 'SHIPPED'`,
      );
    } catch (e) { }
    try {
      await this.dataSource.query(
        `ALTER TYPE "public"."shipment_tracking_logs_status_enum" ADD VALUE IF NOT EXISTS 'DISPATCHED'`,
      );
    } catch (e) { }
    try {
      await this.dataSource.query(
        `ALTER TYPE "public"."orders_status_enum" ADD VALUE IF NOT EXISTS 'FAILED_DELIVERY'`,
      );
    } catch (e) { }
  }

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
    @InjectRepository(Payment)
    private readonly paymentRepo: Repository<Payment>,
    @Inject(forwardRef(() => RefundsService))
    private readonly refundsService: RefundsService,
    private readonly addressesService: AddressesService,
    private readonly warehousesService: WarehousesService,
    private readonly deliverySettingsService: DeliverySettingsService,
    private readonly deliveryChargesService: DeliveryChargesService,
    private readonly shipmentsService: ShipmentsService,
    private readonly notificationsService: NotificationsService,
    private readonly auditLogService: AuditLogService,
    private readonly firebaseService: FirebaseService,
    private readonly adminNotificationService: AdminNotificationService,
    private readonly dataSource: DataSource,
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

    let warehouse: Warehouse | null = null;
    let distanceKm: number | null = null;
    try {
      if (address.latitude && address.longitude) {
        warehouse = await this.warehousesService.findNearest(
          address.latitude,
          address.longitude,
        );
        if (warehouse) {
          distanceKm = this.haversine(
            address.latitude,
            address.longitude,
            warehouse.latitude,
            warehouse.longitude,
          );
        }
      }
    } catch {
      // Warehouse lookup optional
    }

    const settings = await this.deliverySettingsService.getActive();

    if (distanceKm !== null && !this.deliverySettingsService.isServiceable(distanceKm, settings)) {
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
      warehouseId: warehouse?.id ?? null,
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

    if (warehouse) {
      await this.shipmentsService.createShipment(savedOrder.id, warehouse.id);
    }

    await this.cartItemRepo.remove(cart.items);
    cart.items = [];
    cart.subtotal = 0;
    cart.totalItems = 0;
    await this.cartRepo.save(cart);

    const result = (await this.orderRepo.findOne({
      where: { id: savedOrder.id },
      relations: {
        items: {
          product: { images: true, category: true },
          variant: { attributes: { attribute: true, attributeValue: true } },
        },
        shippingAddress: true,
        user: true,
      },
    })) as Order;

    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (user) {
      if (!user.firstOrderId) {
        user.firstOrderId = savedOrder.id;
        await this.userRepo.save(user);
      }
      this.notificationsService.sendOrderConfirmation({
        to: user.email,
        userId: user.id,
        orderNumber: savedOrder.orderNumber,
        firstName: user.firstName,
      }).catch(() => { });
      this.firebaseService.sendPushToUser(
        userId,
        FcmUserType.CUSTOMER,
        {
          title: 'Order Confirmed',
          body: `Your order ${savedOrder.orderNumber} has been placed successfully.`,
          data: { orderId: savedOrder.id, orderNumber: savedOrder.orderNumber },
        },
      ).catch(() => { });
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
          product: { images: true, category: true },
          variant: { attributes: { attribute: true, attributeValue: true } },
        },
        shippingAddress: true,
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
          product: { images: true, category: true },
          variant: { attributes: { attribute: true, attributeValue: true } },
        },
        shippingAddress: true,
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
          product: { images: true, category: true },
          variant: { attributes: { attribute: true, attributeValue: true } },
        },
        shippingAddress: true,
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
          product: { images: true, category: true },
          variant: { attributes: { attribute: true, attributeValue: true } },
        },
        shippingAddress: true,
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

    if (dto.status === OrderStatus.PACKED) {
      try {
        const shipment = await this.shipmentsService.findByOrderId(orderId);
        if (shipment && shipment.status === ShipmentStatus.PENDING) {
          await this.shipmentsService.updateStatus(
            shipment.id,
            { status: ShipmentStatus.PACKED },
            adminId || 'system',
          );
        }
      } catch (err) {
        // Shipment may not exist or already updated
      }
    }

    if (dto.status === OrderStatus.DISPATCHED) {
      try {
        const shipment = await this.shipmentsService.findByOrderId(orderId);
        if (shipment && (shipment.status === ShipmentStatus.PENDING || shipment.status === ShipmentStatus.PACKED)) {
          await this.shipmentsService.updateStatus(
            shipment.id,
            { status: ShipmentStatus.READY_FOR_DISPATCH },
            adminId || 'system',
          );
        }
      } catch (err) {
        // Shipment may not exist or already updated
      }
    }

    if (order.user) {
      this.firebaseService.sendPushToUser(
        order.user.id,
        FcmUserType.CUSTOMER,
        {
          title: 'Order Status Updated',
          body: `Your order ${saved.orderNumber} is now ${saved.status}.`,
          data: { orderId: saved.id, orderNumber: saved.orderNumber, status: saved.status },
        },
      ).catch(() => { });
      this.notificationsService.sendOrderStatusUpdate({
        to: order.user.email,
        userId: order.user.id,
        firstName: order.user.firstName,
        orderNumber: saved.orderNumber,
        oldStatus,
        newStatus: saved.status,
        orderUrl: `${process.env.FRONTEND_URL || ''}/orders/${saved.id}`,
      }).catch(() => { });
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

    if (order.status === OrderStatus.CANCELLED) {
      return {
        message: 'Order is already cancelled.',
        data: this.toResponse(order),
      };
    }

    if (!isAdmin) {
      const uncancellable = [
        OrderStatus.DISPATCHED,
        OrderStatus.SHIPPED,
        OrderStatus.OUT_FOR_DELIVERY,
        OrderStatus.DELIVERED,
        OrderStatus.CANCELLED,
        OrderStatus.RETURN_REQUESTED,
        OrderStatus.RETURNED,
      ];
      if (uncancellable.includes(order.status)) {
        throw new BadRequestException(
          `Order cannot be cancelled once it is ${order.status.replace(/_/g, ' ').toLowerCase()}.`,
        );
      }

      const hoursSincePlacement =
        (Date.now() - new Date(order.createdAt).getTime()) / (1000 * 60 * 60);
      if (hoursSincePlacement > 24) {
        throw new BadRequestException(
          'Cancellation window of 24 hours has expired.',
        );
      }
    }

    const oldStatus = order.status;

    // Transaction-safe state update & inventory restoration
    const saved = await this.dataSource.transaction(async (manager) => {
      const targetOrder = await manager.findOne(Order, {
        where: { id: orderId },
        lock: { mode: 'pessimistic_write' },
      });
      if (!targetOrder || targetOrder.status === OrderStatus.CANCELLED) {
        return targetOrder || order;
      }

      targetOrder.status = OrderStatus.CANCELLED;
      if (dto?.reason) {
        targetOrder.notes = dto.reason;
      }
      const updatedOrder = await manager.save(Order, targetOrder);

      const items = await manager.find(OrderItem, { where: { orderId } });
      for (const item of items) {
        const inventory = await manager.findOne(Inventory, {
          where: { variantId: item.variantId },
          lock: { mode: 'pessimistic_write' },
        });
        if (inventory) {
          inventory.availableQuantity = Number(inventory.availableQuantity) + item.quantity;
          await manager.save(Inventory, inventory);
        }
      }
      return updatedOrder;
    });

    // Trigger Stripe Refund if order was paid
    if (order.paymentStatus === PaymentStatus.PAID || order.paymentStatus === PaymentStatus.PARTIALLY_REFUNDED) {
      const payment = await this.paymentRepo.findOne({ where: { orderId } });
      if (payment) {
        try {
          await this.refundsService.createRefund(
            payment.id,
            {
              amount: Number(order.totalAmount),
              reason: dto?.reason || 'Order cancellation',
            },
            adminId,
            `cancel_order_${order.id}`,
          );
        } catch (refundErr: any) {
          this.logger.error(
            `Stripe refund trigger failed during cancellation of order ${order.id}:`,
            refundErr,
          );
        }
      }
    }

    if (order.user) {
      this.firebaseService.sendPushToUser(
        order.user.id,
        FcmUserType.CUSTOMER,
        {
          title: 'Order Cancelled',
          body: `Your order ${saved.orderNumber} has been cancelled.`,
          data: { orderId: saved.id, orderNumber: saved.orderNumber },
        },
      ).catch(() => { });
      this.notificationsService.sendOrderStatusUpdate({
        to: order.user.email,
        userId: order.user.id,
        firstName: order.user.firstName,
        orderNumber: saved.orderNumber,
        oldStatus,
        newStatus: OrderStatus.CANCELLED,
        orderUrl: `${process.env.FRONTEND_URL || ''}/orders/${saved.id}`,
      }).catch(() => { });
    }

    await this.adminNotificationService.create({
      type: AdminNotificationType.ORDER,
      title: 'Order Cancelled',
      message: `Order ${saved.orderNumber} was cancelled${order.user ? ` by ${order.user.firstName} ${order.user.lastName}` : ''}${dto?.reason ? `: ${dto.reason}` : ''}`,
      data: { orderId: saved.id, orderNumber: saved.orderNumber, reason: dto?.reason ?? null, cancelledBy: adminId },
    });

    const reloaded = await this.orderRepo.findOne({
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
      message: 'Order cancelled successfully.',
      data: this.toResponse(reloaded || saved),
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
    const shipping = Number(order.shippingAmount || order.deliveryCharge || 0);
    const tax = Number(order.taxAmount || 0);
    const discount = Number(order.discountAmount || 0);

    const uncancellableStatuses = [
      OrderStatus.DISPATCHED,
      OrderStatus.SHIPPED,
      OrderStatus.OUT_FOR_DELIVERY,
      OrderStatus.DELIVERED,
      OrderStatus.CANCELLED,
      OrderStatus.RETURN_REQUESTED,
      OrderStatus.RETURNED,
    ];
    const isCancellable = !uncancellableStatuses.includes(order.status);

    return plainToInstance(
      OrderResponseDto,
      {
        ...order,
        userName,
        shipping,
        tax,
        discount,
        isCancellable,
        shippingAddress: order.shippingAddress
          ? {
            id: order.shippingAddress.id,
            fullName: order.shippingAddress.fullName,
            phone: order.shippingAddress.phone,
            addressLine1: order.shippingAddress.addressLine1,
            addressLine2: order.shippingAddress.addressLine2,
            city: order.shippingAddress.city,
            state: order.shippingAddress.state,
            country: order.shippingAddress.country,
            postalCode: order.shippingAddress.postalCode,
          }
          : null,
        items: (order.items ?? []).map((item) => {
          let imageUrl: string | undefined;
          if (item.product?.images?.length) {
            const primary = item.product.images.find((img) => img.isPrimary);
            imageUrl = primary
              ? primary.imageUrl
              : item.product.images[0].imageUrl;
          }
          if (!imageUrl) {
            imageUrl = 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=600&q=80';
          }
          const variantName = item.variant?.attributes
            ?.map((a) => a.attributeValue?.value ?? '')
            .filter(Boolean)
            .join(' / ');
          const price = Number(item.unitPrice || 0);
          const name = item.productName || item.product?.name || 'Sportswear Item';
          const categoryName = item.product?.category?.name || 'Sportswear';
          const slug = item.product?.slug || '';
          return plainToInstance(
            OrderItemResponseDto,
            {
              ...item,
              imageUrl,
              image: imageUrl,
              price,
              name,
              variantName,
              categoryName,
              slug,
            },
            { excludeExtraneousValues: true },
          );
        }),
      },
      { excludeExtraneousValues: true },
    );
  }
}
