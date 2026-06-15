import { Entity, Column, Index, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../../shared/entities/base.entity';
import { FinancialTransaction } from './financial-transaction.entity';

@Entity('ledger_entries')
@Index(['transactionId'])
@Index(['accountCode'])
@Index(['createdAt'])
export class LedgerEntry extends BaseEntity {
  @Column({ name: 'transaction_id', type: 'uuid' })
  transactionId: string;

  @ManyToOne(() => FinancialTransaction, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'transaction_id' })
  transaction: FinancialTransaction;

  @Column({ name: 'account_code', type: 'varchar', length: 50 })
  accountCode: string;

  @Column({ name: 'account_name', type: 'varchar', length: 255 })
  accountName: string;

  @Column({
    name: 'debit_amount',
    type: 'decimal',
    precision: 15,
    scale: 2,
    default: 0,
  })
  debitAmount: number;

  @Column({
    name: 'credit_amount',
    type: 'decimal',
    precision: 15,
    scale: 2,
    default: 0,
  })
  creditAmount: number;

  @Column({
    name: 'balance_after',
    type: 'decimal',
    precision: 15,
    scale: 2,
    nullable: true,
  })
  balanceAfter: number | null;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({ name: 'entry_date', type: 'timestamptz', default: () => 'NOW()' })
  entryDate: Date;
}
