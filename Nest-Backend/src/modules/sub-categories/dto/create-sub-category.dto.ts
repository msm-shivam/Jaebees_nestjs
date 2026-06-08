import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Matches,
  MaxLength,
  Min,
} from 'class-validator';

export class CreateSubCategoryDto {
  @ApiProperty({ example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  @IsUUID('4')
  categoryId: string;

  @ApiProperty({ example: 'Running Shoes' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(150)
  name: string;

  @ApiPropertyOptional({
    example: 'running-shoes',
    description: 'Auto-generated from name if not provided',
  })
  @IsOptional()
  @IsString()
  @MaxLength(150)
  @Matches(/^[a-z0-9-]+$/, {
    message: 'Slug must be lowercase letters, numbers, and hyphens.',
  })
  slug?: string;

  @ApiPropertyOptional({
    example: 'https://cdn.sport.com/sub-categories/running.jpg',
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  image?: string;

  @ApiPropertyOptional({ example: 'High-performance running footwear' })
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  description?: string;

  @ApiPropertyOptional({ example: 0, default: 0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  sortOrder?: number;

  @ApiPropertyOptional({ example: true, default: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
