import { Entity, Column, Index } from 'typeorm';
import { BaseEntity } from '../../../shared/entities/base.entity';
import { SecurityEventType } from '../enums/security-event-type.enum';
import { SeverityLevel } from '../enums/severity-level.enum';

@Entity('security_events')
@Index(['eventType'])
@Index(['severity'])
@Index(['userId'])
@Index(['createdAt'])
export class SecurityEvent extends BaseEntity {
  @Column({ name: 'event_type', type: 'enum', enum: SecurityEventType })
  eventType: SecurityEventType;

  @Column({
    name: 'severity',
    type: 'enum',
    enum: SeverityLevel,
    default: SeverityLevel.LOW,
  })
  severity: SeverityLevel;

  @Column({ name: 'user_id', type: 'uuid', nullable: true })
  userId: string | null;

  @Column({ type: 'jsonb', nullable: true })
  details: Record<string, unknown> | null;
}
