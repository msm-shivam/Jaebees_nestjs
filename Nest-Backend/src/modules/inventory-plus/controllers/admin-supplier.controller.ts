import { Controller, Post, Get, Patch, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AdminJwtGuard } from '../../../common/guards/admin-jwt.guard';
import { PermissionsGuard } from '../../../common/guards/permissions.guard';
import { Permissions } from '../../../common/decorators/permissions.decorator';
import { DefaultPermissions } from '../../../common/constants/roles.constants';
import { SupplierService } from '../services/supplier.service';
import { CreateSupplierDto } from '../dto/create-supplier.dto';
import { UpdateSupplierDto } from '../dto/update-supplier.dto';
import { SupplierQueryDto } from '../dto/supplier-query.dto';

@ApiTags('Admin Suppliers')
@ApiBearerAuth()
@UseGuards(AdminJwtGuard, PermissionsGuard)
@Controller('admin/suppliers')
export class AdminSupplierController {
  constructor(private readonly supplierService: SupplierService) {}

  @Post()
  @Permissions(DefaultPermissions.SUPPLIER_CREATE)
  @ApiOperation({ summary: 'Create a supplier' })
  create(@Body() dto: CreateSupplierDto) {
    return this.supplierService.create(dto);
  }

  @Get()
  @Permissions(DefaultPermissions.SUPPLIER_VIEW)
  @ApiOperation({ summary: 'List all suppliers' })
  findAll(@Query() query: SupplierQueryDto) {
    return this.supplierService.findAll(query);
  }

  @Get(':id')
  @Permissions(DefaultPermissions.SUPPLIER_VIEW)
  @ApiOperation({ summary: 'Get supplier by ID' })
  findById(@Param('id') id: string) {
    return this.supplierService.findById(id);
  }

  @Patch(':id')
  @Permissions(DefaultPermissions.SUPPLIER_UPDATE)
  @ApiOperation({ summary: 'Update a supplier' })
  update(@Param('id') id: string, @Body() dto: UpdateSupplierDto) {
    return this.supplierService.update(id, dto);
  }

  @Delete(':id')
  @Permissions(DefaultPermissions.SUPPLIER_DELETE)
  @ApiOperation({ summary: 'Soft-delete a supplier' })
  remove(@Param('id') id: string) {
    return this.supplierService.remove(id);
  }
}
