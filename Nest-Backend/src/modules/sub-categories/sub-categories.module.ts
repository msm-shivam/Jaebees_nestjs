import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SubCategory } from './entities/sub-category.entity';
import { SubCategoriesService } from './sub-categories.service';
import { SubCategoriesController } from './sub-categories.controller';
import { CategoriesModule } from '../categories/categories.module';
import { SecurityComplianceModule } from '../security-compliance/security-compliance.module';

@Module({
  imports: [TypeOrmModule.forFeature([SubCategory]), CategoriesModule,SecurityComplianceModule],
  controllers: [SubCategoriesController],
  providers: [SubCategoriesService],
  exports: [SubCategoriesService],
})
export class SubCategoriesModule {}
