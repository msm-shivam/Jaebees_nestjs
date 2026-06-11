import { Controller, Post, Get, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AdminJwtGuard } from '../../../common/guards/admin-jwt.guard';
import { PermissionsGuard } from '../../../common/guards/permissions.guard';
import { Permissions } from '../../../common/decorators/permissions.decorator';
import { DefaultPermissions } from '../../../common/constants/roles.constants';
import { GoodsReceiptService } from '../services/goods-receipt.service';
import { CreateGoodsReceiptDto } from '../dto/create-goods-receipt.dto';

@ApiTags('Admin Goods Receipts')
@ApiBearerAuth()
@UseGuards(AdminJwtGuard, PermissionsGuard)
@Controller('admin/goods-receipts')
export class AdminGoodsReceiptController {
  constructor(private readonly receiptService: GoodsReceiptService) {}

  @Post()
  @Permissions(DefaultPermissions.INVENTORY_RECEIVE)
  @ApiOperation({ summary: 'Create a goods receipt (receive stock)' })
  create(@Body() dto: CreateGoodsReceiptDto) {
    return this.receiptService.create(dto);
  }

  @Get()
  @Permissions(DefaultPermissions.INVENTORY_VIEW)
  @ApiOperation({ summary: 'List all goods receipts' })
  findAll(@Query('page') page = 1, @Query('limit') limit = 20) {
    return this.receiptService.findAll(page, limit);
  }

  @Get(':id')
  @Permissions(DefaultPermissions.INVENTORY_VIEW)
  @ApiOperation({ summary: 'Get goods receipt by ID' })
  findById(@Param('id') id: string) {
    return this.receiptService.findById(id);
  }
}
