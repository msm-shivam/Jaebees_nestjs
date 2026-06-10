import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Coupon } from './entities/coupon.entity';
import { CouponUsage } from './entities/coupon-usage.entity';
import { Promotion } from './entities/promotion.entity';
import { PromotionProduct } from './entities/promotion-product.entity';
import { PromotionCategory } from './entities/promotion-category.entity';
import { Campaign } from './entities/campaign.entity';
import { CouponService } from './services/coupon.service';
import { CouponUsageService } from './services/coupon-usage.service';
import { CouponValidationService } from './services/coupon-validation.service';
import { PromotionService } from './services/promotion.service';
import { CampaignService } from './services/campaign.service';
import { DiscountCalculationService } from './services/discount-calculation.service';
import { AnalyticsService } from './services/analytics.service';
import { CouponController } from './controllers/coupon.controller';
import { PromotionController } from './controllers/promotion.controller';
import { CampaignController } from './controllers/campaign.controller';
import { CustomerCouponController } from './controllers/customer-coupon.controller';
import { CustomerPromotionController } from './controllers/customer-promotion.controller';
import { AnalyticsController } from './controllers/analytics.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Coupon,
      CouponUsage,
      Promotion,
      PromotionProduct,
      PromotionCategory,
      Campaign,
    ]),
  ],
  controllers: [
    CouponController,
    PromotionController,
    CampaignController,
    CustomerCouponController,
    CustomerPromotionController,
    AnalyticsController,
  ],
  providers: [
    CouponService,
    CouponUsageService,
    CouponValidationService,
    PromotionService,
    CampaignService,
    DiscountCalculationService,
    AnalyticsService,
  ],
  exports: [
    CouponService,
    CouponUsageService,
    PromotionService,
    CampaignService,
    DiscountCalculationService,
  ],
})
export class CouponsPromotionsModule {}
