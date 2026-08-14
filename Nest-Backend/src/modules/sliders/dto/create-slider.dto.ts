import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateSliderDto {
  @ApiPropertyOptional({ description: 'Slider description' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  title?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  subtitle?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  buttonText?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  buttonLink?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      try {
        return JSON.parse(value);
      } catch {
        return [value];
      }
    }
    return value;
  })
  images?: any;

  @ApiPropertyOptional()
  @IsOptional()
  newImages?: any;

  @ApiPropertyOptional()
  @IsOptional()
  keptUrls?: any;

  @ApiPropertyOptional()
  @IsOptional()
  keptInitialUrls?: any;
}
