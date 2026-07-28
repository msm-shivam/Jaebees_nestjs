import { Expose, Type } from 'class-transformer';
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  ManyToOne,
  JoinColumn,
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
  @Expose()
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Expose()
  @Column({ name: 'product_id', type: 'uuid' })
  productId: string;

  @Expose()
  @Type(() => Product)
  @ManyToOne(() => Product, (product) => product.variants, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'product_id' })
  product: Product;

  @Expose()
  @Column({ type: 'varchar', length: 150, unique: true })
  sku: string;

  @Expose()
  @Column({ type: 'varchar', length: 150, nullable: true })
  barcode: string;

  @Expose()
  @Column({ type: 'decimal', precision: 12, scale: 2 })
  price: number;

  @Expose()
  @Column({
    name: 'compare_at_price',
    type: 'decimal',
    precision: 12,
    scale: 2,
    nullable: true,
  })
  compareAtPrice: number;

  @Expose()
  @Column({
    name: 'cost_price',
    type: 'decimal',
    precision: 12,
    scale: 2,
    nullable: true,
  })
  costPrice: number;

  @Expose()
  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  weight: number;

  @Expose()
  @Column({
    type: 'enum',
    enum: VariantStatus,
    default: VariantStatus.ACTIVE,
  })
  status: VariantStatus;

  @Expose()
  @Column({ name: 'is_default', type: 'boolean', default: false })
  isDefault: boolean;

  @OneToMany(
    () => ProductVariantAttribute,
    (variantAttribute: ProductVariantAttribute) => variantAttribute.variant,
    {
      cascade: true,
    },
  )
  attributes: ProductVariantAttribute[];

  @OneToMany(() => Inventory, (inventory) => inventory.variant, {
    cascade: true,
  })
  inventories: Inventory[];

  @Expose()
  @CreateDateColumn({ name: 'created_at', type: 'timestamp with time zone' })
  createdAt: Date;

  @Expose()
  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp with time zone' })
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at', type: 'timestamp with time zone' })
  deletedAt: Date;
}
