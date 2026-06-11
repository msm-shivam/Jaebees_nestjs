import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { AdminJwtGuard } from '../../../common/guards/admin-jwt.guard';
import { PermissionsGuard } from '../../../common/guards/permissions.guard';
import { Permissions } from '../../../common/decorators/permissions.decorator';
import { DefaultPermissions } from '../../../common/constants/roles.constants';
import { SupportAnalyticsService } from '../services/support-analytics.service';

@ApiTags('Admin — Support Analytics')
@ApiBearerAuth('JWT')
@UseGuards(AdminJwtGuard, PermissionsGuard)
@Controller('admin/support-analytics')
export class AdminSupportAnalyticsController {
  constructor(private readonly analyticsService: SupportAnalyticsService) {}

  @Get('summary')
  @Permissions(DefaultPermissions.SUPPORT_VIEW)
  async getSummary() {
    return this.analyticsService.getSummary();
  }

  @Get('categories')
  @Permissions(DefaultPermissions.SUPPORT_VIEW)
  async getCategories() {
    return this.analyticsService.getCategoryBreakdown();
  }

  @Get('agents')
  @Permissions(DefaultPermissions.SUPPORT_VIEW)
  async getAgents() {
    return this.analyticsService.getAgentPerformance();
  }

  @Get('sla')
  @Permissions(DefaultPermissions.SUPPORT_VIEW)
  async getSla() {
    return this.analyticsService.getSlaSummary();
  }
}
