import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsInt, Min, Max, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';

export enum InventoryFilterStatus {
  ALL = 'all',
  LOW_STOCK = 'low_stock',
  OUT_OF_STOCK = 'out_of_stock',
  IN_STOCK = 'in_stock',
}

export class InventoryQueryDto {
  @ApiPropertyOptional({
    description: 'Search by variant SKU',
    example: 'NIKE',
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({
    description: 'Filter by stock status',
    enum: InventoryFilterStatus,
    default: 'all',
  })
  @IsOptional()
  @IsEnum(InventoryFilterStatus)
  status?: InventoryFilterStatus;

  @ApiPropertyOptional({ example: 1, default: 1 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  page?: number;

  @ApiPropertyOptional({ example: 20, default: 20 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  @Type(() => Number)
  limit?: number;
}
