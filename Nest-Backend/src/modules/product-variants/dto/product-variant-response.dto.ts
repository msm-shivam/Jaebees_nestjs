import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { VariantStatus } from '../entities/product-variant.entity';

export class ProductVariantResponseDto {
  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
  id: string;

  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
  productId: string;

  @ApiProperty({ example: 'NIKE-PEGASUS-41-BLK-10' })
  sku: string;

  @ApiPropertyOptional({ example: '1234567890123' })
  barcode?: string;

  @ApiProperty({ example: 129.99 })
  price: number;

  @ApiPropertyOptional({ example: 149.99 })
  compareAtPrice?: number;

  @ApiPropertyOptional({ example: 89.99 })
  costPrice?: number;

  @ApiPropertyOptional({ example: 0.85 })
  weight?: number;

  @ApiProperty({ enum: VariantStatus, example: VariantStatus.ACTIVE })
  status: VariantStatus;

  @ApiProperty({ example: false })
  isDefault: boolean;

  @ApiProperty({ example: '2024-01-15T10:30:00Z' })
  createdAt: Date;

  @ApiProperty({ example: '2024-01-15T10:30:00Z' })
  updatedAt: Date;

  @ApiPropertyOptional({ example: '2024-02-01T10:30:00Z' })
  deletedAt?: Date;
}
