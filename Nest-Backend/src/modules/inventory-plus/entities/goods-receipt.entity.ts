import {
  Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, ManyToOne, JoinColumn, Index, OneToMany,
} from 'typeorm';
import { PurchaseOrder } from './purchase-order.entity';
import { GoodsReceiptItem } from './goods-receipt-item.entity';

@Entity('goods_receipts')
@Index(['receiptNumber'], { unique: true })
@Index(['purchaseOrderId'])
export class GoodsReceipt {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'receipt_number', length: 50, unique: true })
  receiptNumber: string;

  @Column({ name: 'purchase_order_id', type: 'uuid' })
  purchaseOrderId: string;

  @ManyToOne(() => PurchaseOrder, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'purchase_order_id' })
  purchaseOrder: PurchaseOrder;

  @Column({ name: 'received_by', length: 200, nullable: true })
  receivedBy: string;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @OneToMany(() => GoodsReceiptItem, (item) => item.goodsReceipt)
  items: GoodsReceiptItem[];

  @CreateDateColumn({ name: 'created_at', type: 'timestamp with time zone' })
  createdAt: Date;
}
