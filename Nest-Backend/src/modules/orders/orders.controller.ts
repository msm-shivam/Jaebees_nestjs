import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
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
import { CreateOrderDto } from './dto/create-order.dto';
import { CancelOrderDto } from './dto/cancel-order.dto';
import { OrderResponseDto } from './dto/order-response.dto';
import { OrderListQueryDto } from './dto/order-list-query.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { JwtPayload } from '../../common/decorators/current-user.decorator';
import { ApiPaginatedResponse } from '../../common/decorators/api-paginated-response.decorator';

@ApiTags('Customer — Orders')
@ApiBearerAuth('JWT')
@UseGuards(JwtAuthGuard)
@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Create order from cart',
    description:
      'Creates a new order from the current cart. Validates inventory, reduces stock, and clears the cart.',
  })
  @ApiResponse({
    status: 201,
    description: 'Order created successfully.',
    type: OrderResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Cart empty or validation error.' })
  async createOrder(
    @CurrentUser() user: JwtPayload,
    @Body() dto: CreateOrderDto,
  ) {
    return this.ordersService.createOrder(user.sub, dto);
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get my orders',
    description:
      "Returns a paginated list of the authenticated customer's orders.",
  })
  @ApiPaginatedResponse(OrderResponseDto)
  async getMyOrders(
    @CurrentUser() user: JwtPayload,
    @Query() query: OrderListQueryDto,
  ) {
    return this.ordersService.getMyOrders(user.sub, query);
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get order details',
    description: 'Returns a single order by ID for the authenticated customer.',
  })
  @ApiResponse({
    status: 200,
    description: 'Order returned.',
    type: OrderResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Order not found.' })
  async getMyOrder(
    @CurrentUser() user: JwtPayload,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.ordersService.getMyOrder(user.sub, id);
  }

  @Patch(':id/cancel')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Cancel order',
    description:
      'Cancels an order. Only allowed when status is PENDING or CONFIRMED. Restores inventory.',
  })
  @ApiResponse({
    status: 200,
    description: 'Order cancelled successfully.',
    type: OrderResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Order cannot be cancelled in current status.',
  })
  @ApiResponse({ status: 404, description: 'Order not found.' })
  async cancelOrder(
    @CurrentUser() user: JwtPayload,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: CancelOrderDto,
  ) {
    return this.ordersService.cancelOrder(id, dto, false);
  }
}
