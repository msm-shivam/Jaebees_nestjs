import { Controller, Get, Param, ParseUUIDPipe, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CategoriesService } from '../../categories/categories.service';
import { CategoryQueryDto } from '../../categories/dto/category-query.dto';
import { CategoryResponseDto } from '../../categories/dto/category-response.dto';
import { ApiPaginatedResponse } from '../../../common/decorators/api-paginated-response.decorator';

@ApiTags('Categories')
@ApiBearerAuth('JWT')
@Controller('categories')
export class PublicCategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Get()
  @ApiOperation({ summary: 'List categories', description: 'Public category listing with pagination and search.' })
  @ApiPaginatedResponse(CategoryResponseDto)
  async findAll(@Query() query: CategoryQueryDto) {
    return this.categoriesService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get category by ID' })
  @ApiResponse({ status: 200, description: 'Category found.', type: CategoryResponseDto })
  @ApiResponse({ status: 404, description: 'Category not found.' })
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.categoriesService.findOne(id);
  }
}
