import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { InventoryService } from './inventory.service';
import { CreateInventoryDto } from './dto/create-inventory.dto';
import { UpdateInventoryDto } from './dto/update-inventory.dto';
import { AdjustInventoryDto } from './dto/adjust-inventory.dto';
import { ReserveInventoryDto } from './dto/reserve-inventory.dto';
import { ReleaseInventoryDto } from './dto/release-inventory.dto';
import { InventoryResponseDto } from './dto/inventory-response.dto';
import { InventoryQueryDto } from './dto/inventory-query.dto';
import { AdminJwtGuard } from '../../common/guards/admin-jwt.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { Permissions } from '../../common/decorators/permissions.decorator';
import { DefaultPermissions } from '../../common/constants/roles.constants';
import { UseGuards } from '@nestjs/common';
import { CurrentAdmin } from 'src/common/decorators/current-admin.decorator';

@ApiTags('Inventory')
@UseGuards(AdminJwtGuard, PermissionsGuard)
@Controller('admin/inventory')
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  @Get('variants')
  @HttpCode(HttpStatus.OK)
  @Permissions(DefaultPermissions.INVENTORY_VIEW)
  @ApiOperation({
    summary: 'Search variants for inventory creation',
    description:
      'Search variants by SKU or barcode to easily select when creating inventory.',
  })
  @ApiQuery({
    name: 'search',
    required: false,
    description: 'Search term for variant SKU or barcode',
  })
  async findVariants(@Query('search') search?: string) {
    return this.inventoryService.findVariants(search);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @Permissions(DefaultPermissions.INVENTORY_CREATE)
  @ApiOperation({
    summary: 'Create inventory record',
    description:
      'Creates an inventory record for a variant. Only one inventory per variant allowed. Accepts variantId or variantSku.',
  })
  @ApiResponse({
    status: 201,
    description: 'Inventory created successfully.',
    type: InventoryResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid input or inventory already exists.',
  })
  @ApiResponse({ status: 404, description: 'Variant not found.' })
  async create(@Body() dto: CreateInventoryDto,@CurrentAdmin() admin: any,) {
    return this.inventoryService.create(dto,admin.sub);
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  @Permissions(DefaultPermissions.INVENTORY_VIEW)
  @ApiOperation({ summary: 'List inventory records with pagination' })
  @ApiResponse({
    status: 200,
    description: 'Inventory records retrieved successfully.',
  })
  async findAll(@Query() query: InventoryQueryDto) {
    return this.inventoryService.findAll(query);
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @Permissions(DefaultPermissions.INVENTORY_VIEW)
  @ApiOperation({ summary: 'Get inventory by ID' })
  @ApiResponse({
    status: 200,
    description: 'Inventory retrieved successfully.',
    type: InventoryResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Inventory not found.' })
  async findOne(@Param('id') id: string) {
    return this.inventoryService.findOne(id);
  }

  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  @Permissions(DefaultPermissions.INVENTORY_UPDATE)
  @ApiOperation({ summary: 'Update inventory record' })
  @ApiResponse({
    status: 200,
    description: 'Inventory updated successfully.',
    type: InventoryResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid input or validation error.',
  })
  @ApiResponse({ status: 404, description: 'Inventory not found.' })
  async update(@Param('id') id: string, @Body() dto: UpdateInventoryDto) {
    return this.inventoryService.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @Permissions(DefaultPermissions.INVENTORY_DELETE)
  @ApiOperation({ summary: 'Delete inventory record' })
  @ApiResponse({ status: 200, description: 'Inventory deleted successfully.' })
  @ApiResponse({ status: 404, description: 'Inventory not found.' })
  async remove(@Param('id') id: string) {
    return this.inventoryService.remove(id);
  }

  @Patch(':id/adjust')
  @HttpCode(HttpStatus.OK)
  @Permissions(DefaultPermissions.INVENTORY_ADJUST)
  @ApiOperation({
    summary: 'Adjust stock quantity',
    description: 'Adjust stock quantity (positive to add, negative to remove).',
  })
  @ApiResponse({
    status: 200,
    description: 'Stock adjusted successfully.',
    type: InventoryResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Invalid adjustment amount.' })
  @ApiResponse({ status: 404, description: 'Inventory not found.' })
  async adjust(@Param('id') id: string, @Body() dto: AdjustInventoryDto, @CurrentAdmin() admin: any) {
    return this.inventoryService.adjust(id, dto, admin?.sub);
  }

  @Patch(':id/reserve')
  @HttpCode(HttpStatus.OK)
  @Permissions(DefaultPermissions.INVENTORY_ADJUST)
  @ApiOperation({
    summary: 'Reserve stock for order',
    description: 'Reserve stock quantity for an order. Checks availability.',
  })
  @ApiResponse({
    status: 200,
    description: 'Stock reserved successfully.',
    type: InventoryResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Insufficient stock available.' })
  @ApiResponse({ status: 404, description: 'Inventory not found.' })
  async reserve(@Param('id') id: string, @Body() dto: ReserveInventoryDto, @CurrentAdmin() admin: any) {
    return this.inventoryService.reserve(id, dto, admin?.sub);
  }

  @Patch(':id/release')
  @HttpCode(HttpStatus.OK)
  @Permissions(DefaultPermissions.INVENTORY_ADJUST)
  @ApiOperation({
    summary: 'Release reserved stock',
    description: 'Release reserved stock (e.g., order cancelled).',
  })
  @ApiResponse({
    status: 200,
    description: 'Stock released successfully.',
    type: InventoryResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Cannot release more than reserved.',
  })
  @ApiResponse({ status: 404, description: 'Inventory not found.' })
  async release(@Param('id') id: string, @Body() dto: ReleaseInventoryDto, @CurrentAdmin() admin: any) {
    return this.inventoryService.release(id, dto, admin?.sub);
  }
}
