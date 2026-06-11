import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { AdminJwtGuard } from '../../../common/guards/admin-jwt.guard';
import { PermissionsGuard } from '../../../common/guards/permissions.guard';
import { Permissions } from '../../../common/decorators/permissions.decorator';
import { DefaultPermissions } from '../../../common/constants/roles.constants';
import { EmailAnalyticsService } from '../services/email-analytics.service';

@ApiTags('Admin — Communication Analytics')
@ApiBearerAuth('JWT')
@UseGuards(AdminJwtGuard, PermissionsGuard)
@Controller('admin/communication-analytics')
export class AdminCommunicationAnalyticsController {
  constructor(private readonly analyticsService: EmailAnalyticsService) {}

  @Get('summary')
  @Permissions(DefaultPermissions.NOTIFICATION_VIEW)
  async getSummary() {
    return this.analyticsService.getSummary();
  }

  @Get('emails')
  @Permissions(DefaultPermissions.NOTIFICATION_VIEW)
  async getEmails(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('dateFrom') dateFrom?: string,
    @Query('dateTo') dateTo?: string,
  ) {
    return this.analyticsService.getEmailStats({ page, limit, dateFrom, dateTo });
  }

  @Get('campaigns')
  @Permissions(DefaultPermissions.NOTIFICATION_VIEW)
  async getCampaigns() {
    return this.analyticsService.getCampaignStats();
  }
}
