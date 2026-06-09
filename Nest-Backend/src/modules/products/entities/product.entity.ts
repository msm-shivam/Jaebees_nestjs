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
import { Brand } from '../../brands/entities/brand.entity';
import { Category } from '../../categories/entities/category.entity';
import { SubCategory } from '../../sub-categories/entities/sub-category.entity';
import { ProductImage } from './product-image.entity';
import { ProductVariant } from '../../product-variants/entities/product-variant.entity';

export enum ProductStatus {
  DRAFT = 'DRAFT',
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  ARCHIVED = 'ARCHIVED',
}

@Entity('products')
@Index(['brandId'])
@Index(['categoryId'])
@Index(['subCategoryId'])
@Index(['slug'], { unique: true })
@Index(['status'])
@Index(['isActive'])
@Index(['isFeatured'])
export class Product extends BaseEntity {
  @Column({ name: 'brand_id', type: 'uuid' })
  brandId: string;

  @Column({ name: 'category_id', type: 'uuid' })
  categoryId: string;

  @Column({ name: 'sub_category_id', type: 'uuid' })
  subCategoryId: string;

  @Column({ length: 255 })
  name: string;

  @Column({ unique: true, length: 255 })
  slug: string;

  @Column({ name: 'sku_prefix', type: 'varchar', length: 100, nullable: true })
  skuPrefix: string | null;

  @Column({ name: 'short_description', type: 'text', nullable: true })
  shortDescription: string | null;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({
    type: 'enum',
    enum: ProductStatus,
    default: ProductStatus.DRAFT,
  })
  status: ProductStatus;

  @Column({ name: 'meta_title', type: 'varchar', length: 255, nullable: true })
  metaTitle: string | null;

  @Column({ name: 'meta_description', type: 'text', nullable: true })
  metaDescription: string | null;

  @Column({ name: 'meta_keywords', type: 'text', nullable: true })
  metaKeywords: string | null;

  @Column({ name: 'is_featured', default: false })
  isFeatured: boolean;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @Column({
    name: 'average_rating',
    type: 'decimal',
    precision: 3,
    scale: 2,
    default: 0,
  })
  averageRating: number;

  @Column({ name: 'total_ratings', type: 'int', default: 0 })
  totalRatings: number;

  @Column({ name: 'total_reviews', type: 'int', default: 0 })
  totalReviews: number;

  @Column({ name: 'five_star_count', type: 'int', default: 0 })
  fiveStarCount: number;

  @Column({ name: 'four_star_count', type: 'int', default: 0 })
  fourStarCount: number;

  @Column({ name: 'three_star_count', type: 'int', default: 0 })
  threeStarCount: number;

  @Column({ name: 'two_star_count', type: 'int', default: 0 })
  twoStarCount: number;

  @Column({ name: 'one_star_count', type: 'int', default: 0 })
  oneStarCount: number;

  @DeleteDateColumn({ name: 'deleted_at', type: 'timestamptz', nullable: true })
  deletedAt: Date | null;

  // ─── Relations ────────────────────────────────────────────────────────────
  @ManyToOne(() => Brand, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'brand_id' })
  brand: Brand;

  @ManyToOne(() => Category, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'category_id' })
  category: Category;

  @ManyToOne(() => SubCategory, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'sub_category_id' })
  subCategory: SubCategory;

  @OneToMany(() => ProductImage, (image) => image.product, {
    cascade: true,
    onDelete: 'CASCADE',
  })
  images: ProductImage[];

  @OneToMany(() => ProductVariant, (variant) => variant.product, {
    cascade: true,
    onDelete: 'CASCADE',
  })
  variants: ProductVariant[];
}
