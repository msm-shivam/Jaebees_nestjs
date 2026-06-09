import { IsEnum, IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ReviewReportReason } from '../enums/review-report-reason.enum';

export class ReportReviewDto {
  @ApiProperty({ enum: ReviewReportReason })
  @IsEnum(ReviewReportReason)
  reason: ReviewReportReason;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  notes?: string;
}
