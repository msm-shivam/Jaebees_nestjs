import { Controller, Get, Param, ParseUUIDPipe, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CollectionsService } from '../../collections/collections.service';
import { CollectionQueryDto } from '../../collections/dto/collection-query.dto';
import { CollectionResponseDto } from '../../collections/dto/collection-response.dto';
import { ApiPaginatedResponse } from '../../../common/decorators/api-paginated-response.decorator';

@ApiTags('Collections')
@ApiBearerAuth('JWT')
@Controller('collections')
export class PublicCollectionsController {
  constructor(private readonly collectionsService: CollectionsService) {}

  @Get()
  @ApiOperation({ summary: 'List collections', description: 'Public collection listing with pagination and search.' })
  @ApiPaginatedResponse(CollectionResponseDto)
  async findAll(@Query() query: CollectionQueryDto) {
    return this.collectionsService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get collection by ID', description: 'Returns the collection details along with its associated products.' })
  @ApiResponse({ status: 200, description: 'Collection found (includes products).' })
  @ApiResponse({ status: 404, description: 'Collection not found.' })
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.collectionsService.findOne(id);
  }
}
