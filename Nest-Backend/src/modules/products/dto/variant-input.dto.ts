import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNumber, IsOptional, IsBoolean, Min, IsArray } from 'class-validator';
import { Type } from 'class-transformer';

class AttributeMapping {
  @ApiProperty({ example: 'attr-uuid-1' })
  @IsString()
  attributeId: string;

  @ApiProperty({ example: 'value-uuid-1' })
  @IsString()
  attributeValueId: string;
}

export class VariantInputDto {
  @ApiProperty({ example: 'NIKE-SHIRT-BLK-M' })
  @IsString()
  sku: string;

  @ApiProperty({ example: 129.99 })
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  price: number;

  @ApiPropertyOptional({ example: 149.99 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  compareAtPrice?: number;

  @ApiPropertyOptional({ example: 89.99 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  costPrice?: number;

  @ApiPropertyOptional({ example: false })
  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;

  @ApiPropertyOptional({ example: [{ attributeId: 'attr-uuid-1', attributeValueId: 'value-uuid-1' }] })
  @IsOptional()
  @IsArray()
  @Type(() => AttributeMapping)
  attributes?: AttributeMapping[];
}
