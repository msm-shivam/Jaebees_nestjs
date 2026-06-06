import { Controller, Get, Post, Patch, Delete, Body, Param, Query, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ProductVariantsService } from './product-variants.service';
import { CreateProductVariantDto } from './dto/create-product-variant.dto';
import { UpdateProductVariantDto } from './dto/update-product-variant.dto';
import { ProductVariantQueryDto } from './dto/product-variant-query.dto';
import { ProductVariantResponseDto } from './dto/product-variant-response.dto';
import { AdminJwtGuard } from '../../common/guards/admin-jwt.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { Permissions } from '../../common/decorators/permissions.decorator';
import { DefaultPermissions } from '../../common/constants/roles.constants';
import { UseGuards } from '@nestjs/common';

@ApiTags('Product Variants')
@UseGuards(AdminJwtGuard, PermissionsGuard)
@Controller('admin/product-variants')
export class ProductVariantsController {
  constructor(private readonly productVariantsService: ProductVariantsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @Permissions(DefaultPermissions.VARIANT_CREATE)
  @ApiOperation({ summary: 'Create a new product variant', description: 'Creates a new product variant with optional attributes. SKU must be unique.' })
  @ApiResponse({ status: 201, description: 'Variant created successfully.', type: ProductVariantResponseDto })
  @ApiResponse({ status: 400, description: 'Invalid input or validation error.' })
  @ApiResponse({ status: 404, description: 'Product not found.' })
  async create(@Body() dto: CreateProductVariantDto) {
    return this.productVariantsService.create(dto);
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  @Permissions(DefaultPermissions.VARIANT_VIEW)
  @ApiOperation({ summary: 'List product variants with pagination and filtering' })
  @ApiResponse({ status: 200, description: 'Variants retrieved successfully.' })
  async findAll(@Query() query: ProductVariantQueryDto) {
    return this.productVariantsService.findAll(query);
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @Permissions(DefaultPermissions.VARIANT_VIEW)
  @ApiOperation({ summary: 'Get variant by ID' })
  @ApiResponse({ status: 200, description: 'Variant retrieved successfully.', type: ProductVariantResponseDto })
  @ApiResponse({ status: 404, description: 'Variant not found.' })
  async findOne(@Param('id') id: string) {
    return this.productVariantsService.findOne(id);
  }

  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  @Permissions(DefaultPermissions.VARIANT_UPDATE)
  @ApiOperation({ summary: 'Update a product variant', description: 'Update variant details. SKU must remain unique.' })
  @ApiResponse({ status: 200, description: 'Variant updated successfully.', type: ProductVariantResponseDto })
  @ApiResponse({ status: 400, description: 'Invalid input or validation error.' })
  @ApiResponse({ status: 404, description: 'Variant not found.' })
  async update(@Param('id') id: string, @Body() dto: UpdateProductVariantDto) {
    return this.productVariantsService.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @Permissions(DefaultPermissions.VARIANT_DELETE)
  @ApiOperation({ summary: 'Soft delete a product variant' })
  @ApiResponse({ status: 200, description: 'Variant deleted successfully.' })
  @ApiResponse({ status: 404, description: 'Variant not found.' })
  async remove(@Param('id') id: string) {
    return this.productVariantsService.remove(id);
  }

  @Patch(':id/default')
  @HttpCode(HttpStatus.OK)
  @Permissions(DefaultPermissions.VARIANT_UPDATE)
  @ApiOperation({ summary: 'Set variant as default', description: 'Sets a variant as the default variant for its product. Unsets previous default.' })
  @ApiResponse({ status: 200, description: 'Default variant set successfully.', type: ProductVariantResponseDto })
  @ApiResponse({ status: 404, description: 'Variant not found.' })
  async setAsDefault(@Param('id') id: string) {
    return this.productVariantsService.setAsDefault(id);
  }

  @Post(':id/attributes')
  @HttpCode(HttpStatus.CREATED)
  @Permissions(DefaultPermissions.VARIANT_UPDATE)
  @ApiOperation({ summary: 'Assign attributes to a variant', description: 'Assign attribute-value mappings to a variant. Prevents duplicate attributes.' })
  @ApiResponse({ status: 201, description: 'Attributes assigned successfully.' })
  @ApiResponse({ status: 400, description: 'Invalid input or duplicate attribute assignment.' })
  @ApiResponse({ status: 404, description: 'Variant, attribute, or attribute value not found.' })
  async assignAttributes(
    @Param('id') id: string,
    @Body() body: { attributes: Array<{ attributeId: string; attributeValueId: string }> },
  ) {
    return this.productVariantsService.assignAttributes(id, body.attributes);
  }

  @Delete(':id/attributes/:mappingId')
  @HttpCode(HttpStatus.OK)
  @Permissions(DefaultPermissions.VARIANT_UPDATE)
  @ApiOperation({ summary: 'Remove an attribute from a variant' })
  @ApiResponse({ status: 200, description: 'Attribute removed successfully.' })
  @ApiResponse({ status: 404, description: 'Variant or attribute mapping not found.' })
  async removeAttribute(@Param('id') id: string, @Param('mappingId') mappingId: string) {
    return this.productVariantsService.removeAttribute(id, mappingId);
  }
}
