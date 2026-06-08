import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength } from 'class-validator';

export class CancelOrderDto {
  @ApiPropertyOptional({ example: 'Customer requested cancellation.' })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  reason?: string;
}
