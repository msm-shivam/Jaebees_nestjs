import {
  Column,
  DeleteDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
} from 'typeorm';
import { BaseEntity } from '../../../shared/entities/base.entity';
import { Category } from '../../categories/entities/category.entity';
import { Brand } from '../../brands/entities/brand.entity';
import { ProductImage } from './product-image.entity';

export enum ProductStatus {
  DRAFT = 'DRAFT',
  ACTIVE = 'ACTIVE',
  ARCHIVED = 'ARCHIVED',
}

export enum ProductGender {
  MEN = 'MEN',
  WOMEN = 'WOMEN',
  UNISEX = 'UNISEX',
  KIDS = 'KIDS',
}

@Entity('products')
@Index(['slug'], { unique: true })
@Index(['categoryId'])
@Index(['brandId'])
@Index(['status'])
@Index(['gender'])
export class Product extends BaseEntity {
  @Column({ length: 250 })
  name: string;

  @Column({ unique: true, length: 250 })
  slug: string;

  @Column({ name: 'short_description', type: 'varchar', length: 500, nullable: true })
  shortDescription: string | null;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({ type: 'enum', enum: ProductStatus, default: ProductStatus.DRAFT })
  status: ProductStatus;

  @Column({ type: 'enum', enum: ProductGender, default: ProductGender.UNISEX })
  gender: ProductGender;

  @Column({ name: 'base_price', type: 'numeric', precision: 10, scale: 2 })
  basePrice: number;

  @Column({ name: 'compare_price', type: 'numeric', precision: 10, scale: 2, nullable: true })
  comparePrice: number | null;

  @Column({ name: 'cost_price', type: 'numeric', precision: 10, scale: 2, nullable: true })
  costPrice: number | null;

  @Column({ name: 'sku', type: 'varchar', length: 100, nullable: true })
  sku: string | null;

  @Column({ name: 'barcode', type: 'varchar', length: 100, nullable: true })
  barcode: string | null;

  @Column({ name: 'is_featured', default: false })
  isFeatured: boolean;

  @Column({ name: 'is_digital', default: false })
  isDigital: boolean;

  @Column({ name: 'weight', type: 'numeric', precision: 8, scale: 3, nullable: true })
  weight: number | null;

  @Column({ name: 'category_id', type: 'uuid', nullable: true })
  categoryId: string | null;

  @Column({ name: 'brand_id', type: 'uuid', nullable: true })
  brandId: string | null;

  // ─── SEO ──────────────────────────────────────────────────────────────────
  @Column({ name: 'meta_title', type: 'varchar', length: 200, nullable: true })
  metaTitle: string | null;

  @Column({ name: 'meta_description', type: 'varchar', length: 500, nullable: true })
  metaDescription: string | null;

  @Column({ name: 'tags', type: 'varchar', array: true, default: [] })
  tags: string[];

  @DeleteDateColumn({ name: 'deleted_at', type: 'timestamptz', nullable: true })
  deletedAt: Date | null;

  // ─── Relations ────────────────────────────────────────────────────────────
  @ManyToOne(() => Category, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'category_id' })
  category: Category | null;

  @ManyToOne(() => Brand, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'brand_id' })
  brand: Brand | null;

  @OneToMany(() => ProductImage, (img) => img.product, { cascade: ['insert', 'update'] })
  images: ProductImage[];
}
