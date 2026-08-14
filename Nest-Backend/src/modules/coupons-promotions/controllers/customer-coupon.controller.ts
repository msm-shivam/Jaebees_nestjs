import {
  Controller,
  Post,
  Get,
  Delete,
  Body,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { DiscountCalculationService } from '../services/discount-calculation.service';
import { CouponService } from '../services/coupon.service';
import { ApplyCouponDto } from '../dto/apply-coupon.dto';
import { ValidateCouponDto } from '../dto/validate-coupon.dto';

@ApiTags('Coupons')
@Controller('coupons')
export class CustomerCouponController {
  constructor(
    private readonly discountCalculationService: DiscountCalculationService,
    private readonly couponService: CouponService,
  ) {}

  @Get('available')
  @ApiOperation({ summary: 'Get active public coupons' })
  async getAvailable() {
    const res = await this.couponService.findAll({ limit: 50 });
    const now = new Date();
    return res.items.filter(
      (c) => c.isActive && new Date(c.endDate) > now && new Date(c.startDate) <= now,
    );
  }

  @Post('validate')
  @ApiOperation({ summary: 'Validate a coupon code' })
  async validate(@Body() dto: ValidateCouponDto, @CurrentUser() user?: any) {
    const validUserId = user?.id && /^[0-9a-fA-F-]{36}$/.test(user.id) ? user.id : undefined;
    return this.discountCalculationService.applyCoupon(dto.code, {
      userId: validUserId,
      orderAmount: dto.orderAmount ?? 0,
    });
  }

  @Post('apply')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Apply a coupon to order' })
  async apply(@Body() dto: ApplyCouponDto, @CurrentUser() user: any) {
    return this.discountCalculationService.applyCoupon(dto.code, {
      userId: user.id,
      orderAmount: dto.orderAmount ?? 0,
    });
  }

  @Delete('remove')
  @ApiOperation({ summary: 'Remove applied coupon' })
  remove() {
    return { message: 'Coupon removed' };
  }
}
