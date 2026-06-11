import { Entity, Column, Index } from 'typeorm';
import { BaseEntity } from '../../../shared/entities/base.entity';

@Entity('return_reason_master')
@Index(['code'], { unique: true })
export class ReturnReasonMaster extends BaseEntity {
  @Column({ length: 50, unique: true })
  code: string;

  @Column({ length: 255 })
  title: string;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;
}
