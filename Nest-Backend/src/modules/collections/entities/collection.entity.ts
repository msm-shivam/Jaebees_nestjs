import { Column, DeleteDateColumn, Entity, Index } from 'typeorm';
import { BaseEntity } from '../../../shared/entities/base.entity';

@Entity('collections')
@Index(['slug'], { unique: true })
@Index(['isActive'])
export class Collection extends BaseEntity {
  @Column({ length: 150 })
  name: string;

  @Column({ unique: true, length: 150 })
  slug: string;

  @Column({
    name: 'banner_image',
    type: 'varchar',
    length: 500,
    nullable: true,
  })
  bannerImage: string | null;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @DeleteDateColumn({ name: 'deleted_at', type: 'timestamptz', nullable: true })
  deletedAt: Date | null;
}
