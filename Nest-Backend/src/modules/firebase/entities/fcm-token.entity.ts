import { Entity, Column, Index } from 'typeorm';
import { Expose } from 'class-transformer';
import { BaseEntity } from '../../../shared/entities/base.entity';

export enum FcmUserType {
  CUSTOMER = 'customer',
  ADMIN = 'admin',
}

@Entity('fcm_tokens')
@Index(['userId', 'userType'])
@Index(['token'], { unique: true })
export class FcmToken extends BaseEntity {
  @Expose()
  @Column({ name: 'user_id', type: 'uuid' })
  userId: string;

  @Expose()
  @Column({ name: 'user_type', type: 'enum', enum: FcmUserType })
  userType: FcmUserType;

  @Expose()
  @Column({ name: 'token', length: 500 })
  token: string;

  @Expose()
  @Column({ name: 'device_info', type: 'jsonb', nullable: true })
  deviceInfo: Record<string, any> | null;
}
