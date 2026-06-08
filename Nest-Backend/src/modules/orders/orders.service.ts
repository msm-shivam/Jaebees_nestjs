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
import { paginate } from '../../common/utils/pagination.util';

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
  ) {}

  async createOrder(
    userId: string,
    dto: CreateOrderDto,
  ): Promise<{ message: string; data: OrderResponseDto }> {
    const cart = await this.cartRepo.findOne({
      where: { userId },
      relations: { items: true },
    });
    if (!cart) throw new BadRequestException('Cart not found.');
    if (!cart.items || cart.items.length === 0) {
      throw new BadRequestException('Cart is empty.');
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

    const orderNumber = await this.generateOrderNumber();

    const order = this.orderRepo.create({
      orderNumber,
      userId,
      status: OrderStatus.PENDING,
      subtotal: Number(cart.subtotal),
      discountAmount: 0,
      shippingAmount: 0,
      taxAmount: 0,
      totalAmount: Number(cart.subtotal),
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
      }
    }
    await this.orderItemRepo.save(orderItems);

    await this.cartItemRepo.remove(cart.items);
    cart.subtotal = 0;
    cart.totalItems = 0;
    await this.cartRepo.save(cart);

    const result = (await this.orderRepo.findOne({
      where: { id: savedOrder.id },
      relations: { items: true },
    })) as Order;
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
      relations: { items: true },
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
      relations: { items: true },
    });

    return paginate(
      items.map((item) => this.toResponse(item)),
      total,
      page,
      limit,
    );
  }

  async getOrder(orderId: string): Promise<OrderResponseDto> {
    const order = await this.orderRepo.findOne({
      where: { id: orderId },
      relations: { items: true },
    });
    if (!order) throw new NotFoundException('Order not found.');
    return this.toResponse(order);
  }

  async updateStatus(
    orderId: string,
    dto: UpdateOrderStatusDto,
  ): Promise<{ message: string; data: OrderResponseDto }> {
    const order = await this.orderRepo.findOne({
      where: { id: orderId },
      relations: { items: true },
    });
    if (!order) throw new NotFoundException('Order not found.');

    order.status = dto.status;
    const saved = await this.orderRepo.save(order);

    return {
      message: 'Order status updated successfully.',
      data: this.toResponse(saved),
    };
  }

  async cancelOrder(
    orderId: string,
    dto?: CancelOrderDto,
    isAdmin = false,
  ): Promise<{ message: string; data: OrderResponseDto }> {
    const order = await this.orderRepo.findOne({
      where: { id: orderId },
      relations: { items: true },
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

    return {
      message: 'Order cancelled successfully.',
      data: this.toResponse(saved),
    };
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
    return plainToInstance(
      OrderResponseDto,
      {
        ...order,
        items: (order.items ?? []).map((item) =>
          plainToInstance(OrderItemResponseDto, item, {
            excludeExtraneousValues: true,
          }),
        ),
      },
      { excludeExtraneousValues: true },
    );
  }
}
