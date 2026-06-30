import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { CartService } from './cart.service';
import { CartResponseDto } from './dto/cart-response.dto';
import { AdminJwtGuard } from '../../common/guards/admin-jwt.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { Permissions } from '../../common/decorators/permissions.decorator';
import { DefaultPermissions } from '../../common/constants/roles.constants';

@ApiTags('Admin — Cart')
@ApiBearerAuth('JWT')
@UseGuards(AdminJwtGuard, PermissionsGuard)
@Controller('admin/customers')
export class AdminCartController {
  constructor(private readonly cartService: CartService) {}

  @Get(':userId/cart')
  @HttpCode(HttpStatus.OK)
  @Permissions(DefaultPermissions.USER_VIEW)
  @ApiOperation({ summary: 'Get customer cart by user ID' })
  @ApiResponse({
    status: 200,
    description: 'Cart retrieved successfully.',
    type: CartResponseDto,
  })
  async getCustomerCart(@Param('userId', ParseUUIDPipe) userId: string) {
    return this.cartService.getCart(userId);
  }
}
