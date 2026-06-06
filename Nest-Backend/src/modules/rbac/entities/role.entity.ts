import { Column, Entity, Index, ManyToMany, JoinTable } from 'typeorm';
import { BaseEntity } from '../../../shared/entities/base.entity';
import { Permission } from './permission.entity';

@Entity('roles')
@Index(['slug'], { unique: true })
export class Role extends BaseEntity {
  @Column({ length: 100 })
  name: string;

  @Column({ unique: true, length: 100 })
  slug: string;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @ManyToMany(() => Permission, (permission) => permission.roles, {
    cascade: false,
  })
  @JoinTable({
    name: 'role_permissions',
    joinColumn: { name: 'role_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'permission_id', referencedColumnName: 'id' },
  })
  permissions: Permission[];
}
