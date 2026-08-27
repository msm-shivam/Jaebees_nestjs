import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm';
import { BaseEntity } from '../../../shared/entities/base.entity';
import { Payment } from './payment.entity';

export enum RefundStatus {
  PROCESSING = 'PROCESSING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
}

@Entity('payment_refunds')
@Index(['paymentId'])
@Index(['idempotencyKey'], { unique: true })
export class PaymentRefund extends BaseEntity {
  @Column({ name: 'payment_id', type: 'uuid' })
  paymentId: string;

  @ManyToOne(() => Payment, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'payment_id' })
  payment: Payment;

  @Column({
    name: 'stripe_refund_id',
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  stripeRefundId: string | null;

  @Column({ name: 'refund_amount', type: 'decimal', precision: 12, scale: 2 })
  refundAmount: number;

  @Column({
    type: 'varchar',
    length: 50,
    default: 'COMPLETED',
  })
  status: string;

  @Column({
    name: 'idempotency_key',
    type: 'varchar',
    length: 255,
    nullable: true,
    unique: true,
  })
  idempotencyKey: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  reason: string | null;

  @Column({ type: 'text', nullable: true })
  notes: string | null;

  @Column({ name: 'processed_by', type: 'uuid', nullable: true })
  processedBy: string | null;

  @Column({ name: 'processed_at', type: 'timestamptz', nullable: true })
  processedAt: Date | null;
}
