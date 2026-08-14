import { Controller, Get, Patch, Body, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AdminJwtGuard } from '../../../common/guards/admin-jwt.guard';
import { PermissionsGuard } from '../../../common/guards/permissions.guard';
import { Permissions } from '../../../common/decorators/permissions.decorator';
import { DefaultPermissions } from '../../../common/constants/roles.constants';
import { SystemSettingsService } from '../services/system-settings.service';
import type { UpdateSettingsDto } from '../dto/update-settings.dto';

@ApiTags('Admin — Settings')
@ApiBearerAuth('JWT')
@UseGuards(AdminJwtGuard, PermissionsGuard)
@Controller('admin/settings')
export class AdminSettingsController {
  constructor(private readonly settingsService: SystemSettingsService) {}

  @Get('announcement')
  @Permissions(DefaultPermissions.SETTINGS_VIEW)
  async getAnnouncement() {
    const setting = await this.settingsService.findByKey('announcement_text');
    return {
      statusCode: 200,
      message: 'Success',
      data: {
        text: setting?.value ?? 'FREE SHIPPING OVER $75 • 48-HOUR RETURNS',
      },
    };
  }

  @Patch('announcement')
  @Permissions(DefaultPermissions.SETTINGS_MANAGE)
  async updateAnnouncement(@Body('text') text: string) {
    await this.settingsService.upsert({ announcement_text: text ?? '' });
    return {
      statusCode: 200,
      message: 'Announcement header text updated successfully',
      data: { text: text ?? '' },
    };
  }

  @Get()
  @Permissions(DefaultPermissions.SETTINGS_VIEW)
  async findAll(@Query('category') category?: string) {
    return this.settingsService.findAll(category);
  }

  @Patch()
  @Permissions(DefaultPermissions.SETTINGS_MANAGE)
  async upsert(@Body() dto: UpdateSettingsDto) {
    return this.settingsService.upsert(dto.settings ?? {});
  }
}
