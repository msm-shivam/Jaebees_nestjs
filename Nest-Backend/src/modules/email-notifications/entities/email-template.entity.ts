import { Entity, Column, Index } from 'typeorm';
import { BaseEntity } from '../../../shared/entities/base.entity';

@Entity('email_notification_templates')
@Index(['code'], { unique: true })
export class EmailTemplate extends BaseEntity {
  @Column({ type: 'varchar', length: 100, unique: true })
  code: string;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ name: 'subject_template', type: 'varchar', length: 500 })
  subjectTemplate: string;

  @Column({ name: 'body_template', type: 'text' })
  bodyTemplate: string;

  @Column({ type: 'jsonb', default: [] })
  variables: string[];

  @Column({ type: 'boolean', default: true })
  active: boolean;
}
