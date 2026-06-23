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
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
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
import { CurrentAdmin } from 'src/common/decorators/current-admin.decorator';

@ApiTags('Admin — Sub Categories')
@ApiBearerAuth('JWT')
@UseGuards(AdminJwtGuard, PermissionsGuard)
@Controller('admin/sub-categories')
export class SubCategoriesController {
  constructor(private readonly subCategoriesService: SubCategoriesService) {}

  @Post()
  @UseInterceptors(
    FileInterceptor('image', {
      storage: diskStorage({
        destination: './uploads/sub-categories',
        filename: (req, file, cb) => {
          cb(null, `${Date.now()}-${file.originalname}`);
        },
      }),
    }),
  )
  @ApiConsumes('multipart/form-data')
  @ApiBody({ description: 'Create sub category with optional image', type: CreateSubCategoryDto })
  @HttpCode(HttpStatus.CREATED)
  @Permissions(DefaultPermissions.CATEGORY_CREATE)
  @ApiOperation({ summary: 'Create a new sub category' })
  @ApiResponse({ status: 201, description: 'Sub category created.' })
  async create(@Body() dto: CreateSubCategoryDto, @CurrentAdmin() admin: any, @UploadedFile() image?: Express.Multer.File) {
    return this.subCategoriesService.create(dto, admin.sub, image);
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
  @UseInterceptors(
    FileInterceptor('image', {
      storage: diskStorage({
        destination: './uploads/sub-categories',
        filename: (req, file, cb) => {
          cb(null, `${Date.now()}-${file.originalname}`);
        },
      }),
    }),
  )
  @ApiConsumes('multipart/form-data')
  @ApiBody({ description: 'Update sub category with optional image', type: UpdateSubCategoryDto })
  @HttpCode(HttpStatus.OK)
  @Permissions(DefaultPermissions.CATEGORY_UPDATE)
  @ApiOperation({ summary: 'Update a sub category' })
  @ApiResponse({ status: 200, description: 'Sub category updated.' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateSubCategoryDto,
    @CurrentAdmin() admin: any,
    @UploadedFile() image?: Express.Multer.File,
  ) {
    return this.subCategoriesService.update(id, dto, admin.sub, image);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @Permissions(DefaultPermissions.CATEGORY_DELETE)
  @ApiOperation({ summary: 'Soft delete a sub category' })
  @ApiResponse({ status: 200, description: 'Sub category deleted.' })
  async remove(@Param('id', ParseUUIDPipe) id: string, @CurrentAdmin() admin: any) {
    return this.subCategoriesService.remove(id,admin.sub);
  }
}
