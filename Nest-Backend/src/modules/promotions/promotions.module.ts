import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Coupon } from './entities/coupon.entity';
import { Promotion } from './entities/promotion.entity';
import { DiscountRule } from './entities/discount-rule.entity';
import { CouponUsage } from './entities/coupon-usage.entity';
import { CouponsService } from './services/coupons.service';
import { PromotionsService } from './services/promotions.service';
import { DiscountEngineService } from './services/discount-engine.service';
import { CouponUsageService } from './services/coupon-usage.service';
import { CouponsController } from './controllers/coupons.controller';
import { PromotionsController } from './controllers/promotions.controller';
import { CustomerCouponsController } from './controllers/customer-coupons.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([Coupon, Promotion, DiscountRule, CouponUsage]),
  ],
  controllers: [
    CouponsController,
    PromotionsController,
    CustomerCouponsController,
  ],
  providers: [
    CouponsService,
    PromotionsService,
    DiscountEngineService,
    CouponUsageService,
  ],
  exports: [
    CouponsService,
    PromotionsService,
    DiscountEngineService,
    CouponUsageService,
  ],
})
export class PromotionsModule {}
