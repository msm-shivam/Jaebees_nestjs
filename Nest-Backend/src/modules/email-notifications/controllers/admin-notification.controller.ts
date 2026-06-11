import {
  Controller, Get, Post, Body, Param, Query, UseGuards, ParseUUIDPipe,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { AdminJwtGuard } from '../../../common/guards/admin-jwt.guard';
import { PermissionsGuard } from '../../../common/guards/permissions.guard';
import { Permissions } from '../../../common/decorators/permissions.decorator';
import { DefaultPermissions } from '../../../common/constants/roles.constants';
import { EmailNotificationService } from '../services/email-notification.service';
import type { SendNotificationDto } from '../dto/send-notification.dto';
import type { BulkNotificationDto } from '../dto/bulk-notification.dto';

@ApiTags('Admin — Notifications')
@ApiBearerAuth('JWT')
@UseGuards(AdminJwtGuard, PermissionsGuard)
@Controller('admin/notifications')
export class AdminNotificationController {
  constructor(private readonly notificationService: EmailNotificationService) {}

  @Post('send')
  @Permissions(DefaultPermissions.NOTIFICATION_SEND)
  async send(@Body() dto: SendNotificationDto) {
    return this.notificationService.send(dto);
  }

  @Post('bulk')
  @Permissions(DefaultPermissions.NOTIFICATION_SEND)
  async sendBulk(@Body() dto: BulkNotificationDto) {
    return this.notificationService.sendBulk(dto.notifications);
  }

  @Get()
  @Permissions(DefaultPermissions.NOTIFICATION_VIEW)
  async findAll(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('status') status?: string,
  ) {
    return this.notificationService.findAll({ page, limit, status: status as any });
  }

  @Get(':id')
  @Permissions(DefaultPermissions.NOTIFICATION_VIEW)
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.notificationService.findOne(id);
  }
}
