import {
  Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, Index, OneToMany,
} from 'typeorm';
import { PromotionType } from '../enums/promotion-type.enum';
import { PromotionProduct } from './promotion-product.entity';
import { PromotionCategory } from './promotion-category.entity';

@Entity('promotions')
@Index(['isActive', 'startDate', 'endDate'])
@Index(['priority'])
export class Promotion {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 200 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'enum', enum: PromotionType })
  type: PromotionType;

  @Column({ name: 'discount_value', type: 'decimal', precision: 10, scale: 2 })
  discountValue: number;

  @Column({ name: 'start_date', type: 'timestamp with time zone' })
  startDate: Date;

  @Column({ name: 'end_date', type: 'timestamp with time zone' })
  endDate: Date;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @Column({ type: 'int', default: 0 })
  priority: number;

  @Column({ name: 'is_stackable', default: false })
  isStackable: boolean;

  @Column({ name: 'auto_apply', default: false })
  autoApply: boolean;

  @OneToMany(() => PromotionProduct, (pp) => pp.promotion)
  promotionProducts: PromotionProduct[];

  @OneToMany(() => PromotionCategory, (pc) => pc.promotion)
  promotionCategories: PromotionCategory[];

  @CreateDateColumn({ name: 'created_at', type: 'timestamp with time zone' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp with time zone' })
  updatedAt: Date;
}
