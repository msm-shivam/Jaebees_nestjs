import { Entity, Column, Index, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../../shared/entities/base.entity';
import { Review } from './review.entity';
import { User } from '../../users/entities/user.entity';
import { ReviewReportReason } from '../enums/review-report-reason.enum';

@Entity('review_reports')
@Index(['reviewId'])
@Index(['userId'])
export class ReviewReport extends BaseEntity {
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

  @Column({ type: 'enum', enum: ReviewReportReason })
  reason: ReviewReportReason;

  @Column({ type: 'text', nullable: true })
  notes: string;
}
