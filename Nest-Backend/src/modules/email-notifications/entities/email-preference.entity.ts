import { Entity, Column, Index, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../../shared/entities/base.entity';
import { User } from '../../users/entities/user.entity';

@Entity('email_preferences')
@Index(['userId'], { unique: true })
export class EmailPreference extends BaseEntity {
  @Column({ name: 'user_id', type: 'uuid', unique: true })
  userId: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ name: 'marketing_emails_enabled', type: 'boolean', default: true })
  marketingEmailsEnabled: boolean;

  @Column({
    name: 'transactional_emails_enabled',
    type: 'boolean',
    default: true,
  })
  transactionalEmailsEnabled: boolean;

  @Column({ name: 'order_updates', type: 'boolean', default: true })
  orderUpdates: boolean;

  @Column({ name: 'promotions_and_offers', type: 'boolean', default: true })
  promotionsAndOffers: boolean;

  @Column({ name: 'product_recommendations', type: 'boolean', default: true })
  productRecommendations: boolean;

  @Column({ name: 'newsletter', type: 'boolean', default: false })
  newsletter: boolean;
}
