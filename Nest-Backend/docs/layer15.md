# Layer 15 — Coupons, Promotions, Discount Engine & Marketing Campaigns

### Status: ✅ Complete

---

## Module Build Log

| Module | Status | Started | Completed |
|----------|----------|----------|----------|
| Coupon Module | ✅ Done | 2026-06-10 | 2026-06-10 |
| Promotion Module | ✅ Done | 2026-06-10 | 2026-06-10 |
| Campaign Module | ✅ Done | 2026-06-10 | 2026-06-10 |
| Discount Calculation Engine | ✅ Done | 2026-06-10 | 2026-06-10 |
| Coupon Validation Engine | ✅ Done | 2026-06-10 | 2026-06-10 |
| Buy X Get Y Engine | ✅ Done | 2026-06-10 | 2026-06-10 |
| Free Shipping Rules Engine | ✅ Done | 2026-06-10 | 2026-06-10 |
| Marketing Analytics | ✅ Done | 2026-06-10 | 2026-06-10 |
| Admin Coupon Management | ✅ Done | 2026-06-10 | 2026-06-10 |
| Admin Promotion Management | ✅ Done | 2026-06-10 | 2026-06-10 |
| Admin Campaign Management | ✅ Done | 2026-06-10 | 2026-06-10 |
| Migration Phase15CouponsPromotions | ✅ Done | 2026-06-10 | 2026-06-10 |

---

# New Entities

| Entity | Table |
|----------|----------|
| Coupon | coupons |
| CouponUsage | coupon_usages |
| Promotion | promotions |
| PromotionProduct | promotion_products |
| PromotionCategory | promotion_categories |
| Campaign | campaigns |

---

# Coupon Types

```ts
export enum CouponType {
  PERCENTAGE = "PERCENTAGE",
  FIXED_AMOUNT = "FIXED_AMOUNT",
  FREE_SHIPPING = "FREE_SHIPPING",
}
```

---

# Promotion Types

```ts
export enum PromotionType {
  PRODUCT_DISCOUNT = "PRODUCT_DISCOUNT",
  CATEGORY_DISCOUNT = "CATEGORY_DISCOUNT",
  CART_DISCOUNT = "CART_DISCOUNT",
  BUY_X_GET_Y = "BUY_X_GET_Y",
  FLASH_SALE = "FLASH_SALE",
}
```

---

# Campaign Types

```ts
export enum CampaignType {
  SUMMER_SALE = "SUMMER_SALE",
  FESTIVAL_SALE = "FESTIVAL_SALE",
  CLEARANCE = "CLEARANCE",
  BLACK_FRIDAY = "BLACK_FRIDAY",
  CUSTOM = "CUSTOM",
}
```

---

# New Permissions

| Permission | Slug |
|------------|------------|
| View Coupons | coupon.view |
| Create Coupon | coupon.create |
| Update Coupon | coupon.update |
| Delete Coupon | coupon.delete |
| View Promotions | promotion.view |
| Create Promotion | promotion.create |
| Update Promotion | promotion.update |
| Delete Promotion | promotion.delete |
| View Campaigns | campaign.view |
| Create Campaign | campaign.create |
| Update Campaign | campaign.update |
| Delete Campaign | campaign.delete |

---

# Customer APIs

## Coupons

### Base Route

```http
/api/v1/coupons
```

| Method | Path | Auth | Status |
|----------|----------|----------|----------|
| POST | /coupons/validate | Customer JWT | ✅ |
| POST | /coupons/apply | Customer JWT | ✅ |
| DELETE | /coupons/remove | Customer JWT | ✅ |

---

## Promotions

### Base Route

```http
/api/v1/promotions
```

| Method | Path | Auth | Status |
|----------|----------|----------|----------|
| GET | /promotions | Public | ✅ |
| GET | /promotions/active | Public | ✅ |
| GET | /promotions/:id | Public | ✅ |

---

# Admin APIs

## Coupons

### Base Route

```http
/api/v1/admin/coupons
```

| Method | Path | Permission | Status |
|----------|----------|----------|----------|
| POST | /admin/coupons | coupon.create | ✅ |
| GET | /admin/coupons | coupon.view | ✅ |
| GET | /admin/coupons/:id | coupon.view | ✅ |
| PATCH | /admin/coupons/:id | coupon.update | ✅ |
| DELETE | /admin/coupons/:id | coupon.delete | ✅ |

---

## Promotions

### Base Route

```http
/api/v1/admin/promotions
```

| Method | Path | Permission | Status |
|----------|----------|----------|----------|
| POST | /admin/promotions | promotion.create | ✅ |
| GET | /admin/promotions | promotion.view | ✅ |
| GET | /admin/promotions/:id | promotion.view | ✅ |
| PATCH | /admin/promotions/:id | promotion.update | ✅ |
| DELETE | /admin/promotions/:id | promotion.delete | ✅ |

---

## Campaigns

### Base Route

```http
/api/v1/admin/campaigns
```

| Method | Path | Permission | Status |
|----------|----------|----------|----------|
| POST | /admin/campaigns | campaign.create | ✅ |
| GET | /admin/campaigns | campaign.view | ✅ |
| GET | /admin/campaigns/:id | campaign.view | ✅ |
| PATCH | /admin/campaigns/:id | campaign.update | ✅ |
| DELETE | /admin/campaigns/:id | campaign.delete | ✅ |

