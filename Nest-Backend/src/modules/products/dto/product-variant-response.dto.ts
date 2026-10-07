import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { VariantStatus } from '../../product-variants/entities/product-variant.entity';

export class ProductVariantResponseDto {
  @Expose()
  @ApiProperty()
  id: string;

  @Expose()
  @ApiProperty()
  productId: string;

  @Expose()
  @ApiProperty()
  sku: string;

  @Expose()
  @ApiPropertyOptional()
  barcode: string | null;

  @Expose()
  @ApiProperty()
  price: number;

  @Expose()
  @ApiPropertyOptional()
  compareAtPrice: number | null;

  @Expose()
  @ApiPropertyOptional()
  costPrice: number | null;

  @Expose()
  @ApiPropertyOptional()
  weight: number | null;

  @Expose()
  @ApiProperty({ enum: VariantStatus })
  status: VariantStatus;

  @Expose()
  @ApiProperty()
  isDefault: boolean;

  @Expose()
  @ApiPropertyOptional({ example: 10, description: 'Available quantity in stock' })
  availableQuantity?: number | null;

  @Expose()
  @ApiPropertyOptional({ example: 10, description: 'Total quantity in stock' })
  stockQuantity?: number | null;

  @Expose()
  @ApiPropertyOptional({ example: false, description: 'Whether this variant is out of stock' })
  isOutOfStock?: boolean;

  @Expose()
  @ApiPropertyOptional({ example: true, description: 'Whether this variant is in stock' })
  inStock?: boolean;

  @Expose()
  @ApiProperty()
  createdAt: Date;

  @Expose()
  @ApiProperty()
  updatedAt: Date;
}
