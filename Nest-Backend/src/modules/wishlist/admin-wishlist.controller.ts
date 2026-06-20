import {
  Controller,
  Get,
  Param,
  UseGuards,
  ParseUUIDPipe,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { AdminJwtGuard } from '../../common/guards/admin-jwt.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { Permissions } from '../../common/decorators/permissions.decorator';
import { DefaultPermissions } from '../../common/constants/roles.constants';
import { WishlistService } from './wishlist.service';

@ApiTags('Admin — Wishlist')
@ApiBearerAuth('JWT')
@UseGuards(AdminJwtGuard, PermissionsGuard)
@Controller('admin/wishlist')
export class AdminWishlistController {
  constructor(private readonly wishlistService: WishlistService) {}

  @Get(':userId')
  @Permissions(DefaultPermissions.WISHLIST_ADMIN_VIEW)
  @ApiOperation({ summary: 'View a customer wishlist by user ID' })
  @ApiParam({ name: 'userId', type: String, format: 'uuid', description: 'Customer user UUID' })
  @ApiResponse({ status: 200, description: 'Customer wishlist with user info and items' })
  @ApiResponse({ status: 404, description: 'User not found' })
  @ApiResponse({ status: 403, description: 'Forbidden — missing wishlist.admin_view permission' })
  async getCustomerWishlist(@Param('userId', ParseUUIDPipe) userId: string) {
    return this.wishlistService.getWishlistByUserId(userId);
  }
}
