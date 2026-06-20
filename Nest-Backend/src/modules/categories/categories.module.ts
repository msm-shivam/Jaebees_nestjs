import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Category } from './entities/category.entity';
import { Brand } from '../brands/entities/brand.entity';
import { CategoriesService } from './categories.service';
import { CategoriesController } from './categories.controller';
import { SecurityComplianceModule } from '../security-compliance/security-compliance.module';

@Module({
  imports: [TypeOrmModule.forFeature([Category, Brand]) , SecurityComplianceModule],
  controllers: [CategoriesController],
  providers: [CategoriesService],
  exports: [CategoriesService],
})
export class CategoriesModule {}
