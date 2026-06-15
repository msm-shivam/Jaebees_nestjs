import {
  IsString,
  IsEnum,
  IsNumber,
  IsBoolean,
  IsOptional,
  IsArray,
  Min,
  IsUUID,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PromotionType } from '../enums/promotion-type.enum';

export class CreatePromotionDto {
  @ApiProperty({ example: 'Summer Sale 2026' })
  @IsString()
  name: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description: string;

  @ApiProperty({ enum: PromotionType, example: PromotionType.PRODUCT_DISCOUNT })
  @IsEnum(PromotionType)
  type: PromotionType;

  @ApiProperty({ example: 20 })
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

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  isStackable: boolean;

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  autoApply: boolean;

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  productIds: string[];

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  categoryIds: string[];
}
