import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';
import { ProductStatus } from '../entities/product.entity';
import { ProductImageResponseDto } from './product-image-response.dto';

export class ProductResponseDto {
  @Expose()
  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
  id: string;

  @Expose()
  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
  brandId: string;

  @Expose()
  @ApiProperty({ example: 'Nike' })
  brandName: string;

  @Expose()
  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
  categoryId: string;

  @Expose()
  @ApiProperty({ example: 'Running Shoes' })
  categoryName: string;

  @Expose()
  @ApiPropertyOptional({ example: '123e4567-e89b-12d3-a456-426614174000' })
  subCategoryId: string | null;

  @Expose()
  @ApiProperty({ example: 'Nike Air Zoom Pegasus 41' })
  name: string;

  @Expose()
  @ApiProperty({ example: 'nike-air-zoom-pegasus-41' })
  slug: string;

  @Expose()
  @ApiPropertyOptional({ example: 'NIKE-PEGASUS-41' })
  skuPrefix?: string;

  @Expose()
  @ApiPropertyOptional({ example: 'Lightweight and responsive running shoe' })
  shortDescription?: string;

  @Expose()
  @ApiPropertyOptional({
    example:
      'The Nike Air Zoom Pegasus 41 is a versatile running shoe that provides a smooth, responsive ride for everyday running.',
  })
  description?: string;

  @Expose()
  @ApiProperty({
    enum: ProductStatus,
    example: ProductStatus.ACTIVE,
    description: 'Product status: DRAFT, ACTIVE, INACTIVE, ARCHIVED',
  })
  status: ProductStatus;

  @Expose()
  @ApiPropertyOptional({
    example: 'Nike Air Zoom Pegasus 41 - Lightweight Running Shoe',
  })
  metaTitle?: string;

  @Expose()
  @ApiPropertyOptional({
    example: 'Fast and responsive running shoe for all distances',
  })
  metaDescription?: string;

  @Expose()
  @ApiPropertyOptional({ example: 'running shoes, lightweight, responsive' })
  metaKeywords?: string;

  @Expose()
  @ApiProperty({
    example: false,
    description: 'Whether the product is featured',
  })
  isFeatured: boolean;

  @Expose()
  @ApiProperty({ example: true, description: 'Whether the product is active' })
  isActive: boolean;

  @Expose()
  @ApiProperty({ type: [ProductImageResponseDto], description: 'Product images' })
  @Type(() => ProductImageResponseDto)
  images: ProductImageResponseDto[];

  @Expose()
  @ApiProperty({ example: '2024-01-15T10:30:00Z' })
  createdAt: Date;

  @Expose()
  @ApiProperty({ example: '2024-01-15T10:30:00Z' })
  updatedAt: Date;

  @Expose()
  @ApiPropertyOptional({ example: '2024-02-01T10:30:00Z' })
  deletedAt?: Date;
}
