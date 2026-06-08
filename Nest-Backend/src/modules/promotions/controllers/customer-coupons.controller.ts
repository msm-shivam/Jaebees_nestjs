import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  UseGuards,
  Req,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { DiscountEngineService } from '../services/discount-engine.service';
import { ApplyCouponDto } from '../dto/apply-coupon.dto';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import type { Request } from 'express';

interface ApplyCouponBody {
  orderAmount?: string | number;
  isFirstOrder?: boolean;
}

interface ValidateQuery {
  orderAmount?: string;
  isFirstOrder?: string;
}

@ApiTags('Customer Coupons')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('coupons')
export class CustomerCouponsController {
  constructor(private readonly discountEngineService: DiscountEngineService) {}

  @Post('apply')
  @ApiOperation({ summary: 'Apply a coupon code to current order' })
  async applyCoupon(@Body() dto: ApplyCouponDto, @Req() req: Request) {
    const body = req.body as ApplyCouponBody;
    const userId: string = (req.user as Record<string, unknown>).id as string;
    const orderAmount = parseFloat(body?.orderAmount?.toString() || '0');
    const isFirstOrder = body?.isFirstOrder === true;

    return this.discountEngineService.applyCoupon(dto.code, {
      userId,
      orderAmount,
      isFirstOrder,
    });
  }

  @Get('validate/:code')
  @ApiOperation({ summary: 'Validate a coupon code' })
  async validateCoupon(@Param('code') code: string, @Req() req: Request) {
    const query = req.query as ValidateQuery;
    const userId: string = (req.user as Record<string, unknown>).id as string;
    const orderAmount = parseFloat(query?.orderAmount || '0');
    const isFirstOrder = query?.isFirstOrder === 'true';

    return this.discountEngineService.applyCoupon(code, {
      userId,
      orderAmount,
      isFirstOrder,
    });
  }
}
