import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Attribute } from './entities/attribute.entity';
import { AttributeValue } from '../attribute-values/entities/attribute-value.entity';
import { AttributesService } from './attributes.service';
import { AttributesController } from './attributes.controller';
import { SecurityComplianceModule } from '../security-compliance/security-compliance.module';

@Module({
  imports: [TypeOrmModule.forFeature([Attribute, AttributeValue]),SecurityComplianceModule],
  controllers: [AttributesController],
  providers: [AttributesService],
  exports: [AttributesService],
})
export class AttributesModule {}
