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
import { CmsPageService } from '../services/cms-page.service';
import type { CreateCmsPageDto } from '../dto/create-cms-page.dto';
import type { UpdateCmsPageDto } from '../dto/update-cms-page.dto';

@ApiTags('Admin — CMS Pages')
@ApiBearerAuth('JWT')
@UseGuards(AdminJwtGuard, PermissionsGuard)
@Controller('admin/cms-pages')
export class AdminCmsController {
  constructor(private readonly cmsPageService: CmsPageService) {}

  @Post()
  @Permissions(DefaultPermissions.CMS_MANAGE)
  async create(@Body() dto: CreateCmsPageDto) {
    return this.cmsPageService.create(dto);
  }

  @Get()
  @Permissions(DefaultPermissions.CMS_VIEW)
  async findAll(@Query('page') page?: number, @Query('limit') limit?: number) {
    return this.cmsPageService.findAll(page, limit);
  }

  @Get(':id')
  @Permissions(DefaultPermissions.CMS_VIEW)
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.cmsPageService.findOne(id);
  }

  @Patch(':id')
  @Permissions(DefaultPermissions.CMS_MANAGE)
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateCmsPageDto,
  ) {
    return this.cmsPageService.update(id, dto);
  }

  @Delete(':id')
  @Permissions(DefaultPermissions.CMS_MANAGE)
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    await this.cmsPageService.remove(id);
    return { message: 'CMS page deleted' };
  }
}
