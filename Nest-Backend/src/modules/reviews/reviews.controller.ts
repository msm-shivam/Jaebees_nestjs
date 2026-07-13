import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  ParseUUIDPipe,
  UseGuards,
  Req,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ReviewsService } from './reviews.service';
import { ReviewHelpfulVoteService } from './review-helpful-vote.service';
import { ReviewReportService } from './review-report.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';
import { ReportReviewDto } from './dto/report-review.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import type { Request } from 'express';

@ApiTags('Reviews')
@Controller()
export class ReviewsController {
  constructor(
    private readonly reviewsService: ReviewsService,
    private readonly helpfulVoteService: ReviewHelpfulVoteService,
    private readonly reportService: ReviewReportService,
  ) {}

  @Post('reviews')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a review for a delivered order item' })
  create(@Body() dto: CreateReviewDto, @Req() req: Request) {
    const userId: string = (req.user as Record<string, unknown>).id as string;
    return this.reviewsService.create(userId, dto);
  }

  @Get('reviews/my')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get my reviews' })
  getMyReviews(@Req() req: Request) {
    const userId: string = (req.user as Record<string, unknown>).id as string;
    return this.reviewsService.findByUser(userId);
  }

  @Get('reviews/product/:productId')
  @ApiOperation({ summary: 'Get approved reviews for a product' })
  getProductReviews(@Param('productId', ParseUUIDPipe) productId: string) {
    return this.reviewsService.findByProduct(productId);
  }

  @Get('reviews/:id')
  @ApiOperation({ summary: 'Get a review by ID' })
  getById(@Param('id', ParseUUIDPipe) id: string) {
    return this.reviewsService.findById(id);
  }

  @Patch('reviews/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update own review (only if not approved)' })
  update(
    @Param('id') id: string,
    @Body() dto: UpdateReviewDto,
    @Req() req: Request,
  ) {
    const userId: string = (req.user as Record<string, unknown>).id as string;
    return this.reviewsService.update(id, userId, dto);
  }

  @Delete('reviews/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete own review' })
  remove(@Param('id') id: string, @Req() req: Request) {
    const userId: string = (req.user as Record<string, unknown>).id as string;
    return this.reviewsService.remove(id, userId);
  }

  @Post('reviews/:id/helpful')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Mark a review as helpful' })
  markHelpful(@Param('id') id: string, @Req() req: Request) {
    const userId: string = (req.user as Record<string, unknown>).id as string;
    return this.helpfulVoteService.vote(id, userId);
  }

  @Delete('reviews/:id/helpful')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Remove helpful vote from a review' })
  removeHelpful(@Param('id') id: string, @Req() req: Request) {
    const userId: string = (req.user as Record<string, unknown>).id as string;
    return this.helpfulVoteService.removeVote(id, userId);
  }

  @Post('reviews/:id/report')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Report a review' })
  report(
    @Param('id') id: string,
    @Body() dto: ReportReviewDto,
    @Req() req: Request,
  ) {
    const userId: string = (req.user as Record<string, unknown>).id as string;
    return this.reportService.report(id, userId, dto);
  }
}