---

# Analytics APIs

## Base Route

```http
/api/v1/admin/analytics
```

| Method | Path | Permission | Status |
|----------|----------|----------|----------|
| GET | /analytics/coupons | coupon.view | ✅ |
| GET | /analytics/promotions | promotion.view | ✅ |
| GET | /analytics/campaigns | campaign.view | ✅ |

---

# Coupon Rules

| Rule | Description |
|--------|--------|
| code unique | Unique coupon code |
| startDate | Active start date |
| endDate | Expiry date |
| maxUses | Total usage limit |
| maxUsesPerUser | Per customer limit |
| minimumOrderAmount | Minimum cart amount |
| maximumDiscountAmount | Discount cap |
| firstOrderOnly | New customer only |
| active | Enable / Disable |
| stackable | Allow stacking |

---

# Promotion Rules

| Rule | Description |
|--------|--------|
| Auto Apply | Automatically applied |
| Product Specific | Product level promotion |
| Category Specific | Category level promotion |
| Collection Specific | Collection level promotion |
| Flash Sale | Limited-time promotion |
| Schedule Support | Start/end dates |

---

# Buy X Get Y Rules

| Rule | Description |
|--------|--------|
| Buy Quantity | Required quantity |
| Get Quantity | Reward quantity |
| Same Product | Supported |
| Different Product | Supported |
| Free Product | Supported |
| Percentage Discount | Supported |

Examples:

```text
Buy 2 Jerseys → Get 1 Free

Buy 3 Shoes → Get 20% Off

Buy 5 Cricket Balls → Get 2 Free
```

---

# Free Shipping Rules

| Rule | Description |
|--------|--------|
| Order Threshold | Example ₹999+ |
| Coupon Based | FREE_SHIPPING |
| Promotion Based | Supported |
| Region Based | Supported |

---

# Campaign Features

| Feature | Supported |
|----------|----------|
| Homepage Campaign | ✅ |
| Banner Campaign | ✅ |
| Flash Sale Campaign | ✅ |
| Festival Sale Campaign | ✅ |
| Category Campaign | ✅ |
| Product Campaign | ✅ |
| Landing Page Campaign | ✅ |
| Scheduled Campaign | ✅ |

---

# Business Rules Implemented

| Rule | Description |
|--------|--------|
| Coupon Expired | Reject |
| Coupon Disabled | Reject |
| Usage Limit Reached | Reject |
| User Limit Reached | Reject |
| Minimum Order Not Met | Reject |
| Product Restriction | Validate |
| Category Restriction | Validate |
| First Order Only | Validate |
| Free Shipping Coupon | Shipping = 0 |
| Percentage Coupon | Percentage discount |
| Fixed Coupon | Flat discount |
| Buy X Get Y | Automatic calculation |
| Flash Sale Priority | Highest priority |
| Promotion Scheduling | Automatic start/end |
| Coupon Usage Tracking | Successful order only |
| Refund Handling | Coupon remains consumed |
| Campaign Scheduling | Automatic activation |
| Campaign Expiry | Automatic deactivation |

---

# Analytics

## Coupon Analytics

- Total Coupons
- Active Coupons
- Expired Coupons
- Total Redemptions
- Revenue Generated
- Average Discount
- Top Coupons
- Conversion Rate

---

## Promotion Analytics

- Active Promotions
- Promotion Revenue
- Promotion Orders
- Best Performing Promotion
- Total Discount Given
- Flash Sale Revenue

---

## Campaign Analytics

- Campaign Revenue
- Campaign Orders
- Campaign Conversion Rate
- Campaign CTR
- Top Campaigns
- Campaign ROI

---

# Deliverables

- [x] Coupon Entity
- [x] CouponUsage Entity
- [x] Promotion Entity
- [x] PromotionProduct Entity
- [x] PromotionCategory Entity
- [x] Campaign Entity
- [x] CouponService
- [x] PromotionService
- [x] CampaignService
- [x] CouponValidationService
- [x] DiscountCalculationService
- [x] CouponController
- [x] PromotionController
- [x] CampaignController
- [x] AnalyticsService
- [x] Cart Integration
- [x] Checkout Integration
- [x] Order Integration
- [x] RBAC Integration
- [x] Swagger Documentation
- [x] Seed Permissions
- [x] Migration Phase15CouponsPromotions
- [x] Zero TypeScript Build Errors

---

# Dependencies

### Existing Layers Required

- Layer 03 Products
- Layer 04 Categories
- Layer 05 Cart
- Layer 06 Orders
- Layer 07 Payments
- Layer 11 Wishlist
- Layer 14 Search

---

# Migration

```bash
npm run migration:generate -- Phase15CouponsPromotions
npm run migration:run
```

---

# Seed Updates

Added Permissions:

coupon.*
promotion.*
campaign.*

Assigned Roles:

SUPER_ADMIN
ADMIN
MARKETING_MANAGER
PRODUCT_MANAGER

---

### Phase Status

✅ Layer 15 Complete

Next Layer:

# Layer 16 — CMS, Homepage Builder, Hero Banners, SEO Management, Announcement Bars & Dynamic Landing Pages