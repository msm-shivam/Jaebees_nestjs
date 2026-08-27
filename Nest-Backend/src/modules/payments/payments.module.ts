import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Payment } from './entities/payment.entity';
import { PaymentMethod } from './entities/payment-method.entity';
import { PaymentRefund } from './entities/payment-refund.entity';
import { PaymentLog } from './entities/payment-log.entity';
import { PaymentWebhook } from './entities/payment-webhook.entity';
import { CheckoutSnapshot } from './entities/checkout-snapshot.entity';
import { Order } from '../orders/entities/order.entity';
import { OrderItem } from '../orders/entities/order-item.entity';
import { User } from '../users/entities/user.entity';
import { Cart } from '../cart/entities/cart.entity';
import { CartItem } from '../cart/entities/cart-item.entity';
import { ProductVariant } from '../product-variants/entities/product-variant.entity';
import { Inventory } from '../inventory/entities/inventory.entity';
import { Address } from '../addresses/entities/address.entity';
import { Warehouse } from '../warehouses/entities/warehouse.entity';
import { StripeService } from './services/stripe.service';
import { PaymentsService } from './services/payments.service';
import { RefundsService } from './services/refunds.service';
import { PaymentMethodsService } from './services/payment-methods.service';
import { CheckoutCronService } from './services/checkout-cron.service';
import { PaymentsController } from './controllers/payments.controller';
import { AdminPaymentsController } from './controllers/admin-payments.controller';
import { CustomerPaymentsController } from './controllers/customer-payments.controller';
import { PaymentMethodsController } from './controllers/payment-methods.controller';
import { AddressesModule } from '../addresses/addresses.module';
import { WarehousesModule } from '../warehouses/warehouses.module';
import { DeliverySettingsModule } from '../delivery-settings/delivery-settings.module';
import { DeliveryChargesModule } from '../delivery-charges/delivery-charges.module';
import { ShipmentsModule } from '../shipments/shipments.module';
import { NotificationsModule } from '../notifications/notifications.module';

import { Coupon } from '../coupons-promotions/entities/coupon.entity';
import { CouponUsage } from '../coupons-promotions/entities/coupon-usage.entity';
import { CouponsPromotionsModule } from '../coupons-promotions/coupons-promotions.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Payment,
      PaymentMethod,
      PaymentRefund,
      PaymentLog,
      PaymentWebhook,
      CheckoutSnapshot,
      Order,
      OrderItem,
      User,
      Cart,
      CartItem,
      ProductVariant,
      Inventory,
      Address,
      Warehouse,
      Coupon,
      CouponUsage,
    ]),
    AddressesModule,
    WarehousesModule,
    DeliverySettingsModule,
    DeliveryChargesModule,
    ShipmentsModule,
    NotificationsModule,
    CouponsPromotionsModule,
  ],
  controllers: [
    PaymentsController,
    AdminPaymentsController,
    CustomerPaymentsController,
    PaymentMethodsController,
  ],
  providers: [
    StripeService,
    PaymentsService,
    RefundsService,
    PaymentMethodsService,
    CheckoutCronService,
  ],
  exports: [PaymentsService, StripeService, CheckoutCronService, RefundsService],
})
export class PaymentsModule {}
