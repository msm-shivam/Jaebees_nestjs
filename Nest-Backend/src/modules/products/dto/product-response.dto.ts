import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ProductStatus } from '../entities/product.entity';

export class ProductResponseDto {
  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
  id: string;

  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
  brandId: string;

  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
  categoryId: string;

  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
  subCategoryId: string;

  @ApiProperty({ example: 'Nike Air Zoom Pegasus 41' })
  name: string;

  @ApiProperty({ example: 'nike-air-zoom-pegasus-41' })
  slug: string;

  @ApiPropertyOptional({ example: 'NIKE-PEGASUS-41' })
  skuPrefix?: string;

  @ApiPropertyOptional({ example: 'Lightweight and responsive running shoe' })
  shortDescription?: string;

  @ApiPropertyOptional({
    example:
      'The Nike Air Zoom Pegasus 41 is a versatile running shoe that provides a smooth, responsive ride for everyday running.',
  })
  description?: string;

  @ApiProperty({
    enum: ProductStatus,
    example: ProductStatus.ACTIVE,
    description: 'Product status: DRAFT, ACTIVE, INACTIVE, ARCHIVED',
  })
  status: ProductStatus;

  @ApiPropertyOptional({
    example: 'Nike Air Zoom Pegasus 41 - Lightweight Running Shoe',
  })
  metaTitle?: string;

  @ApiPropertyOptional({
    example: 'Fast and responsive running shoe for all distances',
  })
  metaDescription?: string;

  @ApiPropertyOptional({ example: 'running shoes, lightweight, responsive' })
  metaKeywords?: string;

  @ApiProperty({
    example: false,
    description: 'Whether the product is featured',
  })
  isFeatured: boolean;

  @ApiProperty({ example: true, description: 'Whether the product is active' })
  isActive: boolean;

  @ApiProperty({ example: '2024-01-15T10:30:00Z' })
  createdAt: Date;

  @ApiProperty({ example: '2024-01-15T10:30:00Z' })
  updatedAt: Date;

  @ApiPropertyOptional({ example: '2024-02-01T10:30:00Z' })
  deletedAt?: Date;
}
