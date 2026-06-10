import { IsString, IsEmail, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SendTestEmailDto {
  @ApiProperty()
  @IsEmail()
  recipient: string;

  @ApiProperty()
  @IsString()
  @MaxLength(100)
  templateCode: string;
}
