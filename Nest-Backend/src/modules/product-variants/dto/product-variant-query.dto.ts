import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsInt, IsOptional, IsString, IsUUID, Min } from 'class-validator';
import { VariantStatus } from '../entities/product-variant.entity';

export class ProductVariantQueryDto {
  @ApiPropertyOptional({ example: 1, default: 1 })
  @IsOptional()
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ example: 20, default: 20 })
  @IsOptional()
  @IsInt()
  @Min(1)
  limit?: number = 20;

  @ApiPropertyOptional({ example: '123e4567-e89b-12d3-a456-426614174000', description: 'Filter by product ID' })
  @IsOptional()
  @IsUUID()
  productId?: string;

  @ApiPropertyOptional({ enum: VariantStatus, example: VariantStatus.ACTIVE })
  @IsOptional()
  @IsEnum(VariantStatus)
  status?: VariantStatus;

  @ApiPropertyOptional({ example: 'NIKE-PEGASUS', description: 'Search by SKU' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ example: 'price', description: 'Sort field: price, createdAt, updatedAt' })
  @IsOptional()
  @IsString()
  sortBy?: string = 'createdAt';

  @ApiPropertyOptional({ example: 'DESC', description: 'Sort order: ASC or DESC' })
  @IsOptional()
  @IsString()
  sortOrder?: 'ASC' | 'DESC' = 'DESC';
}
