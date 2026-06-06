import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductVariant } from './entities/product-variant.entity';
import { ProductVariantAttribute } from './entities/product-variant-attribute.entity';
import { ProductVariantsService } from './product-variants.service';
import { ProductVariantsController } from './product-variants.controller';
import { Product } from '../products/entities/product.entity';
import { Attribute } from '../attributes/entities/attribute.entity';
import { AttributeValue } from '../attribute-values/entities/attribute-value.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ProductVariant,
      ProductVariantAttribute,
      Product,
      Attribute,
      AttributeValue,
    ]),
  ],
  controllers: [ProductVariantsController],
  providers: [ProductVariantsService],
  exports: [ProductVariantsService],
})
export class ProductVariantsModule {}
