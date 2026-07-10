import { Controller, Get, Param, ParseUUIDPipe, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { SubCategoriesService } from '../../sub-categories/sub-categories.service';
import { SubCategoryQueryDto } from '../../sub-categories/dto/sub-category-query.dto';
import { SubCategoryResponseDto } from '../../sub-categories/dto/sub-category-response.dto';
import { ApiPaginatedResponse } from '../../../common/decorators/api-paginated-response.decorator';

@ApiTags('Sub Categories')
@ApiBearerAuth('JWT')
@Controller('sub-categories')
export class PublicSubCategoriesController {
  constructor(private readonly subCategoriesService: SubCategoriesService) {}

  @Get()
  @ApiOperation({ summary: 'List sub categories', description: 'Public sub-category listing with pagination and filtering by parent category.' })
  @ApiPaginatedResponse(SubCategoryResponseDto)
  async findAll(@Query() query: SubCategoryQueryDto) {
    return this.subCategoriesService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get sub category by ID' })
  @ApiResponse({ status: 200, description: 'Sub category found.', type: SubCategoryResponseDto })
  @ApiResponse({ status: 404, description: 'Sub category not found.' })
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.subCategoriesService.findOne(id);
  }
}
