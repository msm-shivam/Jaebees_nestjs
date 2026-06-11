import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { SendNotificationDto } from './send-notification.dto';

export class BulkNotificationDto {
  @ApiProperty({ type: [SendNotificationDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SendNotificationDto)
  notifications: SendNotificationDto[];
}
