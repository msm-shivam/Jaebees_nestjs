import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, In } from 'typeorm';
import { Payment } from '../entities/payment.entity';
import { PaymentRefund, RefundStatus } from '../entities/payment-refund.entity';
import { PaymentLog } from '../entities/payment-log.entity';
import { PaymentStatus } from '../entities/payment-status.enum';
import { Order } from '../../orders/entities/order.entity';
import { User } from '../../users/entities/user.entity';
import { StripeService } from './stripe.service';
import { CreateRefundDto } from '../dto/create-refund.dto';
import { NotificationsService } from '../../notifications/notifications.service';

@Injectable()
export class RefundsService {
  private readonly logger = new Logger(RefundsService.name);

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
    private readonly dataSource: DataSource,
  ) {}

  async createRefund(
    paymentId: string,
    dto: CreateRefundDto,
    performedBy: string,
    idempotencyKeyOverride?: string,
  ) {
    const key = dto.idempotencyKey || idempotencyKeyOverride || `refund_${paymentId}_${dto.amount ?? 'full'}_${Date.now()}`;

    // 1. Idempotency Check for existing reservation/refund
    let existingRefund = await this.refundRepo.findOne({
      where: { idempotencyKey: key },
    });

    if (existingRefund) {
      if (
        existingRefund.paymentId !== paymentId ||
        (dto.amount && Number(existingRefund.refundAmount) !== Number(dto.amount))
      ) {
        throw new BadRequestException(
          'Idempotency conflict: existing refund parameters do not match request.',
        );
      }

      if (existingRefund.status === RefundStatus.COMPLETED) {
        const paymentObj = await this.paymentRepo.findOne({
          where: { id: paymentId },
          relations: { refunds: true },
        });
        return {
          message: 'Refund already processed.',
          alreadyProcessed: true,
          data: paymentObj,
        };
      }
    }

    // 2. Phase 1: DB Lock & Reservation Transaction
    let refundReservation: PaymentRefund;
    if (!existingRefund || existingRefund.status === RefundStatus.FAILED) {
      refundReservation = await this.dataSource.transaction(async (manager) => {
        const paymentLocked = await manager.findOne(Payment, {
          where: { id: paymentId },
          lock: { mode: 'pessimistic_write' },
        });
        if (!paymentLocked) {
          throw new NotFoundException('Payment not found');
        }

        if (paymentLocked.status === PaymentStatus.REFUNDED) {
          throw new BadRequestException('Payment is already fully refunded');
        }

        if (!paymentLocked.stripePaymentIntentId) {
          throw new BadRequestException(
            'Cannot refund: no Stripe payment intent associated',
          );
        }

        const existingRefunds = await manager.find(PaymentRefund, {
          where: {
            paymentId,
            status: In([RefundStatus.COMPLETED, RefundStatus.PROCESSING]),
          },
        });

        const totalReservedAndRefunded = existingRefunds.reduce(
          (sum, r) => sum + Number(r.refundAmount),
          0,
        );

        const remaining = Number(paymentLocked.amount) - totalReservedAndRefunded;
        if (remaining <= 0) {
          throw new BadRequestException('No remaining amount to refund');
        }

        const refundAmt = dto.amount ?? remaining;
        if (refundAmt <= 0) {
          throw new BadRequestException('Refund amount must be greater than 0');
        }
        if (refundAmt > remaining) {
          throw new BadRequestException(
            `Refund amount exceeds remaining balance of ${remaining}`,
          );
        }

        const reservation = manager.create(PaymentRefund, {
          paymentId,
          refundAmount: refundAmt,
          status: RefundStatus.PROCESSING,
          idempotencyKey: key,
          reason: dto.reason ?? null,
          processedBy: performedBy,
        });

        return await manager.save(PaymentRefund, reservation);
      });
    } else {
      refundReservation = existingRefund;
    }

    const paymentObj = await this.paymentRepo.findOne({ where: { id: paymentId } });
    if (!paymentObj || !paymentObj.stripePaymentIntentId) {
      throw new BadRequestException('Payment or Stripe intent missing.');
    }

    // 3. Phase 2: Call Stripe API outside DB transaction lock
    let stripeRefund: any;
    try {
      stripeRefund = await this.stripeService.createRefund(
        paymentObj.stripePaymentIntentId,
        Number(refundReservation.refundAmount),
        dto.reason,
        key,
      );
    } catch (err: any) {
      this.logger.error(`Stripe refund failed for key ${key}:`, err);
      refundReservation.status = RefundStatus.FAILED;
      await this.refundRepo.save(refundReservation);
      throw new BadRequestException(
        err?.message || 'Stripe refund creation failed.',
      );
    }

    // 4. Phase 3: Finalize DB State & Commit Completion
    const updatedPayment = await this.dataSource.transaction(async (manager) => {
      refundReservation.stripeRefundId = stripeRefund.id;
      refundReservation.status = RefundStatus.COMPLETED;
      refundReservation.processedAt = new Date();
      await manager.save(PaymentRefund, refundReservation);

      const allCompleted = await manager.find(PaymentRefund, {
        where: { paymentId, status: RefundStatus.COMPLETED },
      });

      const totalCompleted = allCompleted.reduce(
        (sum, r) => sum + Number(r.refundAmount),
        0,
      );

      const targetPayment = await manager.findOne(Payment, { where: { id: paymentId } });
      if (targetPayment) {
        if (totalCompleted >= Number(targetPayment.amount)) {
          targetPayment.status = PaymentStatus.REFUNDED;
        } else {
          targetPayment.status = PaymentStatus.PARTIALLY_REFUNDED;
        }
        await manager.save(Payment, targetPayment);
      }

      const log = manager.create(PaymentLog, {
        paymentId,
        action: 'REFUND_CREATED',
        message: `Refund of ${refundReservation.refundAmount} created. Reason: ${dto.reason ?? 'N/A'}`,
        performedBy,
      });
      await manager.save(PaymentLog, log);

      return targetPayment;
    });

    const order = await this.orderRepo.findOne({
      where: { id: paymentObj.orderId },
      relations: { user: true },
    });
    if (order?.user) {
      this.notificationsService.sendRefundProcessed({
        to: order.user.email,
        userId: order.user.id,
        firstName: order.user.firstName,
        orderNumber: order.orderNumber,
        amount: Number(refundReservation.refundAmount),
        reason: dto.reason ?? 'Customer request',
      }).catch(() => {});
    }

    return {
      message: 'Refund processed successfully.',
      alreadyProcessed: false,
      data: updatedPayment,
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
