import {
  Column,
  DeleteDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
} from 'typeorm';
import { BaseEntity } from '../../../shared/entities/base.entity';
import { User } from '../../users/entities/user.entity';

@Entity('addresses')
@Index(['userId'])
@Index(['isDefault'])
export class Address extends BaseEntity {
  @Column({ name: 'user_id', type: 'uuid' })
  userId: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ name: 'full_name', type: 'varchar', length: 100 })
  fullName: string;

  @Column({ type: 'varchar', length: 20 })
  phone: string;

  @Column({ name: 'address_line_1', type: 'varchar', length: 255 })
  addressLine1: string;

  @Column({
    name: 'address_line_2',
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  addressLine2: string | null;

  @Column({ type: 'varchar', length: 100 })
  city: string;

  @Column({ type: 'varchar', length: 100 })
  state: string;

  @Column({ type: 'varchar', length: 100 })
  country: string;

  @Column({ name: 'postal_code', type: 'varchar', length: 20 })
  postalCode: string;

  @Column({ type: 'decimal', precision: 10, scale: 7 })
  latitude: number;

  @Column({ type: 'decimal', precision: 10, scale: 7 })
  longitude: number;

  @Column({ name: 'is_default', type: 'boolean', default: false })
  isDefault: boolean;

  @DeleteDateColumn({ name: 'deleted_at', type: 'timestamptz', nullable: true })
  deletedAt: Date;
}
