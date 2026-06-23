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
  @UseInterceptors(
    FileInterceptor('image', {
      storage: diskStorage({
        destination: './uploads/collections',
        filename: (req, file, cb) => {
          cb(null, `${Date.now()}-${file.originalname}`);
        },
      }),
    }),
  )
  @ApiConsumes('multipart/form-data')
  @ApiBody({ description: 'Create collection with optional banner image', type: CreateCollectionDto })
  @HttpCode(HttpStatus.CREATED)
  @Permissions(DefaultPermissions.COLLECTION_CREATE)
  @ApiOperation({ summary: 'Create a new collection' })
  @ApiResponse({ status: 201, description: 'Collection created.' })
  async create(@Body() dto: CreateCollectionDto, @UploadedFile() image?: Express.Multer.File) {
    return this.collectionsService.create(dto, image);
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
  @UseInterceptors(
    FileInterceptor('image', {
      storage: diskStorage({
        destination: './uploads/collections',
        filename: (req, file, cb) => {
          cb(null, `${Date.now()}-${file.originalname}`);
        },
      }),
    }),
  )
  @ApiConsumes('multipart/form-data')
  @ApiBody({ description: 'Update collection with optional banner image', type: UpdateCollectionDto })
  @HttpCode(HttpStatus.OK)
  @Permissions(DefaultPermissions.COLLECTION_UPDATE)
  @ApiOperation({ summary: 'Update a collection' })
  @ApiResponse({ status: 200, description: 'Collection updated.' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateCollectionDto,
    @UploadedFile() image?: Express.Multer.File,
  ) {
    return this.collectionsService.update(id, dto, image);
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
