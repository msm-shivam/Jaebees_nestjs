import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class UpdateProfileDto {
  @ApiPropertyOptional({ example: 'John' })
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  firstName?: string;

  @ApiPropertyOptional({ example: 'Doe' })
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  lastName?: string;

  @ApiPropertyOptional({ example: '+1234567890' })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  mobile?: string;
}
