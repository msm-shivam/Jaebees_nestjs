import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AdminJwtGuard } from '../../../common/guards/admin-jwt.guard';
import { PermissionsGuard } from '../../../common/guards/permissions.guard';
import { Permissions } from '../../../common/decorators/permissions.decorator';
import { DefaultPermissions } from '../../../common/constants/roles.constants';
import { AnalyticsService } from '../services/analytics.service';

@ApiTags('Admin Analytics')
@ApiBearerAuth()
@UseGuards(AdminJwtGuard, PermissionsGuard)
@Controller('admin/analytics')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('coupons')
  @Permissions(DefaultPermissions.COUPON_VIEW)
  @ApiOperation({ summary: 'Get coupon analytics' })
  getCouponAnalytics() {
    return this.analyticsService.getCouponAnalytics();
  }

  @Get('promotions')
  @Permissions(DefaultPermissions.PROMOTION_VIEW)
  @ApiOperation({ summary: 'Get promotion analytics' })
  getPromotionAnalytics() {
    return this.analyticsService.getPromotionAnalytics();
  }

  @Get('campaigns')
  @Permissions(DefaultPermissions.CAMPAIGN_VIEW)
  @ApiOperation({ summary: 'Get campaign analytics' })
  getCampaignAnalytics() {
    return this.analyticsService.getCampaignAnalytics();
  }
}
