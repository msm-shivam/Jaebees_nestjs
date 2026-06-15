import { Entity, Column, Index } from 'typeorm';
import { BaseEntity } from '../../../shared/entities/base.entity';
import { CampaignStatus } from '../enums/campaign-status.enum';
import { CampaignType } from '../enums/campaign-type.enum';

@Entity('email_campaigns')
@Index(['status'])
@Index(['scheduledAt'])
@Index(['createdAt'])
export class EmailCampaign extends BaseEntity {
  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'varchar', length: 500 })
  subject: string;

  @Column({ type: 'text' })
  body: string;

  @Column({
    type: 'enum',
    enum: CampaignType,
    default: CampaignType.PROMOTIONAL,
  })
  type: CampaignType;

  @Column({ name: 'target_audience', type: 'jsonb', nullable: true })
  targetAudience: Record<string, unknown> | null;

  @Column({ type: 'enum', enum: CampaignStatus, default: CampaignStatus.DRAFT })
  status: CampaignStatus;

  @Column({ name: 'scheduled_at', type: 'timestamptz', nullable: true })
  scheduledAt: Date | null;

  @Column({ name: 'sent_at', type: 'timestamptz', nullable: true })
  sentAt: Date | null;

  @Column({ name: 'total_recipients', type: 'int', default: 0 })
  totalRecipients: number;

  @Column({ name: 'successful_sends', type: 'int', default: 0 })
  successfulSends: number;

  @Column({ name: 'failed_sends', type: 'int', default: 0 })
  failedSends: number;

  @Column({ name: 'opens_count', type: 'int', default: 0 })
  opensCount: number;

  @Column({ name: 'clicks_count', type: 'int', default: 0 })
  clicksCount: number;

  @Column({ name: 'created_by', type: 'uuid', nullable: true })
  createdBy: string | null;
}
