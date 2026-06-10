import {
  Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, ManyToOne, JoinColumn, Index,
} from 'typeorm';
import { Promotion } from './promotion.entity';

@Entity('promotion_categories')
@Index(['promotionId'])
@Index(['categoryId'])
export class PromotionCategory {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'promotion_id', type: 'uuid' })
  promotionId: string;

  @ManyToOne(() => Promotion, (promotion) => promotion.promotionCategories, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'promotion_id' })
  promotion: Promotion;

  @Column({ name: 'category_id', type: 'uuid' })
  categoryId: string;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp with time zone' })
  createdAt: Date;
}
