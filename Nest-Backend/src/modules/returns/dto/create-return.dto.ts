import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsEnum,
  IsOptional,
  IsString,
  IsUUID,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ReturnReason } from '../enums/return-reason.enum';
import { ReturnItemCondition } from '../enums/return-item-condition.enum';

class ReturnItemDto {
  @ApiProperty()
  @IsUUID()
  orderItemId: string;

  @ApiProperty()
  @Min(1)
  quantity: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  reason?: string;

  @ApiPropertyOptional({ enum: ReturnItemCondition })
  @IsOptional()
  @IsEnum(ReturnItemCondition)
  condition?: ReturnItemCondition;
}

export class CreateReturnDto {
  @ApiProperty()
  @IsUUID()
  orderId: string;

  @ApiProperty({ enum: ReturnReason })
  @IsEnum(ReturnReason)
  reason: ReturnReason;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiProperty({ type: [ReturnItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ReturnItemDto)
  items: ReturnItemDto[];
}
