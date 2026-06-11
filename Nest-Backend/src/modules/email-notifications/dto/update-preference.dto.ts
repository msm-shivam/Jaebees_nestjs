import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsOptional } from 'class-validator';

export class UpdatePreferenceDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  marketingEmailsEnabled?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  transactionalEmailsEnabled?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  orderUpdates?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  promotionsAndOffers?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  productRecommendations?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  newsletter?: boolean;
}
