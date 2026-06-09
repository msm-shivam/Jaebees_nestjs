import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ReviewHelpfulVote } from './entities/review-helpful-vote.entity';
import { Review } from './entities/review.entity';

@Injectable()
export class ReviewHelpfulVoteService {
  constructor(
    @InjectRepository(ReviewHelpfulVote)
    private readonly voteRepository: Repository<ReviewHelpfulVote>,
    @InjectRepository(Review)
    private readonly reviewRepository: Repository<Review>,
  ) {}

  async vote(reviewId: string, userId: string): Promise<void> {
    const review = await this.reviewRepository.findOne({ where: { id: reviewId } });
    if (!review) {
      throw new NotFoundException('Review not found');
    }

    const existing = await this.voteRepository.findOne({
      where: { reviewId, userId },
    });
    if (existing) {
      throw new ConflictException('You have already voted on this review');
    }

    await this.voteRepository.save(this.voteRepository.create({ reviewId, userId }));
    await this.reviewRepository.increment({ id: reviewId }, 'helpfulCount', 1);
  }

  async removeVote(reviewId: string, userId: string): Promise<void> {
    const vote = await this.voteRepository.findOne({
      where: { reviewId, userId },
    });
    if (!vote) {
      throw new NotFoundException('Vote not found');
    }

    await this.voteRepository.remove(vote);
    await this.reviewRepository.decrement({ id: reviewId }, 'helpfulCount', 1);
  }
}
