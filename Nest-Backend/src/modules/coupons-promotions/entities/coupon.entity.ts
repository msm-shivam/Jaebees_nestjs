import {
  Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, Index,
} from 'typeorm';
import { CouponType } from '../enums/coupon-type.enum';

@Entity('coupons')
@Index(['code'], { unique: true })
@Index(['isActive', 'startDate', 'endDate'])
export class Coupon {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 50, unique: true })
  code: string;

  @Column({ type: 'enum', enum: CouponType })
  type: CouponType;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  value: number;

  @Column({ name: 'start_date', type: 'timestamp with time zone' })
  startDate: Date;

  @Column({ name: 'end_date', type: 'timestamp with time zone' })
  endDate: Date;

  @Column({ name: 'max_uses', type: 'int', nullable: true })
  maxUses: number;

  @Column({ name: 'max_uses_per_user', type: 'int', nullable: true })
  maxUsesPerUser: number;

  @Column({ name: 'minimum_order_amount', type: 'decimal', precision: 10, scale: 2, default: 0 })
  minimumOrderAmount: number;

  @Column({ name: 'maximum_discount_amount', type: 'decimal', precision: 10, scale: 2, nullable: true })
  maximumDiscountAmount: number;

  @Column({ name: 'first_order_only', default: false })
  firstOrderOnly: boolean;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @Column({ name: 'is_stackable', default: false })
  isStackable: boolean;

  @Column({ name: 'usage_count', type: 'int', default: 0 })
  usageCount: number;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp with time zone' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp with time zone' })
  updatedAt: Date;
}
