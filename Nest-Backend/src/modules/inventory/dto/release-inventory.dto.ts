import { ApiProperty } from '@nestjs/swagger';
import { IsInt, Min } from 'class-validator';

export class ReleaseInventoryDto {
  @ApiProperty({
    example: 5,
    description: 'Quantity to release from reservation',
  })
  @IsInt()
  @Min(1)
  quantity: number;
}
