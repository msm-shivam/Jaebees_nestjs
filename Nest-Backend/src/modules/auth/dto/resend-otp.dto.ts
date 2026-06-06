import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsEnum, MaxLength } from 'class-validator';
import { OtpType } from '../entities/otp-verification.entity';

export class ResendOtpDto {
  @ApiProperty({ example: 'john.doe@example.com' })
  @IsEmail()
  @MaxLength(255)
  email: string;

  @ApiProperty({
    enum: OtpType,
    example: OtpType.EMAIL_VERIFY,
    description: 'EMAIL_VERIFY — for email verification, FORGOT_PASSWORD — for password reset',
  })
  @IsEnum(OtpType)
  type: OtpType;
}
