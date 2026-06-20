import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Wishlist } from './entities/wishlist.entity';
import { WishlistItem } from './entities/wishlist-item.entity';
import { Product } from '../products/entities/product.entity';
import { ProductVariant } from '../product-variants/entities/product-variant.entity';
import { Inventory } from '../inventory/entities/inventory.entity';
import { Cart } from '../cart/entities/cart.entity';
import { CartItem } from '../cart/entities/cart-item.entity';
import { CartModule } from '../cart/cart.module';
import { WishlistService } from './wishlist.service';
import { WishlistController } from './wishlist.controller';
import { AdminWishlistController } from './admin-wishlist.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Wishlist,
      WishlistItem,
      Product,
      ProductVariant,
      Inventory,
      Cart,
      CartItem,
    ]),
    CartModule,
  ],
  controllers: [WishlistController, AdminWishlistController],
  providers: [WishlistService],
  exports: [WishlistService],
})
export class WishlistModule {}
