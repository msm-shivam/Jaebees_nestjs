import { ApiProperty } from '@nestjs/swagger';
import { IsInt, Min } from 'class-validator';

export class ReserveInventoryDto {
  @ApiProperty({ example: 5, description: 'Quantity to reserve for an order' })
  @IsInt()
  @Min(1)
  quantity: number;
}
