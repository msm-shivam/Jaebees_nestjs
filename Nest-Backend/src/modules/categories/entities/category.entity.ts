import { Column, DeleteDateColumn, Entity, Index, OneToMany } from 'typeorm';
import { BaseEntity } from '../../../shared/entities/base.entity';
import { SubCategory } from '../../sub-categories/entities/sub-category.entity';

@Entity('categories')
@Index(['slug'], { unique: true })
@Index(['sortOrder'])
@Index(['isActive'])
export class Category extends BaseEntity {
  @Column({ length: 150 })
  name: string;

  @Column({ unique: true, length: 150 })
  slug: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  image: string | null;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({ name: 'sort_order', type: 'int', default: 0 })
  sortOrder: number;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @DeleteDateColumn({ name: 'deleted_at', type: 'timestamptz', nullable: true })
  deletedAt: Date | null;

  @OneToMany(() => SubCategory, (sub) => sub.category)
  subCategories: SubCategory[];
}
