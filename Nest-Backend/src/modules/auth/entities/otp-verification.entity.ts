import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
} from 'typeorm';

export enum OtpType {
  EMAIL_VERIFY = 'EMAIL_VERIFY',
  FORGOT_PASSWORD = 'FORGOT_PASSWORD',
}

@Entity('otp_verifications')
@Index(['email', 'type'])
export class OtpVerification {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 255 })
  email: string;

  @Column({ length: 10 })
  otp: string;

  @Column({ type: 'enum', enum: OtpType })
  type: OtpType;

  @Column({ name: 'expires_at', type: 'timestamptz' })
  expiresAt: Date;

  @Column({ name: 'verified_at', type: 'timestamptz', nullable: true })
  verifiedAt: Date | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;
}
