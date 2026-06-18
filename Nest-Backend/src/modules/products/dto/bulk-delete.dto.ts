import { ArrayNotEmpty, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class BulkDeleteDto {
  @ApiProperty({
    description: 'Array of product IDs to delete',
    example: ['uuid-1', 'uuid-2'],
    isArray: true,
    type: String,
  })
  @ArrayNotEmpty()
  @IsUUID('4', { each: true })
  ids: string[];
}
