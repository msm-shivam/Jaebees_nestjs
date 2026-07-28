import { Expose } from 'class-transformer';
import {
  Column,
  DeleteDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
} from 'typeorm';
import { BaseEntity } from '../../../shared/entities/base.entity';
import { Product } from './product.entity';

@Entity('product_images')
@Index(['productId'])
@Index(['isPrimary'])
export class ProductImage extends BaseEntity {
  @Column({ name: 'product_id', type: 'uuid' })
  productId: string;

  @Expose()
  @Column({ name: 'image_url', type: 'text' })
  imageUrl: string;

  @Expose()
  @Column({ name: 'alt_text', type: 'varchar', length: 255, nullable: true })
  altText: string | null;

  @Expose()
  @Column({ name: 'sort_order', type: 'int', default: 0 })
  sortOrder: number;

  @Expose()
  @Column({ name: 'is_primary', default: false })
  isPrimary: boolean;

  @DeleteDateColumn({ name: 'deleted_at', type: 'timestamptz', nullable: true })
  deletedAt: Date | null;

  // ─── Relations ────────────────────────────────────────────────────────────
  @ManyToOne(() => Product, (product) => product.images, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'product_id' })
  product: Product;
}
