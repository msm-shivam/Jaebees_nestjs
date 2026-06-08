import { ApiProperty } from '@nestjs/swagger';

export class InventoryResponseDto {
  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
  id: string;

  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
  variantId: string;

  @ApiProperty({ example: 100 })
  quantity: number;

  @ApiProperty({ example: 10 })
  reservedQuantity: number;

  @ApiProperty({
    example: 90,
    description: 'Available for purchase (quantity - reservedQuantity)',
  })
  availableQuantity: number;

  @ApiProperty({ example: 5 })
  lowStockThreshold: number;

  @ApiProperty({ example: '2024-01-15T10:30:00Z' })
  createdAt: Date;

  @ApiProperty({ example: '2024-01-15T10:30:00Z' })
  updatedAt: Date;
}
