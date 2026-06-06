import {
  Column,
  Entity,
  Index,
  JoinTable,
  ManyToMany,
  OneToMany,
} from 'typeorm';
import { BaseEntity } from '../../../shared/entities/base.entity';
import { Role } from '../../rbac/entities/role.entity';
import { AdminSession } from './admin-session.entity';

@Entity('admin_users')
@Index(['email'], { unique: true })
export class AdminUser extends BaseEntity {
  @Column({ length: 200 })
  name: string;

  @Column({ unique: true, length: 255 })
  email: string;

  @Column({ name: 'password_hash', length: 255 })
  passwordHash: string;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @Column({ name: 'last_login_at', type: 'timestamptz', nullable: true })
  lastLoginAt: Date | null;

  @ManyToMany(() => Role, { cascade: false })
  @JoinTable({
    name: 'admin_roles',
    joinColumn: { name: 'admin_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'role_id', referencedColumnName: 'id' },
  })
  roles: Role[];

  @OneToMany(() => AdminSession, (session) => session.admin)
  sessions: AdminSession[];
}
