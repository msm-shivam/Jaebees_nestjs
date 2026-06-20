import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Attribute } from './entities/attribute.entity';
import { AttributesService } from './attributes.service';
import { AttributesController } from './attributes.controller';
import { SecurityComplianceModule } from '../security-compliance/security-compliance.module';

@Module({
  imports: [TypeOrmModule.forFeature([Attribute]),SecurityComplianceModule],
  controllers: [AttributesController],
  providers: [AttributesService],
  exports: [AttributesService],
})
export class AttributesModule {}
