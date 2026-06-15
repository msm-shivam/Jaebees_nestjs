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
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AdminJwtGuard } from '../../../common/guards/admin-jwt.guard';
import { PermissionsGuard } from '../../../common/guards/permissions.guard';
import { Permissions } from '../../../common/decorators/permissions.decorator';
import { DefaultPermissions } from '../../../common/constants/roles.constants';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import type { JwtPayload } from '../../../common/decorators/current-user.decorator';
import { SavedReportService } from '../services/saved-report.service';
import type { CreateSavedReportDto } from '../dto/create-saved-report.dto';
import type { UpdateSavedReportDto } from '../dto/update-saved-report.dto';

@ApiTags('Admin — Saved Reports')
@ApiBearerAuth('JWT')
@UseGuards(AdminJwtGuard, PermissionsGuard)
@Controller('admin/saved-reports')
export class AdminSavedReportController {
  constructor(private readonly savedReportService: SavedReportService) {}

  @Post()
  @Permissions(DefaultPermissions.REPORTS_VIEW)
  async create(
    @CurrentUser() admin: JwtPayload,
    @Body() dto: CreateSavedReportDto,
  ) {
    return this.savedReportService.create(dto, admin.sub);
  }

  @Get()
  @Permissions(DefaultPermissions.REPORTS_VIEW)
  async findAll(@Query('page') page?: number, @Query('limit') limit?: number) {
    return this.savedReportService.findAll(page, limit);
  }

  @Get(':id')
  @Permissions(DefaultPermissions.REPORTS_VIEW)
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.savedReportService.findOne(id);
  }

  @Patch(':id')
  @Permissions(DefaultPermissions.REPORTS_VIEW)
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateSavedReportDto,
  ) {
    return this.savedReportService.update(id, dto);
  }

  @Delete(':id')
  @Permissions(DefaultPermissions.REPORTS_VIEW)
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    await this.savedReportService.remove(id);
    return { message: 'Saved report deleted' };
  }
}
