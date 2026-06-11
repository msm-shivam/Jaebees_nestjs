import { Entity, Column, Index } from 'typeorm';
import { BaseEntity } from '../../../shared/entities/base.entity';
import { TransactionType } from '../enums/transaction-type.enum';

@Entity('financial_transactions')
@Index(['transactionNumber'], { unique: true })
@Index(['type'])
@Index(['referenceType', 'referenceId'])
@Index(['createdAt'])
export class FinancialTransaction extends BaseEntity {
  @Column({ name: 'transaction_number', type: 'varchar', length: 50, unique: true })
  transactionNumber: string;

  @Column({ type: 'enum', enum: TransactionType })
  type: TransactionType;

  @Column({ type: 'decimal', precision: 15, scale: 2 })
  amount: number;

  @Column({ type: 'varchar', length: 50, default: 'COMPLETED' })
  status: string;

  @Column({ name: 'reference_type', type: 'varchar', length: 100, nullable: true })
  referenceType: string | null;

  @Column({ name: 'reference_id', type: 'uuid', nullable: true })
  referenceId: string | null;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({ name: 'transaction_date', type: 'timestamptz', default: () => 'NOW()' })
  transactionDate: Date;
}
