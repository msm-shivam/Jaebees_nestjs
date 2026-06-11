import { Entity, Column, Index } from 'typeorm';
import { BaseEntity } from '../../../shared/entities/base.entity';

@Entity('expense_records')
@Index(['category'])
@Index(['expenseDate'])
@Index(['createdAt'])
export class ExpenseRecord extends BaseEntity {
  @Column({ type: 'varchar', length: 100 })
  category: string;

  @Column({ type: 'decimal', precision: 15, scale: 2 })
  amount: number;

  @Column({ name: 'expense_date', type: 'timestamptz' })
  expenseDate: Date;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({ name: 'vendor_name', type: 'varchar', length: 255, nullable: true })
  vendorName: string | null;

  @Column({ name: 'invoice_number', type: 'varchar', length: 100, nullable: true })
  invoiceNumber: string | null;

  @Column({ name: 'created_by', type: 'uuid', nullable: true })
  createdBy: string | null;
}
