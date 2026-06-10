import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Order } from './entities/order.entity';
import { OrderItem } from './entities/order-item.entity';
import { User } from '../users/entities/user.entity';
import { Cart } from '../cart/entities/cart.entity';
import { CartItem } from '../cart/entities/cart-item.entity';
import { Inventory } from '../inventory/entities/inventory.entity';
import { ProductVariant } from '../product-variants/entities/product-variant.entity';
import { OrdersService } from './orders.service';
import { OrdersController } from './orders.controller';
import { AdminOrdersController } from './admin-orders.controller';
import { AddressesModule } from '../addresses/addresses.module';
import { WarehousesModule } from '../warehouses/warehouses.module';
import { DeliverySettingsModule } from '../delivery-settings/delivery-settings.module';
import { ShipmentsModule } from '../shipments/shipments.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Order,
      OrderItem,
      Cart,
      CartItem,
      Inventory,
      ProductVariant,
      User,
    ]),
    AddressesModule,
    WarehousesModule,
    DeliverySettingsModule,
    ShipmentsModule,
  ],
  controllers: [OrdersController, AdminOrdersController],
  providers: [OrdersService],
  exports: [OrdersService],
})
export class OrdersModule {}
