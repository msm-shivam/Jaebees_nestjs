import {
  Controller,
  Get,
  Post,
  Param,
  Query,
  Body,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AdminJwtGuard } from '../../../common/guards/admin-jwt.guard';
import { PermissionsGuard } from '../../../common/guards/permissions.guard';
import { Permissions } from '../../../common/decorators/permissions.decorator';
import { DefaultPermissions } from '../../../common/constants/roles.constants';
import { NotificationLogService } from '../notification-log.service';
import { NotificationsService } from '../notifications.service';
import { NotificationLogQueryDto } from '../dto/notification-log-query.dto';
import { SendTestEmailDto } from '../dto/send-test-email.dto';

@ApiTags('Admin - Notifications')
@ApiBearerAuth()
@UseGuards(AdminJwtGuard, PermissionsGuard)
@Controller('admin/notifications')
export class AdminNotificationsController {
  constructor(
    private readonly notificationLogService: NotificationLogService,
    private readonly notificationsService: NotificationsService,
  ) {}

  @Get('logs')
  @Permissions(DefaultPermissions.NOTIFICATION_VIEW)
  @ApiOperation({ summary: 'List notification logs' })
  findLogs(@Query() query: NotificationLogQueryDto) {
    return this.notificationLogService.findAll(query);
  }

  @Get('logs/:id')
  @Permissions(DefaultPermissions.NOTIFICATION_VIEW)
  @ApiOperation({ summary: 'Get notification log by id' })
  findLogById(@Param('id') id: string) {
    return this.notificationLogService.findById(id);
  }

  @Post('send-test')
  @Permissions(DefaultPermissions.NOTIFICATION_MANAGE)
  @ApiOperation({ summary: 'Send test email' })
  sendTest(@Body() dto: SendTestEmailDto) {
    return this.notificationsService.sendTestEmail(
      dto.recipient,
      dto.templateCode,
    );
  }
}
