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
  ],
  migrations: ['src/database/migrations/*.ts'],
  synchronize: false,
  logging: true,
});
