import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class ResendMobileOtpDto {
  @ApiPropertyOptional({ example: '+919876543210' })
  @IsOptional()
  @IsString()
  mobile?: string;

  @ApiPropertyOptional({ example: 'john.doe@example.com' })
  @IsOptional()
  @IsString()
  email?: string;
}
