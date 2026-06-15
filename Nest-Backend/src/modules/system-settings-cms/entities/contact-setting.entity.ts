import { Entity, Column } from 'typeorm';
import { BaseEntity } from '../../../shared/entities/base.entity';

@Entity('contact_settings')
export class ContactSetting extends BaseEntity {
  @Column({ type: 'varchar', length: 255 })
  email: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  phone: string | null;

  @Column({ type: 'text', nullable: true })
  address: string | null;

  @Column({
    name: 'support_hours',
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  supportHours: string | null;
}
