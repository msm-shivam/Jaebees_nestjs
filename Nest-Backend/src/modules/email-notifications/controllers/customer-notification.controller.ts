import {
  Controller, Get, Post, Patch, Body, Param, Query, UseGuards, ParseUUIDPipe,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import type { JwtPayload } from '../../../common/decorators/current-user.decorator';
import { EmailNotificationService } from '../services/email-notification.service';
import type { UpdatePreferenceDto } from '../dto/update-preference.dto';

@ApiTags('Customer — Notifications')
@ApiBearerAuth('JWT')
@UseGuards(JwtAuthGuard)
@Controller('notifications')
export class CustomerNotificationController {
  constructor(private readonly notificationService: EmailNotificationService) {}

  @Get()
  async findMy(
    @CurrentUser() user: JwtPayload,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.notificationService.findMyNotifications(user.sub, { page, limit });
  }

  @Get('unread-count')
  async unreadCount(@CurrentUser() user: JwtPayload) {
    const count = await this.notificationService.getUnreadCount(user.sub);
    return { unreadCount: count };
  }

  @Patch(':id/read')
  async markAsRead(
    @CurrentUser() user: JwtPayload,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    await this.notificationService.markAsRead(id, user.sub);
    return { message: 'Marked as read' };
  }

  @Patch('read-all')
  async markAllAsRead(@CurrentUser() user: JwtPayload) {
    await this.notificationService.markAllAsRead(user.sub);
    return { message: 'All marked as read' };
  }

  @Get('preferences')
  async getPreferences(@CurrentUser() user: JwtPayload) {
    return this.notificationService.getPreferences(user.sub);
  }

  @Patch('preferences')
  async updatePreferences(
    @CurrentUser() user: JwtPayload,
    @Body() dto: UpdatePreferenceDto,
  ) {
    return this.notificationService.updatePreferences(user.sub, dto);
  }
}
