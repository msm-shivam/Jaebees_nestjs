import {
  Controller,
  Post,
  Delete,
  Body,
  Param,
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
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('coupons')
export class CustomerCouponController {
  constructor(
    private readonly discountCalculationService: DiscountCalculationService,
    private readonly couponService: CouponService,
  ) {}

  @Post('validate')
  @ApiOperation({ summary: 'Validate a coupon code' })
  async validate(@Body() dto: ValidateCouponDto, @CurrentUser() user: any) {
    return this.discountCalculationService.applyCoupon(dto.code, {
      userId: user.id,
      orderAmount: dto.orderAmount ?? 0,
      isFirstOrder: false,
    });
  }

  @Post('apply')
  @ApiOperation({ summary: 'Apply a coupon to order' })
  async apply(@Body() dto: ApplyCouponDto, @CurrentUser() user: any) {
    return this.discountCalculationService.applyCoupon(dto.code, {
      userId: user.id,
      orderAmount: dto.orderAmount ?? 0,
      isFirstOrder: false,
    });
  }

  @Delete('remove')
  @ApiOperation({ summary: 'Remove applied coupon' })
  remove() {
    return { message: 'Coupon removed' };
  }
}
