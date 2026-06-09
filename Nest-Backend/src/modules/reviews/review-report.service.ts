import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ReviewReport } from './entities/review-report.entity';
import { Review } from './entities/review.entity';
import { ReportReviewDto } from './dto/report-review.dto';

@Injectable()
export class ReviewReportService {
  constructor(
    @InjectRepository(ReviewReport)
    private readonly reportRepository: Repository<ReviewReport>,
    @InjectRepository(Review)
    private readonly reviewRepository: Repository<Review>,
  ) {}

  async report(reviewId: string, userId: string, dto: ReportReviewDto): Promise<ReviewReport> {
    const review = await this.reviewRepository.findOne({ where: { id: reviewId } });
    if (!review) {
      throw new NotFoundException('Review not found');
    }

    const report = this.reportRepository.create({
      reviewId,
      userId,
      reason: dto.reason,
      notes: dto.notes,
    });
    return this.reportRepository.save(report);
  }
}
