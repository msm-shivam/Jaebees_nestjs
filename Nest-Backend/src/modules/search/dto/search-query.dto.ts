import {
  IsOptional,
  IsString,
  IsUUID,
  IsNumber,
  Min,
  Max,
  IsBoolean,
  IsEnum,
  IsArray,
  IsDateString,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type, Transform } from 'class-transformer';

export enum SortOption {
  RELEVANCE = 'relevance',
  NEWEST = 'newest',
  PRICE_ASC = 'price_asc',
  PRICE_DESC = 'price_desc',
  BEST_SELLING = 'best_selling',
  HIGHEST_RATED = 'highest_rated',
  MOST_VIEWED = 'most_viewed',
  DISCOUNT_DESC = 'discount_desc',
  NAME_ASC = 'name_asc',
  NAME_DESC = 'name_desc',
}

export enum AvailabilityOption {
  IN_STOCK = 'IN_STOCK',
  OUT_OF_STOCK = 'OUT_OF_STOCK',
  PREORDER = 'PREORDER',
}

export class SearchQueryDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  q?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID('4', { each: true })
  @IsArray()
  @Transform(({ value }) =>
    typeof value === 'string' ? value.split(',') : value,
  )
  categoryIds?: string[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID('4', { each: true })
  @IsArray()
  @Transform(({ value }) =>
    typeof value === 'string' ? value.split(',') : value,
  )
  brandIds?: string[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID('4', { each: true })
  @IsArray()
  @Transform(({ value }) =>
    typeof value === 'string' ? value.split(',') : value,
  )
  collectionIds?: string[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID('4', { each: true })
  @IsArray()
  @Transform(({ value }) =>
    typeof value === 'string' ? value.split(',') : value,
  )
  attributeValueIds?: string[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsString({ each: true })
  @IsArray()
  @Transform(({ value }) =>
    typeof value === 'string' ? value.split(',') : value,
  )
  sizes?: string[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsString({ each: true })
  @IsArray()
  @Transform(({ value }) =>
    typeof value === 'string' ? value.split(',') : value,
  )
  colors?: string[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsString({ each: true })
  @IsArray()
  @Transform(({ value }) =>
    typeof value === 'string' ? value.split(',') : value,
  )
  materials?: string[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsString({ each: true })
  @IsArray()
  @Transform(({ value }) =>
    typeof value === 'string' ? value.split(',') : value,
  )
  genders?: string[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsString({ each: true })
  @IsArray()
  @Transform(({ value }) =>
    typeof value === 'string' ? value.split(',') : value,
  )
  sports?: string[];

  @ApiPropertyOptional({
    description:
      'Comma-separated price bucket labels (e.g. 0-500,500-1000,1000-2000,2000+)',
  })
  @IsOptional()
  @IsString({ each: true })
  @IsArray()
  @Transform(({ value }) =>
    typeof value === 'string' ? value.split(',') : value,
  )
  priceBuckets?: string[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsEnum(AvailabilityOption)
  availability?: AvailabilityOption;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString({ each: true })
  @IsArray()
  @Transform(({ value }) =>
    typeof value === 'string' ? value.split(',') : value,
  )
  tags?: string[];

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  minPrice?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  maxPrice?: number;

  @ApiPropertyOptional({ description: 'Minimum rating filter (0-5)' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @Max(5)
  minRating?: number;

  @ApiPropertyOptional({ description: 'Maximum rating filter (0-5)' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @Max(5)
  maxRating?: number;

  @ApiPropertyOptional({ description: 'Minimum discount percentage (0-100)' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @Max(100)
  minDiscount?: number;

  @ApiPropertyOptional({ description: 'Maximum discount percentage (0-100)' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @Max(100)
  maxDiscount?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true' || value === true)
  inStock?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true' || value === true)
  hasReview?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true' || value === true)
  isFeatured?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true' || value === true)
  isNewArrival?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true' || value === true)
  isBestSeller?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true' || value === true)
  onSale?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  createdAfter?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  createdBefore?: string;

  @ApiPropertyOptional({ description: 'Future marketplace support' })
  @IsOptional()
  @IsUUID('4', { each: true })
  @IsArray()
  @Transform(({ value }) =>
    typeof value === 'string' ? value.split(',') : value,
  )
  sellerIds?: string[];

  @ApiPropertyOptional({ description: 'Future inventory-aware search' })
  @IsOptional()
  @IsUUID('4', { each: true })
  @IsArray()
  @Transform(({ value }) =>
    typeof value === 'string' ? value.split(',') : value,
  )
  warehouseIds?: string[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsString({ each: true })
  @IsArray()
  @Transform(({ value }) =>
    typeof value === 'string' ? value.split(',') : value,
  )
  countryOfOrigin?: string[];

  @ApiPropertyOptional({ enum: SortOption, default: SortOption.RELEVANCE })
  @IsOptional()
  @IsEnum(SortOption)
  sort?: SortOption;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  page?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(100)
  limit?: number;
}
