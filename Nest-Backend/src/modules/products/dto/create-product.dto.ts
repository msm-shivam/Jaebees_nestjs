import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  ValidateNested,
} from 'class-validator';
import { ProductStatus } from '../entities/product.entity';
import { VariantInputDto } from './variant-input.dto';

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
    type: [String],
  })
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      try {
        const parsed = JSON.parse(value);
        return Array.isArray(parsed) ? parsed : [parsed];
      } catch {
        return [value];
      }
    }
    return value;
  })
  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  collectionIds?: string[];

  @ApiPropertyOptional({
    example: ['123e4567-e89b-12d3-a456-426614174000'],
    description: 'Product tag IDs to assign',
    type: [String],
  })
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      try {
        const parsed = JSON.parse(value);
        return Array.isArray(parsed) ? parsed : [parsed];
      } catch {
        return [value];
      }
    }
    return value;
  })
  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  tagIds?: string[];

  @ApiPropertyOptional({
    type: 'array',
    items: { type: 'string', format: 'binary' },
    description: 'Product images to upload (max 5)',
  })
  @IsOptional()
  images?: any[];

  @ApiPropertyOptional({
    example: 0,
    description: 'Index of the uploaded image to set as primary (default: 0)',
  })
  @Transform(({ value }: { value: unknown }) => {
    if (value === undefined || value === '') return undefined;
    const num = Number(value);
    return isNaN(num) ? undefined : num;
  })
  @IsOptional()
  primaryImageIndex?: number;

  @ApiPropertyOptional({
    example: [{ sku: 'NIKE-SHIRT-BLK-M', price: 129.99, attributes: [{ attributeId: '...', attributeValueId: '...' }] }],
    description: 'Variants to create with the product (send as JSON string in multipart form-data)',
    type: [VariantInputDto],
  })
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      try { return JSON.parse(value); } catch { return []; }
    }
    return value;
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => VariantInputDto)
  variants?: VariantInputDto[];
}
