import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  Max,
  Min,
  ArrayMaxSize,
} from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateAttributeDto {
  @ApiProperty({ example: 'Color' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(150)
  name: string;

  @ApiPropertyOptional({
    example: 'color',
    description: 'Auto-generated from name if not provided',
  })
  @IsOptional()
  @IsString()
  @MaxLength(150)
  @Matches(/^[a-z0-9-]+$/, {
    message: 'Slug must be lowercase letters, numbers, and hyphens.',
  })
  slug?: string;

  @ApiPropertyOptional({ example: true, default: false })
  @IsOptional()
  @IsBoolean()
  isFilterable?: boolean;

  @ApiPropertyOptional({ example: false, default: false })
  @IsOptional()
  @IsBoolean()
  isRequired?: boolean;

  @ApiPropertyOptional({ example: 0, default: 0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  sortOrder?: number;

  @ApiPropertyOptional({
    example: ['Red', 'Black', 'White'],
    description: 'Attribute values to create inline (max 10). Send as JSON string in multipart form-data.',
    maxLength: 10,
  })
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      try { return JSON.parse(value); } catch { return []; }
    }
    return value;
  })
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(10)
  @IsString({ each: true })
  @MaxLength(150, { each: true })
  @IsNotEmpty({ each: true })
  values?: string[];
}
