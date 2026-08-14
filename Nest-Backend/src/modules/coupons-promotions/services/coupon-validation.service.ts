import { Injectable, BadRequestException } from '@nestjs/common';
import { Coupon, CouponStatus } from '../entities/coupon.entity';
import { CouponRule, CouponRuleType, CouponTargetType } from '../entities/coupon-rule.entity';
import { CouponType } from '../enums/coupon-type.enum';
import { CouponUsageService } from './coupon-usage.service';

export interface EvaluatedCartItem {
  productId: string;
  variantId?: string;
  categoryId?: string;
  subCategoryId?: string;
  brandId?: string;
  collectionId?: string;
  unitPrice: number;
  quantity: number;
  lineTotal: number;
  isSaleItem?: boolean;
}

export interface CouponValidationContext {
  userId: string;
  orderAmount?: number;
  items?: EvaluatedCartItem[];
  isFirstOrder?: boolean;
}

export interface CouponValidationResult {
  valid: boolean;
  coupon: Coupon;
  eligibleSubtotal: number;
  discountAmount: number;
  isFreeShipping: boolean;
  eligibleItems: EvaluatedCartItem[];
}

@Injectable()
export class CouponValidationService {
  constructor(private readonly couponUsageService: CouponUsageService) {}

  async validate(
    coupon: Coupon,
    context: CouponValidationContext,
  ): Promise<CouponValidationResult> {
    if (!coupon.isActive || coupon.status === CouponStatus.PAUSED || coupon.status === CouponStatus.DRAFT) {
      throw new BadRequestException('Coupon is inactive or paused');
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

    if (coupon.firstOrderOnly && !context.isFirstOrder) {
      throw new BadRequestException('This coupon is reserved for first orders only');
    }

    if (coupon.maxUsesPerUser && context.userId) {
      const userUsageCount = await this.couponUsageService.getUserUsageCount(
        coupon.id,
        context.userId,
      );
      if (userUsageCount >= coupon.maxUsesPerUser) {
        throw new BadRequestException(
          'You have reached the usage limit for this coupon',
        );
      }
    }

    const items = context.items || [];
    const overallSubtotal = context.orderAmount ?? items.reduce((acc, item) => acc + item.lineTotal, 0);

    let eligibleItems: EvaluatedCartItem[] = [...items];

    if (coupon.rules && coupon.rules.length > 0) {
      const exclusionRules = coupon.rules.filter((r) => r.ruleType === CouponRuleType.EXCLUSION);
      const inclusionRules = coupon.rules.filter((r) => r.ruleType === CouponRuleType.INCLUSION);

      // 1. Hard Exclusion Filtering (Exclusion overrides inclusion)
      if (exclusionRules.length > 0) {
        eligibleItems = eligibleItems.filter((item) => {
          for (const rule of exclusionRules) {
            if (rule.targetType === CouponTargetType.PRODUCT && rule.targetId === item.productId) return false;
            if (rule.targetType === CouponTargetType.VARIANT && rule.targetId === item.variantId) return false;
            if (rule.targetType === CouponTargetType.CATEGORY && rule.targetId === item.categoryId) return false;
            if (rule.targetType === CouponTargetType.SUB_CATEGORY && rule.targetId === item.subCategoryId) return false;
            if (rule.targetType === CouponTargetType.BRAND && rule.targetId === item.brandId) return false;
            if (rule.targetType === CouponTargetType.COLLECTION && rule.targetId === item.collectionId) return false;
            if (rule.targetType === CouponTargetType.SALE_ITEMS && item.isSaleItem) return false;
          }
          return true;
        });
      }

      // 2. Inclusion Filtering (If inclusion rules exist, must match at least one)
      if (inclusionRules.length > 0) {
        eligibleItems = eligibleItems.filter((item) => {
          return inclusionRules.some((rule) => {
            if (rule.targetType === CouponTargetType.PRODUCT) return rule.targetId === item.productId;
            if (rule.targetType === CouponTargetType.VARIANT) return rule.targetId === item.variantId;
            if (rule.targetType === CouponTargetType.CATEGORY) return rule.targetId === item.categoryId;
            if (rule.targetType === CouponTargetType.SUB_CATEGORY) return rule.targetId === item.subCategoryId;
            if (rule.targetType === CouponTargetType.BRAND) return rule.targetId === item.brandId;
            if (rule.targetType === CouponTargetType.COLLECTION) return rule.targetId === item.collectionId;
            return false;
          });
        });
      }
    }

    const eligibleSubtotal = items.length > 0
      ? eligibleItems.reduce((sum, item) => sum + item.lineTotal, 0)
      : overallSubtotal;

    if (coupon.minimumOrderAmount > 0 && eligibleSubtotal < coupon.minimumOrderAmount) {
      throw new BadRequestException(
        `Minimum eligible cart amount of $${coupon.minimumOrderAmount} required for this coupon`,
      );
    }

    const isFreeShipping = coupon.type === CouponType.FREE_SHIPPING;
    const discountAmount = this.calculateDiscount(coupon, eligibleSubtotal);

    return {
      valid: true,
      coupon,
      eligibleSubtotal,
      discountAmount,
      isFreeShipping,
      eligibleItems,
    };
  }

  calculateDiscount(coupon: Coupon, eligibleSubtotal: number): number {
    if (coupon.type === CouponType.FREE_SHIPPING) {
      return 0;
    }

    let discount = 0;
    if (coupon.type === CouponType.PERCENTAGE) {
      discount = (eligibleSubtotal * Number(coupon.value)) / 100;
    } else {
      discount = Number(coupon.value);
    }

    if (coupon.maximumDiscountAmount && coupon.maximumDiscountAmount > 0) {
      discount = Math.min(discount, Number(coupon.maximumDiscountAmount));
    }

    return Math.min(discount, eligibleSubtotal);
  }
}

