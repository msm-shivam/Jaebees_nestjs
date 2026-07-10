import {
  Controller,
  Get,
  Patch,
  Delete,
  Param,
  Query,
  ParseUUIDPipe,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AdminJwtGuard } from '../../../common/guards/admin-jwt.guard';
import { PermissionsGuard } from '../../../common/guards/permissions.guard';
import { AdminNotificationService } from '../admin-notification.service';
import { AdminNotificationQueryDto } from '../dto/admin-notification-query.dto';
import { Permissions } from '../../../common/decorators/permissions.decorator';
import { DefaultPermissions } from '../../../common/constants/roles.constants';

@ApiTags('Admin Notifications')
@ApiBearerAuth()
@UseGuards(AdminJwtGuard, PermissionsGuard)
@Controller('admin/notifications')
export class AdminNotificationsV2Controller {
  constructor(
    private readonly adminNotificationService: AdminNotificationService,
  ) {}

  @Get()
  @Permissions(DefaultPermissions.NOTIFICATION_VIEW)
  @ApiOperation({ summary: 'List admin notifications with filters' })
  findAll(@Query() query: AdminNotificationQueryDto) {
    return this.adminNotificationService.findAll(query);
  }

  @Get('summary')
  @Permissions(DefaultPermissions.NOTIFICATION_VIEW)
  @ApiOperation({ summary: 'Get notification summary counts (total, unread, by type)' })
  async summary() {
    return this.adminNotificationService.getSummary();
  }

  @Get('unread-count')
  @Permissions(DefaultPermissions.NOTIFICATION_VIEW)
  @ApiOperation({ summary: 'Get count of unread notifications' })
  async unreadCount() {
    const count = await this.adminNotificationService.countUnread();
    return { unreadCount: count };
  }

  @Get(':id')
  @Permissions(DefaultPermissions.NOTIFICATION_VIEW)
  @ApiOperation({ summary: 'Get admin notification by id' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.adminNotificationService.findOne(id);
  }

  @Patch('read-all')
  @Permissions(DefaultPermissions.NOTIFICATION_MANAGE)
  @ApiOperation({ summary: 'Mark all notifications as read' })
  markAllAsRead() {
    return this.adminNotificationService.markAllAsRead();
  }

  @Delete('clear-read')
  @Permissions(DefaultPermissions.NOTIFICATION_MANAGE)
  @ApiOperation({ summary: 'Delete all read notifications' })
  clearRead() {
    return this.adminNotificationService.clearRead();
  }

  @Delete(':id')
  @Permissions(DefaultPermissions.NOTIFICATION_MANAGE)
  @ApiOperation({ summary: 'Delete a single notification' })
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.adminNotificationService.remove(id);
  }
}
