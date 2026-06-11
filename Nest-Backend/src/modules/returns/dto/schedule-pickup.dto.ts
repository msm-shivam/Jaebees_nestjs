import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsOptional, IsString } from 'class-validator';

export class SchedulePickupDto {
  @ApiProperty()
  @IsDateString()
  pickupDate: string;

  @ApiProperty()
  @IsString()
  courierName: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  notes?: string;
}
