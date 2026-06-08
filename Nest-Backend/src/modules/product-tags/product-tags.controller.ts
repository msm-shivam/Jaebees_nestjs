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
import { ProductTagsService } from './product-tags.service';
import { CreateProductTagDto } from './dto/create-product-tag.dto';
import { UpdateProductTagDto } from './dto/update-product-tag.dto';
import { ProductTagQueryDto } from './dto/product-tag-query.dto';
import { ProductTagResponseDto } from './dto/product-tag-response.dto';
import { AdminJwtGuard } from '../../common/guards/admin-jwt.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { Permissions } from '../../common/decorators/permissions.decorator';
import { DefaultPermissions } from '../../common/constants/roles.constants';
import { ApiPaginatedResponse } from '../../common/decorators/api-paginated-response.decorator';

@ApiTags('Admin — Product Tags')
@ApiBearerAuth('JWT')
@UseGuards(AdminJwtGuard, PermissionsGuard)
@Controller('admin/product-tags')
export class ProductTagsController {
  constructor(private readonly productTagsService: ProductTagsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @Permissions(DefaultPermissions.TAG_CREATE)
  @ApiOperation({ summary: 'Create a new product tag' })
  @ApiResponse({ status: 201, description: 'Product tag created.' })
  async create(@Body() dto: CreateProductTagDto) {
    return this.productTagsService.create(dto);
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  @Permissions(DefaultPermissions.TAG_VIEW)
  @ApiOperation({ summary: 'List product tags with pagination' })
  @ApiPaginatedResponse(ProductTagResponseDto)
  async findAll(@Query() query: ProductTagQueryDto) {
    return this.productTagsService.findAll(query);
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @Permissions(DefaultPermissions.TAG_VIEW)
  @ApiOperation({ summary: 'Get product tag by ID' })
  @ApiResponse({
    status: 200,
    description: 'Product tag returned.',
    type: ProductTagResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Product tag not found.' })
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.productTagsService.findOne(id);
  }

  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  @Permissions(DefaultPermissions.TAG_UPDATE)
  @ApiOperation({ summary: 'Update a product tag' })
  @ApiResponse({ status: 200, description: 'Product tag updated.' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateProductTagDto,
  ) {
    return this.productTagsService.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @Permissions(DefaultPermissions.TAG_DELETE)
  @ApiOperation({ summary: 'Delete a product tag' })
  @ApiResponse({ status: 200, description: 'Product tag deleted.' })
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.productTagsService.remove(id);
  }
}
