import { Entity, Column, Index, ManyToOne, JoinColumn, Unique } from 'typeorm';
import { BaseEntity } from '../../../shared/entities/base.entity';
import { Review } from './review.entity';
import { User } from '../../users/entities/user.entity';

@Entity('review_helpful_votes')
@Unique(['reviewId', 'userId'])
@Index(['reviewId'])
@Index(['userId'])
export class ReviewHelpfulVote extends BaseEntity {
  @Column({ name: 'review_id', type: 'uuid' })
  reviewId: string;

  @ManyToOne(() => Review, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'review_id' })
  review: Review;

  @Column({ name: 'user_id', type: 'uuid' })
  userId: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;
}
