import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Brand } from './entities/brand.entity';
import { Category } from '../categories/entities/category.entity';
import { BrandsService } from './brands.service';
import { BrandsController } from './brands.controller';
import { SecurityComplianceModule } from '../security-compliance/security-compliance.module';

@Module({
  imports: [TypeOrmModule.forFeature([Brand, Category]),SecurityComplianceModule],
  controllers: [BrandsController],
  providers: [BrandsService],
  exports: [BrandsService],
})
export class BrandsModule {}
