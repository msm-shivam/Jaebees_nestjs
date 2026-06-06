import { ApiProperty } from '@nestjs/swagger';
import { IsInt, Min } from 'class-validator';

export class AdjustInventoryDto {
  @ApiProperty({ example: 10, description: 'Quantity to adjust (positive to add, negative to remove)' })
  @IsInt()
  quantity: number;
}
