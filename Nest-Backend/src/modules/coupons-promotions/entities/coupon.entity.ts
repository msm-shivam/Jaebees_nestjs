import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  Index,
  OneToMany,
} from 'typeorm';
import { Expose } from 'class-transformer';
import { CouponType } from '../enums/coupon-type.enum';
import { CouponRule } from './coupon-rule.entity';

export enum CouponStatus {
  DRAFT = 'DRAFT',
  ACTIVE = 'ACTIVE',
  PAUSED = 'PAUSED',
  EXPIRED = 'EXPIRED',
  ARCHIVED = 'ARCHIVED',
}

@Entity('coupons')
@Index(['code'], { unique: true })
@Index(['isActive', 'startDate', 'endDate'])
export class Coupon {
  @Expose()
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Expose()
  @Column({ length: 50, unique: true })
  code: string;

  @Expose()
  @Column({ length: 150, default: '' })
  name: string;

  @Expose()
  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Expose()
  @Column({ type: 'enum', enum: CouponType })
  type: CouponType;

  @Expose()
  @Column({ type: 'decimal', precision: 10, scale: 2 })
  value: number;

  @Expose()
  @Column({ name: 'start_date', type: 'timestamp with time zone' })
  startDate: Date;

  @Expose()
  @Column({ name: 'end_date', type: 'timestamp with time zone' })
  endDate: Date;

  @Expose()
  @Column({ name: 'max_uses', type: 'int', nullable: true })
  maxUses: number | null;

  @Expose()
  @Column({ name: 'max_uses_per_user', type: 'int', nullable: true })
  maxUsesPerUser: number | null;

  @Expose()
  @Column({
    name: 'minimum_order_amount',
    type: 'decimal',
    precision: 10,
    scale: 2,
    default: 0,
  })
  minimumOrderAmount: number;

  @Expose()
  @Column({
    name: 'maximum_discount_amount',
    type: 'decimal',
    precision: 10,
    scale: 2,
    nullable: true,
  })
  maximumDiscountAmount: number | null;

  @Expose()
  @Column({ name: 'first_order_only', default: false })
  firstOrderOnly: boolean;

  @Expose()
  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @Expose()
  @Column({
    type: 'enum',
    enum: CouponStatus,
    default: CouponStatus.ACTIVE,
  })
  status: CouponStatus;

  @Expose()
  @Column({ name: 'is_stackable', default: false })
  isStackable: boolean;

  @Expose()
  @Column({ name: 'auto_apply', default: false })
  autoApply: boolean;

  @Expose()
  @Column({ type: 'int', default: 0 })
  priority: number;

  @Expose()
  @Column({ name: 'usage_count', type: 'int', default: 0 })
  usageCount: number;

  @Expose()
  @Column({ name: 'admin_notes', type: 'text', nullable: true })
  adminNotes: string | null;

  @Expose()
  @OneToMany(() => CouponRule, (rule) => rule.coupon, { cascade: true })
  rules: CouponRule[];

  @Expose()
  @CreateDateColumn({ name: 'created_at', type: 'timestamp with time zone' })
  createdAt: Date;

  @Expose()
  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp with time zone' })
  updatedAt: Date;

  @Expose()
  @DeleteDateColumn({ name: 'deleted_at', type: 'timestamp with time zone', nullable: true })
  deletedAt: Date | null;
}

