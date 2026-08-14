/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { Injectable, Logger, Inject, forwardRef } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan, In } from 'typeorm';
import {
  CheckoutSnapshot,
  CheckoutSnapshotStatus,
} from '../entities/checkout-snapshot.entity';
import { Order } from '../../orders/entities/order.entity';
import { StripeService } from './stripe.service';
import { PaymentsService } from './payments.service';

@Injectable()
export class CheckoutCronService {
  private readonly logger = new Logger(CheckoutCronService.name);

  constructor(
    @InjectRepository(CheckoutSnapshot)
    private readonly snapshotRepo: Repository<CheckoutSnapshot>,
    @InjectRepository(Order)
    private readonly orderRepo: Repository<Order>,
    private readonly stripeService: StripeService,
    @Inject(forwardRef(() => PaymentsService))
    private readonly paymentsService: PaymentsService,
  ) {}

  /**
   * Runs every 10 minutes to expire old PENDING snapshots
   */
  @Cron(CronExpression.EVERY_10_MINUTES)
  async handleSnapshotCleanup() {
    this.logger.log('Starting scheduled job: Checkout Snapshot Cleanup');
    try {
      const now = new Date();
      const expiredResult = await this.snapshotRepo.update(
        {
          status: CheckoutSnapshotStatus.PENDING,
          expiresAt: LessThan(now),
        },
        {
          status: CheckoutSnapshotStatus.EXPIRED,
        },
      );

      if (expiredResult.affected && expiredResult.affected > 0) {
        this.logger.log(
          `Expired ${expiredResult.affected} stale checkout snapshots.`,
        );
      }
    } catch (err: any) {
      this.logger.error('Failed to cleanup expired checkout snapshots', err);
    }
  }

  /**
   * Runs every 15 minutes to recover orphan payments (captured by Stripe but order creation interrupted)
   */
  @Cron('*/15 * * * *')
  async handleOrphanedPaymentRecovery() {
    this.logger.log('Starting scheduled job: Orphaned Payment Recovery');
    try {
      const candidates = await this.snapshotRepo.find({
        where: {
          status: In([
            CheckoutSnapshotStatus.PAYMENT_PROCESSING,
            CheckoutSnapshotStatus.PAID,
          ]),
        },
        take: 50,
      });

      for (const snapshot of candidates) {
        if (!snapshot.stripePaymentIntentId) continue;

        const existingOrder = await this.orderRepo.findOne({
          where: [
            { snapshotId: snapshot.id },
            { stripePaymentIntentId: snapshot.stripePaymentIntentId },
          ],
        });

        if (existingOrder) {
          if (snapshot.status !== CheckoutSnapshotStatus.USED) {
            snapshot.status = CheckoutSnapshotStatus.USED;
            await this.snapshotRepo.save(snapshot);
          }
          continue;
        }

        try {
          const intent = await this.stripeService.retrievePaymentIntent(
            snapshot.stripePaymentIntentId,
          );

          if (intent.status === 'succeeded') {
            this.logger.warn(
              `Recovering orphaned payment intent: ${intent.id} for snapshot: ${snapshot.id}`,
            );
            await this.paymentsService.processSuccessfulPayment(intent.id);
          } else if (
            intent.status === 'canceled' ||
            intent.status === 'requires_payment_method'
          ) {
            snapshot.status = CheckoutSnapshotStatus.FAILED;
            await this.snapshotRepo.save(snapshot);
          }
        } catch (intentErr: any) {
          this.logger.error(
            `Failed to recover intent ${snapshot.stripePaymentIntentId}`,
            intentErr,
          );
        }
      }
    } catch (err: any) {
      this.logger.error('Failed to execute orphaned payment recovery job', err);
    }
  }
}
