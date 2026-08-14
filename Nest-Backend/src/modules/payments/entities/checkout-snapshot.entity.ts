import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

export enum CheckoutSnapshotStatus {
  PENDING = 'PENDING',
  PAYMENT_PROCESSING = 'PAYMENT_PROCESSING',
  PAID = 'PAID',
  USED = 'USED',
  FAILED = 'FAILED',
  EXPIRED = 'EXPIRED',
}

export interface SnapshotItem {
  productId: string;
  variantId: string;
  sku: string;
  productName: string;
  unitPrice: number;
  quantity: number;
  lineTotal: number;
}

@Entity('checkout_snapshots')
export class CheckoutSnapshot {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'stripe_payment_intent_id', type: 'varchar', nullable: true, unique: true })
  @Index({ unique: true })
  stripePaymentIntentId: string | null;

  @Column({ name: 'user_id', type: 'varchar' })
  @Index()
  userId: string;

  @Column({ name: 'shipping_address_id', type: 'varchar' })
  shippingAddressId: string;

  @Column({ type: 'text', nullable: true })
  notes: string | null;

  @Column({ type: 'jsonb' })
  items: SnapshotItem[];

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  subtotal: number;

  @Column({ name: 'shipping_amount', type: 'decimal', precision: 12, scale: 2, default: 0 })
  shippingAmount: number;

  @Column({ name: 'tax_amount', type: 'decimal', precision: 12, scale: 2, default: 0 })
  taxAmount: number;

  @Column({ name: 'discount_amount', type: 'decimal', precision: 12, scale: 2, default: 0 })
  discountAmount: number;

  @Column({ name: 'coupon_id', type: 'varchar', nullable: true })
  couponId: string | null;

  @Column({ name: 'coupon_code', type: 'varchar', nullable: true })
  couponCode: string | null;

  @Column({ name: 'total_amount', type: 'decimal', precision: 12, scale: 2, default: 0 })
  totalAmount: number;

  @Column({ type: 'varchar', default: 'usd' })
  currency: string;

  @Column({
    type: 'enum',
    enum: CheckoutSnapshotStatus,
    default: CheckoutSnapshotStatus.PENDING,
  })
  @Index()
  status: CheckoutSnapshotStatus;

  @Column({ name: 'expires_at', type: 'timestamp with time zone' })
  @Index()
  expiresAt: Date;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp with time zone' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp with time zone' })
  updatedAt: Date;
}
