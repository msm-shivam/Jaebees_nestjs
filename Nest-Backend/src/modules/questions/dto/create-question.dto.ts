import { IsString, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateQuestionDto {
  @ApiProperty()
  @IsUUID()
  productId: string;

  @ApiProperty()
  @IsString()
  question: string;
}
