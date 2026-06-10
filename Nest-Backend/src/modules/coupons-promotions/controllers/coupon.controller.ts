import { Controller, Post, Get, Patch, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AdminJwtGuard } from '../../../common/guards/admin-jwt.guard';
import { PermissionsGuard } from '../../../common/guards/permissions.guard';
import { Permissions } from '../../../common/decorators/permissions.decorator';
import { DefaultPermissions } from '../../../common/constants/roles.constants';
import { CouponService } from '../services/coupon.service';
import { CreateCouponDto } from '../dto/create-coupon.dto';
import { UpdateCouponDto } from '../dto/update-coupon.dto';
import { CouponQueryDto } from '../dto/coupon-query.dto';

@ApiTags('Admin Coupons')
@ApiBearerAuth()
@UseGuards(AdminJwtGuard, PermissionsGuard)
@Controller('admin/coupons')
export class CouponController {
  constructor(private readonly couponService: CouponService) {}

  @Post()
  @Permissions(DefaultPermissions.COUPON_CREATE)
  @ApiOperation({ summary: 'Create a coupon' })
  create(@Body() dto: CreateCouponDto) {
    return this.couponService.create(dto);
  }

  @Get()
  @Permissions(DefaultPermissions.COUPON_VIEW)
  @ApiOperation({ summary: 'List all coupons' })
  findAll(@Query() query: CouponQueryDto) {
    return this.couponService.findAll(query);
  }

  @Get(':id')
  @Permissions(DefaultPermissions.COUPON_VIEW)
  @ApiOperation({ summary: 'Get coupon by ID' })
  findById(@Param('id') id: string) {
    return this.couponService.findById(id);
  }

  @Patch(':id')
  @Permissions(DefaultPermissions.COUPON_UPDATE)
  @ApiOperation({ summary: 'Update a coupon' })
  update(@Param('id') id: string, @Body() dto: UpdateCouponDto) {
    return this.couponService.update(id, dto);
  }

  @Delete(':id')
  @Permissions(DefaultPermissions.COUPON_DELETE)
  @ApiOperation({ summary: 'Delete a coupon' })
  remove(@Param('id') id: string) {
    return this.couponService.remove(id);
  }
}
