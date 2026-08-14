import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { OtpPurpose } from '../entities/otp-verification.entity';

export class ResendOtpDto {
  @ApiProperty({ example: '+919876543210' })
  @IsString()
  @IsNotEmpty()
  mobile: string;

  @ApiProperty({
    enum: OtpPurpose,
    example: OtpPurpose.MOBILE_VERIFICATION,
    description: 'MOBILE_VERIFICATION — for mobile verification, EMAIL_VERIFICATION — for email verification',
  })
  @IsEnum(OtpPurpose)
  purpose?: OtpPurpose;
}
