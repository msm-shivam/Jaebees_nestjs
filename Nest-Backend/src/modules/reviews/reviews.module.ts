import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Review } from './entities/review.entity';
import { ReviewImage } from './entities/review-image.entity';
import { ReviewHelpfulVote } from './entities/review-helpful-vote.entity';
import { ReviewReport } from './entities/review-report.entity';
import { Order } from '../orders/entities/order.entity';
import { OrderItem } from '../orders/entities/order-item.entity';
import { Product } from '../products/entities/product.entity';
import { ReviewsService } from './reviews.service';
import { ReviewHelpfulVoteService } from './review-helpful-vote.service';
import { ReviewReportService } from './review-report.service';
import { ReviewAnalyticsService } from './review-analytics.service';
import { ReviewsController } from './reviews.controller';
import { AdminReviewsController } from './admin-reviews.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Review,
      ReviewImage,
      ReviewHelpfulVote,
      ReviewReport,
      Order,
      OrderItem,
      Product,
    ]),
  ],
  controllers: [ReviewsController, AdminReviewsController],
  providers: [
    ReviewsService,
    ReviewHelpfulVoteService,
    ReviewReportService,
    ReviewAnalyticsService,
  ],
  exports: [ReviewsService],
})
export class ReviewsModule {}
