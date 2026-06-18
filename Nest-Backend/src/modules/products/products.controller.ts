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
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ProductQueryDto } from './dto/product-query.dto';
import { ProductResponseDto } from './dto/product-response.dto';
import { BulkDeleteDto } from './dto/bulk-delete.dto';
import { CreateProductImageDto } from './dto/create-product-image.dto';
import { UpdateProductImageDto } from './dto/update-product-image.dto';
import { ProductImageResponseDto } from './dto/product-image-response.dto';
import { AdminJwtGuard } from '../../common/guards/admin-jwt.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { Permissions } from '../../common/decorators/permissions.decorator';
import { DefaultPermissions } from '../../common/constants/roles.constants';
import { ApiPaginatedResponse } from '../../common/decorators/api-paginated-response.decorator';
import { FilesInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';

@ApiTags('Admin — Products')
@ApiBearerAuth('JWT')
@UseGuards(AdminJwtGuard, PermissionsGuard)
@Controller('admin/products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  // ─── Product CRUD ──────────────────────────────────────────────────────────

  @Post()
  @UseInterceptors(
    FilesInterceptor('images', 5, {
      storage: diskStorage({
        destination: './uploads/products',
        filename: (req, file, cb) => {
          cb(null, `${Date.now()}-${file.originalname}`);
        },
      }),
    }),
  )
  @ApiConsumes('multipart/form-data')
  @HttpCode(HttpStatus.CREATED)
  @Permissions(DefaultPermissions.PRODUCT_CREATE)
  @ApiOperation({
    summary: 'Create a new product',
    description:
      'Creates a new product with optional collections, tags, and up to 5 image uploads. Slug is auto-generated from name if not provided.',
  })
  @ApiBody({ type: CreateProductDto })
  @ApiResponse({
    status: 201,
    description: 'Product created successfully.',
    type: ProductResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid input or validation error.',
  })
  async create(
    @Body() dto: CreateProductDto,
    @UploadedFiles() files?: Express.Multer.File[],
  ) {
    return this.productsService.create(dto, files);
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  @Permissions(DefaultPermissions.PRODUCT_VIEW)
  @ApiOperation({ summary: 'List products with pagination and filtering' })
  @ApiPaginatedResponse(ProductResponseDto)
  async findAll(@Query() query: ProductQueryDto) {
    return this.productsService.findAll(query);
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @Permissions(DefaultPermissions.PRODUCT_VIEW)
  @ApiOperation({ summary: 'Get product by ID' })
  @ApiResponse({
    status: 200,
    description: 'Product returned.',
    type: ProductResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Product not found.' })
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.productsService.findOne(id);
  }

  @Patch(':id')
  @UseInterceptors(
    FilesInterceptor('images', 5, {
      storage: diskStorage({
        destination: './uploads/products',
        filename: (req, file, cb) => {
          cb(null, `${Date.now()}-${file.originalname}`);
        },
      }),
    }),
  )
  @ApiConsumes('multipart/form-data')
  @HttpCode(HttpStatus.OK)
  @Permissions(DefaultPermissions.PRODUCT_UPDATE)
  @ApiOperation({
    summary: 'Update a product',
    description:
      'Update product details and optionally upload up to 5 images (adds to existing images). Does not modify collections or tags.',
  })
  @ApiBody({ type: UpdateProductDto })
  @ApiResponse({
    status: 200,
    description: 'Product updated successfully.',
    type: ProductResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Product not found.' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateProductDto,
    @UploadedFiles() files?: Express.Multer.File[],
  ) {
    return this.productsService.update(id, dto, files);
  }

  @Delete('bulk')
  @HttpCode(HttpStatus.OK)
  @Permissions(DefaultPermissions.PRODUCT_DELETE)
  @ApiOperation({
    summary: 'Bulk delete products',
    description: 'Soft deletes multiple products by their IDs.',
  })
  @ApiBody({ type: BulkDeleteDto })
  @ApiResponse({
    status: 200,
    description: 'Products deleted successfully.',
  })
  @ApiResponse({ status: 400, description: 'Invalid IDs.' })
  async bulkRemove(@Body() dto: BulkDeleteDto) {
    return this.productsService.bulkRemove(dto.ids);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @Permissions(DefaultPermissions.PRODUCT_DELETE)
  @ApiOperation({
    summary: 'Soft delete a product',
    description: 'Soft deletes a product. Can be restored.',
  })
  @ApiResponse({ status: 200, description: 'Product deleted successfully.' })
  @ApiResponse({ status: 404, description: 'Product not found.' })
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.productsService.remove(id);
  }

  // ─── Product Status ────────────────────────────────────────────────────────

  @Patch(':id/publish')
  @HttpCode(HttpStatus.OK)
  @Permissions(DefaultPermissions.PRODUCT_PUBLISH)
  @ApiOperation({
    summary: 'Publish a product',
    description:
      'Sets product status to ACTIVE, making it visible in the catalog.',
  })
  @ApiResponse({
    status: 200,
    description: 'Product published successfully.',
    type: ProductResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Product not found.' })
  async publish(@Param('id', ParseUUIDPipe) id: string) {
    return this.productsService.publish(id);
  }

  @Patch(':id/archive')
  @HttpCode(HttpStatus.OK)
  @Permissions(DefaultPermissions.PRODUCT_ARCHIVE)
  @ApiOperation({
    summary: 'Archive a product',
    description:
      'Sets product status to ARCHIVED, removing it from the catalog.',
  })
  @ApiResponse({
    status: 200,
    description: 'Product archived successfully.',
    type: ProductResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Product not found.' })
  async archive(@Param('id', ParseUUIDPipe) id: string) {
    return this.productsService.archive(id);
  }

  // ─── Collections ──────────────────────────────────────────────────────────

  @Post(':id/collections')
  @HttpCode(HttpStatus.CREATED)
  @Permissions(DefaultPermissions.PRODUCT_UPDATE)
  @ApiOperation({
    summary: 'Assign collections to a product',
    description:
      'Assign one or more collections to a product. Prevents duplicate assignments.',
  })
  @ApiResponse({
    status: 201,
    description: 'Collections assigned successfully.',
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid input or duplicate collection assignment.',
  })
  @ApiResponse({ status: 404, description: 'Product or collection not found.' })
  async assignCollections(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: { collectionIds: string[] },
  ) {
    return this.productsService.assignCollections(id, body.collectionIds);
  }

  @Delete(':id/collections/:collectionId')
  @HttpCode(HttpStatus.OK)
  @Permissions(DefaultPermissions.PRODUCT_UPDATE)
  @ApiOperation({
    summary: 'Remove a collection from a product',
    description: 'Removes a specific collection assignment from a product.',
  })
  @ApiResponse({ status: 200, description: 'Collection removed successfully.' })
  @ApiResponse({
    status: 404,
    description: 'Product, collection, or mapping not found.',
  })
  async removeCollection(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('collectionId', ParseUUIDPipe) collectionId: string,
  ) {
    return this.productsService.removeCollection(id, collectionId);
  }

  // ─── Tags ─────────────────────────────────────────────────────────────────

  @Post(':id/tags')
  @HttpCode(HttpStatus.CREATED)
  @Permissions(DefaultPermissions.PRODUCT_UPDATE)
  @ApiOperation({
    summary: 'Assign tags to a product',
    description:
      'Assign one or more tags to a product. Prevents duplicate assignments.',
  })
  @ApiResponse({ status: 201, description: 'Tags assigned successfully.' })
  @ApiResponse({
    status: 400,
    description: 'Invalid input or duplicate tag assignment.',
  })
  @ApiResponse({ status: 404, description: 'Product or tag not found.' })
  async assignTags(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: { tagIds: string[] },
  ) {
    return this.productsService.assignTags(id, body.tagIds);
  }

  @Delete(':id/tags/:tagId')
  @HttpCode(HttpStatus.OK)
  @Permissions(DefaultPermissions.PRODUCT_UPDATE)
  @ApiOperation({
    summary: 'Remove a tag from a product',
    description: 'Removes a specific tag assignment from a product.',
  })
  @ApiResponse({ status: 200, description: 'Tag removed successfully.' })
  @ApiResponse({
    status: 404,
    description: 'Product, tag, or mapping not found.',
  })
  async removeTag(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('tagId', ParseUUIDPipe) tagId: string,
  ) {
    return this.productsService.removeTag(id, tagId);
  }

  // ─── Images ───────────────────────────────────────────────────────────────

  @Post(':id/images')
  @HttpCode(HttpStatus.CREATED)
  @Permissions(DefaultPermissions.PRODUCT_UPDATE)
  @ApiOperation({
    summary: 'Add an image to a product',
    description:
      'Adds a new image to a product. Only one image can be primary per product.',
  })
  @ApiResponse({
    status: 201,
    description: 'Image added successfully.',
    type: ProductImageResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Invalid input.' })
  @ApiResponse({ status: 404, description: 'Product not found.' })
  async addImage(@Body() dto: CreateProductImageDto) {
    return this.productsService.addImage(dto);
  }

  @Get(':id/images')
  @HttpCode(HttpStatus.OK)
  @Permissions(DefaultPermissions.PRODUCT_VIEW)
  @ApiOperation({
    summary: 'Get all images for a product',
    description: 'Retrieves all images for a product, sorted by sort_order.',
  })
  @ApiResponse({ status: 200, description: 'Images retrieved successfully.' })
  @ApiResponse({ status: 404, description: 'Product not found.' })
  async getImages(@Param('id', ParseUUIDPipe) id: string) {
    return this.productsService.getImages(id);
  }

  @Patch('images/:imageId')
  @HttpCode(HttpStatus.OK)
  @Permissions(DefaultPermissions.PRODUCT_UPDATE)
  @ApiOperation({
    summary: 'Update a product image',
    description: 'Updates image details like URL, alt text, or sort order.',
  })
  @ApiResponse({
    status: 200,
    description: 'Image updated successfully.',
    type: ProductImageResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Invalid input.' })
  @ApiResponse({ status: 404, description: 'Image not found.' })
  async updateImage(
    @Param('imageId', ParseUUIDPipe) imageId: string,
    @Body() dto: UpdateProductImageDto,
  ) {
    return this.productsService.updateImage(imageId, dto);
  }

  @Delete('images/:imageId')
  @HttpCode(HttpStatus.OK)
  @Permissions(DefaultPermissions.PRODUCT_UPDATE)
  @ApiOperation({
    summary: 'Delete a product image',
    description: 'Soft deletes a product image. Can be restored.',
  })
  @ApiResponse({ status: 200, description: 'Image deleted successfully.' })
  @ApiResponse({ status: 404, description: 'Image not found.' })
  async removeImage(@Param('imageId', ParseUUIDPipe) imageId: string) {
    return this.productsService.removeImage(imageId);
  }

  @Patch('images/:imageId/primary')
  @HttpCode(HttpStatus.OK)
  @Permissions(DefaultPermissions.PRODUCT_UPDATE)
  @ApiOperation({
    summary: 'Set a product image as primary',
    description:
      'Sets an image as the primary image for a product. Unsets previous primary image.',
  })
  @ApiResponse({
    status: 200,
    description: 'Primary image set successfully.',
    type: ProductImageResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Image not found.' })
  async setPrimaryImage(@Param('imageId', ParseUUIDPipe) imageId: string) {
    return this.productsService.setPrimaryImage(imageId);
  }
}
