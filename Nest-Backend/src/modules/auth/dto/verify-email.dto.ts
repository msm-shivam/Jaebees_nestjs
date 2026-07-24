import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsObject, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

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

  @ApiPropertyOptional({ description: 'FCM device token for push notifications' })
  @IsOptional()
  @IsString()
  fcmToken?: string;

  @ApiPropertyOptional({ description: 'Device info (e.g. platform, model)' })
  @IsOptional()
  @IsObject()
  deviceInfo?: Record<string, any>;
}
