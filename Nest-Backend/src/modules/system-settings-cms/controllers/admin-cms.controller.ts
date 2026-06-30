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
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { AdminJwtGuard } from '../../../common/guards/admin-jwt.guard';
import { PermissionsGuard } from '../../../common/guards/permissions.guard';
import { Permissions } from '../../../common/decorators/permissions.decorator';
import { DefaultPermissions } from '../../../common/constants/roles.constants';
import { ApiPaginatedResponse } from '../../../common/decorators/api-paginated-response.decorator';
import { CmsPageService } from '../services/cms-page.service';
import { CmsPageQueryDto } from '../dto/cms-page-query.dto';
import { CreateCmsPageDto } from '../dto/create-cms-page.dto';
import { UpdateCmsPageDto } from '../dto/update-cms-page.dto';

@ApiTags('Admin — CMS Pages')
@ApiBearerAuth('JWT')
@UseGuards(AdminJwtGuard, PermissionsGuard)
@Controller('admin/cms-pages')
export class AdminCmsController {
  constructor(private readonly cmsPageService: CmsPageService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @Permissions(DefaultPermissions.CMS_MANAGE)
  @ApiOperation({ summary: 'Create a new CMS page' })
  @ApiResponse({ status: 201, description: 'CMS page created.' })
  async create(@Body() dto: CreateCmsPageDto) {
    return this.cmsPageService.create(dto);
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  @Permissions(DefaultPermissions.CMS_VIEW)
  @ApiOperation({
    summary: 'List CMS pages with pagination, search, and filters',
  })
  @ApiPaginatedResponse(CmsPageQueryDto)
  async findAll(@Query() query: CmsPageQueryDto) {
    return this.cmsPageService.findAll(query);
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @Permissions(DefaultPermissions.CMS_VIEW)
  @ApiOperation({ summary: 'Get CMS page by ID' })
  @ApiResponse({ status: 200, description: 'CMS page returned.' })
  @ApiResponse({ status: 404, description: 'CMS page not found.' })
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.cmsPageService.findOne(id);
  }

  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  @Permissions(DefaultPermissions.CMS_MANAGE)
  @ApiOperation({ summary: 'Update a CMS page' })
  @ApiResponse({ status: 200, description: 'CMS page updated.' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateCmsPageDto,
  ) {
    return this.cmsPageService.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @Permissions(DefaultPermissions.CMS_MANAGE)
  @ApiOperation({ summary: 'Delete a CMS page' })
  @ApiResponse({ status: 200, description: 'CMS page deleted.' })
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    await this.cmsPageService.remove(id);
    return { message: 'CMS page deleted' };
  }
}
