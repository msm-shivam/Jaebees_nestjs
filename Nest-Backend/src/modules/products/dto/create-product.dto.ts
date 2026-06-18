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

export class CreateProductDto {
  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
  @IsUUID()
  @IsNotEmpty()
  brandId: string;

  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
  @IsUUID()
  @IsNotEmpty()
  categoryId: string;

  @ApiPropertyOptional({ example: '123e4567-e89b-12d3-a456-426614174000' })
  @IsOptional()
  @IsUUID()
  @Transform(({ value }: { value: unknown }) =>
    value === '' ? undefined : value,
  )
  subCategoryId?: string;

  @ApiProperty({ example: 'Nike Air Zoom Pegasus 41' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  name: string;

  @ApiPropertyOptional({
    example: 'nike-air-zoom-pegasus-41',
    description: 'Auto-generated from name if not provided',
  })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  slug?: string;

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

  @ApiProperty({
    enum: ProductStatus,
    example: ProductStatus.DRAFT,
    description: 'Product status: DRAFT, ACTIVE, INACTIVE, ARCHIVED',
  })
  @IsEnum(ProductStatus)
  @IsNotEmpty()
  status: ProductStatus;

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

  @ApiPropertyOptional({ example: false, default: false })
  @IsOptional()
  @IsBoolean()
  isFeatured?: boolean;

  @ApiPropertyOptional({ example: true, default: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional({
    example: ['123e4567-e89b-12d3-a456-426614174000'],
    description: 'Collection IDs to assign',
  })
  @IsOptional()
  collectionIds?: string[];

  @ApiPropertyOptional({
    example: ['123e4567-e89b-12d3-a456-426614174000'],
    description: 'Product tag IDs to assign',
  })
  @IsOptional()
  tagIds?: string[];

  @ApiPropertyOptional({
    type: 'array',
    items: { type: 'string', format: 'binary' },
    description: 'Product images to upload (max 5)',
  })
  @IsOptional()
  images?: any[];
}
