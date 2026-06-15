import {
  IsString,
  IsEnum,
  IsNumber,
  IsBoolean,
  IsOptional,
  Min,
  Max,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { CouponType } from '../enums/coupon-type.enum';

export class CreateCouponDto {
  @ApiProperty({ example: 'SUMMER10' })
  @IsString()
  code: string;

  @ApiProperty({ enum: CouponType, example: CouponType.PERCENTAGE })
  @IsEnum(CouponType)
  type: CouponType;

  @ApiProperty({ example: 10 })
  @IsNumber()
  @Min(0)
  value: number;

  @ApiProperty({ example: '2026-06-10T00:00:00Z' })
  @IsString()
  startDate: string;

  @ApiProperty({ example: '2026-07-10T00:00:00Z' })
  @IsString()
  endDate: string;

  @ApiPropertyOptional({ example: 100 })
  @IsOptional()
  @IsNumber()
  @Min(1)
  maxUses: number;

  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @IsNumber()
  @Min(1)
  maxUsesPerUser: number;

  @ApiPropertyOptional({ example: 500 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  minimumOrderAmount: number;

  @ApiPropertyOptional({ example: 50 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  maximumDiscountAmount: number;

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  firstOrderOnly: boolean;

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  isActive: boolean;

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  isStackable: boolean;
}
