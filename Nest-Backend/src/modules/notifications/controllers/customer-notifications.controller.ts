import { Controller, Get, Patch, Body, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { NotificationPreferenceService } from '../notification-preference.service';
import { UpdateNotificationPreferenceDto } from '../dto/update-notification-preference.dto';

@ApiTags('Customer - Notifications')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('notifications/preferences')
export class CustomerNotificationsController {
  constructor(private readonly prefService: NotificationPreferenceService) {}

  @Get()
  @ApiOperation({ summary: 'Get my notification preferences' })
  getPreferences(@Req() req: any) {
    return this.prefService.findByUserId(req.user.id);
  }

  @Patch()
  @ApiOperation({ summary: 'Update my notification preferences' })
  updatePreferences(
    @Req() req: any,
    @Body() dto: UpdateNotificationPreferenceDto,
  ) {
    return this.prefService.update(req.user.id, dto);
  }
}
