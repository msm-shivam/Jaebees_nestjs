import { ApiProperty } from '@nestjs/swagger';
import { ArrayMinSize, IsArray, IsUUID } from 'class-validator';

export class AssignRolesDto {
  @ApiProperty({
    type: [String],
    description: 'Array of role UUIDs to assign to the admin',
    example: ['uuid-1', 'uuid-2'],
  })
  @IsArray()
  @ArrayMinSize(1)
  @IsUUID('4', { each: true })
  roleIds: string[];
}
