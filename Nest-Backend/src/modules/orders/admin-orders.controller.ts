import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { OrdersService } from './orders.service';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { CancelOrderDto } from './dto/cancel-order.dto';
import { OrderResponseDto } from './dto/order-response.dto';
import { OrderListQueryDto } from './dto/order-list-query.dto';
import { AdminJwtGuard } from '../../common/guards/admin-jwt.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { Permissions } from '../../common/decorators/permissions.decorator';
import { DefaultPermissions } from '../../common/constants/roles.constants';
import { ApiPaginatedResponse } from '../../common/decorators/api-paginated-response.decorator';
import { CurrentAdmin } from 'src/common/decorators/current-admin.decorator';

@ApiTags('Admin — Orders')
@ApiBearerAuth('JWT')
@UseGuards(AdminJwtGuard, PermissionsGuard)
@Controller('admin/orders')
export class AdminOrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  @Permissions(DefaultPermissions.ORDER_VIEW)
  @ApiOperation({
    summary: 'List all orders',
    description:
      'Returns a paginated list of all orders. Supports filtering by status.',
  })
  @ApiPaginatedResponse(OrderResponseDto)
  async getAllOrders(@Query() query: OrderListQueryDto) {
    return this.ordersService.getAllOrders(query);
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @Permissions(DefaultPermissions.ORDER_VIEW)
  @ApiOperation({
    summary: 'Get order by ID',
    description: 'Returns a single order with all items.',
  })
  @ApiResponse({
    status: 200,
    description: 'Order returned.',
    type: OrderResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Order not found.' })
  async getOrder(@Param('id', ParseUUIDPipe) id: string) {
    return this.ordersService.getOrder(id);
  }

  @Patch(':id/status')
  @HttpCode(HttpStatus.OK)
  @Permissions(DefaultPermissions.ORDER_UPDATE)
  @ApiOperation({
    summary: 'Update order status',
    description:
      'Updates the status of an order. Supports all order status transitions.',
  })
  @ApiResponse({
    status: 200,
    description: 'Order status updated.',
    type: OrderResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Order not found.' })
  async updateStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateOrderStatusDto,
    @CurrentAdmin() admin: any,

  ) {
    return this.ordersService.updateStatus(id, dto,admin.sub);
  }

  @Patch(':id/cancel')
  @HttpCode(HttpStatus.OK)
  @Permissions(DefaultPermissions.ORDER_CANCEL)
  @ApiOperation({
    summary: 'Cancel order (admin)',
    description:
      'Admin can cancel any order regardless of status. Restores inventory.',
  })
  @ApiResponse({
    status: 200,
    description: 'Order cancelled successfully.',
    type: OrderResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Order not found.' })
  async cancelOrder(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentAdmin() admin: any,
    @Body() dto: CancelOrderDto,
  ) {
    return this.ordersService.cancelOrder(id,admin.sub, dto, true);
  }
}
