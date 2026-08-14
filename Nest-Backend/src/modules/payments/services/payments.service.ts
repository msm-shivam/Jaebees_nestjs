/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access */
import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
  OnModuleInit,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In, ILike, DataSource } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { Payment } from '../entities/payment.entity';
import { PaymentLog } from '../entities/payment-log.entity';
import { PaymentMethod } from '../entities/payment-method.entity';
import { PaymentWebhook } from '../entities/payment-webhook.entity';
import { PaymentStatus } from '../entities/payment-status.enum';
import {
  CheckoutSnapshot,
  CheckoutSnapshotStatus,
  SnapshotItem,
} from '../entities/checkout-snapshot.entity';
import { Order, OrderStatus } from '../../orders/entities/order.entity';
import { OrderItem } from '../../orders/entities/order-item.entity';
import { User } from '../../users/entities/user.entity';
import { Cart } from '../../cart/entities/cart.entity';
import { CartItem } from '../../cart/entities/cart-item.entity';
import { ProductVariant } from '../../product-variants/entities/product-variant.entity';
import { Inventory } from '../../inventory/entities/inventory.entity';
import { Address } from '../../addresses/entities/address.entity';
import { Warehouse } from '../../warehouses/entities/warehouse.entity';
import { StripeService } from './stripe.service';
import { NotificationsService } from '../../notifications/notifications.service';
import { AddressesService } from '../../addresses/addresses.service';
import { WarehousesService } from '../../warehouses/warehouses.service';
import { DeliverySettingsService } from '../../delivery-settings/delivery-settings.service';
import { DeliveryChargesService } from '../../delivery-charges/delivery-charges.service';
import { ShipmentsService } from '../../shipments/shipments.service';
import { Coupon } from '../../coupons-promotions/entities/coupon.entity';
import { CouponUsage } from '../../coupons-promotions/entities/coupon-usage.entity';
import { CouponValidationService } from '../../coupons-promotions/services/coupon-validation.service';
import { CreatePaymentIntentDto } from '../dto/create-payment-intent.dto';
import { ConfirmPaymentDto } from '../dto/confirm-payment.dto';
import { PaymentQueryDto } from '../dto/payment-query.dto';
import { UpdatePaymentDto } from '../dto/update-payment.dto';
import { plainToInstance } from 'class-transformer';
import { PaymentIntentResponseDto } from '../dto/payment-response.dto';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class PaymentsService implements OnModuleInit {
  private readonly logger = new Logger(PaymentsService.name);

  constructor(
    @InjectRepository(Payment)
    private readonly paymentRepo: Repository<Payment>,
    @InjectRepository(PaymentLog)
    private readonly paymentLogRepo: Repository<PaymentLog>,
    @InjectRepository(PaymentMethod)
    private readonly paymentMethodRepo: Repository<PaymentMethod>,
    @InjectRepository(PaymentWebhook)
    private readonly webhookRepo: Repository<PaymentWebhook>,
    @InjectRepository(CheckoutSnapshot)
    private readonly snapshotRepo: Repository<CheckoutSnapshot>,
    @InjectRepository(Order)
    private readonly orderRepo: Repository<Order>,
    @InjectRepository(OrderItem)
    private readonly orderItemRepo: Repository<OrderItem>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    @InjectRepository(Cart)
    private readonly cartRepo: Repository<Cart>,
    @InjectRepository(CartItem)
    private readonly cartItemRepo: Repository<CartItem>,
    @InjectRepository(ProductVariant)
    private readonly variantRepo: Repository<ProductVariant>,
    @InjectRepository(Inventory)
    private readonly inventoryRepo: Repository<Inventory>,
    @InjectRepository(Address)
    private readonly addressRepo: Repository<Address>,
    @InjectRepository(Warehouse)
    private readonly warehouseRepo: Repository<Warehouse>,
    @InjectRepository(Coupon)
    private readonly couponRepo: Repository<Coupon>,
    @InjectRepository(CouponUsage)
    private readonly couponUsageRepo: Repository<CouponUsage>,
    private readonly couponValidationService: CouponValidationService,
    private readonly stripeService: StripeService,
    private readonly notificationsService: NotificationsService,
    private readonly configService: ConfigService,
    private readonly addressesService: AddressesService,
    private readonly warehousesService: WarehousesService,
    private readonly deliverySettingsService: DeliverySettingsService,
    private readonly deliveryChargesService: DeliveryChargesService,
    private readonly shipmentsService: ShipmentsService,
    private readonly dataSource: DataSource,
  ) {}

  async onModuleInit() {
    try {
      await this.dataSource.query(`
        CREATE TABLE IF NOT EXISTS checkout_snapshots (
          id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
          stripe_payment_intent_id varchar UNIQUE,
          user_id varchar NOT NULL,
          shipping_address_id varchar NOT NULL,
          notes text,
          items jsonb NOT NULL,
          subtotal decimal(12,2) DEFAULT 0,
          shipping_amount decimal(12,2) DEFAULT 0,
          tax_amount decimal(12,2) DEFAULT 0,
          discount_amount decimal(12,2) DEFAULT 0,
          total_amount decimal(12,2) DEFAULT 0,
          currency varchar DEFAULT 'usd',
          status varchar DEFAULT 'PENDING',
          expires_at timestamptz NOT NULL,
          created_at timestamptz DEFAULT now(),
          updated_at timestamptz DEFAULT now()
        );
        ALTER TABLE orders ADD COLUMN IF NOT EXISTS snapshot_id varchar UNIQUE;
        ALTER TABLE orders ADD COLUMN IF NOT EXISTS stripe_payment_intent_id varchar UNIQUE;
        ALTER TABLE payments ADD COLUMN IF NOT EXISTS stripe_payment_intent_id varchar UNIQUE;
        ALTER TABLE checkout_snapshots ADD COLUMN IF NOT EXISTS coupon_id varchar;
        ALTER TABLE checkout_snapshots ADD COLUMN IF NOT EXISTS coupon_code varchar;
      `);
      this.logger.log('Database schema for checkout snapshots verified.');
    } catch (err) {
      this.logger.error('Failed to initialize checkout_snapshots table', err);
    }
  }

  async createPaymentIntent(dto: CreatePaymentIntentDto, userId?: string) {
    const currency = this.configService.get<string>('STRIPE_CURRENCY', 'usd');

    // Customer Checkout Snapshot Flow (pre-order payment intent)
    if (dto.shippingAddressId || (!dto.orderId && userId)) {
      if (!userId) {
        throw new BadRequestException('User authentication is required for checkout.');
      }
      if (!dto.shippingAddressId) {
        throw new BadRequestException('Shipping address is required.');
      }

      const cart = await this.cartRepo.findOne({
        where: { userId },
        relations: { items: true },
      });
      if (!cart || !cart.items || cart.items.length === 0) {
        throw new BadRequestException('Cart is empty.');
      }

      const address = await this.addressesService.findById(dto.shippingAddressId);
      if (address.userId !== userId) {
        throw new BadRequestException('Address does not belong to user.');
      }

      const snapshotItems: SnapshotItem[] = [];
      for (const cartItem of cart.items) {
        const variant = await this.variantRepo.findOne({
          where: { id: cartItem.variantId },
          relations: { product: true },
        });
        if (!variant) {
          throw new BadRequestException(`Variant ${cartItem.variantId} not found.`);
        }

        const inventory = await this.inventoryRepo.findOne({
          where: { variantId: cartItem.variantId },
        });
        if (!inventory || inventory.availableQuantity < cartItem.quantity) {
          throw new BadRequestException(
            `Insufficient stock for item: ${variant.product?.name ?? 'Product'}.`,
          );
        }

        const unitPrice = Number(cartItem.unitPrice);
        const lineTotal = Number(cartItem.lineTotal);
        snapshotItems.push({
          productId: variant.productId,
          variantId: cartItem.variantId,
          sku: variant.sku,
          productName: variant.product?.name ?? 'Sportswear Product',
          unitPrice,
          quantity: cartItem.quantity,
          lineTotal,
        });
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
        throw new BadRequestException('Delivery is not available in your area.');
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

      let effectiveShippingCharge = shippingAmount + deliveryCharge + handlingCharge;
      let discountAmount = 0;
      let couponId: string | null = null;
      let couponCode: string | null = null;

      if (dto.couponCode) {
        const coupon = await this.couponRepo.findOne({
          where: { code: dto.couponCode.trim().toUpperCase() },
          relations: { rules: true },
        });

        if (!coupon) {
          throw new BadRequestException(`Coupon code '${dto.couponCode}' is invalid.`);
        }

        const userOrderCount = await this.orderRepo.count({
          where: { userId, status: In([OrderStatus.CONFIRMED, OrderStatus.PROCESSING, OrderStatus.DELIVERED, OrderStatus.SHIPPED]) },
        });

        const validationResult = await this.couponValidationService.validate(coupon, {
          userId,
          orderAmount: subtotal,
          items: snapshotItems.map((i) => ({
            productId: i.productId,
            variantId: i.variantId,
            unitPrice: i.unitPrice,
            quantity: i.quantity,
            lineTotal: i.lineTotal,
          })),
          isFirstOrder: userOrderCount === 0,
        });

        if (validationResult.isFreeShipping) {
          effectiveShippingCharge = 0;
        }

        discountAmount = validationResult.discountAmount;
        couponId = coupon.id;
        couponCode = coupon.code;
      }

      const taxAmount = Math.round(subtotal * 0.1 * 100) / 100;
      const grandTotal = Math.max(
        0,
        subtotal + effectiveShippingCharge + taxAmount - discountAmount,
      );

      const snapshot = this.snapshotRepo.create({
        userId,
        shippingAddressId: dto.shippingAddressId,
        notes: dto.notes ?? null,
        items: snapshotItems,
        subtotal,
        shippingAmount: effectiveShippingCharge,
        taxAmount,
        discountAmount,
        couponId,
        couponCode,
        totalAmount: grandTotal,
        currency,
        status: CheckoutSnapshotStatus.PENDING,
        expiresAt: new Date(Date.now() + 30 * 60 * 1000), // 30 mins
      });
      const savedSnapshot = await this.snapshotRepo.save(snapshot);

      const metadata: Record<string, string> = {
        snapshotId: savedSnapshot.id,
        userId,
      };
      if (couponCode) {
        metadata.couponCode = couponCode;
      }

      const intent = await this.stripeService.createPaymentIntent(
        grandTotal,
        currency,
        metadata,
        savedSnapshot.id,
      );

      savedSnapshot.stripePaymentIntentId = intent.id;
      await this.snapshotRepo.save(savedSnapshot);

      return plainToInstance(
        PaymentIntentResponseDto,
        {
          clientSecret: intent.client_secret,
          paymentIntentId: intent.id,
        },
        { excludeExtraneousValues: true },
      );
    }

    // Legacy / Order-First Flow (for Admin/Legacy support)
    if (!dto.orderId) {
      throw new BadRequestException('Either orderId or shippingAddressId is required.');
    }

    const order = await this.orderRepo.findOne({
      where: { id: dto.orderId },
    });
    if (!order) {
      throw new NotFoundException('Order not found');
    }

    const existingPayment = await this.paymentRepo.findOne({
      where: { orderId: dto.orderId, status: PaymentStatus.PAID },
    });
    if (existingPayment) {
      throw new BadRequestException('Order is already paid');
    }

    const amount = Number(order.totalAmount);
    const metadata: Record<string, string> = {
      orderId: order.id,
      orderNumber: order.orderNumber,
    };
    if (order.userId) {
      metadata.userId = order.userId;
    }

    const intent = await this.stripeService.createPaymentIntent(
      amount,
      currency,
      metadata,
    );

    const transactionNumber = `TXN-${uuidv4().slice(0, 8).toUpperCase()}`;

    let payment = await this.paymentRepo.findOne({
      where: { orderId: dto.orderId, status: PaymentStatus.PENDING },
    });

    if (payment) {
      payment.stripePaymentIntentId = intent.id;
      payment.amount = amount;
      payment.gatewayStatus = intent.status;
      payment.gatewayResponse = intent;
      payment.transactionNumber = transactionNumber;
    } else {
      payment = this.paymentRepo.create({
        orderId: dto.orderId,
        transactionNumber,
        amount,
        status: PaymentStatus.PENDING,
        stripePaymentIntentId: intent.id,
        gatewayStatus: intent.status,
        gatewayResponse: intent as unknown as Record<string, unknown>,
      });
    }

    await this.paymentRepo.save(payment);

    return plainToInstance(
      PaymentIntentResponseDto,
      {
        clientSecret: intent.client_secret,
        paymentIntentId: intent.id,
      },
      { excludeExtraneousValues: true },
    );
  }

  async confirmPayment(dto: ConfirmPaymentDto) {
    return this.processSuccessfulPayment(dto.paymentIntentId);
  }

  /**
   * Single Payment Processing Pipeline
   * Handles payment verification, snapshot loading, database transaction, row locking, order creation, and post-commit notifications.
   */
  async processSuccessfulPayment(paymentIntentId: string) {
    const startTime = Date.now();
    const intent = await this.stripeService.retrievePaymentIntent(paymentIntentId);
    if (!intent || intent.status !== 'succeeded') {
      throw new BadRequestException(`Payment ${paymentIntentId} has not succeeded on Stripe.`);
    }

    const snapshotId = intent.metadata?.snapshotId;
    const userIdFromMetadata = intent.metadata?.userId;

    // 1. Snapshot-First Idempotency Check
    const existingOrder = await this.orderRepo.findOne({
      where: [
        { stripePaymentIntentId: paymentIntentId },
        ...(snapshotId ? [{ snapshotId }] : []),
      ],
      relations: { items: true },
    });

    if (existingOrder) {
      this.logger.log(`Payment ${paymentIntentId} already processed for Order ${existingOrder.id}`);
      return {
        message: 'Payment confirmed successfully.',
        alreadyProcessed: true,
        orderId: existingOrder.id,
        status: 'PAID',
        data: existingOrder,
      };
    }

    // 2. Load & Validate Snapshot
    let snapshot: CheckoutSnapshot | null = null;
    if (snapshotId) {
      snapshot = await this.snapshotRepo.findOne({ where: { id: snapshotId } });
      if (snapshot) {
        if (snapshot.status === CheckoutSnapshotStatus.USED) {
          const ord = await this.orderRepo.findOne({ where: { snapshotId: snapshot.id } });
          if (ord) {
            return {
              message: 'Payment already processed.',
              alreadyProcessed: true,
              orderId: ord.id,
              status: 'PAID',
              data: ord,
            };
          }
        }
        if (
          snapshot.status === CheckoutSnapshotStatus.EXPIRED ||
          (snapshot.expiresAt && snapshot.expiresAt < new Date() && snapshot.status === CheckoutSnapshotStatus.PENDING)
        ) {
          snapshot.status = CheckoutSnapshotStatus.EXPIRED;
          await this.snapshotRepo.save(snapshot);
          throw new BadRequestException('Checkout session has expired. Please initiate checkout again.');
        }

        snapshot.status = CheckoutSnapshotStatus.PAYMENT_PROCESSING;
        await this.snapshotRepo.save(snapshot);
      }
    }

    // 3. Execute Single Database Transaction
    const transactionResult = await this.dataSource.transaction(async (manager) => {
      // Re-verify inventory & acquire pessimistic_write row lock
      if (snapshot && snapshot.items) {
        for (const item of snapshot.items) {
          const inventory = await manager.findOne(Inventory, {
            where: { variantId: item.variantId },
            lock: { mode: 'pessimistic_write' },
          });
          if (!inventory || inventory.availableQuantity < item.quantity) {
            throw new BadRequestException(
              `Inventory changed during payment. Insufficient stock for variant ${item.variantId}.`,
            );
          }
        }
      }

      const orderNumber = await this.generateOrderNumberInTx(manager);
      const effectiveUserId = snapshot?.userId || userIdFromMetadata || intent.metadata?.userId;
      const shippingAddrId = snapshot?.shippingAddressId || null;

      let warehouseId: string | null = null;
      let distanceKm: number | null = null;
      if (shippingAddrId) {
        const addr = await manager.findOne(Address, { where: { id: shippingAddrId } });
        if (addr) {
          const wh = await this.warehousesService.findNearest(addr.latitude, addr.longitude);
          if (wh) {
            warehouseId = wh.id;
            distanceKm = this.haversine(addr.latitude, addr.longitude, wh.latitude, wh.longitude);
          }
        }
      }

      const totalAmt = snapshot?.totalAmount ? Number(snapshot.totalAmount) : Number(intent.amount) / 100;
      const subtotalAmt = snapshot?.subtotal ? Number(snapshot.subtotal) : totalAmt;

      const order = manager.create(Order, {
        orderNumber,
        userId: effectiveUserId,
        snapshotId: snapshot?.id || null,
        stripePaymentIntentId: paymentIntentId,
        status: OrderStatus.PROCESSING,
        paymentStatus: PaymentStatus.PAID,
        subtotal: subtotalAmt,
        shippingAmount: snapshot?.shippingAmount ? Number(snapshot.shippingAmount) : 0,
        taxAmount: snapshot?.taxAmount ? Number(snapshot.taxAmount) : 0,
        discountAmount: snapshot?.discountAmount ? Number(snapshot.discountAmount) : 0,
        totalAmount: totalAmt,
        paidAmount: totalAmt,
        dueAmount: 0,
        shippingAddressId: shippingAddrId,
        warehouseId,
        distanceKm,
        notes: snapshot?.notes || null,
      });
      const savedOrder = await manager.save(Order, order);

      // Create Order Items & Deduct Stock
      if (snapshot && snapshot.items) {
        const orderItems = snapshot.items.map((item) =>
          manager.create(OrderItem, {
            orderId: savedOrder.id,
            productId: item.productId,
            variantId: item.variantId,
            productName: item.productName,
            sku: item.sku,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            totalPrice: item.lineTotal,
          }),
        );
        await manager.save(OrderItem, orderItems);

        for (const item of snapshot.items) {
          const inv = await manager.findOne(Inventory, { where: { variantId: item.variantId } });
          if (inv) {
            inv.availableQuantity -= item.quantity;
            await manager.save(Inventory, inv);
          }
        }

        snapshot.status = CheckoutSnapshotStatus.USED;
        snapshot.stripePaymentIntentId = paymentIntentId;
        await manager.save(CheckoutSnapshot, snapshot);

        // Atomic Coupon Usage Tracking
        if (snapshot.couponId) {
          const couponToUpdate = await manager.findOne(Coupon, {
            where: { id: snapshot.couponId },
            lock: { mode: 'pessimistic_write' },
          });

          if (couponToUpdate) {
            couponToUpdate.usageCount = (couponToUpdate.usageCount || 0) + 1;
            await manager.save(Coupon, couponToUpdate);

            const usage = manager.create(CouponUsage, {
              couponId: couponToUpdate.id,
              userId: effectiveUserId,
              orderId: savedOrder.id,
              discountAmount: snapshot.discountAmount ? Number(snapshot.discountAmount) : 0,
            });
            await manager.save(CouponUsage, usage);
          }
        }
      }

      // Create Payment Record
      const transactionNumber = `TXN-${uuidv4().slice(0, 8).toUpperCase()}`;
      const payment = manager.create(Payment, {
        orderId: savedOrder.id,
        transactionNumber,
        amount: totalAmt,
        status: PaymentStatus.PAID,
        stripePaymentIntentId: paymentIntentId,
        stripeChargeId: (intent.latest_charge as string) || null,
        gatewayStatus: intent.status,
        gatewayResponse: intent as unknown as Record<string, unknown>,
        paidAt: new Date(),
      });
      await manager.save(Payment, payment);

      // Create Shipment
      if (warehouseId) {
        await this.shipmentsService.createShipment(savedOrder.id, warehouseId, manager);
      }

      // Clear User Cart
      if (effectiveUserId) {
        const userCart = await manager.findOne(Cart, {
          where: { userId: effectiveUserId },
          relations: { items: true },
        });
        if (userCart && userCart.items?.length > 0) {
          await manager.remove(CartItem, userCart.items);
          userCart.items = [];
          userCart.subtotal = 0;
          userCart.totalItems = 0;
          await manager.save(Cart, userCart);
        }
      }

      return { savedOrder, payment };
    });

    const processingTimeMs = Date.now() - startTime;

    // Production Audit Logging
    this.logger.log(
      `[ORDER_CREATED_AUDIT] SnapshotId: ${snapshot?.id ?? 'N/A'}, PaymentIntentId: ${paymentIntentId}, OrderId: ${transactionResult.savedOrder.id}, UserId: ${transactionResult.savedOrder.userId}, ProcessingTimeMs: ${processingTimeMs}ms, Timestamp: ${new Date().toISOString()}`,
    );

    // Asynchronous Email Notification (Decoupled post-commit)
    this.sendPaymentNotification(transactionResult.savedOrder.id, 'success').catch((err) => {
      this.logger.error('Async payment confirmation email failed to send:', err);
    });

    return {
      message: 'Payment confirmed successfully.',
      alreadyProcessed: false,
      orderId: transactionResult.savedOrder.id,
      status: 'PAID',
      data: transactionResult.savedOrder,
    };
  }

  async handleWebhook(eventId: string, eventType: string, payload: any) {
    let webhook = await this.webhookRepo.findOne({
      where: { eventId },
    });

    if (webhook?.processed) {
      return { received: true, alreadyProcessed: true };
    }

    if (!webhook) {
      webhook = this.webhookRepo.create({
        eventId,
        eventType,
        payload,
        processed: false,
      });
    }

    switch (eventType) {
      case 'payment_intent.succeeded': {
        const intent = payload.data?.object;
        if (intent?.id) {
          await this.processSuccessfulPayment(intent.id);
        }
        webhook.processed = true;
        webhook.processedAt = new Date();
        break;
      }
      case 'payment_intent.payment_failed': {
        const failedIntent = payload.data?.object;
        if (failedIntent?.id) {
          const snapshotId = failedIntent.metadata?.snapshotId;
          if (snapshotId) {
            const snap = await this.snapshotRepo.findOne({ where: { id: snapshotId } });
            if (snap) {
              snap.status = CheckoutSnapshotStatus.FAILED;
              await this.snapshotRepo.save(snap);
            }
          }
        }
        webhook.processed = true;
        webhook.processedAt = new Date();
        break;
      }
      default:
        webhook.processed = true;
        webhook.processedAt = new Date();
        break;
    }

    await this.webhookRepo.save(webhook);
    return { received: true };
  }

  async getAllPayments(query: PaymentQueryDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = {};
    if (query.status) where.status = query.status;

    const [data, total] = await this.paymentRepo.findAndCount({
      where,
      relations: { refunds: true },
      skip,
      take: limit,
      order: { createdAt: 'DESC' },
    });

    return {
      data,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async getPayment(id: string) {
    const payment = await this.paymentRepo.findOne({
      where: { id },
      relations: { refunds: true, logs: true },
    });
    if (!payment) {
      throw new NotFoundException('Payment not found');
    }
    return payment;
  }

  async updatePayment(id: string, dto: UpdatePaymentDto) {
    const payment = await this.getPayment(id);
    if (dto.notes !== undefined) payment.notes = dto.notes;
    await this.paymentRepo.save(payment);
    return payment;
  }

  async getOrderPayment(orderId: string) {
    const payment = await this.paymentRepo.findOne({
      where: { orderId },
      relations: { refunds: true, logs: true },
    });
    if (!payment) {
      throw new NotFoundException('Payment not found for this order');
    }
    return payment;
  }

  async getCustomerPayments(userId: string, query: PaymentQueryDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const skip = (page - 1) * limit;
    const where: Record<string, unknown> = {};
    if (query.status) where.status = query.status;

    const [data] = await this.paymentRepo.findAndCount({
      where,
      relations: { refunds: true },
      skip,
      take: limit,
      order: { createdAt: 'DESC' },
    });

    const filtered = data.filter((p) => p.orderId);
    const orderIds = filtered.map((p) => p.orderId);

    if (orderIds.length === 0) {
      return {
        data: [],
        meta: { total: 0, page, limit, totalPages: 0 },
      };
    }

    const orders = await this.orderRepo.findBy({ id: In(orderIds) });
    const userOrderIds = orders
      .filter((o) => o.userId === userId)
      .map((o) => o.id);

    const userPayments = filtered.filter((p) =>
      userOrderIds.includes(p.orderId),
    );

    return {
      data: userPayments,
      meta: {
        total: userPayments.length,
        page,
        limit,
        totalPages: Math.ceil(userPayments.length / limit),
      },
    };
  }

  private async generateOrderNumberInTx(manager: any): Promise<string> {
    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, '0');
    const d = String(now.getDate()).padStart(2, '0');
    const prefix = `ORD-${y}${m}${d}-`;

    const todayOrders = await manager.find(Order, {
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

  private async createLog(
    paymentId: string,
    action: string,
    options?: { message?: string; performedBy?: string },
  ) {
    const log = this.paymentLogRepo.create({
      paymentId,
      action,
      message: options?.message ?? null,
      performedBy: options?.performedBy ?? null,
    });
    return this.paymentLogRepo.save(log);
  }

  private async sendPaymentNotification(
    orderId: string,
    type: 'success' | 'failed' | 'refunded',
  ) {
    try {
      const order = await this.orderRepo.findOne({
        where: { id: orderId },
        relations: { user: true },
      });
      if (!order?.user) return;

      if (type === 'success') {
        this.notificationsService
          .sendPaymentSuccess({
            to: order.user.email,
            userId: order.user.id,
            firstName: order.user.firstName,
            orderNumber: order.orderNumber,
            amount: Number(order.totalAmount),
          })
          .catch(() => {});
      } else if (type === 'failed') {
        this.notificationsService
          .sendPaymentFailed({
            to: order.user.email,
            userId: order.user.id,
            firstName: order.user.firstName,
            orderNumber: order.orderNumber,
          })
          .catch(() => {});
      } else if (type === 'refunded') {
        this.notificationsService
          .sendRefundProcessed({
            to: order.user.email,
            userId: order.user.id,
            firstName: order.user.firstName,
            orderNumber: order.orderNumber,
            amount: Number(order.totalAmount),
            reason: 'Webhook refund',
          })
          .catch(() => {});
      }
    } catch (error) {
      this.logger.error(
        'Failed to send payment notification:',
        error,
      );
    }
  }
}
