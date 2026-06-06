import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  Index,
} from 'typeorm';
import { ProductVariant } from '../../product-variants/entities/product-variant.entity';

@Entity('inventories')
@Index('idx_inventories_variant_id', ['variantId'], { unique: true })
@Index('idx_inventories_quantity', ['quantity'])
@Index('idx_inventories_available_quantity', ['availableQuantity'])
export class Inventory {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'variant_id', type: 'uuid', unique: true })
  variantId: string;

  @ManyToOne(() => ProductVariant, (variant) => variant.inventories, {
    onDelete: 'CASCADE',
  })
  variant: ProductVariant;

  @Column({ type: 'int', default: 0 })
  quantity: number;

  @Column({ name: 'reserved_quantity', type: 'int', default: 0 })
  reservedQuantity: number;

  @Column({ name: 'available_quantity', type: 'int', default: 0 })
  availableQuantity: number;

  @Column({ name: 'low_stock_threshold', type: 'int', default: 5 })
  lowStockThreshold: number;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp with time zone' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp with time zone' })
  updatedAt: Date;
}
