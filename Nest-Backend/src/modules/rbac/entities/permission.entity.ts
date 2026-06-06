import { Column, Entity, Index, ManyToMany } from 'typeorm';
import { BaseEntity } from '../../../shared/entities/base.entity';
import { Role } from './role.entity';

@Entity('permissions')
@Index(['slug'], { unique: true })
export class Permission extends BaseEntity {
  @Column({ length: 100 })
  name: string;

  @Column({ unique: true, length: 100 })
  slug: string;

  @Column({ length: 100 })
  module: string;

  @ManyToMany(() => Role, (role) => role.permissions)
  roles: Role[];
}
