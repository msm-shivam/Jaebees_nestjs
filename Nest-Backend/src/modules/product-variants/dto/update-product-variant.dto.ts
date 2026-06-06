import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsNumber, IsOptional, IsString, IsBoolean, Min } from 'class-validator';
import { VariantStatus } from '../entities/product-variant.entity';
import { PartialType } from '@nestjs/swagger';
import { CreateProductVariantDto } from './create-product-variant.dto';

export class UpdateProductVariantDto extends PartialType(CreateProductVariantDto) {
  @ApiPropertyOptional({ example: 'NIKE-PEGASUS-41-BLK-10-UPDATED' })
  @IsOptional()
  @IsString()
  sku?: string;

  @ApiPropertyOptional({ example: 119.99 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  price?: number;

  @ApiPropertyOptional({ example: VariantStatus.INACTIVE })
  @IsOptional()
  @IsEnum(VariantStatus)
  status?: VariantStatus;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;
}
