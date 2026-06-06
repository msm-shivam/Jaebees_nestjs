import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MaxLength, MinLength } from 'class-validator';

export class VerifyEmailDto {
  @ApiProperty({ example: 'john.doe@example.com' })
  @IsEmail()
  @MaxLength(255)
  email: string;

  @ApiProperty({ example: '123456' })
  @IsString()
  @MinLength(6)
  @MaxLength(10)
  otp: string;
}
