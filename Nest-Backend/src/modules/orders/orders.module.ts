import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Order } from './entities/order.entity';
import { OrderItem } from './entities/order-item.entity';
import { User } from '../users/entities/user.entity';
import { Cart } from '../cart/entities/cart.entity';
import { CartItem } from '../cart/entities/cart-item.entity';
import { Inventory } from '../inventory/entities/inventory.entity';
import { ProductVariant } from '../product-variants/entities/product-variant.entity';
import { StockAlert } from '../inventory-plus/entities/stock-alert.entity';
import { Payment } from '../payments/entities/payment.entity';
import { OrdersService } from './orders.service';
import { OrdersController } from './orders.controller';
import { AdminOrdersController } from './admin-orders.controller';
import { AddressesModule } from '../addresses/addresses.module';
import { WarehousesModule } from '../warehouses/warehouses.module';
import { DeliverySettingsModule } from '../delivery-settings/delivery-settings.module';
import { DeliveryChargesModule } from '../delivery-charges/delivery-charges.module';
import { ShipmentsModule } from '../shipments/shipments.module';
import { SecurityComplianceModule } from '../security-compliance/security-compliance.module';
import { PaymentsModule } from '../payments/payments.module';

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
      StockAlert,
      Payment,
    ]),
    SecurityComplianceModule,
    AddressesModule,
    WarehousesModule,
    DeliverySettingsModule,
    DeliveryChargesModule,
    ShipmentsModule,
    forwardRef(() => PaymentsModule),
  ],
  controllers: [OrdersController, AdminOrdersController],
  providers: [OrdersService],
  exports: [OrdersService],
})
export class OrdersModule {}
