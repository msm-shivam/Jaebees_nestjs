import { Entity, Column, Index, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../../shared/entities/base.entity';
import { ReturnRequest } from './return-request.entity';
import { OrderItem } from '../../orders/entities/order-item.entity';
import { ReturnItemCondition } from '../enums/return-item-condition.enum';

@Entity('return_items')
@Index(['returnRequestId'])
@Index(['orderItemId'])
export class ReturnItem extends BaseEntity {
  @Column({ name: 'return_request_id', type: 'uuid' })
  returnRequestId: string;

  @ManyToOne(() => ReturnRequest, (rr) => rr.items, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'return_request_id' })
  returnRequest: ReturnRequest;

  @Column({ name: 'order_item_id', type: 'uuid' })
  orderItemId: string;

  @ManyToOne(() => OrderItem, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'order_item_id' })
  orderItem: OrderItem;

  @Column({ type: 'int' })
  quantity: number;

  @Column({ type: 'text', nullable: true })
  reason: string;

  @Column({
    type: 'enum',
    enum: ReturnItemCondition,
    default: ReturnItemCondition.UNOPENED,
  })
  condition: ReturnItemCondition;

  @Column({
    name: 'refund_amount',
    type: 'decimal',
    precision: 12,
    scale: 2,
    default: 0,
  })
  refundAmount: number;
}
