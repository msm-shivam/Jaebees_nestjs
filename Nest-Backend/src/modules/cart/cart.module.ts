import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Cart } from './entities/cart.entity';
import { CartItem } from './entities/cart-item.entity';
import { ProductVariant } from '../product-variants/entities/product-variant.entity';
import { Product } from '../products/entities/product.entity';
import { Inventory } from '../inventory/entities/inventory.entity';
import { CartService } from './cart.service';
import { CartController } from './cart.controller';
import { AdminCartController } from './admin-cart.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Cart,
      CartItem,
      ProductVariant,
      Product,
      Inventory,
    ]),
  ],
  controllers: [CartController, AdminCartController],
  providers: [CartService],
  exports: [CartService],
})
export class CartModule {}
