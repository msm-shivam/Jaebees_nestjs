import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ProductImageResponseDto {
  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
  id: string;

  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
  productId: string;

  @ApiProperty({ example: 'https://cdn.example.com/products/nike-pegasus-41-front.jpg' })
  imageUrl: string;

  @ApiPropertyOptional({ example: 'Nike Air Zoom Pegasus 41 - Front View' })
  altText?: string;

  @ApiProperty({ example: 0, description: 'Sort order for display' })
  sortOrder: number;

  @ApiProperty({ example: false, description: 'Whether this is the primary image' })
  isPrimary: boolean;

  @ApiProperty({ example: '2024-01-15T10:30:00Z' })
  createdAt: Date;

  @ApiProperty({ example: '2024-01-15T10:30:00Z' })
  updatedAt: Date;

  @ApiPropertyOptional({ example: '2024-02-01T10:30:00Z' })
  deletedAt?: Date;
}
