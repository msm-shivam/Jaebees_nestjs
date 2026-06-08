import {
  Controller,
  Post,
  Get,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { CouponsService } from '../services/coupons.service';
import { CreateCouponDto } from '../dto/create-coupon.dto';
import { UpdateCouponDto } from '../dto/update-coupon.dto';
import { CouponQueryDto } from '../dto/coupon-query.dto';
import { AdminJwtGuard } from '../../../common/guards/admin-jwt.guard';
import { PermissionsGuard } from '../../../common/guards/permissions.guard';
import { Permissions } from '../../../common/decorators/permissions.decorator';
import { DefaultPermissions } from '../../../common/constants/roles.constants';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import type { JwtPayload } from '../../../common/decorators/current-user.decorator';

@ApiTags('Admin Coupons')
@ApiBearerAuth()
@UseGuards(AdminJwtGuard, PermissionsGuard)
@Controller('admin/coupons')
export class CouponsController {
  constructor(private readonly couponsService: CouponsService) {}

  @Post()
  @Permissions(DefaultPermissions.COUPON_CREATE)
  @ApiOperation({ summary: 'Create a new coupon' })
  create(@Body() dto: CreateCouponDto, @CurrentUser() user: JwtPayload) {
    return this.couponsService.create(dto, user.sub);
  }

  @Get()
  @Permissions(DefaultPermissions.COUPON_VIEW)
  @ApiOperation({ summary: 'List all coupons' })
  findAll(@Query() query: CouponQueryDto) {
    return this.couponsService.findAll(query);
  }

  @Get(':id')
  @Permissions(DefaultPermissions.COUPON_VIEW)
  @ApiOperation({ summary: 'Get coupon by ID' })
  findOne(@Param('id') id: string) {
    return this.couponsService.findById(id);
  }

  @Patch(':id')
  @Permissions(DefaultPermissions.COUPON_UPDATE)
  @ApiOperation({ summary: 'Update a coupon' })
  update(@Param('id') id: string, @Body() dto: UpdateCouponDto) {
    return this.couponsService.update(id, dto);
  }

  @Delete(':id')
  @Permissions(DefaultPermissions.COUPON_DELETE)
  @ApiOperation({ summary: 'Delete a coupon (soft)' })
  remove(@Param('id') id: string) {
    return this.couponsService.remove(id);
  }
}
