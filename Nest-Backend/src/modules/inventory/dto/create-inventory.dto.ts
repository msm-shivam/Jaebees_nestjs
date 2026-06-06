import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsOptional, IsUUID, Min } from 'class-validator';

export class CreateInventoryDto {
  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
  @IsUUID()
  variantId: string;

  @ApiProperty({ example: 100, default: 0 })
  @IsInt()
  @Min(0)
  quantity: number;

  @ApiPropertyOptional({ example: 0, default: 0 })
  @IsOptional()
  @IsInt()
  @Min(0)
  reservedQuantity?: number;

  @ApiPropertyOptional({ example: 5, default: 5 })
  @IsOptional()
  @IsInt()
  @Min(0)
  lowStockThreshold?: number;
}
