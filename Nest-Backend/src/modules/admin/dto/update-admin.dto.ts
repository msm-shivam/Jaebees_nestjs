import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsEmail,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class UpdateAdminDto {
  @ApiPropertyOptional({ example: 'Jane Admin' })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  name?: string;

  @ApiPropertyOptional({ example: 'jane.admin@sport.com' })
  @IsOptional()
  @IsEmail()
  @MaxLength(255)
  email?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
