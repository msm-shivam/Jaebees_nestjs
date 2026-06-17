import { IsOptional, IsString, IsIn } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class PeriodQueryDto {
  @ApiPropertyOptional({
    enum: ['7d', '30d', 'this_month', 'this_year'],
    default: '7d',
  })
  @IsOptional()
  @IsString()
  @IsIn(['7d', '30d', 'this_month', 'this_year'])
  period?: string = '7d';
}

export class GranularityQueryDto {
  @ApiPropertyOptional({
    enum: ['daily', 'weekly', 'monthly'],
    default: 'daily',
  })
  @IsOptional()
  @IsString()
  @IsIn(['daily', 'weekly', 'monthly'])
  granularity?: string = 'daily';
}

export class PeriodShortQueryDto {
  @ApiPropertyOptional({
    enum: ['this_week', 'this_month'],
    default: 'this_week',
  })
  @IsOptional()
  @IsString()
  @IsIn(['this_week', 'this_month'])
  period?: string = 'this_week';
}

export class GranularityShortQueryDto {
  @ApiPropertyOptional({ enum: ['daily', 'weekly'], default: 'daily' })
  @IsOptional()
  @IsString()
  @IsIn(['daily', 'weekly'])
  granularity?: string = 'daily';
}
