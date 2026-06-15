import { Controller, Get, Patch, Body, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AdminJwtGuard } from '../../../common/guards/admin-jwt.guard';
import { PermissionsGuard } from '../../../common/guards/permissions.guard';
import { Permissions } from '../../../common/decorators/permissions.decorator';
import { DefaultPermissions } from '../../../common/constants/roles.constants';
import { ContactSettingsService } from '../services/contact-settings.service';
import type { UpdateContactSettingsDto } from '../dto/update-contact-settings.dto';

@ApiTags('Admin — Contact Settings')
@ApiBearerAuth('JWT')
@UseGuards(AdminJwtGuard, PermissionsGuard)
@Controller('admin/contact-settings')
export class AdminContactSettingsController {
  constructor(
    private readonly contactSettingsService: ContactSettingsService,
  ) {}

  @Get()
  @Permissions(DefaultPermissions.SETTINGS_VIEW)
  async find() {
    return this.contactSettingsService.find();
  }

  @Patch()
  @Permissions(DefaultPermissions.SETTINGS_MANAGE)
  async upsert(@Body() dto: UpdateContactSettingsDto) {
    return this.contactSettingsService.upsert(dto);
  }
}
