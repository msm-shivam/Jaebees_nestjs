import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsNumber, IsOptional, IsString, IsUUID, IsBoolean, Min, Max } from 'class-validator';
import { VariantStatus } from '../entities/product-variant.entity';

export class CreateProductVariantDto {
  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
  @IsUUID()
  productId: string;

  @ApiProperty({ example: 'NIKE-PEGASUS-41-BLK-10', description: 'Stock Keeping Unit - must be unique' })
  @IsString()
  sku: string;

  @ApiPropertyOptional({ example: '1234567890123', description: 'Barcode/UPC' })
  @IsOptional()
  @IsString()
  barcode?: string;

  @ApiProperty({ example: 129.99, description: 'Selling price' })
  @IsNumber()
  @Min(0)
  price: number;

  @ApiPropertyOptional({ example: 149.99, description: 'Original price for comparison/discount display' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  compareAtPrice?: number;

  @ApiPropertyOptional({ example: 89.99, description: 'Cost price for profit calculation' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  costPrice?: number;

  @ApiPropertyOptional({ example: 0.85, description: 'Weight in kg' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  weight?: number;

  @ApiProperty({ enum: VariantStatus, example: VariantStatus.ACTIVE, description: 'Variant status' })
  @IsEnum(VariantStatus)
  status: VariantStatus;

  @ApiPropertyOptional({ example: false, description: 'Whether this is the default variant for the product' })
  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;

  @ApiPropertyOptional({
    example: [
      { attributeId: 'attr-uuid-1', attributeValueId: 'value-uuid-1' },
      { attributeId: 'attr-uuid-2', attributeValueId: 'value-uuid-2' },
    ],
    description: 'Attribute mappings for this variant (e.g., Color: Black, Size: 10)',
  })
  @IsOptional()
  attributes?: Array<{ attributeId: string; attributeValueId: string }>;
}
