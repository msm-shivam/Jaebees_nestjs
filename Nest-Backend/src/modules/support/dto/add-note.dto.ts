import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength } from 'class-validator';

export class AddNoteDto {
  @ApiProperty()
  @IsString()
  @MinLength(1)
  note: string;
}
