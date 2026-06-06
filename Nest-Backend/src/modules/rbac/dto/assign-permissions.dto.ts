import { ApiProperty } from '@nestjs/swagger';
import { ArrayMinSize, IsArray, IsUUID } from 'class-validator';

export class AssignPermissionsDto {
  @ApiProperty({
    type: [String],
    description: 'Array of permission UUIDs to assign to the role',
    example: ['uuid-1', 'uuid-2'],
  })
  @IsArray()
  @ArrayMinSize(1)
  @IsUUID('4', { each: true })
  permissionIds: string[];
}
