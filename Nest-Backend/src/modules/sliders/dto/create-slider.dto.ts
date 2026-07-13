import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class CreateSliderDto {
  @ApiPropertyOptional({ description: 'Slider description' })
  @IsOptional()
  @IsString()
  description?: string;
}
