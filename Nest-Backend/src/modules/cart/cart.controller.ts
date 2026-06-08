import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { CartService } from './cart.service';
import { AddCartItemDto } from './dto/add-cart-item.dto';
import { UpdateCartItemDto } from './dto/update-cart-item.dto';
import { CartResponseDto } from './dto/cart-response.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { JwtPayload } from '../../common/decorators/current-user.decorator';

@ApiTags('Cart')
@ApiBearerAuth('JWT')
@UseGuards(JwtAuthGuard)
@Controller('cart')
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get current cart',
    description:
      "Returns the authenticated customer's cart with all items. Creates a new cart if none exists.",
  })
  @ApiResponse({
    status: 200,
    description: 'Cart retrieved successfully.',
    type: CartResponseDto,
  })
  async getCart(@CurrentUser() user: JwtPayload) {
    return this.cartService.getCart(user.sub);
  }

  @Post('items')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Add item to cart',
    description:
      'Adds a product variant to the cart. Validates variant status, product availability, and stock. If variant already exists, quantity is increased.',
  })
  @ApiResponse({
    status: 201,
    description: 'Item added to cart successfully.',
    type: CartResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Validation error or business rule violation.',
  })
  @ApiResponse({ status: 404, description: 'Variant not found.' })
  async addItem(@CurrentUser() user: JwtPayload, @Body() dto: AddCartItemDto) {
    return this.cartService.addItem(user.sub, dto);
  }

  @Patch('items/:itemId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Update cart item quantity',
    description:
      'Updates the quantity of a specific cart item. Validates stock availability.',
  })
  @ApiResponse({
    status: 200,
    description: 'Cart item updated successfully.',
    type: CartResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Insufficient stock.' })
  @ApiResponse({ status: 404, description: 'Cart item not found.' })
  async updateItem(
    @CurrentUser() user: JwtPayload,
    @Param('itemId', ParseUUIDPipe) itemId: string,
    @Body() dto: UpdateCartItemDto,
  ) {
    return this.cartService.updateItem(user.sub, itemId, dto);
  }

  @Delete('items/:itemId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Remove item from cart',
    description: 'Removes a specific item from the cart.',
  })
  @ApiResponse({
    status: 200,
    description: 'Item removed from cart successfully.',
    type: CartResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Cart item not found.' })
  async removeItem(
    @CurrentUser() user: JwtPayload,
    @Param('itemId', ParseUUIDPipe) itemId: string,
  ) {
    return this.cartService.removeItem(user.sub, itemId);
  }

  @Delete('clear')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Clear cart',
    description: 'Removes all items from the cart.',
  })
  @ApiResponse({
    status: 200,
    description: 'Cart cleared successfully.',
    type: CartResponseDto,
  })
  async clearCart(@CurrentUser() user: JwtPayload) {
    return this.cartService.clearCart(user.sub);
  }
}
