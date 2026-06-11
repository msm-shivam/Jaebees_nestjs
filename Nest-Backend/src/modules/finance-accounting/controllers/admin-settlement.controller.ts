import {
  Controller, Get, Post, Patch, Body, Param, Query, UseGuards, ParseUUIDPipe,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { AdminJwtGuard } from '../../../common/guards/admin-jwt.guard';
import { PermissionsGuard } from '../../../common/guards/permissions.guard';
import { Permissions } from '../../../common/decorators/permissions.decorator';
import { DefaultPermissions } from '../../../common/constants/roles.constants';
import { SettlementService } from '../services/settlement.service';
import type { CreateSettlementDto } from '../dto/create-settlement.dto';
import type { UpdateSettlementDto } from '../dto/update-settlement.dto';

@ApiTags('Admin — Settlements')
@ApiBearerAuth('JWT')
@UseGuards(AdminJwtGuard, PermissionsGuard)
@Controller('admin/settlements')
export class AdminSettlementController {
  constructor(private readonly settlementService: SettlementService) {}

  @Post()
  @Permissions(DefaultPermissions.SETTLEMENT_MANAGE)
  async create(@Body() dto: CreateSettlementDto) {
    return this.settlementService.create(dto);
  }

  @Get()
  @Permissions(DefaultPermissions.SETTLEMENT_VIEW)
  async findAll(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('status') status?: string,
    @Query('supplierId') supplierId?: string,
  ) {
    return this.settlementService.findAll({ page, limit, status, supplierId });
  }

  @Get(':id')
  @Permissions(DefaultPermissions.SETTLEMENT_VIEW)
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.settlementService.findOne(id);
  }

  @Patch(':id')
  @Permissions(DefaultPermissions.SETTLEMENT_MANAGE)
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateSettlementDto,
  ) {
    return this.settlementService.update(id, dto);
  }
}
