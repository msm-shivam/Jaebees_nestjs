import { Entity, Column, Index, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../../shared/entities/base.entity';
import { EmailNotification } from './email-notification.entity';
import { NotificationStatus } from '../enums/notification-status.enum';

@Entity('email_logs')
@Index(['notificationId'])
@Index(['createdAt'])
export class EmailLog extends BaseEntity {
  @Column({ name: 'notification_id', type: 'uuid', nullable: true })
  notificationId: string | null;

  @ManyToOne(() => EmailNotification, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'notification_id' })
  notification: EmailNotification | null;

  @Column({ type: 'varchar', length: 100 })
  provider: string;

  @Column({ type: 'enum', enum: NotificationStatus, default: NotificationStatus.PENDING })
  status: NotificationStatus;

  @Column({ name: 'error_message', type: 'text', nullable: true })
  errorMessage: string | null;

  @Column({ name: 'delivered_at', type: 'timestamptz', nullable: true })
  deliveredAt: Date | null;

  @Column({ name: 'opened_at', type: 'timestamptz', nullable: true })
  openedAt: Date | null;

  @Column({ name: 'clicked_at', type: 'timestamptz', nullable: true })
  clickedAt: Date | null;

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, unknown> | null;
}
