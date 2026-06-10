import { IsString, IsEnum, IsNumber, IsBoolean, IsOptional, Min, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { CampaignType } from '../enums/campaign-type.enum';

export class CreateCampaignDto {
  @ApiProperty({ example: 'Summer Sale 2026' })
  @IsString()
  @MaxLength(200)
  name: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description: string;

  @ApiProperty({ enum: CampaignType, example: CampaignType.SUMMER_SALE })
  @IsEnum(CampaignType)
  type: CampaignType;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(500)
  bannerUrl: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(500)
  landingPageUrl: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(0)
  discountValue: number;

  @ApiProperty({ example: '2026-06-10T00:00:00Z' })
  @IsString()
  startDate: string;

  @ApiProperty({ example: '2026-07-10T00:00:00Z' })
  @IsString()
  endDate: string;

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  isActive: boolean;

  @ApiPropertyOptional({ default: 0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  priority: number;
}
