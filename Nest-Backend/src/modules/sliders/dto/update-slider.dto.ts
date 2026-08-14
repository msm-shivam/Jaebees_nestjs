import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsOptional, IsString } from 'class-validator';
import { Transform } from 'class-transformer';

export class UpdateSliderDto {
  @ApiPropertyOptional()
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

  @ApiPropertyOptional({
    description:
      'JSON array of image URLs to keep (e.g. ["/uploads/sliders/abc.jpg"]). Send [] to clear all images.',
  })
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
  @IsArray()
  @IsString({ each: true })
  images?: string[];

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
