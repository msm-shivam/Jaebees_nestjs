import { Entity, Column, Index } from 'typeorm';
import { BaseEntity } from '../../../shared/entities/base.entity';
import { PrivacyRequestType } from '../enums/privacy-request-type.enum';
import { PrivacyRequestStatus } from '../enums/privacy-request-status.enum';

@Entity('privacy_requests')
@Index(['userId'])
@Index(['requestType'])
@Index(['status'])
@Index(['createdAt'])
export class PrivacyRequest extends BaseEntity {
  @Column({ name: 'user_id', type: 'uuid' })
  userId: string;

  @Column({ name: 'request_type', type: 'enum', enum: PrivacyRequestType })
  requestType: PrivacyRequestType;

  @Column({
    name: 'status',
    type: 'enum',
    enum: PrivacyRequestStatus,
    default: PrivacyRequestStatus.PENDING,
  })
  status: PrivacyRequestStatus;

  @Column({ name: 'processed_at', type: 'timestamptz', nullable: true })
  processedAt: Date | null;
}
