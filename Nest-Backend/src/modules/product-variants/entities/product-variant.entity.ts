import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  ManyToOne,
  OneToMany,
  Index,
} from 'typeorm';
import { Product } from '../../products/entities/product.entity';
import { ProductVariantAttribute } from './product-variant-attribute.entity';
import { Inventory } from '../../inventory/entities/inventory.entity';

export enum VariantStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  OUT_OF_STOCK = 'OUT_OF_STOCK',
  ARCHIVED = 'ARCHIVED',
}

@Entity('product_variants')
@Index('idx_product_variants_product_id', ['productId'])
@Index('idx_product_variants_sku', ['sku'], { unique: true })
@Index('idx_product_variants_status', ['status'])
@Index('idx_product_variants_is_default', ['isDefault'])
export class ProductVariant {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'product_id', type: 'uuid' })
  productId: string;

  @ManyToOne(() => Product, (product) => product.variants, {
    onDelete: 'CASCADE',
  })
  product: Product;

  @Column({ type: 'varchar', length: 150, unique: true })
  sku: string;

  @Column({ type: 'varchar', length: 150, nullable: true })
  barcode: string;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  price: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, nullable: true })
  compareAtPrice: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, nullable: true })
  costPrice: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  weight: number;

  @Column({
    type: 'enum',
    enum: VariantStatus,
    default: VariantStatus.ACTIVE,
  })
  status: VariantStatus;

  @Column({ name: 'is_default', type: 'boolean', default: false })
  isDefault: boolean;

  @OneToMany(() => ProductVariantAttribute, (variantAttribute: ProductVariantAttribute) => variantAttribute.variant, {
    cascade: true,
  })
  attributes: ProductVariantAttribute[];

  @OneToMany(() => Inventory, (inventory) => inventory.variant, {
    cascade: true,
  })
  inventories: Inventory[];

  @CreateDateColumn({ name: 'created_at', type: 'timestamp with time zone' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp with time zone' })
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at', type: 'timestamp with time zone' })
  deletedAt: Date;
}
