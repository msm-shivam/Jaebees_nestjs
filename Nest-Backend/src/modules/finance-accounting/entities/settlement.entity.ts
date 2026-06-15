import { Entity, Column, Index } from 'typeorm';
import { BaseEntity } from '../../../shared/entities/base.entity';
import { SettlementStatus } from '../enums/settlement-status.enum';

@Entity('settlements')
@Index(['settlementNumber'], { unique: true })
@Index(['supplierId'])
@Index(['status'])
@Index(['createdAt'])
export class Settlement extends BaseEntity {
  @Column({
    name: 'settlement_number',
    type: 'varchar',
    length: 50,
    unique: true,
  })
  settlementNumber: string;

  @Column({ name: 'supplier_id', type: 'uuid', nullable: true })
  supplierId: string | null;

  @Column({ type: 'decimal', precision: 15, scale: 2 })
  amount: number;

  @Column({
    type: 'enum',
    enum: SettlementStatus,
    default: SettlementStatus.PENDING,
  })
  status: SettlementStatus;

  @Column({ name: 'settlement_date', type: 'timestamptz', nullable: true })
  settlementDate: Date | null;

  @Column({ name: 'due_date', type: 'timestamptz', nullable: true })
  dueDate: Date | null;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({
    name: 'reference_type',
    type: 'varchar',
    length: 100,
    nullable: true,
  })
  referenceType: string | null;

  @Column({ name: 'reference_id', type: 'uuid', nullable: true })
  referenceId: string | null;
}
