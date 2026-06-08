import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { Promotion } from './promotion.entity';

@Entity('discount_rules')
@Index(['promotionId'])
export class DiscountRule {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'promotion_id', type: 'uuid' })
  promotionId: string;

  @ManyToOne(() => Promotion, (promotion) => promotion.discountRules, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'promotion_id' })
  promotion: Promotion;

  @Column({ name: 'category_id', type: 'uuid', nullable: true })
  categoryId: string;

  @Column({ name: 'product_id', type: 'uuid', nullable: true })
  productId: string;

  @Column({ name: 'variant_id', type: 'uuid', nullable: true })
  variantId: string;

  @Column({ name: 'minimum_quantity', type: 'int', nullable: true })
  minimumQuantity: number;

  @Column({
    name: 'minimum_amount',
    type: 'decimal',
    precision: 10,
    scale: 2,
    nullable: true,
  })
  minimumAmount: number;

  @Column({ name: 'buy_quantity', type: 'int', nullable: true })
  buyQuantity: number;

  @Column({ name: 'get_quantity', type: 'int', nullable: true })
  getQuantity: number;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp with time zone' })
  createdAt: Date;
}
