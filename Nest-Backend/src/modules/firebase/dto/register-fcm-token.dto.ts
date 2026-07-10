import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsObject } from 'class-validator';

export class RegisterFcmTokenDto {
  @ApiProperty({ description: 'FCM device token' })
  @IsString()
  token: string;

  @ApiProperty({ description: 'Device info (optional)', required: false })
  @IsOptional()
  @IsObject()
  deviceInfo?: Record<string, any>;
}
