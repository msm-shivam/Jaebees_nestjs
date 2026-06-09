import { ApiProperty } from '@nestjs/swagger';

export class RatingDistributionDto {
  @ApiProperty()
  fiveStar: number;

  @ApiProperty()
  fourStar: number;

  @ApiProperty()
  threeStar: number;

  @ApiProperty()
  twoStar: number;

  @ApiProperty()
  oneStar: number;
}

export class ReviewAnalyticsResponseDto {
  @ApiProperty()
  totalReviews: number;

  @ApiProperty()
  approvedReviews: number;

  @ApiProperty()
  pendingReviews: number;

  @ApiProperty()
  rejectedReviews: number;

  @ApiProperty()
  averageRating: number;

  @ApiProperty({ type: RatingDistributionDto })
  ratingDistribution: RatingDistributionDto;

  @ApiProperty({ type: 'array', example: [{ productId: '...', productName: '...', reviewCount: 5 }] })
  mostReviewedProducts: Array<{ productId: string; productName: string; reviewCount: number }>;

  @ApiProperty({ type: 'array', example: [{ reviewId: '...', helpfulCount: 10 }] })
  mostHelpfulReviews: Array<{ reviewId: string; helpfulCount: number }>;
}
