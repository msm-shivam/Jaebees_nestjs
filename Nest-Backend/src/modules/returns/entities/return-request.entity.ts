import { Entity, Column, Index, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { BaseEntity } from '../../../shared/entities/base.entity';
import { Order } from '../../orders/entities/order.entity';
import { User } from '../../users/entities/user.entity';
import { ReturnRequestStatus } from '../enums/return-request-status.enum';
import { ReturnReason } from '../enums/return-reason.enum';
import { ReturnItem } from './return-item.entity';
import { ReverseShipment } from './reverse-shipment.entity';
import { ReturnAudit } from './return-audit.entity';

@Entity('return_requests')
@Index(['returnNumber'], { unique: true })
@Index(['orderId'])
@Index(['userId'])
@Index(['status'])
@Index(['requestedAt'])
export class ReturnRequest extends BaseEntity {
  @Column({ name: 'return_number', type: 'varchar', length: 50, unique: true })
  returnNumber: string;

  @Column({ name: 'order_id', type: 'uuid' })
  orderId: string;

  @ManyToOne(() => Order, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'order_id' })
  order: Order;

  @Column({ name: 'user_id', type: 'uuid' })
  userId: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ type: 'enum', enum: ReturnRequestStatus, default: ReturnRequestStatus.REQUESTED })
  status: ReturnRequestStatus;

  @Column({ type: 'enum', enum: ReturnReason })
  reason: ReturnReason;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column({ name: 'total_refund_amount', type: 'decimal', precision: 12, scale: 2, default: 0 })
  totalRefundAmount: number;

  @Column({ name: 'requested_at', type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  requestedAt: Date;

  @Column({ name: 'approved_at', type: 'timestamptz', nullable: true })
  approvedAt: Date;

  @Column({ name: 'completed_at', type: 'timestamptz', nullable: true })
  completedAt: Date;

  @OneToMany(() => ReturnItem, (item) => item.returnRequest, { cascade: true })
  items: ReturnItem[];

  @OneToMany(() => ReverseShipment, (shipment) => shipment.returnRequest)
  shipments: ReverseShipment[];

  @OneToMany(() => ReturnAudit, (audit) => audit.returnRequest)
  audits: ReturnAudit[];
}
