import 'reflect-metadata';
import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';
import { User } from '../modules/users/entities/user.entity';
import { UserSession } from '../modules/users/entities/user-session.entity';
import { AdminUser } from '../modules/admin/entities/admin-user.entity';
import { AdminSession } from '../modules/admin/entities/admin-session.entity';
import { Role } from '../modules/rbac/entities/role.entity';
import { Permission } from '../modules/rbac/entities/permission.entity';
import { OtpVerification } from '../modules/auth/entities/otp-verification.entity';
import { Brand } from '../modules/brands/entities/brand.entity';
import { Category } from '../modules/categories/entities/category.entity';
import { SubCategory } from '../modules/sub-categories/entities/sub-category.entity';
import { Collection } from '../modules/collections/entities/collection.entity';
import { Attribute } from '../modules/attributes/entities/attribute.entity';
import { AttributeValue } from '../modules/attribute-values/entities/attribute-value.entity';
import { ProductTag } from '../modules/product-tags/entities/product-tag.entity';
import { ProductTagMapping } from '../modules/product-tags/entities/product-tag-mapping.entity';
import { ProductCollection } from '../modules/collections/entities/product-collection.entity';
import { Product } from '../modules/products/entities/product.entity';
import { ProductImage } from '../modules/products/entities/product-image.entity';
import { ProductVariant } from '../modules/product-variants/entities/product-variant.entity';
import { ProductVariantAttribute } from '../modules/product-variants/entities/product-variant-attribute.entity';
import { Inventory } from '../modules/inventory/entities/inventory.entity';
import { Cart } from '../modules/cart/entities/cart.entity';
import { CartItem } from '../modules/cart/entities/cart-item.entity';
import { Order } from '../modules/orders/entities/order.entity';
import { OrderItem } from '../modules/orders/entities/order-item.entity';
import { PaymentMethod } from '../modules/payments/entities/payment-method.entity';
import { Payment } from '../modules/payments/entities/payment.entity';
import { PaymentRefund } from '../modules/payments/entities/payment-refund.entity';
import { PaymentLog } from '../modules/payments/entities/payment-log.entity';
import { PaymentWebhook } from '../modules/payments/entities/payment-webhook.entity';
import { Address } from '../modules/addresses/entities/address.entity';
import { Warehouse } from '../modules/warehouses/entities/warehouse.entity';
import { DeliverySetting } from '../modules/delivery-settings/entities/delivery-setting.entity';
import { Shipment } from '../modules/shipments/entities/shipment.entity';
import { ShipmentTrackingLog } from '../modules/shipments/entities/shipment-tracking-log.entity';
import { Coupon } from '../modules/coupons-promotions/entities/coupon.entity';
import { CouponUsage } from '../modules/coupons-promotions/entities/coupon-usage.entity';
import { Promotion } from '../modules/coupons-promotions/entities/promotion.entity';
import { PromotionProduct } from '../modules/coupons-promotions/entities/promotion-product.entity';
import { PromotionCategory } from '../modules/coupons-promotions/entities/promotion-category.entity';
import { Campaign } from '../modules/coupons-promotions/entities/campaign.entity';
import { Wishlist } from '../modules/wishlist/entities/wishlist.entity';
import { WishlistItem } from '../modules/wishlist/entities/wishlist-item.entity';
import { Review } from '../modules/reviews/entities/review.entity';
import { ReviewImage } from '../modules/reviews/entities/review-image.entity';
import { ReviewHelpfulVote } from '../modules/reviews/entities/review-helpful-vote.entity';
import { ReviewReport } from '../modules/reviews/entities/review-report.entity';
import { ProductQuestion } from '../modules/questions/entities/product-question.entity';
import { ProductAnswer } from '../modules/questions/entities/product-answer.entity';
import { Supplier } from '../modules/inventory-plus/entities/supplier.entity';
import { PurchaseOrder } from '../modules/inventory-plus/entities/purchase-order.entity';
import { PurchaseOrderItem } from '../modules/inventory-plus/entities/purchase-order-item.entity';
import { GoodsReceipt } from '../modules/inventory-plus/entities/goods-receipt.entity';
import { GoodsReceiptItem } from '../modules/inventory-plus/entities/goods-receipt-item.entity';
import { StockAdjustment } from '../modules/inventory-plus/entities/stock-adjustment.entity';
import { StockAlert } from '../modules/inventory-plus/entities/stock-alert.entity';
import { InventoryAudit } from '../modules/inventory-plus/entities/inventory-audit.entity';

dotenv.config();

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST ?? 'localhost',
  port: parseInt(process.env.DB_PORT ?? '5432', 10),
  username: process.env.DB_USERNAME ?? 'postgres',
  password: process.env.DB_PASSWORD ?? 'postgres',
  database: process.env.DB_NAME ?? 'sport_ecommerce',
  entities: [
    User,
    UserSession,
    AdminUser,
    AdminSession,
    Role,
    Permission,
    OtpVerification,
    Brand,
    Category,
    SubCategory,
    Collection,
    Attribute,
    AttributeValue,
    ProductTag,
    ProductTagMapping,
    ProductCollection,
    Product,
    ProductImage,
    ProductVariant,
    ProductVariantAttribute,
    Inventory,
    Cart,
    CartItem,
    Order,
    OrderItem,
    PaymentMethod,
    Payment,
    PaymentRefund,
    PaymentLog,
    PaymentWebhook,
    Address,
    Warehouse,
    DeliverySetting,
    Shipment,
    ShipmentTrackingLog,
    Coupon,
    CouponUsage,
    Promotion,
    PromotionProduct,
    PromotionCategory,
    Campaign,
    Wishlist,
    WishlistItem,
    Review,
    ReviewImage,
    ReviewHelpfulVote,
    ReviewReport,
    ProductQuestion,
    ProductAnswer,
    Supplier,
    PurchaseOrder,
    PurchaseOrderItem,
    GoodsReceipt,
    GoodsReceiptItem,
    StockAdjustment,
    StockAlert,
    InventoryAudit,
  ],
  migrations: ['src/database/migrations/*.ts'],
  synchronize: false,
  logging: true,
});
