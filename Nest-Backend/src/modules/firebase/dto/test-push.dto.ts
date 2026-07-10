import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsIn, IsObject } from 'class-validator';

export class TestPushDto {
  @ApiPropertyOptional({ description: 'Single FCM device token' })
  @IsOptional()
  @IsString()
  token?: string;

  @ApiPropertyOptional({ description: 'Send to all tokens of this user type' })
  @IsOptional()
  @IsIn(['customer', 'admin'])
  userType?: 'customer' | 'admin';

  @ApiPropertyOptional({ description: 'User ID (use with userType)' })
  @IsOptional()
  @IsString()
  userId?: string;

  @ApiProperty({ description: 'Notification title' })
  @IsString()
  title: string;

  @ApiProperty({ description: 'Notification body' })
  @IsString()
  body: string;

  @ApiPropertyOptional({ description: 'Custom data payload' })
  @IsOptional()
  @IsObject()
  data?: Record<string, string>;
}
