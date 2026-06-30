import { Entity, Column } from 'typeorm';
import { BaseEntity } from '../../../shared/entities/base.entity';

@Entity('store_settings')
export class StoreSetting extends BaseEntity {
  @Column({
    name: 'store_name',
    type: 'varchar',
    length: 255,
    default: 'Sport Ecom',
  })
  storeName: string;

  @Column({
    name: 'store_tagline',
    type: 'varchar',
    length: 255,
    default: "India's Sports Marketplace",
  })
  storeTagline: string;

  @Column({
    name: 'store_email',
    type: 'varchar',
    length: 255,
    default: 'support@sportecom.com',
  })
  storeEmail: string;

  @Column({
    name: 'support_email',
    type: 'varchar',
    length: 255,
    default: 'help@sportecom.com',
  })
  supportEmail: string;

  @Column({ type: 'varchar', length: 50, default: '+91XXXXXXXXXX' })
  phone: string;

  @Column({ type: 'varchar', length: 50, default: '+91XXXXXXXXXX' })
  whatsapp: string;

  @Column({
    name: 'website_url',
    type: 'varchar',
    length: 255,
    default: 'https://sportecom.com',
  })
  websiteUrl: string;

  @Column({ name: 'logo_url', type: 'varchar', length: 500, nullable: true })
  logoUrl: string | null;

  @Column({ name: 'favicon_url', type: 'varchar', length: 500, nullable: true })
  faviconUrl: string | null;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({
    name: 'address_line1',
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  addressLine1: string | null;

  @Column({
    name: 'address_line2',
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  addressLine2: string | null;

  @Column({ type: 'varchar', length: 100, nullable: true })
  city: string | null;

  @Column({ type: 'varchar', length: 100, nullable: true })
  state: string | null;

  @Column({ type: 'varchar', length: 100, nullable: true })
  country: string | null;

  @Column({ name: 'postal_code', type: 'varchar', length: 20, nullable: true })
  postalCode: string | null;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 6,
    nullable: true,
    transformer: {
      to: (value: number | null) => value,
      from: (value: string | null) => (value ? parseFloat(value) : null),
    },
  })
  latitude: number | null;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 6,
    nullable: true,
    transformer: {
      to: (value: number | null) => value,
      from: (value: string | null) => (value ? parseFloat(value) : null),
    },
  })
  longitude: number | null;

  // Social Links
  @Column({ type: 'varchar', length: 255, nullable: true, default: '' })
  facebook: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true, default: '' })
  instagram: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true, default: '' })
  twitter: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true, default: '' })
  youtube: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true, default: '' })
  linkedin: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true, default: '' })
  telegram: string | null;

  @Column({
    name: 'whatsapp_social',
    type: 'varchar',
    length: 255,
    nullable: true,
    default: '',
  })
  whatsappSocial: string | null;

  // Email Config
  @Column({
    name: 'from_name',
    type: 'varchar',
    length: 255,
    nullable: true,
    default: 'Sport Ecom',
  })
  fromName: string | null;

  @Column({
    name: 'from_email',
    type: 'varchar',
    length: 255,
    nullable: true,
    default: 'support@sportecom.com',
  })
  fromEmail: string | null;

  @Column({
    name: 'reply_to_email',
    type: 'varchar',
    length: 255,
    nullable: true,
    default: 'help@sportecom.com',
  })
  replyToEmail: string | null;

  // Business Information
  @Column({
    name: 'company_name',
    type: 'varchar',
    length: 255,
    nullable: true,
    default: '',
  })
  companyName: string | null;

  @Column({
    name: 'gst_number',
    type: 'varchar',
    length: 50,
    nullable: true,
    default: '',
  })
  gstNumber: string | null;

  @Column({
    name: 'pan_number',
    type: 'varchar',
    length: 50,
    nullable: true,
    default: '',
  })
  panNumber: string | null;

  @Column({
    name: 'cin_number',
    type: 'varchar',
    length: 50,
    nullable: true,
    default: '',
  })
  cinNumber: string | null;

  @Column({
    name: 'bank_name',
    type: 'varchar',
    length: 255,
    nullable: true,
    default: '',
  })
  bankName: string | null;

  @Column({
    name: 'account_number',
    type: 'varchar',
    length: 100,
    nullable: true,
    default: '',
  })
  accountNumber: string | null;

  @Column({
    name: 'ifsc_code',
    type: 'varchar',
    length: 50,
    nullable: true,
    default: '',
  })
  ifscCode: string | null;

  // SMTP Config
  @Column({ name: 'smtp_host', type: 'varchar', length: 255, nullable: true })
  smtpHost: string | null;

  @Column({ name: 'smtp_port', type: 'int', nullable: true })
  smtpPort: number | null;

  @Column({ name: 'smtp_user', type: 'varchar', length: 255, nullable: true })
  smtpUser: string | null;

  @Column({ name: 'smtp_pass', type: 'varchar', length: 255, nullable: true })
  smtpPass: string | null;

  @Column({ name: 'smtp_secure', type: 'boolean', nullable: true })
  smtpSecure: boolean | null;

  @Column({
    name: 'email_provider',
    type: 'varchar',
    length: 50,
    nullable: true,
    default: 'smtp',
  })
  emailProvider: string | null;
}
