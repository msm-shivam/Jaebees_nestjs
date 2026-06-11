import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class RejectReturnDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  reason?: string;
}
