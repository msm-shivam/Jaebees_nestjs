import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm';
import { BaseEntity } from '../../../shared/entities/base.entity';
import { AdminUser } from './admin-user.entity';

@Entity('admin_sessions')
@Index(['adminId'])
export class AdminSession extends BaseEntity {
  @Column({ name: 'admin_id' })
  adminId: string;

  @Column({ name: 'refresh_token', length: 500 })
  refreshToken: string;

  @Column({ name: 'ip_address', type: 'varchar', length: 50, nullable: true })
  ipAddress: string | null;

  @Column({ name: 'user_agent', type: 'varchar', length: 500, nullable: true })
  userAgent: string | null;

  @Column({ name: 'expires_at', type: 'timestamptz' })
  expiresAt: Date;

  @ManyToOne(() => AdminUser, (admin) => admin.sessions, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'admin_id' })
  admin: AdminUser;
}
