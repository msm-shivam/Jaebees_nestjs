import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThanOrEqual, MoreThanOrEqual } from 'typeorm';
import { Coupon } from '../entities/coupon.entity';
import { Promotion } from '../entities/promotion.entity';
import { DiscountRule } from '../entities/discount-rule.entity';
import { CouponUsage } from '../entities/coupon-usage.entity';
import { DiscountType } from '../enums/discount-type.enum';
import { CouponType } from '../enums/coupon-type.enum';
import { PromotionStatus } from '../enums/promotion-status.enum';
import { DiscountResponseDto } from '../dto/discount-response.dto';

interface DiscountContext {
  userId: string;
  orderAmount: number;
  isFirstOrder: boolean;
  items?: Array<{
    productId: string;
    variantId: string;
    categoryId: string;
    quantity: number;
    unitPrice: number;
  }>;
}

@Injectable()
export class DiscountEngineService {
  constructor(
    @InjectRepository(Coupon)
    private readonly couponRepository: Repository<Coupon>,
    @InjectRepository(Promotion)
    private readonly promotionRepository: Repository<Promotion>,
    @InjectRepository(DiscountRule)
    private readonly discountRuleRepository: Repository<DiscountRule>,
    @InjectRepository(CouponUsage)
    private readonly couponUsageRepository: Repository<CouponUsage>,
  ) {}

  async applyCoupon(
    code: string,
    context: DiscountContext,
  ): Promise<DiscountResponseDto> {
    const coupon = await this.couponRepository.findOne({
      where: { code: code.toUpperCase(), isActive: true },
    });
    if (!coupon) {
      return {
        applicable: false,
        discountType: 'NONE',
        discountValue: 0,
        discountAmount: 0,
        finalAmount: context.orderAmount,
      };
    }

    const validation = await this.validateCouponForUser(coupon, context);
    if (!validation.valid) {
      return {
        applicable: false,
        discountType: 'NONE',
        discountValue: 0,
        discountAmount: 0,
        finalAmount: context.orderAmount,
      };
    }

    const discountAmount = this.calculateDiscount(
      coupon.discountType,
      coupon.discountValue,
      context.orderAmount,
      coupon.maximumDiscountAmount,
    );

    return {
      applicable: true,
      couponId: coupon.id,
      couponCode: coupon.code,
      discountType: coupon.discountType,
      discountValue: coupon.discountValue,
      discountAmount,
      finalAmount: Math.max(0, context.orderAmount - discountAmount),
    };
  }

  async applyBestPromotion(
    context: DiscountContext,
  ): Promise<DiscountResponseDto | null> {
    const now = new Date();
    const promotions = await this.promotionRepository.find({
      where: {
        status: PromotionStatus.ACTIVE,
        startDate: LessThanOrEqual(now),
        endDate: MoreThanOrEqual(now),
      },
      order: { priority: 'DESC' },
    });

    if (promotions.length === 0) return null;

    let bestDiscount: DiscountResponseDto | null = null;

    for (const promotion of promotions) {
      const rules = await this.discountRuleRepository.find({
        where: { promotionId: promotion.id },
      });

      if (!this.matchesRules(promotion, rules, context)) continue;

      let discountAmount = this.calculateDiscount(
        promotion.discountType,
        promotion.discountValue,
        context.orderAmount,
        null,
      );

      if (promotion.discountType === DiscountType.FREE_SHIPPING) {
        discountAmount = 0;
      }

      if (!bestDiscount || discountAmount > bestDiscount.discountAmount) {
        bestDiscount = {
          applicable: true,
          promotionId: promotion.id,
          promotionName: promotion.name,
          discountType: promotion.discountType,
          discountValue: promotion.discountValue,
          discountAmount,
          finalAmount: Math.max(0, context.orderAmount - discountAmount),
        };
      }
    }

    return bestDiscount;
  }

  calculateDiscountAmount(
    coupon: Coupon | null,
    context: DiscountContext,
  ): number {
    if (!coupon) return 0;
    return this.calculateDiscount(
      coupon.discountType,
      coupon.discountValue,
      context.orderAmount,
      coupon.maximumDiscountAmount,
    );
  }

  private calculateDiscount(
    discountType: DiscountType,
    discountValue: number,
    orderAmount: number,
    maxDiscount: number | null,
  ): number {
    switch (discountType) {
      case DiscountType.PERCENTAGE: {
        const amount = (orderAmount * discountValue) / 100;
        return maxDiscount ? Math.min(amount, maxDiscount) : amount;
      }
      case DiscountType.FIXED:
        return Math.min(discountValue, orderAmount);
      case DiscountType.FREE_SHIPPING:
        return 0;
      default:
        return 0;
    }
  }

  private async validateCouponForUser(
    coupon: Coupon,
    context: DiscountContext,
  ): Promise<{ valid: boolean; message?: string }> {
    const now = new Date();
    if (now < coupon.startsAt)
      return { valid: false, message: 'Not yet valid' };
    if (now > coupon.expiresAt) return { valid: false, message: 'Expired' };
    if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
      return { valid: false, message: 'Usage limit reached' };
    }
    if (context.orderAmount < coupon.minimumOrderAmount) {
      return { valid: false, message: 'Minimum order not met' };
    }
    if (coupon.type === CouponType.FIRST_ORDER && !context.isFirstOrder) {
      return { valid: false, message: 'First order only' };
    }
    if (coupon.usagePerUser) {
      const userUsage = await this.couponUsageRepository.count({
        where: { couponId: coupon.id, userId: context.userId },
      });
      if (userUsage >= coupon.usagePerUser) {
        return { valid: false, message: 'Per-user limit reached' };
      }
    }
    return { valid: true };
  }

  private matchesRules(
    promotion: Promotion,
    rules: DiscountRule[],
    context: DiscountContext,
  ): boolean {
    if (rules.length === 0) return true;

    if (!context.items || context.items.length === 0) return false;

    for (const rule of rules) {
      if (rule.minimumAmount && context.orderAmount < rule.minimumAmount) {
        return false;
      }

      if (rule.productId) {
        const hasProduct = context.items.some(
          (item) => item.productId === rule.productId,
        );
        if (!hasProduct) return false;
      }

      if (rule.categoryId) {
        const hasCategory = context.items.some(
          (item) => item.categoryId === rule.categoryId,
        );
        if (!hasCategory) return false;
      }

      if (rule.minimumQuantity) {
        if (rule.productId) {
          const productQty = context.items
            .filter((item) => item.productId === rule.productId)
            .reduce((sum, item) => sum + item.quantity, 0);
          if (productQty < rule.minimumQuantity) return false;
        } else {
          const totalQty = context.items.reduce(
            (sum, item) => sum + item.quantity,
            0,
          );
          if (totalQty < rule.minimumQuantity) return false;
        }
      }
    }
    return true;
  }
}
