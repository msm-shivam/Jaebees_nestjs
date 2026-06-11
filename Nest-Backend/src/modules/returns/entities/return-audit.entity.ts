import { Entity, Column, Index, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../../shared/entities/base.entity';
import { ReturnRequest } from './return-request.entity';
import { AdminUser } from '../../admin/entities/admin-user.entity';

@Entity('return_audits')
@Index(['returnRequestId'])
export class ReturnAudit extends BaseEntity {
  @Column({ name: 'return_request_id', type: 'uuid' })
  returnRequestId: string;

  @ManyToOne(() => ReturnRequest, (rr) => rr.audits, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'return_request_id' })
  returnRequest: ReturnRequest;

  @Column({ type: 'varchar', length: 100 })
  action: string;

  @Column({ name: 'performed_by', type: 'uuid', nullable: true })
  performedBy: string | null;

  @ManyToOne(() => AdminUser, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'performed_by' })
  adminUser: AdminUser;

  @Column({ type: 'text', nullable: true })
  notes: string;
}
