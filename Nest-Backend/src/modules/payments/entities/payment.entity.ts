import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
} from 'typeorm';
import { BaseEntity } from '../../../shared/entities/base.entity';
import { Order } from '../../orders/entities/order.entity';
import { PaymentMethod } from './payment-method.entity';
import { PaymentRefund } from './payment-refund.entity';
import { PaymentLog } from './payment-log.entity';
import { PaymentStatus } from './payment-status.enum';

@Entity('payments')
@Index(['orderId'])
@Index(['status'])
@Index(['transactionNumber'])
@Index(['stripePaymentIntentId'], { unique: true })
export class Payment extends BaseEntity {
  @Column({ name: 'order_id', type: 'uuid' })
  orderId: string;

  @ManyToOne(() => Order, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'order_id' })
  order: Order;

  @Column({ name: 'payment_method_id', type: 'uuid', nullable: true })
  paymentMethodId: string | null;

  @ManyToOne(() => PaymentMethod, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'payment_method_id' })
  paymentMethod: PaymentMethod | null;

  @Column({
    name: 'transaction_number',
    type: 'varchar',
    length: 100,
    unique: true,
  })
  transactionNumber: string;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  amount: number;

  @Column({
    type: 'enum',
    enum: PaymentStatus,
    default: PaymentStatus.PENDING,
  })
  status: PaymentStatus;

  @Column({
    name: 'stripe_payment_intent_id',
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  stripePaymentIntentId: string | null;

  @Column({
    name: 'stripe_charge_id',
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  stripeChargeId: string | null;

  @Column({
    name: 'gateway_status',
    type: 'varchar',
    length: 50,
    nullable: true,
  })
  gatewayStatus: string | null;

  @Column({ name: 'gateway_response', type: 'jsonb', nullable: true })
  gatewayResponse: Record<string, unknown> | null;

  @Column({ type: 'text', nullable: true })
  notes: string | null;

  @Column({ name: 'paid_at', type: 'timestamptz', nullable: true })
  paidAt: Date | null;

  @OneToMany(() => PaymentRefund, (refund) => refund.payment, { cascade: true })
  refunds: PaymentRefund[];

  @OneToMany(() => PaymentLog, (log) => log.payment, { cascade: true })
  logs: PaymentLog[];
}
