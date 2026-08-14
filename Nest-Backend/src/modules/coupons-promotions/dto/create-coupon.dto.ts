import {
  IsString,
  IsEnum,
  IsNumber,
  IsBoolean,
  IsOptional,
  IsArray,
  ValidateNested,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { CouponType } from '../enums/coupon-type.enum';
import { CouponStatus } from '../entities/coupon.entity';
import { CouponRuleType, CouponTargetType } from '../entities/coupon-rule.entity';

export class CreateCouponRuleDto {
  @ApiProperty({ enum: CouponRuleType, example: CouponRuleType.INCLUSION })
  @IsEnum(CouponRuleType)
  ruleType: CouponRuleType;

  @ApiProperty({ enum: CouponTargetType, example: CouponTargetType.CATEGORY })
  @IsEnum(CouponTargetType)
  targetType: CouponTargetType;

  @ApiPropertyOptional({ example: 'cat-uuid-123' })
  @IsOptional()
  @IsString()
  targetId?: string;
}

export class CreateCouponDto {
  @ApiProperty({ example: 'SUMMER2026' })
  @IsString()
  code: string;

  @ApiPropertyOptional({ example: 'Summer Special 2026' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ example: 'Get 20% off selected categories' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ enum: CouponType, example: CouponType.PERCENTAGE })
  @IsEnum(CouponType)
  type: CouponType;

  @ApiProperty({ example: 20 })
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
  maxUses?: number;

  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @IsNumber()
  @Min(1)
  maxUsesPerUser?: number;

  @ApiPropertyOptional({ example: 50 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  minimumOrderAmount?: number;

  @ApiPropertyOptional({ example: 50 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  maximumDiscountAmount?: number;

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  firstOrderOnly?: boolean;

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional({ enum: CouponStatus, default: CouponStatus.ACTIVE })
  @IsOptional()
  @IsEnum(CouponStatus)
  status?: CouponStatus;

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  isStackable?: boolean;

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  autoApply?: boolean;

  @ApiPropertyOptional({ example: 0 })
  @IsOptional()
  @IsNumber()
  priority?: number;

  @ApiPropertyOptional({ example: 'Internal launch for summer campaign' })
  @IsOptional()
  @IsString()
  adminNotes?: string;

  @ApiPropertyOptional({ type: [CreateCouponRuleDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateCouponRuleDto)
  rules?: CreateCouponRuleDto[];
}

