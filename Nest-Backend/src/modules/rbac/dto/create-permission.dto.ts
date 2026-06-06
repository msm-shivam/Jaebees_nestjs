import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsString,
  Matches,
  MaxLength,
} from 'class-validator';

export class CreatePermissionDto {
  @ApiProperty({ example: 'Create Product' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name: string;

  @ApiProperty({ example: 'product.create' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  @Matches(/^[a-z0-9_.]+$/, {
    message: 'Slug must be lowercase letters, numbers, dots, and underscores.',
  })
  slug: string;

  @ApiProperty({ example: 'product' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  module: string;
}
