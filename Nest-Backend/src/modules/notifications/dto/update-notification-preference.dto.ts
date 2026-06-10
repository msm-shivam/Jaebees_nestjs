import { IsBoolean, IsOptional } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateNotificationPreferenceDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  orderEmails?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  paymentEmails?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  shipmentEmails?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  promotionalEmails?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  reviewEmails?: boolean;
}
