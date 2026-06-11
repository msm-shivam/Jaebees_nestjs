import { IsUUID, IsNumber, IsOptional, IsString, Min, IsArray, ValidateNested } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

class CreateGoodsReceiptItemDto {
  @ApiProperty()
  @IsUUID('4')
  variantId: string;

  @ApiProperty({ example: 10 })
  @IsNumber()
  @Min(1)
  quantityReceived: number;
}

export class CreateGoodsReceiptDto {
  @ApiProperty()
  @IsUUID('4')
  purchaseOrderId: string;

  @ApiPropertyOptional({ example: 'Warehouse Staff' })
  @IsOptional()
  @IsString()
  receivedBy: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  notes: string;

  @ApiProperty({ type: [CreateGoodsReceiptItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateGoodsReceiptItemDto)
  items: CreateGoodsReceiptItemDto[];
}
