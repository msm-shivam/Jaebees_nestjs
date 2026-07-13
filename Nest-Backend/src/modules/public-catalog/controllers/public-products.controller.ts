import { Controller, Get, Param, ParseUUIDPipe, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ProductsService } from '../../products/products.service';
import { ProductQueryDto } from '../../products/dto/product-query.dto';
import { ProductResponseDto } from '../../products/dto/product-response.dto';
import { ProductStatus } from '../../products/entities/product.entity';
import { ApiPaginatedResponse } from '../../../common/decorators/api-paginated-response.decorator';

@ApiTags('Products')
@ApiBearerAuth('JWT')
@Controller('products')
export class PublicProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get()
  @ApiOperation({ summary: 'List products', description: 'Public product listing with pagination, search, and filtering by brand, category, status, and featured flag.' })
  @ApiPaginatedResponse(ProductResponseDto)
  async findAll(@Query() query: ProductQueryDto) {
    const publicQuery = { ...query, status: ProductStatus.ACTIVE };
    return this.productsService.findAll(publicQuery as ProductQueryDto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get product by ID' })
  @ApiResponse({ status: 200, description: 'Product found.', type: ProductResponseDto })
  @ApiResponse({ status: 404, description: 'Product not found.' })
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.productsService.findOne(id);
  }
}
