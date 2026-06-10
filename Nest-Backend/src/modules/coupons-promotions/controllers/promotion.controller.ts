import { Controller, Post, Get, Patch, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AdminJwtGuard } from '../../../common/guards/admin-jwt.guard';
import { PermissionsGuard } from '../../../common/guards/permissions.guard';
import { Permissions } from '../../../common/decorators/permissions.decorator';
import { DefaultPermissions } from '../../../common/constants/roles.constants';
import { PromotionService } from '../services/promotion.service';
import { CreatePromotionDto } from '../dto/create-promotion.dto';
import { UpdatePromotionDto } from '../dto/update-promotion.dto';
import { PromotionQueryDto } from '../dto/promotion-query.dto';

@ApiTags('Admin Promotions')
@ApiBearerAuth()
@UseGuards(AdminJwtGuard, PermissionsGuard)
@Controller('admin/promotions')
export class PromotionController {
  constructor(private readonly promotionService: PromotionService) {}

  @Post()
  @Permissions(DefaultPermissions.PROMOTION_CREATE)
  @ApiOperation({ summary: 'Create a promotion' })
  create(@Body() dto: CreatePromotionDto) {
    return this.promotionService.create(dto);
  }

  @Get()
  @Permissions(DefaultPermissions.PROMOTION_VIEW)
  @ApiOperation({ summary: 'List all promotions' })
  findAll(@Query() query: PromotionQueryDto) {
    return this.promotionService.findAll(query);
  }

  @Get(':id')
  @Permissions(DefaultPermissions.PROMOTION_VIEW)
  @ApiOperation({ summary: 'Get promotion by ID' })
  findById(@Param('id') id: string) {
    return this.promotionService.findById(id);
  }

  @Patch(':id')
  @Permissions(DefaultPermissions.PROMOTION_UPDATE)
  @ApiOperation({ summary: 'Update a promotion' })
  update(@Param('id') id: string, @Body() dto: UpdatePromotionDto) {
    return this.promotionService.update(id, dto);
  }

  @Delete(':id')
  @Permissions(DefaultPermissions.PROMOTION_DELETE)
  @ApiOperation({ summary: 'Delete a promotion' })
  remove(@Param('id') id: string) {
    return this.promotionService.remove(id);
  }
}
