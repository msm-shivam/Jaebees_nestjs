import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan, MoreThan } from 'typeorm';
import { Coupon } from '../entities/coupon.entity';
import { Promotion } from '../entities/promotion.entity';
import { CouponUsageService } from './coupon-usage.service';
import { CouponValidationService, CouponValidationContext } from './coupon-validation.service';
import { CouponType } from '../enums/coupon-type.enum';
import { PromotionType } from '../enums/promotion-type.enum';
import { DiscountResponseDto } from '../dto/discount-response.dto';

export interface DiscountContext {
  userId: string;
  orderAmount: number;
  isFirstOrder: boolean;
}

@Injectable()
export class DiscountCalculationService {
  constructor(
    @InjectRepository(Coupon)
    private readonly couponRepository: Repository<Coupon>,
    @InjectRepository(Promotion)
    private readonly promotionRepository: Repository<Promotion>,
    private readonly couponValidationService: CouponValidationService,
    private readonly couponUsageService: CouponUsageService,
  ) {}

  async applyCoupon(code: string, context: DiscountContext): Promise<DiscountResponseDto> {
    const coupon = await this.couponRepository.findOne({ where: { code: code.toUpperCase() } });
    if (!coupon) {
      return { valid: false, message: 'Coupon not found', discountAmount: 0, finalAmount: context.orderAmount };
    }

    try {
      await this.couponValidationService.validate(coupon, context);
    } catch (err: any) {
      return { valid: false, message: err.message, discountAmount: 0, finalAmount: context.orderAmount };
    }

    const discountAmount = this.couponValidationService.calculateDiscount(coupon, context.orderAmount);
    const finalAmount = Math.max(0, context.orderAmount - discountAmount);

    return {
      valid: true,
      couponId: coupon.id,
      couponCode: coupon.code,
      discountAmount,
      finalAmount,
    };
  }

  async applyBestPromotion(context: DiscountContext): Promise<DiscountResponseDto> {
    const now = new Date();
    const promotions = await this.promotionRepository.find({
      where: {
        isActive: true,
        startDate: LessThan(now),
        endDate: MoreThan(now),
      },
      order: { priority: 'DESC' },
    });

    if (!promotions.length) {
      return { valid: false, message: 'No active promotions', discountAmount: 0, finalAmount: context.orderAmount };
    }

    const bestPromotion = promotions[0];
    let discountAmount = 0;

    if (bestPromotion.type === PromotionType.FLASH_SALE || bestPromotion.type === PromotionType.CART_DISCOUNT) {
      discountAmount = (context.orderAmount * bestPromotion.discountValue) / 100;
    }

    const finalAmount = Math.max(0, context.orderAmount - discountAmount);

    return {
      valid: true,
      couponId: bestPromotion.id,
      couponCode: bestPromotion.name,
      discountAmount,
      finalAmount,
    };
  }

  async recordCouponUsage(couponId: string, userId: string, orderId: string, discountAmount: number): Promise<void> {
    await this.couponUsageService.recordUsage(couponId, userId, orderId, discountAmount);
    await this.couponRepository.increment({ id: couponId }, 'usageCount', 1);
  }
}
