# Layer 9 — Promotions, Coupons & Discounts Management (Complete)

| Module                    | Status      | Started    | Completed  |
| ------------------------- | ----------- | ---------- | ---------- |
| Coupon Management         | ✅ Complete | 2026-06-08 | 2026-06-08 |
| Discount Rules Engine     | ✅ Complete | 2026-06-08 | 2026-06-08 |
| Promotion Campaigns       | ✅ Complete | 2026-06-08 | 2026-06-08 |
| Coupon Redemption Tracking| ✅ Complete | 2026-06-08 | 2026-06-08 |
| Checkout Discount Engine  | ✅ Complete | 2026-06-08 | 2026-06-08 |

### Phase 9 Deliverables

- [x] Coupon Entity
- [x] Promotion Entity
- [x] CouponUsage Entity
- [x] DiscountRule Entity
- [x] DiscountType Enum
- [x] CouponType Enum
- [x] PromotionStatus Enum
- [x] DTOs (CreateCoupon, UpdateCoupon, ApplyCoupon, CreatePromotion, UpdatePromotion, DiscountResponse)
- [x] CouponsService
- [x] PromotionsService
- [x] DiscountEngineService
- [x] CouponUsageService
- [x] CouponsController
- [x] PromotionsController
- [x] CustomerCouponsController
- [x] Checkout Integration
- [x] Migration (coupons, promotions, discount_rules, coupon_usages)
- [x] Permission seeds
- [x] Role mappings
- [x] Swagger documentation
- [x] RBAC integration
- [x] Zero TypeScript build errors

---

# Business Objective

Provide a flexible promotion engine capable of:

- Percentage discounts
- Fixed amount discounts
- Free shipping coupons
- Category-specific promotions
- Product-specific promotions
- Order amount based discounts
- Buy X Get Y campaigns
- First order coupons
- Limited redemption coupons
- Time-based marketing campaigns

---

# Entities

## Coupon Entity

| Field | Type |
|---------|---------|
| id | uuid |
| code | varchar unique |
| name | varchar |
| description | text |
| type | CouponType |
| discountType | DiscountType |
| discountValue | decimal |
| minimumOrderAmount | decimal |
| maximumDiscountAmount | decimal nullable |
| usageLimit | int nullable |
| usagePerUser | int nullable |
| usedCount | int |
| startsAt | timestamp |
| expiresAt | timestamp |
| isActive | boolean |
| createdBy | uuid |
| createdAt | timestamp |
| updatedAt | timestamp |
| deletedAt | timestamp |

---

## Promotion Entity

| Field | Type |
|---------|---------|
| id | uuid |
| name | varchar |
| description | text |
| status | PromotionStatus |
| discountType | DiscountType |
| discountValue | decimal |
| startDate | timestamp |
| endDate | timestamp |
| priority | int |
| isStackable | boolean |
| createdAt | timestamp |
| updatedAt | timestamp |

---

## DiscountRule Entity

| Field | Type |
|---------|---------|
| id | uuid |
| promotionId | uuid |
| categoryId | uuid nullable |
| productId | uuid nullable |
| variantId | uuid nullable |
| minimumQuantity | int nullable |
| minimumAmount | decimal nullable |
| buyQuantity | int nullable |
| getQuantity | int nullable |
| createdAt | timestamp |

---

## CouponUsage Entity

| Field | Type |
|---------|---------|
| id | uuid |
| couponId | uuid |
| userId | uuid |
| orderId | uuid |
| discountAmount | decimal |
| usedAt | timestamp |

---

# Enums

## DiscountType

```ts
export enum DiscountType {
  PERCENTAGE = 'PERCENTAGE',
  FIXED = 'FIXED',
  FREE_SHIPPING = 'FREE_SHIPPING',
}
## CouponType

export enum CouponType {
  GENERAL = 'GENERAL',
  FIRST_ORDER = 'FIRST_ORDER',
  CATEGORY = 'CATEGORY',
  PRODUCT = 'PRODUCT',
}


## PromotionStatus


export enum PromotionStatus {
  DRAFT = 'DRAFT',
  ACTIVE = 'ACTIVE',
  EXPIRED = 'EXPIRED',
  PAUSED = 'PAUSED',
}


## DiscountType


export enum DiscountType {
  PERCENTAGE = 'PERCENTAGE',
  FIXED = 'FIXED',
  FREE_SHIPPING = 'FREE_SHIPPING',
}
```
