import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AdminJwtGuard } from '../../../common/guards/admin-jwt.guard';
import { PermissionsGuard } from '../../../common/guards/permissions.guard';
import { Permissions } from '../../../common/decorators/permissions.decorator';
import { DefaultPermissions } from '../../../common/constants/roles.constants';
import { InventoryAnalyticsService } from '../services/inventory-analytics.service';

@ApiTags('Admin Inventory Analytics')
@ApiBearerAuth()
@UseGuards(AdminJwtGuard, PermissionsGuard)
@Controller('admin/inventory-analytics')
export class AdminInventoryAnalyticsController {
  constructor(private readonly analyticsService: InventoryAnalyticsService) {}

  @Get('summary')
  @Permissions(DefaultPermissions.INVENTORY_ANALYTICS_VIEW)
  @ApiOperation({ summary: 'Get inventory summary statistics' })
  getSummary() {
    return this.analyticsService.getSummary();
  }

  @Get('top-selling')
  @Permissions(DefaultPermissions.INVENTORY_ANALYTICS_VIEW)
  @ApiOperation({ summary: 'Get top selling variants' })
  getTopSelling(@Query('limit') limit = 10) {
    return this.analyticsService.getTopSelling(limit);
  }

  @Get('slow-moving')
  @Permissions(DefaultPermissions.INVENTORY_ANALYTICS_VIEW)
  @ApiOperation({ summary: 'Get slow moving inventory' })
  getSlowMoving() {
    return this.analyticsService.getSlowMoving();
  }

  @Get('stock-value')
  @Permissions(DefaultPermissions.INVENTORY_ANALYTICS_VIEW)
  @ApiOperation({ summary: 'Get total stock value' })
  getStockValue() {
    return this.analyticsService.getStockValue();
  }

  @Get('alerts')
  @Permissions(DefaultPermissions.INVENTORY_ANALYTICS_VIEW)
  @ApiOperation({ summary: 'Get inventory alert statistics' })
  getAlertStats() {
    return this.analyticsService.getAlertStats();
  }
}
