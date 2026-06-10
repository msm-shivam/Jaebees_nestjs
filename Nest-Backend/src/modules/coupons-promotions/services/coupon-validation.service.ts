import { Injectable, BadRequestException } from '@nestjs/common';
import { Coupon } from '../entities/coupon.entity';
import { CouponType } from '../enums/coupon-type.enum';
import { CouponUsageService } from './coupon-usage.service';

export interface CouponValidationContext {
  userId: string;
  orderAmount: number;
  isFirstOrder: boolean;
}

@Injectable()
export class CouponValidationService {
  constructor(private readonly couponUsageService: CouponUsageService) {}

  async validate(coupon: Coupon, context: CouponValidationContext): Promise<void> {
    if (!coupon.isActive) {
      throw new BadRequestException('Coupon is disabled');
    }

    const now = new Date();
    if (now < coupon.startDate) {
      throw new BadRequestException('Coupon is not yet active');
    }
    if (now > coupon.endDate) {
      throw new BadRequestException('Coupon has expired');
    }

    if (coupon.maxUses && coupon.usageCount >= coupon.maxUses) {
      throw new BadRequestException('Coupon usage limit has been reached');
    }

    if (coupon.minimumOrderAmount > 0 && context.orderAmount < coupon.minimumOrderAmount) {
      throw new BadRequestException(
        `Minimum order amount of ${coupon.minimumOrderAmount} required`,
      );
    }

    if (coupon.firstOrderOnly && !context.isFirstOrder) {
      throw new BadRequestException('This coupon is for first order only');
    }

    if (coupon.maxUsesPerUser) {
      const userUsageCount = await this.couponUsageService.getUserUsageCount(coupon.id, context.userId);
      if (userUsageCount >= coupon.maxUsesPerUser) {
        throw new BadRequestException('You have reached the usage limit for this coupon');
      }
    }
  }

  calculateDiscount(coupon: Coupon, orderAmount: number): number {
    let discount = 0;

    if (coupon.type === CouponType.FREE_SHIPPING) {
      return 0;
    }

    if (coupon.type === CouponType.PERCENTAGE) {
      discount = (orderAmount * coupon.value) / 100;
    } else if (coupon.type === CouponType.FIXED_AMOUNT) {
      discount = coupon.value;
    }

    if (coupon.maximumDiscountAmount) {
      discount = Math.min(discount, coupon.maximumDiscountAmount);
    }

    return Math.min(discount, orderAmount);
  }
}
