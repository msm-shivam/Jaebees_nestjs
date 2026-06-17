import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { AdminJwtGuard } from '../../common/guards/admin-jwt.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { Permissions } from '../../common/decorators/permissions.decorator';
import { DefaultPermissions } from '../../common/constants/roles.constants';
import { DashboardService } from './dashboard.service';
import {
  PeriodQueryDto,
  GranularityQueryDto,
  PeriodShortQueryDto,
  GranularityShortQueryDto,
} from './dto/dashboard-query.dto';

@ApiTags('Admin — Dashboard')
@ApiBearerAuth('JWT')
@UseGuards(AdminJwtGuard, PermissionsGuard)
@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('summary')
  @Permissions(DefaultPermissions.DASHBOARD_VIEW)
  @ApiOperation({ summary: 'KPI summary cards' })
  async getSummary(@Query() query: PeriodQueryDto) {
    return this.dashboardService.getSummary(query.period ?? '7d');
  }

  @Get('sales-overview')
  @Permissions(DefaultPermissions.DASHBOARD_VIEW)
  @ApiOperation({ summary: 'Sales comparison chart' })
  async getSalesOverview(@Query() query: GranularityQueryDto) {
    return this.dashboardService.getSalesOverview(query.granularity ?? 'daily');
  }

  @Get('sales-by-category')
  @Permissions(DefaultPermissions.DASHBOARD_VIEW)
  @ApiOperation({ summary: 'Sales by category (donut chart)' })
  async getSalesByCategory(@Query() query: PeriodShortQueryDto) {
    return this.dashboardService.getSalesByCategory(
      query.period ?? 'this_week',
    );
  }

  @Get('sales-by-payment')
  @Permissions(DefaultPermissions.DASHBOARD_VIEW)
  @ApiOperation({ summary: 'Sales by payment method (donut chart)' })
  async getSalesByPayment(@Query() query: PeriodShortQueryDto) {
    return this.dashboardService.getSalesByPayment(query.period ?? 'this_week');
  }

  @Get('users-overview')
  @Permissions(DefaultPermissions.DASHBOARD_VIEW)
  @ApiOperation({ summary: 'Users overview chart' })
  async getUsersOverview(@Query() query: GranularityQueryDto) {
    return this.dashboardService.getUsersOverview(query.granularity ?? 'daily');
  }

  @Get('users-by-source')
  @Permissions(DefaultPermissions.DASHBOARD_VIEW)
  @ApiOperation({ summary: 'Users by source (donut chart)' })
  async getUsersBySource(@Query() query: PeriodShortQueryDto) {
    return this.dashboardService.getUsersBySource(query.period ?? 'this_week');
  }

  @Get('signups')
  @Permissions(DefaultPermissions.DASHBOARD_VIEW)
  @ApiOperation({ summary: 'New user signups chart' })
  async getSignups(@Query() query: GranularityShortQueryDto) {
    return this.dashboardService.getSignups(query.granularity ?? 'daily');
  }

  @Get('top-products')
  @Permissions(DefaultPermissions.DASHBOARD_VIEW)
  @ApiOperation({ summary: 'Top selling products (current month)' })
  async getTopProducts() {
    return this.dashboardService.getTopProducts();
  }

  @Get('recent-orders')
  @Permissions(DefaultPermissions.DASHBOARD_VIEW)
  @ApiOperation({ summary: 'Recent 5 orders' })
  async getRecentOrders() {
    return this.dashboardService.getRecentOrders();
  }
}
