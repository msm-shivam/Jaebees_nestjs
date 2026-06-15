import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Review } from './entities/review.entity';
import { ReviewStatus } from './enums/review-status.enum';
import {
  ReviewAnalyticsResponseDto,
  RatingDistributionDto,
} from './dto/review-analytics-response.dto';

@Injectable()
export class ReviewAnalyticsService {
  constructor(
    @InjectRepository(Review)
    private readonly reviewRepository: Repository<Review>,
  ) {}

  async getAnalytics(): Promise<ReviewAnalyticsResponseDto> {
    const totalReviews = await this.reviewRepository.count({
      withDeleted: false,
    });
    const approvedReviews = await this.reviewRepository.count({
      where: { status: ReviewStatus.APPROVED },
    });
    const pendingReviews = await this.reviewRepository.count({
      where: { status: ReviewStatus.PENDING },
    });
    const rejectedReviews = await this.reviewRepository.count({
      where: { status: ReviewStatus.REJECTED },
    });

    const avgResult = await this.reviewRepository
      .createQueryBuilder('review')
      .select('AVG(review.rating)', 'avg')
      .where('review.status = :status', { status: ReviewStatus.APPROVED })
      .andWhere('review.deletedAt IS NULL')
      .getRawOne();
    const averageRating = avgResult?.avg
      ? parseFloat(parseFloat(avgResult.avg).toFixed(2))
      : 0;

    const distResult = await this.reviewRepository
      .createQueryBuilder('review')
      .select('review.rating', 'rating')
      .addSelect('COUNT(review.id)', 'count')
      .where('review.status = :status', { status: ReviewStatus.APPROVED })
      .andWhere('review.deletedAt IS NULL')
      .groupBy('review.rating')
      .getRawMany();

    const distribution: RatingDistributionDto = {
      fiveStar: 0,
      fourStar: 0,
      threeStar: 0,
      twoStar: 0,
      oneStar: 0,
    };
    for (const row of distResult) {
      const rating = parseInt(row.rating, 10);
      const count = parseInt(row.count, 10);
      if (rating === 5) distribution.fiveStar = count;
      else if (rating === 4) distribution.fourStar = count;
      else if (rating === 3) distribution.threeStar = count;
      else if (rating === 2) distribution.twoStar = count;
      else if (rating === 1) distribution.oneStar = count;
    }

    const mostReviewedRaw = await this.reviewRepository
      .createQueryBuilder('review')
      .select('review.productId', 'productId')
      .addSelect('COUNT(review.id)', 'reviewCount')
      .where('review.status = :status', { status: ReviewStatus.APPROVED })
      .andWhere('review.deletedAt IS NULL')
      .groupBy('review.productId')
      .orderBy('reviewCount', 'DESC')
      .limit(5)
      .getRawMany();
    const mostReviewedProducts = mostReviewedRaw.map((r) => ({
      productId: r.productId,
      productName: '',
      reviewCount: parseInt(r.reviewCount, 10),
    }));

    const mostHelpfulRaw = await this.reviewRepository
      .createQueryBuilder('review')
      .select('review.id', 'reviewId')
      .addSelect('review.helpfulCount', 'helpfulCount')
      .where('review.status = :status', { status: ReviewStatus.APPROVED })
      .andWhere('review.deletedAt IS NULL')
      .orderBy('review.helpfulCount', 'DESC')
      .limit(5)
      .getRawMany();
    const mostHelpfulReviews = mostHelpfulRaw.map((r) => ({
      reviewId: r.reviewId,
      helpfulCount: parseInt(r.helpfulCount, 10),
    }));

    return {
      totalReviews,
      approvedReviews,
      pendingReviews,
      rejectedReviews,
      averageRating,
      ratingDistribution: distribution,
      mostReviewedProducts,
      mostHelpfulReviews,
    };
  }
}
