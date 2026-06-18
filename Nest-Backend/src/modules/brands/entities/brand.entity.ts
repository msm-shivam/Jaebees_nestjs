import {
  Column,
  DeleteDateColumn,
  Entity,
  Index,
  JoinTable,
  ManyToMany,
} from 'typeorm';
import { Expose } from 'class-transformer';
import { BaseEntity } from '../../../shared/entities/base.entity';
import { Category } from '../../categories/entities/category.entity';

@Entity('brands')
@Index(['slug'], { unique: true })
@Index(['isActive'])
export class Brand extends BaseEntity {
  @Column({ length: 150 })
  name: string;

  @Column({ unique: true, length: 150 })
  slug: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  logo: string | null;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @DeleteDateColumn({ name: 'deleted_at', type: 'timestamptz', nullable: true })
  deletedAt: Date | null;

  @Expose()
  @ManyToMany(() => Category, (category) => category.brands, {
    cascade: false,
  })
  @JoinTable({
    name: 'brand_categories',
    joinColumn: { name: 'brand_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'category_id', referencedColumnName: 'id' },
  })
  categories: Category[];
}
