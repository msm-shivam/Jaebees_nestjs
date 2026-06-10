import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { Payment } from '../entities/payment.entity';
import { PaymentLog } from '../entities/payment-log.entity';
import { PaymentMethod } from '../entities/payment-method.entity';
import { PaymentWebhook } from '../entities/payment-webhook.entity';
import { PaymentStatus } from '../entities/payment-status.enum';
import { Order } from '../../orders/entities/order.entity';
import { User } from '../../users/entities/user.entity';
import { StripeService } from './stripe.service';
import { NotificationsService } from '../../notifications/notifications.service';
import { CreatePaymentIntentDto } from '../dto/create-payment-intent.dto';
import { ConfirmPaymentDto } from '../dto/confirm-payment.dto';
import { PaymentQueryDto } from '../dto/payment-query.dto';
import { UpdatePaymentDto } from '../dto/update-payment.dto';

@Injectable()
export class PaymentsService {
  constructor(
    @InjectRepository(Payment)
    private readonly paymentRepo: Repository<Payment>,
    @InjectRepository(PaymentLog)
    private readonly paymentLogRepo: Repository<PaymentLog>,
    @InjectRepository(PaymentMethod)
    private readonly paymentMethodRepo: Repository<PaymentMethod>,
    @InjectRepository(PaymentWebhook)
    private readonly webhookRepo: Repository<PaymentWebhook>,
    @InjectRepository(Order)
    private readonly orderRepo: Repository<Order>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    private readonly stripeService: StripeService,
    private readonly notificationsService: NotificationsService,
  ) {}

  async createPaymentIntent(dto: CreatePaymentIntentDto) {
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
    const intent = await this.stripeService.createPaymentIntent(amount, 'usd', {
      orderId: order.id,
      orderNumber: order.orderNumber,
    });

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

    await this.createLog(payment.id, 'PAYMENT_INTENT_CREATED', {
      message: `Payment intent created: ${intent.id}`,
      performedBy: 'system',
    });

    return {
      clientSecret: intent.client_secret,
    };
  }

  async confirmPayment(dto: ConfirmPaymentDto) {
    const intent = await this.stripeService.retrievePaymentIntent(
      dto.paymentIntentId,
    );

    const payment = await this.paymentRepo.findOne({
      where: { stripePaymentIntentId: dto.paymentIntentId },
      relations: { refunds: true, logs: true },
    });
    if (!payment) {
      throw new NotFoundException('Payment not found');
    }

    if (intent.status === 'succeeded') {
      payment.status = PaymentStatus.PAID;
      payment.stripeChargeId = intent.latest_charge as string;
      payment.gatewayStatus = intent.status;
      payment.gatewayResponse = intent;
      payment.paidAt = new Date();

      await this.paymentRepo.save(payment);

      await this.syncOrderPayment(payment.orderId);
      await this.createLog(payment.id, 'PAYMENT_SUCCESS', {
        message: `Payment succeeded: ${intent.id}`,
        performedBy: 'system',
      });

      await this.sendPaymentNotification(payment.orderId, 'success');
    } else if (intent.status === 'processing') {
      payment.status = PaymentStatus.PROCESSING;
      payment.gatewayStatus = intent.status;
      await this.paymentRepo.save(payment);
      await this.createLog(payment.id, 'PAYMENT_PROCESSING', {
        message: `Payment processing: ${intent.id}`,
        performedBy: 'system',
      });
    } else if (intent.status === 'requires_payment_method') {
      payment.status = PaymentStatus.FAILED;
      payment.gatewayStatus = intent.status;
      await this.paymentRepo.save(payment);
      await this.createLog(payment.id, 'PAYMENT_FAILED', {
        message: `Payment failed: ${intent.last_payment_error?.message ?? 'Card declined'}`,
        performedBy: 'system',
      });

      await this.sendPaymentNotification(payment.orderId, 'failed');
    }

    return {
      message: 'Payment confirmed successfully.',
      data: payment,
    };
  }

