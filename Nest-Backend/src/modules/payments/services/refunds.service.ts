import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Payment } from '../entities/payment.entity';
import { PaymentRefund } from '../entities/payment-refund.entity';
import { PaymentLog } from '../entities/payment-log.entity';
import { PaymentStatus } from '../entities/payment-status.enum';
import { Order } from '../../orders/entities/order.entity';
import { User } from '../../users/entities/user.entity';
import { StripeService } from './stripe.service';
import { CreateRefundDto } from '../dto/create-refund.dto';
import { NotificationsService } from '../../notifications/notifications.service';

@Injectable()
export class RefundsService {
  constructor(
    @InjectRepository(Payment)
    private readonly paymentRepo: Repository<Payment>,
    @InjectRepository(PaymentRefund)
    private readonly refundRepo: Repository<PaymentRefund>,
    @InjectRepository(PaymentLog)
    private readonly paymentLogRepo: Repository<PaymentLog>,
    @InjectRepository(Order)
    private readonly orderRepo: Repository<Order>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    private readonly stripeService: StripeService,
    private readonly notificationsService: NotificationsService,
  ) {}

  async createRefund(
    paymentId: string,
    dto: CreateRefundDto,
    performedBy: string,
  ) {
    const payment = await this.paymentRepo.findOne({
      where: { id: paymentId },
      relations: { refunds: true },
    });
    if (!payment) {
      throw new NotFoundException('Payment not found');
    }

    if (payment.status === PaymentStatus.REFUNDED) {
      throw new BadRequestException('Payment is already fully refunded');
    }

    const totalRefunded = (payment.refunds ?? []).reduce(
      (sum, r) => sum + Number(r.refundAmount),
      0,
    );
    const remaining = Number(payment.amount) - totalRefunded;
    if (remaining <= 0) {
      throw new BadRequestException('No remaining amount to refund');
    }

    const refundAmount = dto.amount ?? remaining;
    if (refundAmount > remaining) {
      throw new BadRequestException(
        `Refund amount exceeds remaining balance of ${remaining}`,
      );
    }

    if (!payment.stripePaymentIntentId) {
      throw new BadRequestException(
        'Cannot refund: no Stripe payment intent associated',
      );
    }

    const stripeRefund = await this.stripeService.createRefund(
      payment.stripePaymentIntentId,
      refundAmount,
      dto.reason,
    );

    const refund = this.refundRepo.create({
      paymentId: payment.id,
      stripeRefundId: stripeRefund.id,
      refundAmount,
      reason: dto.reason ?? null,
      processedBy: performedBy,
      processedAt: new Date(),
    });
    await this.refundRepo.save(refund);

    const newTotalRefunded = totalRefunded + refundAmount;
    if (newTotalRefunded >= Number(payment.amount)) {
      payment.status = PaymentStatus.REFUNDED;
    } else {
      payment.status = PaymentStatus.PARTIALLY_REFUNDED;
    }
    await this.paymentRepo.save(payment);

    await this.createLog(
      payment.id,
      'REFUND_CREATED',
      `Refund of ${refundAmount} created. Reason: ${dto.reason ?? 'N/A'}`,
      performedBy,
    );

    const order = await this.orderRepo.findOne({
      where: { id: payment.orderId },
      relations: { user: true },
    });
    if (order?.user) {
      await this.notificationsService.sendRefundProcessed({
        to: order.user.email,
        userId: order.user.id,
        firstName: order.user.firstName,
        orderNumber: order.orderNumber,
        amount: refundAmount,
        reason: dto.reason ?? 'Customer request',
      });
    }

    return {
      message: 'Refund processed successfully.',
      data: payment,
    };
  }

  private async createLog(
    paymentId: string,
    action: string,
    message: string,
    performedBy: string,
  ) {
    const log = this.paymentLogRepo.create({
      paymentId,
      action,
      message,
      performedBy,
    });
    return this.paymentLogRepo.save(log);
  }
}
