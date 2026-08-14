import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
} from 'typeorm';

export enum OtpChannel {
  SMS = 'SMS',
  EMAIL = 'EMAIL',
}

export enum OtpPurpose {
  MOBILE_VERIFICATION = 'MOBILE_VERIFICATION',
  EMAIL_VERIFICATION = 'EMAIL_VERIFICATION',
  PASSWORD_RESET = 'PASSWORD_RESET',
  CHANGE_MOBILE = 'CHANGE_MOBILE',
}

// Backward compatibility alias for OtpType
export type OtpType = OtpPurpose;
export const OtpType = OtpPurpose;

@Entity('otp_verifications')
@Index(['email', 'purpose'])
@Index(['mobile', 'purpose'])
export class OtpVerification {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  email: string | null;

  @Column({ type: 'varchar', length: 20, nullable: true })
  mobile: string | null;

  @Column({ type: 'enum', enum: OtpChannel, default: OtpChannel.SMS })
  channel: OtpChannel;

  @Column({ type: 'enum', enum: OtpPurpose, default: OtpPurpose.MOBILE_VERIFICATION })
  purpose: OtpPurpose;

  @Column({ type: 'varchar', length: 50, nullable: true })
  type: string | null; // Deprecated column retained for database schema compatibility

  @Column({ name: 'otp_hash', type: 'varchar', length: 255, nullable: true })
  otpHash: string | null;

  @Column({ type: 'varchar', length: 10, nullable: true })
  otp: string | null; // Deprecated column retained during incremental migration

  @Column({ type: 'integer', default: 0 })
  attempts: number;

  @Column({ name: 'expires_at', type: 'timestamptz' })
  expiresAt: Date;

  @Column({ name: 'verified_at', type: 'timestamptz', nullable: true })
  verifiedAt: Date | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;
}
