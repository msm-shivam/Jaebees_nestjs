import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  Index,
} from 'typeorm';

@Entity('stock_alerts')
@Index(['variantId'])
@Index(['triggeredAt'])
@Index(['resolvedAt'])
export class StockAlert {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'variant_id', type: 'uuid' })
  variantId: string;

  @Column({ name: 'threshold_quantity', type: 'int' })
  thresholdQuantity: number;

  @Column({ name: 'current_quantity', type: 'int' })
  currentQuantity: number;

  @Column({ name: 'alert_type', length: 50, default: 'LOW_STOCK' })
  alertType: string;

  @Column({ name: 'is_resolved', default: false })
  isResolved: boolean;

  @Column({
    name: 'triggered_at',
    type: 'timestamp with time zone',
    default: () => 'now()',
  })
  triggeredAt: Date;

  @Column({
    name: 'resolved_at',
    type: 'timestamp with time zone',
    nullable: true,
  })
  resolvedAt: Date;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp with time zone' })
  createdAt: Date;
}
