import { ApiProperty } from '@nestjs/swagger';
import { IsString, MaxLength, MinLength } from 'class-validator';

export class AddTagDto {
  @ApiProperty()
  @IsString()
  @MinLength(1)
  @MaxLength(50)
  tag: string;
}
