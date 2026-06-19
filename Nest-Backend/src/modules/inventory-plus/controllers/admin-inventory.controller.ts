import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { AdminJwtGuard } from '../../../common/guards/admin-jwt.guard';
import { PermissionsGuard } from '../../../common/guards/permissions.guard';
import { Permissions } from '../../../common/decorators/permissions.decorator';
import { DefaultPermissions } from '../../../common/constants/roles.constants';
import { InventoryPlusService } from '../services/inventory-plus.service';
import { AdjustStockDto } from '../dto/adjust-stock.dto';

@ApiTags('Admin Inventory Plus')
@ApiBearerAuth()
@UseGuards(AdminJwtGuard, PermissionsGuard)
@Controller('admin/inventory-plus')
export class AdminInventoryController {
  constructor(private readonly inventoryService: InventoryPlusService) {}

  @Get()
  @Permissions(DefaultPermissions.INVENTORY_VIEW)
  @ApiOperation({ summary: 'List all inventory records' })
  findAll(@Query('page') page = 1, @Query('limit') limit = 20) {
    return this.inventoryService.findAll(page, limit);
  }

  @Get('low-stock')
  @Permissions(DefaultPermissions.INVENTORY_VIEW)
  @ApiOperation({ summary: 'Get low stock items' })
  findLowStock(@Query('page') page = 1, @Query('limit') limit = 20) {
    return this.inventoryService.findLowStock(page, limit);
  }

  @Get('out-of-stock')
  @Permissions(DefaultPermissions.INVENTORY_VIEW)
  @ApiOperation({ summary: 'Get out of stock items' })
  findOutOfStock(@Query('page') page = 1, @Query('limit') limit = 20) {
    return this.inventoryService.findOutOfStock(page, limit);
  }

  @Get('alerts')
  @Permissions(DefaultPermissions.INVENTORY_VIEW)
  @ApiOperation({ summary: 'Get stock alerts' })
  getAlerts(
    @Query('page') page = 1,
    @Query('limit') limit = 20,
    @Query('search') search?: string,
    @Query('status') status?: string,
  ) {
    return this.inventoryService.getAlerts(page, limit, search, status);
  }

  @Get('movements')
  @Permissions(DefaultPermissions.INVENTORY_VIEW)
  @ApiOperation({ summary: 'Get inventory movement audit' })
  getMovements(
    @Query('page') page = 1,
    @Query('limit') limit = 20,
    @Query('actionType') actionType?: string,
    @Query('status') status?: string,
  ) {
    return this.inventoryService.getMovements(page, limit, actionType ?? status);
  }

  @Post('alerts/check')
  @Permissions(DefaultPermissions.INVENTORY_VIEW)
  @ApiOperation({ summary: 'Check all inventory and create alerts for low/out-of-stock items' })
  checkAlerts() {
    return this.inventoryService.checkAndCreateAlerts();
  }

  @Post('alerts/resolve')
  @Permissions(DefaultPermissions.INVENTORY_ADJUST)
  @ApiOperation({ summary: 'Auto-resolve alerts for items now above threshold' })
  resolveAlerts() {
    return this.inventoryService.resolveAlerts();
  }

  @Patch('alerts/:id')
  @Permissions(DefaultPermissions.INVENTORY_ADJUST)
  @ApiOperation({ summary: 'Manually resolve a single alert' })
  resolveSingleAlert(@Param('id') id: string) {
    return this.inventoryService.resolveAlert(id);
  }

  @Post('adjust')
  @Permissions(DefaultPermissions.INVENTORY_ADJUST)
  @ApiOperation({ summary: 'Manually adjust stock quantity' })
  adjustStock(@Body() dto: AdjustStockDto) {
    return this.inventoryService.adjustStock(dto);
  }
}
