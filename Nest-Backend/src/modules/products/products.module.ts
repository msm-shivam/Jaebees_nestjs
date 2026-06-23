import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Product } from './entities/product.entity';
import { ProductImage } from './entities/product-image.entity';
import { Brand } from '../brands/entities/brand.entity';
import { Category } from '../categories/entities/category.entity';
import { SubCategory } from '../sub-categories/entities/sub-category.entity';
import { ProductCollection } from '../collections/entities/product-collection.entity';
import { ProductTagMapping } from '../product-tags/entities/product-tag-mapping.entity';
import { ProductVariant } from '../product-variants/entities/product-variant.entity';
import { ProductVariantAttribute } from '../product-variants/entities/product-variant-attribute.entity';
import { ProductsService } from './products.service';
import { ProductsController } from './products.controller';
import { SecurityComplianceModule } from '../security-compliance/security-compliance.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Product,
      ProductImage,
      Brand,
      Category,
      SubCategory,
      ProductCollection,
      ProductTagMapping,
      ProductVariant,
      ProductVariantAttribute,
    ]),
    SecurityComplianceModule
  ],
  controllers: [ProductsController],
  providers: [ProductsService],
  exports: [ProductsService],
})
export class ProductsModule {}
