import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsEnum, IsOptional, IsString, IsUUID } from 'class-validator';
import { TransactionalEmailType } from '../enums/transactional-email-type.enum';

export class SendNotificationDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  userId?: string;

  @ApiProperty()
  @IsEmail()
  recipientEmail: string;

  @ApiProperty()
  @IsString()
  subject: string;

  @ApiProperty()
  @IsString()
  body: string;

  @ApiPropertyOptional({ enum: TransactionalEmailType })
  @IsOptional()
  @IsEnum(TransactionalEmailType)
  type?: TransactionalEmailType;
}
