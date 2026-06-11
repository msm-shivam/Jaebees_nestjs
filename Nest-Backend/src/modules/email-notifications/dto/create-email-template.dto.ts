import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsString } from 'class-validator';

export class CreateEmailTemplateDto {
  @ApiProperty()
  @IsString()
  code: string;

  @ApiProperty()
  @IsString()
  name: string;

  @ApiProperty()
  @IsString()
  subjectTemplate: string;

  @ApiProperty()
  @IsString()
  bodyTemplate: string;

  @ApiProperty()
  @IsArray()
  @IsString({ each: true })
  variables: string[];
}
