import { Entity, Column } from 'typeorm';
import { Expose } from 'class-transformer';
import { BaseEntity } from '../../../shared/entities/base.entity';

@Entity('sliders')
export class Slider extends BaseEntity {
  @Expose()
  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Expose()
  @Column({ type: 'jsonb', nullable: true })
  images: string[] | null;
}
