import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsBoolean,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
} from 'class-validator';
import { ProductStatus } from '../entities/product.entity';

export class UpdateProductDto {
  @ApiPropertyOptional({ example: '20000001-0000-4000-8000-000000000002' })
  @IsOptional()
  @IsUUID()
  @IsNotEmpty()
  brandId?: string;

  @ApiPropertyOptional({ example: '96a36a37-7be7-44b3-9cb2-d318e3d196f4' })
  @IsOptional()
  @IsUUID()
  @IsNotEmpty()
  categoryId?: string;

  @ApiPropertyOptional({ example: '123e4567-e89b-12d3-a456-426614174000' })
  @IsOptional()
  @IsUUID()
  @Transform(({ value }: { value: unknown }) =>
    value === '' ? undefined : value,
  )
  subCategoryId?: string;

  @ApiPropertyOptional({
    example: 'nike-air-zoom-pegasus-41',
    description: 'Auto-generated from name if not provided',
  })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  slug?: string;

  @ApiPropertyOptional({ example: 'Nike Air Zoom Pegasus 41' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  name?: string;

  @ApiPropertyOptional({
    example: ['123e4567-e89b-12d3-a456-426614174000'],
    description: 'Collection IDs to assign (replaces existing)',
  })
  @IsOptional()
  collectionIds?: string[];

  @ApiPropertyOptional({
    example: ['123e4567-e89b-12d3-a456-426614174000'],
    description: 'Product tag IDs to assign (replaces existing)',
  })
  @IsOptional()
  tagIds?: string[];

  @ApiPropertyOptional({ example: 'NIKE-PEGASUS-41' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  skuPrefix?: string;

  @ApiPropertyOptional({ example: 'Lightweight and responsive running shoe' })
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  shortDescription?: string;

  @ApiPropertyOptional({
    example:
      'The Nike Air Zoom Pegasus 41 is a versatile running shoe that provides a smooth, responsive ride for everyday running.',
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({
    enum: ProductStatus,
    example: ProductStatus.ACTIVE,
    description: 'Product status: DRAFT, ACTIVE, INACTIVE, ARCHIVED',
  })
  @IsOptional()
  @IsEnum(ProductStatus)
  status?: ProductStatus;

  @ApiPropertyOptional({
    example: 'Nike Air Zoom Pegasus 41 - Lightweight Running Shoe',
  })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  metaTitle?: string;

  @ApiPropertyOptional({
    example: 'Fast and responsive running shoe for all distances',
  })
  @IsOptional()
  @IsString()
  metaDescription?: string;

  @ApiPropertyOptional({ example: 'running shoes, lightweight, responsive' })
  @IsOptional()
  @IsString()
  metaKeywords?: string;

  @ApiPropertyOptional({ example: false })
  @IsOptional()
  @IsBoolean()
  isFeatured?: boolean;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional({
    type: 'array',
    items: { type: 'string', format: 'binary' },
    description: 'Product images to upload (max 5, adds to existing images)',
  })
  @IsOptional()
  images?: any[];
}
