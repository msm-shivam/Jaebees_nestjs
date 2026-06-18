import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  Matches,
  MaxLength,
} from 'class-validator';

export class CreateCategoryDto {
  @ApiProperty({ example: 'Shoes' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(150)
  name: string;

  @ApiPropertyOptional({
    example: 'shoes',
    description: 'Auto-generated from name if not provided',
  })
  @IsOptional()
  @IsString()
  @MaxLength(150)
  @Matches(/^[a-z0-9-]+$/, {
    message: 'Slug must be lowercase letters, numbers, and hyphens.',
  })
  slug?: string;

  @IsOptional()
  @ApiPropertyOptional({
    type: 'string',
    format: 'binary',
  })
  image?: any;

  @ApiPropertyOptional({ example: 'Footwear for all sports' })
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  description?: string;

  @ApiPropertyOptional({
    example: ['20000001-0000-4000-8000-000000000002'],
    description: 'Brand IDs to link this category to',
  })
  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  @IsNotEmpty({ each: true })
  brandIds?: string[];
}
