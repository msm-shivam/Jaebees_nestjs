import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { Expose } from 'class-transformer';
import { Coupon } from './coupon.entity';

export enum CouponRuleType {
  INCLUSION = 'INCLUSION',
  EXCLUSION = 'EXCLUSION',
}

export enum CouponTargetType {
  CATEGORY = 'CATEGORY',
  SUB_CATEGORY = 'SUB_CATEGORY',
  BRAND = 'BRAND',
  PRODUCT = 'PRODUCT',
  VARIANT = 'VARIANT',
  COLLECTION = 'COLLECTION',
  SALE_ITEMS = 'SALE_ITEMS',
}

@Entity('coupon_rules')
@Index(['couponId'])
@Index(['ruleType', 'targetType', 'targetId'])
export class CouponRule {
  @Expose()
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Expose()
  @Column({ name: 'coupon_id', type: 'uuid' })
  couponId: string;

  @ManyToOne(() => Coupon, (coupon) => coupon.rules, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'coupon_id' })
  coupon: Coupon;

  @Expose()
  @Column({ name: 'rule_type', type: 'enum', enum: CouponRuleType })
  ruleType: CouponRuleType;

  @Expose()
  @Column({ name: 'target_type', type: 'enum', enum: CouponTargetType })
  targetType: CouponTargetType;

  @Expose()
  @Column({ name: 'target_id', type: 'varchar', nullable: true })
  targetId: string | null;

  @Expose()
  @CreateDateColumn({ name: 'created_at', type: 'timestamp with time zone' })
  createdAt: Date;
}
