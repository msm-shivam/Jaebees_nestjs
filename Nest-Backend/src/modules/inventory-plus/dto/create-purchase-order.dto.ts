import {
  IsString,
  IsUUID,
  IsArray,
  IsOptional,
  IsNumber,
  Min,
  ValidateNested,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

class CreatePurchaseOrderItemDto {
  @ApiProperty()
  @IsUUID('4')
  variantId: string;

  @ApiProperty({ example: 10 })
  @IsNumber()
  @Min(1)
  quantity: number;

  @ApiProperty({ example: 500 })
  @IsNumber()
  @Min(0)
  costPrice: number;
}

export class CreatePurchaseOrderDto {
  @ApiProperty()
  @IsUUID('4')
  supplierId: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  notes: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  expectedDate: string;

  @ApiProperty({ type: [CreatePurchaseOrderItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreatePurchaseOrderItemDto)
  items: CreatePurchaseOrderItemDto[];
}
