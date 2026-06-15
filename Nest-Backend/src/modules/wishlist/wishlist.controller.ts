import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Body,
  UseGuards,
  Req,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { WishlistService } from './wishlist.service';
import {
  CreateWishlistItemDto,
  SaveForLaterDto,
} from './dto/create-wishlist-item.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import type { Request } from 'express';

@ApiTags('Wishlist')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('wishlist')
export class WishlistController {
  constructor(private readonly wishlistService: WishlistService) {}

  @Get()
  @ApiOperation({ summary: 'Get user wishlist with total count' })
  getWishlist(@Req() req: Request) {
    const userId: string = (req.user as Record<string, unknown>).id as string;
    return this.wishlistService.getWishlist(userId);
  }

  @Get('count')
  @ApiOperation({ summary: 'Get total wishlist item count' })
  async getCount(@Req() req: Request) {
    const userId: string = (req.user as Record<string, unknown>).id as string;
    const wishlist = await this.wishlistService.getWishlist(userId);
    return { totalItems: wishlist.totalItems };
  }

  @Post('items')
  @ApiOperation({
    summary: 'Add product to wishlist (validates product/variant ACTIVE)',
  })
  addItem(@Body() dto: CreateWishlistItemDto, @Req() req: Request) {
    const userId: string = (req.user as Record<string, unknown>).id as string;
    return this.wishlistService.addItem(userId, dto);
  }

  @Delete('items/:id')
  @ApiOperation({ summary: 'Remove item from wishlist' })
  removeItem(@Param('id') id: string, @Req() req: Request) {
    const userId: string = (req.user as Record<string, unknown>).id as string;
    return this.wishlistService.removeItem(userId, id);
  }

  @Post('items/:id/move-to-cart')
  @ApiOperation({
    summary: 'Move wishlist item to cart with inventory validation',
  })
  moveToCart(@Param('id') id: string, @Req() req: Request) {
    const userId: string = (req.user as Record<string, unknown>).id as string;
    return this.wishlistService.moveToCart(userId, id);
  }

  @Post('save-for-later')
  @ApiOperation({ summary: 'Move cart item to wishlist (Save for Later)' })
  saveForLater(@Body() dto: SaveForLaterDto, @Req() req: Request) {
    const userId: string = (req.user as Record<string, unknown>).id as string;
    return this.wishlistService.saveForLater(userId, dto.cartItemId);
  }

  @Delete()
  @ApiOperation({ summary: 'Clear all wishlist items' })
  clearWishlist(@Req() req: Request) {
    const userId: string = (req.user as Record<string, unknown>).id as string;
    return this.wishlistService.clearWishlist(userId);
  }

  @Delete('delete')
  @ApiOperation({ summary: 'Soft delete entire wishlist' })
  deleteWishlist(@Req() req: Request) {
    const userId: string = (req.user as Record<string, unknown>).id as string;
    return this.wishlistService.deleteWishlist(userId);
  }
}
