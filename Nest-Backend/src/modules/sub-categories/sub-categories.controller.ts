import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { SubCategoriesService } from './sub-categories.service';
import { CreateSubCategoryDto } from './dto/create-sub-category.dto';
import { UpdateSubCategoryDto } from './dto/update-sub-category.dto';
import { SubCategoryQueryDto } from './dto/sub-category-query.dto';
import { SubCategoryResponseDto } from './dto/sub-category-response.dto';
import { AdminJwtGuard } from '../../common/guards/admin-jwt.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { Permissions } from '../../common/decorators/permissions.decorator';
import { DefaultPermissions } from '../../common/constants/roles.constants';
import { ApiPaginatedResponse } from '../../common/decorators/api-paginated-response.decorator';

@ApiTags('Admin — Sub Categories')
@ApiBearerAuth('JWT')
@UseGuards(AdminJwtGuard, PermissionsGuard)
@Controller('admin/sub-categories')
export class SubCategoriesController {
  constructor(private readonly subCategoriesService: SubCategoriesService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @Permissions(DefaultPermissions.CATEGORY_CREATE)
  @ApiOperation({ summary: 'Create a new sub category' })
  @ApiResponse({ status: 201, description: 'Sub category created.' })
  async create(@Body() dto: CreateSubCategoryDto) {
    return this.subCategoriesService.create(dto);
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  @Permissions(DefaultPermissions.CATEGORY_VIEW)
  @ApiOperation({ summary: 'List sub categories with pagination' })
  @ApiPaginatedResponse(SubCategoryResponseDto)
  async findAll(@Query() query: SubCategoryQueryDto) {
    return this.subCategoriesService.findAll(query);
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @Permissions(DefaultPermissions.CATEGORY_VIEW)
  @ApiOperation({ summary: 'Get sub category by ID' })
  @ApiResponse({
    status: 200,
    description: 'Sub category returned.',
    type: SubCategoryResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Sub category not found.' })
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.subCategoriesService.findOne(id);
  }

  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  @Permissions(DefaultPermissions.CATEGORY_UPDATE)
  @ApiOperation({ summary: 'Update a sub category' })
  @ApiResponse({ status: 200, description: 'Sub category updated.' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateSubCategoryDto,
  ) {
    return this.subCategoriesService.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @Permissions(DefaultPermissions.CATEGORY_DELETE)
  @ApiOperation({ summary: 'Soft delete a sub category' })
  @ApiResponse({ status: 200, description: 'Sub category deleted.' })
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.subCategoriesService.remove(id);
  }
}
