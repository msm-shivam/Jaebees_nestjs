import { Module } from '@nestjs/common';
import { ProductsModule } from '../products/products.module';
import { CategoriesModule } from '../categories/categories.module';
import { CollectionsModule } from '../collections/collections.module';
import { SubCategoriesModule } from '../sub-categories/sub-categories.module';
import { PublicProductsController } from './controllers/public-products.controller';
import { PublicCategoriesController } from './controllers/public-categories.controller';
import { PublicCollectionsController } from './controllers/public-collections.controller';
import { PublicSubCategoriesController } from './controllers/public-sub-categories.controller';

@Module({
  imports: [
    ProductsModule,
    CategoriesModule,
    CollectionsModule,
    SubCategoriesModule,
  ],
  controllers: [
    PublicProductsController,
    PublicCategoriesController,
    PublicCollectionsController,
    PublicSubCategoriesController,
  ],
})
export class PublicCatalogModule {}
