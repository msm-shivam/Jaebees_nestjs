import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { ProductVariant } from '../../product-variants/entities/product-variant.entity';

@Entity('stock_alerts')
@Index(['variantId'])
@Index(['triggeredAt'])
@Index(['resolvedAt'])
export class StockAlert {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => ProductVariant)
  @JoinColumn({ name: 'variant_id' })
  variant: ProductVariant;

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
