import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductsModule } from '../products/products.module';
import { CategoriesModule } from '../categories/categories.module';
import { BrandsModule } from '../brands/brands.module';
import { ReviewsModule } from '../reviews/reviews.module';
import { InventoryModule } from '../inventory/inventory.module';
import { CatalogService } from './catalog.service';
import { AdminCatalogController } from './admin-catalog.controller';
import { SecurityComplianceModule } from '../security-compliance/security-compliance.module';

@Module({
  imports: [
    ProductsModule,
    CategoriesModule,
    BrandsModule,
    ReviewsModule,
    InventoryModule,
    SecurityComplianceModule,
  ],
  controllers: [AdminCatalogController],
  providers: [CatalogService],
  exports: [CatalogService],
})
export class CatalogModule {}
