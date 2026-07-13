import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class UpdateSliderDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;
}