  async handleWebhook(
    eventId: string,
    eventType: string,
    payload: Record<string, unknown>,
  ) {
    const existing = await this.webhookRepo.findOne({
      where: { eventId },
    });
    if (existing) {
      return { received: true, duplicate: true };
    }

    const webhook = this.webhookRepo.create({
      eventId,
      eventType,
      payload,
      processed: false,
    });
    await this.webhookRepo.save(webhook);

    switch (eventType) {
      case 'payment_intent.succeeded': {
        const intent = payload.data as { object: { id: string } };
        const paymentIntentId = intent?.object?.id;
        if (paymentIntentId) {
          await this.confirmPayment({ paymentIntentId });
        }
        webhook.processed = true;
        webhook.processedAt = new Date();
        break;
      }
      case 'payment_intent.payment_failed': {
        const failedIntent = payload.data as { object: { id: string } };
        const failedId = failedIntent?.object?.id;
        if (failedId) {
          const payment = await this.paymentRepo.findOne({
            where: { stripePaymentIntentId: failedId },
          });
          if (payment) {
            payment.status = PaymentStatus.FAILED;
            await this.paymentRepo.save(payment);
            await this.createLog(payment.id, 'PAYMENT_FAILED', {
              message: `Payment failed via webhook: ${failedId}`,
              performedBy: 'system',
            });
            await this.sendPaymentNotification(payment.orderId, 'failed');
          }
        }
        webhook.processed = true;
        webhook.processedAt = new Date();
        break;
      }
      case 'charge.refunded': {
        const charge = payload.data as { object: { payment_intent: string } };
        const piId = charge?.object?.payment_intent;
        if (piId) {
          const payment = await this.paymentRepo.findOne({
            where: { stripePaymentIntentId: piId },
            relations: { refunds: true },
          });
          if (payment) {
            const totalRefunded = (payment.refunds ?? []).reduce(
              (sum, r) => sum + Number(r.refundAmount),
              0,
            );
            if (totalRefunded >= Number(payment.amount)) {
              payment.status = PaymentStatus.REFUNDED;
            } else {
              payment.status = PaymentStatus.PARTIALLY_REFUNDED;
            }
            await this.paymentRepo.save(payment);
            await this.syncOrderPayment(payment.orderId);
            await this.sendPaymentNotification(payment.orderId, 'refunded');
            await this.createLog(payment.id, 'REFUND_COMPLETED', {
              message: `Refund completed via webhook: ${piId}`,
              performedBy: 'system',
            });
          }
        }
        webhook.processed = true;
        webhook.processedAt = new Date();
        break;
      }
      case 'payment_intent.created':
      case 'payment_intent.processing':
      case 'charge.dispute.created':
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

    const [data, total] = await this.paymentRepo.findAndCount({
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

  private async syncOrderPayment(orderId: string) {
    const payments = await this.paymentRepo.find({
      where: { orderId },
    });

    const totalPaid = payments
      .filter(
        (p) =>
          p.status === PaymentStatus.PAID ||
          p.status === PaymentStatus.REFUNDED ||
          p.status === PaymentStatus.PARTIALLY_REFUNDED,
      )
      .reduce((sum, p) => sum + Number(p.amount), 0);

    const refundedAmount = payments
      .filter(
        (p) =>
          p.status === PaymentStatus.REFUNDED ||
          p.status === PaymentStatus.PARTIALLY_REFUNDED,
      )
      .reduce((sum, p) => sum + Number(p.amount), 0);

    const order = await this.orderRepo.findOne({ where: { id: orderId } });
    if (!order) return;

    const latestPayment =
      payments.length > 0
        ? payments.reduce((latest, p) =>
            p.createdAt > latest.createdAt ? p : latest,
          )
        : null;

    order.paidAmount = totalPaid - refundedAmount;
    order.dueAmount = Math.max(0, Number(order.totalAmount) - order.paidAmount);

    if (latestPayment) {
      order.paymentStatus = latestPayment.status;
      if (totalPaid >= Number(order.totalAmount)) {
        order.paymentStatus = PaymentStatus.PAID;
      } else if (
        refundedAmount > 0 &&
        refundedAmount < Number(order.totalAmount)
      ) {
        order.paymentStatus = PaymentStatus.PARTIALLY_REFUNDED;
      } else if (refundedAmount >= Number(order.totalAmount)) {
        order.paymentStatus = PaymentStatus.REFUNDED;
      }
    }

    await this.orderRepo.save(order);
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
        await this.notificationsService.sendPaymentSuccess({
          to: order.user.email,
          userId: order.user.id,
          firstName: order.user.firstName,
          orderNumber: order.orderNumber,
          amount: Number(order.totalAmount),
        });
      } else if (type === 'failed') {
        await this.notificationsService.sendPaymentFailed({
          to: order.user.email,
          userId: order.user.id,
          firstName: order.user.firstName,
          orderNumber: order.orderNumber,
        });
      } else if (type === 'refunded') {
        await this.notificationsService.sendRefundProcessed({
          to: order.user.email,
          userId: order.user.id,
          firstName: order.user.firstName,
          orderNumber: order.orderNumber,
          amount: Number(order.totalAmount),
          reason: 'Webhook refund',
        });
      }
    } catch {}
  }
}
