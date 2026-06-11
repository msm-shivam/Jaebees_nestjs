import { Controller, Post, Get, Patch, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AdminJwtGuard } from '../../../common/guards/admin-jwt.guard';
import { PermissionsGuard } from '../../../common/guards/permissions.guard';
import { Permissions } from '../../../common/decorators/permissions.decorator';
import { DefaultPermissions } from '../../../common/constants/roles.constants';
import { PurchaseOrderService } from '../services/purchase-order.service';
import { CreatePurchaseOrderDto } from '../dto/create-purchase-order.dto';
import { UpdatePurchaseOrderDto } from '../dto/update-purchase-order.dto';
import { PurchaseOrderQueryDto } from '../dto/purchase-order-query.dto';

@ApiTags('Admin Purchase Orders')
@ApiBearerAuth()
@UseGuards(AdminJwtGuard, PermissionsGuard)
@Controller('admin/purchase-orders')
export class AdminPurchaseOrderController {
  constructor(private readonly poService: PurchaseOrderService) {}

  @Post()
  @Permissions(DefaultPermissions.PURCHASE_ORDER_CREATE)
  @ApiOperation({ summary: 'Create a purchase order' })
  create(@Body() dto: CreatePurchaseOrderDto) {
    return this.poService.create(dto);
  }

  @Get()
  @Permissions(DefaultPermissions.PURCHASE_ORDER_VIEW)
  @ApiOperation({ summary: 'List purchase orders' })
  findAll(@Query() query: PurchaseOrderQueryDto) {
    return this.poService.findAll(query);
  }

  @Get(':id')
  @Permissions(DefaultPermissions.PURCHASE_ORDER_VIEW)
  @ApiOperation({ summary: 'Get purchase order by ID' })
  findById(@Param('id') id: string) {
    return this.poService.findById(id);
  }

  @Patch(':id')
  @Permissions(DefaultPermissions.PURCHASE_ORDER_UPDATE)
  @ApiOperation({ summary: 'Update a purchase order (DRAFT only)' })
  update(@Param('id') id: string, @Body() dto: UpdatePurchaseOrderDto) {
    return this.poService.update(id, dto);
  }

  @Post(':id/approve')
  @Permissions(DefaultPermissions.PURCHASE_ORDER_APPROVE)
  @ApiOperation({ summary: 'Approve a purchase order' })
  approve(@Param('id') id: string) {
    return this.poService.approve(id);
  }

  @Post(':id/cancel')
  @Permissions(DefaultPermissions.PURCHASE_ORDER_CANCEL)
  @ApiOperation({ summary: 'Cancel a purchase order' })
  cancel(@Param('id') id: string) {
    return this.poService.cancel(id);
  }
}
