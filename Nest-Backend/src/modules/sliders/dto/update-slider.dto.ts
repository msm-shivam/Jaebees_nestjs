import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsOptional, IsString } from 'class-validator';
import { Transform } from 'class-transformer';

export class UpdateSliderDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({
    description: 'JSON array of image URLs to keep (e.g. ["/uploads/sliders/abc.jpg"]). Send [] to clear all images.',
  })
  @IsOptional()
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      try { return JSON.parse(value); } catch { return undefined; }
    }
    return value;
  })
  @IsArray()
  @IsString({ each: true })
  images?: string[];
}
