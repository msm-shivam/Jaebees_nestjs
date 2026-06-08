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
import { BrandsService } from './brands.service';
import { CreateBrandDto } from './dto/create-brand.dto';
import { UpdateBrandDto } from './dto/update-brand.dto';
import { BrandQueryDto } from './dto/brand-query.dto';
import { BrandResponseDto } from './dto/brand-response.dto';
import { AdminJwtGuard } from '../../common/guards/admin-jwt.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { Permissions } from '../../common/decorators/permissions.decorator';
import { DefaultPermissions } from '../../common/constants/roles.constants';
import { ApiPaginatedResponse } from '../../common/decorators/api-paginated-response.decorator';

@ApiTags('Admin — Brands')
@ApiBearerAuth('JWT')
@UseGuards(AdminJwtGuard, PermissionsGuard)
@Controller('admin/brands')
export class BrandsController {
  constructor(private readonly brandsService: BrandsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @Permissions(DefaultPermissions.BRAND_CREATE)
  @ApiOperation({ summary: 'Create a new brand' })
  @ApiResponse({ status: 201, description: 'Brand created.' })
  async create(@Body() dto: CreateBrandDto) {
    return this.brandsService.create(dto);
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  @Permissions(DefaultPermissions.BRAND_VIEW)
  @ApiOperation({ summary: 'List brands with pagination' })
  @ApiPaginatedResponse(BrandResponseDto)
  async findAll(@Query() query: BrandQueryDto) {
    return this.brandsService.findAll(query);
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @Permissions(DefaultPermissions.BRAND_VIEW)
  @ApiOperation({ summary: 'Get brand by ID' })
  @ApiResponse({
    status: 200,
    description: 'Brand returned.',
    type: BrandResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Brand not found.' })
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.brandsService.findOne(id);
  }

  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  @Permissions(DefaultPermissions.BRAND_UPDATE)
  @ApiOperation({ summary: 'Update a brand' })
  @ApiResponse({ status: 200, description: 'Brand updated.' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateBrandDto,
  ) {
    return this.brandsService.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @Permissions(DefaultPermissions.BRAND_DELETE)
  @ApiOperation({ summary: 'Soft delete a brand' })
  @ApiResponse({ status: 200, description: 'Brand deleted.' })
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.brandsService.remove(id);
  }
}
