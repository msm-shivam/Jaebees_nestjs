import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  ParseUUIDPipe,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { AdminJwtGuard } from '../../../common/guards/admin-jwt.guard';
import { PermissionsGuard } from '../../../common/guards/permissions.guard';
import { Permissions } from '../../../common/decorators/permissions.decorator';
import { DefaultPermissions } from '../../../common/constants/roles.constants';
import { EmailTemplateService } from '../services/email-template.service';
import type { CreateEmailTemplateDto } from '../dto/create-email-template.dto';
import type { UpdateEmailTemplateDto } from '../dto/update-email-template.dto';

@ApiTags('Admin — Email Templates')
@ApiBearerAuth('JWT')
@UseGuards(AdminJwtGuard, PermissionsGuard)
@Controller('admin/email-templates')
export class AdminEmailTemplateController {
  constructor(private readonly templateService: EmailTemplateService) {}

  @Post()
  @Permissions(DefaultPermissions.NOTIFICATION_MANAGE)
  async create(@Body() dto: CreateEmailTemplateDto) {
    return this.templateService.create(dto);
  }

  @Get()
  @Permissions(DefaultPermissions.NOTIFICATION_VIEW)
  async findAll(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('active') active?: string,
  ) {
    const isActive =
      active === 'true' ? true : active === 'false' ? false : undefined;
    return this.templateService.findAll({ page, limit, active: isActive });
  }

  @Get(':id')
  @Permissions(DefaultPermissions.NOTIFICATION_VIEW)
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.templateService.findOne(id);
  }

  @Patch(':id')
  @Permissions(DefaultPermissions.NOTIFICATION_MANAGE)
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateEmailTemplateDto,
  ) {
    return this.templateService.update(id, dto);
  }

  @Delete(':id')
  @Permissions(DefaultPermissions.NOTIFICATION_MANAGE)
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    await this.templateService.remove(id);
    return { message: 'Template deleted' };
  }
}
