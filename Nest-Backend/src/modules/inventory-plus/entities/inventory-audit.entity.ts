import {
  Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, Index,
} from 'typeorm';
import { AuditActionType } from '../enums/audit-action-type.enum';

@Entity('inventory_audits')
@Index(['variantId'])
@Index(['actionType'])
@Index(['createdAt'])
export class InventoryAudit {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'variant_id', type: 'uuid' })
  variantId: string;

  @Column({ type: 'enum', enum: AuditActionType })
  actionType: AuditActionType;

  @Column({ name: 'before_quantity', type: 'int' })
  beforeQuantity: number;

  @Column({ name: 'after_quantity', type: 'int' })
  afterQuantity: number;

  @Column({ name: 'reference_type', length: 100, nullable: true })
  referenceType: string;

  @Column({ name: 'reference_id', type: 'uuid', nullable: true })
  referenceId: string;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column({ name: 'performed_by', type: 'uuid', nullable: true })
  performedBy: string;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp with time zone' })
  createdAt: Date;
}
