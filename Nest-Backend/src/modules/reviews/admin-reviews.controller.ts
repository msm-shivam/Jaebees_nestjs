import {
  Controller,
  Get,
  Patch,
  Delete,
  Param,
  ParseUUIDPipe,
  UseGuards,
  Req,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ReviewsService } from './reviews.service';
import { ReviewAnalyticsService } from './review-analytics.service';
import { AdminJwtGuard } from '../../common/guards/admin-jwt.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { Permissions } from '../../common/decorators/permissions.decorator';
import { DefaultPermissions } from '../../common/constants/roles.constants';
import type { Request } from 'express';

@ApiTags('Admin — Reviews')
@ApiBearerAuth()
@UseGuards(AdminJwtGuard, PermissionsGuard)
@Controller('admin/reviews')
export class AdminReviewsController {
  constructor(
    private readonly reviewsService: ReviewsService,
    private readonly analyticsService: ReviewAnalyticsService,
  ) {}

  @Get()
  @Permissions(DefaultPermissions.REVIEW_VIEW)
  @ApiOperation({ summary: 'List all reviews' })
  findAll() {
    return this.reviewsService.findAll();
  }

  @Get('analytics')
  @Permissions(DefaultPermissions.REVIEW_VIEW)
  @ApiOperation({ summary: 'Get review analytics' })
  getAnalytics() {
    return this.analyticsService.getAnalytics();
  }

  @Get(':id')
  @Permissions(DefaultPermissions.REVIEW_VIEW)
  @ApiOperation({ summary: 'Get review by ID' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.reviewsService.findById(id);
  }

  @Patch(':id/approve')
  @Permissions(DefaultPermissions.REVIEW_APPROVE)
  @ApiOperation({ summary: 'Approve a pending review' })
  approve(@Param('id', ParseUUIDPipe) id: string, @Req() req: Request) {
    const adminId: string = (req.user as Record<string, unknown>).id as string;
    return this.reviewsService.approve(id, adminId);
  }

  @Patch(':id/reject')
  @Permissions(DefaultPermissions.REVIEW_REJECT)
  @ApiOperation({ summary: 'Reject a pending review' })
  reject(@Param('id', ParseUUIDPipe) id: string, @Req() req: Request) {
    const adminId: string = (req.user as Record<string, unknown>).id as string;
    return this.reviewsService.reject(id, adminId);
  }

  @Patch(':id/hide')
  @Permissions(DefaultPermissions.REVIEW_MODERATE)
  @ApiOperation({ summary: 'Hide a review' })
  hide(@Param('id', ParseUUIDPipe) id: string, @Req() req: Request) {
    const adminId: string = (req.user as Record<string, unknown>).id as string;
    return this.reviewsService.hide(id, adminId);
  }

  @Delete(':id')
  @Permissions(DefaultPermissions.REVIEW_DELETE)
  @ApiOperation({ summary: 'Delete a review' })
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.reviewsService.remove(id);
  }
}
