import { Module } from '@nestjs/common';
import { APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';
import { ConfigModule } from './config/config.module';
import { DatabaseModule } from './database/database.module';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { AdminModule } from './modules/admin/admin.module';
import { RbacModule } from './modules/rbac/rbac.module';
import { BrandsModule } from './modules/brands/brands.module';
import { CategoriesModule } from './modules/categories/categories.module';
import { SubCategoriesModule } from './modules/sub-categories/sub-categories.module';
import { CollectionsModule } from './modules/collections/collections.module';
import { AttributesModule } from './modules/attributes/attributes.module';
import { AttributeValuesModule } from './modules/attribute-values/attribute-values.module';
import { ProductTagsModule } from './modules/product-tags/product-tags.module';
import { ProductsModule } from './modules/products/products.module';
import { ProductVariantsModule } from './modules/product-variants/product-variants.module';
import { InventoryModule } from './modules/inventory/inventory.module';
import { CartModule } from './modules/cart/cart.module';
import { OrdersModule } from './modules/orders/orders.module';
import { PaymentsModule } from './modules/payments/payments.module';
import { AddressesModule } from './modules/addresses/addresses.module';
import { WarehousesModule } from './modules/warehouses/warehouses.module';
import { DeliverySettingsModule } from './modules/delivery-settings/delivery-settings.module';
import { ShipmentsModule } from './modules/shipments/shipments.module';
import { CouponsPromotionsModule } from './modules/coupons-promotions/coupons-promotions.module';
import { WishlistModule } from './modules/wishlist/wishlist.module';
import { ReviewsModule } from './modules/reviews/reviews.module';
import { QuestionsModule } from './modules/questions/questions.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { SearchModule } from './modules/search/search.module';
import { InventoryPlusModule } from './modules/inventory-plus/inventory-plus.module';
import { ReturnsModule } from './modules/returns/returns.module';
import { SupportModule } from './modules/support/support.module';
import { EmailNotificationsModule } from './modules/email-notifications/email-notifications.module';
import { GlobalExceptionFilter } from './common/filters/http-exception.filter';
import { ResponseInterceptor } from './common/interceptors/response.interceptor';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';

@Module({
  imports: [
    ConfigModule,
    DatabaseModule,
    AuthModule,
    UsersModule,
    AdminModule,
    RbacModule,
    BrandsModule,
    CategoriesModule,
    SubCategoriesModule,
    CollectionsModule,
    AttributesModule,
    AttributeValuesModule,
    ProductTagsModule,
    ProductsModule,
    ProductVariantsModule,
    InventoryModule,
    CartModule,
    OrdersModule,
    PaymentsModule,
    AddressesModule,
    WarehousesModule,
    DeliverySettingsModule,
    ShipmentsModule,
    CouponsPromotionsModule,
    WishlistModule,
    ReviewsModule,
    QuestionsModule,
    NotificationsModule,
    SearchModule,
    InventoryPlusModule,
    ReturnsModule,
    SupportModule,
    EmailNotificationsModule,
  ],
  providers: [
    { provide: APP_FILTER, useClass: GlobalExceptionFilter },
    { provide: APP_INTERCEPTOR, useClass: LoggingInterceptor },
    { provide: APP_INTERCEPTOR, useClass: ResponseInterceptor },
  ],
})
export class AppModule {}
