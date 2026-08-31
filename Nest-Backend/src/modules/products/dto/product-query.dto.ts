import { Transform, Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Min,
} from 'class-validator';
import { ProductStatus } from '../entities/product.entity';

export class ProductQueryDto {
  @ApiPropertyOptional({ example: 1, default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ example: 20, default: 20 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number = 20;

  @ApiPropertyOptional({
    example: 'Nike Air Zoom',
    description: 'Search in product name and description',
  })
  @IsOptional()
  @IsString()
  @Transform(({ value }: { value: string }) => value || undefined)
  search?: string;

  @ApiPropertyOptional({ enum: ProductStatus, example: ProductStatus.ACTIVE })
  @IsOptional()
  @IsEnum(ProductStatus)
  @Transform(({ value }: { value: string }) => value || undefined)
  status?: ProductStatus;

  @ApiPropertyOptional({
    example: '123e4567-e89b-12d3-a456-426614174000',
    description: 'Filter by brand ID',
  })
  @IsOptional()
  @IsUUID()
  @Transform(({ value }: { value: string }) => value || undefined)
  brandId?: string;

  @ApiPropertyOptional({
    example: '123e4567-e89b-12d3-a456-426614174000',
    description: 'Filter by category ID',
  })
  @IsOptional()
  @IsUUID()
  @Transform(({ value }: { value: string }) => value || undefined)
  categoryId?: string;

  @ApiPropertyOptional({
    example: '123e4567-e89b-12d3-a456-426614174000',
    description: 'Filter by sub-category ID',
  })
  @IsOptional()
  @IsUUID()
  @Transform(({ value }: { value: string }) => value || undefined)
  subCategoryId?: string;

  @ApiPropertyOptional({
    example: '123e4567-e89b-12d3-a456-426614174000',
    description: 'Filter by collection ID',
  })
  @IsOptional()
  @IsUUID()
  @Transform(({ value }: { value: string }) => value || undefined)
  collectionId?: string;

  @ApiPropertyOptional({
    example: 'summer-collection',
    description: 'Filter by collection slug or ID',
  })
  @IsOptional()
  @IsString()
  @Transform(({ value }: { value: string }) => value || undefined)
  collectionSlug?: string;

  @ApiPropertyOptional({
    example: true,
    description: 'Filter featured products',
  })
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }: { value: string | undefined }) => {
    if (value === 'true') return true;
    if (value === 'false') return false;
    return undefined;
  })
  isFeatured?: boolean;

  @ApiPropertyOptional({ example: true, description: 'Filter active products' })
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }: { value: string | undefined }) => {
    if (value === 'true') return true;
    if (value === 'false') return false;
    return undefined;
  })
  isActive?: boolean;

  @ApiPropertyOptional({ example: 100, description: 'Minimum price filter (applied on variant price)' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  minPrice?: number;

  @ApiPropertyOptional({ example: 5000, description: 'Maximum price filter (applied on variant price)' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  maxPrice?: number;

  @ApiPropertyOptional({
    example: 'name',
    description: 'Sort field: name, createdAt, updatedAt',
  })
  @IsOptional()
  @IsString()
  sortBy?: string = 'name';

  @ApiPropertyOptional({
    example: 'DESC',
    description: 'Sort order: ASC or DESC',
  })
  @IsOptional()
  @IsString()
  sortOrder?: 'ASC' | 'DESC' = 'ASC';
}
