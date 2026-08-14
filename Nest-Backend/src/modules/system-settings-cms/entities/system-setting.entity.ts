import { Entity, Column, Index } from 'typeorm';
import { Expose } from 'class-transformer';
import { BaseEntity } from '../../../shared/entities/base.entity';

@Entity('system_settings')
@Index(['key'], { unique: true })
@Index(['category'])
@Index(['createdAt'])
export class SystemSetting extends BaseEntity {
  @Expose()
  @Column({ type: 'varchar', length: 255, unique: true })
  key: string;

  @Expose()
  @Column({ type: 'text' })
  value: string;

  @Expose()
  @Column({ type: 'varchar', length: 100, nullable: true })
  category: string | null;
}
