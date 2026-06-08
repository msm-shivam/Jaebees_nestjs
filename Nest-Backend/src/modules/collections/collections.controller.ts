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
import { CollectionsService } from './collections.service';
import { CreateCollectionDto } from './dto/create-collection.dto';
import { UpdateCollectionDto } from './dto/update-collection.dto';
import { CollectionQueryDto } from './dto/collection-query.dto';
import { CollectionResponseDto } from './dto/collection-response.dto';
import { AdminJwtGuard } from '../../common/guards/admin-jwt.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { Permissions } from '../../common/decorators/permissions.decorator';
import { DefaultPermissions } from '../../common/constants/roles.constants';
import { ApiPaginatedResponse } from '../../common/decorators/api-paginated-response.decorator';

@ApiTags('Admin — Collections')
@ApiBearerAuth('JWT')
@UseGuards(AdminJwtGuard, PermissionsGuard)
@Controller('admin/collections')
export class CollectionsController {
  constructor(private readonly collectionsService: CollectionsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @Permissions(DefaultPermissions.COLLECTION_CREATE)
  @ApiOperation({ summary: 'Create a new collection' })
  @ApiResponse({ status: 201, description: 'Collection created.' })
  async create(@Body() dto: CreateCollectionDto) {
    return this.collectionsService.create(dto);
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  @Permissions(DefaultPermissions.COLLECTION_VIEW)
  @ApiOperation({ summary: 'List collections with pagination' })
  @ApiPaginatedResponse(CollectionResponseDto)
  async findAll(@Query() query: CollectionQueryDto) {
    return this.collectionsService.findAll(query);
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @Permissions(DefaultPermissions.COLLECTION_VIEW)
  @ApiOperation({ summary: 'Get collection by ID' })
  @ApiResponse({
    status: 200,
    description: 'Collection returned.',
    type: CollectionResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Collection not found.' })
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.collectionsService.findOne(id);
  }

  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  @Permissions(DefaultPermissions.COLLECTION_UPDATE)
  @ApiOperation({ summary: 'Update a collection' })
  @ApiResponse({ status: 200, description: 'Collection updated.' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateCollectionDto,
  ) {
    return this.collectionsService.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @Permissions(DefaultPermissions.COLLECTION_DELETE)
  @ApiOperation({ summary: 'Soft delete a collection' })
  @ApiResponse({ status: 200, description: 'Collection deleted.' })
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.collectionsService.remove(id);
  }
}
