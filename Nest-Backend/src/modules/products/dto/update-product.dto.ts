import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsEnum,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
} from 'class-validator';
import { ProductStatus } from '../entities/product.entity';

export class UpdateProductDto {
  @ApiPropertyOptional({ example: 'Nike Air Zoom Pegasus 41' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  name?: string;

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
}
