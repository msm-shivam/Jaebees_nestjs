import { Expose } from 'class-transformer';
import {
  Entity,
  Column,
  Index,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  DeleteDateColumn,
} from 'typeorm';
import { BaseEntity } from '../../../shared/entities/base.entity';
import { Wishlist } from './wishlist.entity';
import { Product } from '../../products/entities/product.entity';
import { ProductVariant } from '../../product-variants/entities/product-variant.entity';

@Entity('wishlist_items')
@Index(['wishlistId'])
@Index(['productId'])
export class WishlistItem extends BaseEntity {
  @Column({ name: 'wishlist_id', type: 'uuid' })
  wishlistId: string;

  @ManyToOne(() => Wishlist, (wishlist) => wishlist.items, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'wishlist_id' })
  wishlist: Wishlist;

  @Column({ name: 'product_id', type: 'uuid' })
  productId: string;

  @Expose()
  @ManyToOne(() => Product, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'product_id' })
  product: Product;

  @Column({ name: 'variant_id', type: 'uuid', nullable: true })
  variantId: string;

  @Expose()
  @ManyToOne(() => ProductVariant, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'variant_id' })
  variant: ProductVariant;

  @Expose()
  @CreateDateColumn({ name: 'added_at', type: 'timestamptz' })
  addedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at', type: 'timestamptz', nullable: true })
  deletedAt: Date;
}
