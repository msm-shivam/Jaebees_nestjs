import { Entity, Column, JoinColumn, OneToOne, Index } from 'typeorm';
import { BaseEntity } from '../../../shared/entities/base.entity';
import { User } from '../../users/entities/user.entity';

@Entity('notification_preferences')
@Index(['userId'], { unique: true })
export class NotificationPreference extends BaseEntity {
  @Column({ name: 'user_id', type: 'uuid' })
  userId: string;

  @OneToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ name: 'order_emails', default: true })
  orderEmails: boolean;

  @Column({ name: 'payment_emails', default: true })
  paymentEmails: boolean;

  @Column({ name: 'shipment_emails', default: true })
  shipmentEmails: boolean;

  @Column({ name: 'promotional_emails', default: false })
  promotionalEmails: boolean;

  @Column({ name: 'review_emails', default: true })
  reviewEmails: boolean;
}
