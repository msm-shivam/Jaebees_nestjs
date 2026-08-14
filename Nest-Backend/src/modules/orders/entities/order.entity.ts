import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
} from 'typeorm';
import { BaseEntity } from '../../../shared/entities/base.entity';
import { User } from '../../users/entities/user.entity';
import { OrderItem } from './order-item.entity';
import { PaymentStatus } from '../../payments/entities/payment-status.enum';
import { Address } from '../../addresses/entities/address.entity';
import { Warehouse } from '../../warehouses/entities/warehouse.entity';

export enum OrderStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  PROCESSING = 'PROCESSING',
  PACKED = 'PACKED',
  SHIPPED = 'SHIPPED',
  OUT_FOR_DELIVERY = 'OUT_FOR_DELIVERY',
  DELIVERED = 'DELIVERED',
  CANCELLED = 'CANCELLED',
  RETURN_REQUESTED = 'RETURN_REQUESTED',
  RETURNED = 'RETURNED',
}

@Entity('orders')
@Index(['userId'])
@Index(['orderNumber'], { unique: true })
@Index(['status'])
@Index(['createdAt'])
export class Order extends BaseEntity {
  @Column({ name: 'order_number', type: 'varchar', length: 50, unique: true })
  orderNumber: string;

  @Column({ name: 'user_id', type: 'uuid' })
  userId: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({
    type: 'enum',
    enum: OrderStatus,
    default: OrderStatus.PENDING,
  })
  status: OrderStatus;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  subtotal: number;

  @Column({
    name: 'discount_amount',
    type: 'decimal',
    precision: 12,
    scale: 2,
    default: 0,
  })
  discountAmount: number;

  @Column({ name: 'shipping_address_id', type: 'uuid', nullable: true })
  shippingAddressId: string | null;

  @ManyToOne(() => Address, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'shipping_address_id' })
  shippingAddress: Address | null;

  @Column({ name: 'warehouse_id', type: 'uuid', nullable: true })
  warehouseId: string | null;

  @ManyToOne(() => Warehouse, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'warehouse_id' })
  warehouse: Warehouse | null;

  @Column({
    name: 'distance_km',
    type: 'decimal',
    precision: 10,
    scale: 2,
    nullable: true,
  })
  distanceKm: number | null;

  @Column({
    name: 'shipping_amount',
    type: 'decimal',
    precision: 12,
    scale: 2,
    default: 0,
  })
  shippingAmount: number;

  @Column({
    name: 'delivery_charge',
    type: 'decimal',
    precision: 12,
    scale: 2,
    default: 0,
  })
  deliveryCharge: number;

  @Column({
    name: 'cod_charge',
    type: 'decimal',
    precision: 12,
    scale: 2,
    default: 0,
  })
  codCharge: number;

  @Column({
    name: 'handling_charge',
    type: 'decimal',
    precision: 12,
    scale: 2,
    default: 0,
  })
  handlingCharge: number;

  @Column({
    name: 'tax_amount',
    type: 'decimal',
    precision: 12,
    scale: 2,
    default: 0,
  })
  taxAmount: number;

  @Column({
    name: 'total_amount',
    type: 'decimal',
    precision: 12,
    scale: 2,
    default: 0,
  })
  totalAmount: number;

  @Column({ type: 'text', nullable: true })
  notes: string | null;

  @Column({
    name: 'payment_status',
    type: 'enum',
    enum: PaymentStatus,
    default: PaymentStatus.PENDING,
  })
  paymentStatus: PaymentStatus;

  @Column({
    name: 'paid_amount',
    type: 'decimal',
    precision: 12,
    scale: 2,
    default: 0,
  })
  paidAmount: number;

  @Column({
    name: 'due_amount',
    type: 'decimal',
    precision: 12,
    scale: 2,
    default: 0,
  })
  dueAmount: number;
  @Column({ name: 'snapshot_id', type: 'varchar', nullable: true, unique: true })
  @Index({ unique: true })
  snapshotId: string | null;

  @Column({ name: 'stripe_payment_intent_id', type: 'varchar', nullable: true, unique: true })
  @Index({ unique: true })
  stripePaymentIntentId: string | null;

  @OneToMany(() => OrderItem, (item) => item.order, { cascade: true })
  items: OrderItem[];
}
