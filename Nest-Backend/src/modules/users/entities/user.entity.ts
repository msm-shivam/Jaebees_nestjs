import { Column, DeleteDateColumn, Entity, Index, OneToMany } from 'typeorm';
import { BaseEntity } from '../../../shared/entities/base.entity';
import { UserSession } from './user-session.entity';

@Entity('users')
@Index(['email'], { unique: true })
@Index(['mobile'], { unique: true })
export class User extends BaseEntity {
  @Column({ name: 'first_name', length: 100 })
  firstName: string;

  @Column({ name: 'last_name', length: 100 })
  lastName: string;

  @Column({ unique: true, length: 255 })
  email: string;

  @Column({
    unique: true,
    type: 'varchar',
    length: 20,
    nullable: true,
    default: null,
  })
  mobile: string | undefined;

  @Column({ name: 'password_hash', length: 255 })
  passwordHash: string;

  @Column({ name: 'is_email_verified', default: false })
  isEmailVerified: boolean;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @DeleteDateColumn({ name: 'deleted_at', type: 'timestamptz', nullable: true })
  deletedAt: Date | undefined;

  @Column({ name: 'avatar', type: 'varchar', length: 500, nullable: true, default: null })
  avatar: string | null;

  @Column({ name: 'first_order_id', type: 'uuid', nullable: true, default: null })
  firstOrderId: string | null;

  @OneToMany(() => UserSession, (session) => session.user)
  sessions: UserSession[];
}
