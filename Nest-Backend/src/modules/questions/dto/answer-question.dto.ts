import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AnswerQuestionDto {
  @ApiProperty()
  @IsString()
  answer: string;
}
