import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateOrderDto {
  @ApiPropertyOptional({ example: 'Please deliver to the front desk.' })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  notes?: string;
}
