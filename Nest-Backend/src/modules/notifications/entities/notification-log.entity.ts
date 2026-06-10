import { Entity, Column, Index } from 'typeorm';
import { BaseEntity } from '../../../shared/entities/base.entity';

export enum NotificationStatus {
  SENT = 'sent',
  FAILED = 'failed',
  QUEUED = 'queued',
}

@Entity('notification_logs')
@Index(['userId'])
@Index(['status'])
@Index(['sentAt'])
export class NotificationLog extends BaseEntity {
  @Column({ name: 'user_id', type: 'uuid', nullable: true })
  userId: string;

  @Column({ length: 255 })
  recipient: string;

  @Column({ name: 'template_code', length: 100 })
  templateCode: string;

  @Column({ length: 255 })
  subject: string;

  @Column({ type: 'varchar', length: 20, default: NotificationStatus.QUEUED })
  status: NotificationStatus;

  @Column({ name: 'error_message', type: 'text', nullable: true })
  errorMessage: string;

  @Column({ name: 'sent_at', type: 'timestamptz', nullable: true })
  sentAt: Date;
}
