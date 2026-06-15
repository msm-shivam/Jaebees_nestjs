import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
  ParseUUIDPipe,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AdminJwtGuard } from '../../../common/guards/admin-jwt.guard';
import { PermissionsGuard } from '../../../common/guards/permissions.guard';
import { Permissions } from '../../../common/decorators/permissions.decorator';
import { DefaultPermissions } from '../../../common/constants/roles.constants';
import { HomepageService } from '../services/homepage.service';
import type { CreateHomepageSectionDto } from '../dto/create-homepage-section.dto';
import type { UpdateHomepageSectionDto } from '../dto/update-homepage-section.dto';

@ApiTags('Admin — Homepage')
@ApiBearerAuth('JWT')
@UseGuards(AdminJwtGuard, PermissionsGuard)
@Controller('admin/homepage')
export class AdminHomepageController {
  constructor(private readonly homepageService: HomepageService) {}

  @Get()
  @Permissions(DefaultPermissions.CMS_VIEW)
  async findAll() {
    return this.homepageService.findAll();
  }

  @Post()
  @Permissions(DefaultPermissions.CMS_MANAGE)
  async create(@Body() dto: CreateHomepageSectionDto) {
    return this.homepageService.create(dto);
  }

  @Patch(':id')
  @Permissions(DefaultPermissions.CMS_MANAGE)
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateHomepageSectionDto,
  ) {
    return this.homepageService.update(id, dto);
  }

  @Delete(':id')
  @Permissions(DefaultPermissions.CMS_MANAGE)
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    await this.homepageService.remove(id);
    return { message: 'Homepage section deleted' };
  }
}
