import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsBoolean,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  Matches,
  MaxLength,
} from 'class-validator';

export class CreateBrandDto {
  @ApiProperty({ example: 'Nike' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(150)
  name: string;

  @ApiPropertyOptional({
    example: 'nike',
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

  @ApiPropertyOptional({ example: 'Just Do It' })
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  description?: string;

  @ApiPropertyOptional({
    example: ['96a36a37-7be7-44b3-9cb2-d318e3d196f4'],
    description: 'Category IDs to link this brand to',
  })
  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  @IsNotEmpty({ each: true })
  categoryIds?: string[];
}
