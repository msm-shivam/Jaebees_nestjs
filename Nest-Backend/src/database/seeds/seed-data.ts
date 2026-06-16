import 'reflect-metadata';
import * as dotenv from 'dotenv';
import { AppDataSource } from '../data-source';
import { User } from '../../modules/users/entities/user.entity';
import { AdminUser } from '../../modules/admin/entities/admin-user.entity';
import { Brand } from '../../modules/brands/entities/brand.entity';
import { Category } from '../../modules/categories/entities/category.entity';
import { SubCategory } from '../../modules/sub-categories/entities/sub-category.entity';
import { Collection } from '../../modules/collections/entities/collection.entity';
import { ProductCollection } from '../../modules/collections/entities/product-collection.entity';
import { Attribute } from '../../modules/attributes/entities/attribute.entity';
import { AttributeValue } from '../../modules/attribute-values/entities/attribute-value.entity';
import { ProductTag } from '../../modules/product-tags/entities/product-tag.entity';
import { ProductTagMapping } from '../../modules/product-tags/entities/product-tag-mapping.entity';
import { Product } from '../../modules/products/entities/product.entity';
import { ProductImage } from '../../modules/products/entities/product-image.entity';
import { ProductVariant } from '../../modules/product-variants/entities/product-variant.entity';
import { ProductVariantAttribute } from '../../modules/product-variants/entities/product-variant-attribute.entity';
import { Inventory } from '../../modules/inventory/entities/inventory.entity';
import { Warehouse } from '../../modules/warehouses/entities/warehouse.entity';
import { DeliverySetting } from '../../modules/delivery-settings/entities/delivery-setting.entity';
import { Supplier } from '../../modules/inventory-plus/entities/supplier.entity';
import { PurchaseOrder } from '../../modules/inventory-plus/entities/purchase-order.entity';
import { PurchaseOrderItem } from '../../modules/inventory-plus/entities/purchase-order-item.entity';
import { GoodsReceipt } from '../../modules/inventory-plus/entities/goods-receipt.entity';
import { GoodsReceiptItem } from '../../modules/inventory-plus/entities/goods-receipt-item.entity';
import { StockAdjustment } from '../../modules/inventory-plus/entities/stock-adjustment.entity';
import { StockAlert } from '../../modules/inventory-plus/entities/stock-alert.entity';
import { InventoryAudit } from '../../modules/inventory-plus/entities/inventory-audit.entity';
import { Address } from '../../modules/addresses/entities/address.entity';
import { Order } from '../../modules/orders/entities/order.entity';
import { OrderItem } from '../../modules/orders/entities/order-item.entity';
import { Cart } from '../../modules/cart/entities/cart.entity';
import { CartItem } from '../../modules/cart/entities/cart-item.entity';
import { Wishlist } from '../../modules/wishlist/entities/wishlist.entity';
import { WishlistItem } from '../../modules/wishlist/entities/wishlist-item.entity';
import { PaymentMethod } from '../../modules/payments/entities/payment-method.entity';
import { Payment } from '../../modules/payments/entities/payment.entity';
import { PaymentRefund } from '../../modules/payments/entities/payment-refund.entity';
import { PaymentLog } from '../../modules/payments/entities/payment-log.entity';
import { Shipment } from '../../modules/shipments/entities/shipment.entity';
import { ShipmentTrackingLog } from '../../modules/shipments/entities/shipment-tracking-log.entity';
import { Coupon } from '../../modules/coupons-promotions/entities/coupon.entity';
import { CouponUsage } from '../../modules/coupons-promotions/entities/coupon-usage.entity';
import { Promotion } from '../../modules/coupons-promotions/entities/promotion.entity';
import { PromotionProduct } from '../../modules/coupons-promotions/entities/promotion-product.entity';
import { PromotionCategory } from '../../modules/coupons-promotions/entities/promotion-category.entity';
import { Campaign } from '../../modules/coupons-promotions/entities/campaign.entity';
import { SupportTicket } from '../../modules/support/entities/support-ticket.entity';
import { TicketMessage } from '../../modules/support/entities/ticket-message.entity';
import { TicketAssignment } from '../../modules/support/entities/ticket-assignment.entity';
import { TicketNote } from '../../modules/support/entities/ticket-note.entity';
import { TicketAttachment } from '../../modules/support/entities/ticket-attachment.entity';
import { TicketAudit } from '../../modules/support/entities/ticket-audit.entity';
import { TicketSlaLog } from '../../modules/support/entities/ticket-sla-log.entity';
import { TicketRating } from '../../modules/support/entities/ticket-rating.entity';
import { TicketTag } from '../../modules/support/entities/ticket-tag.entity';
import { ReturnRequest } from '../../modules/returns/entities/return-request.entity';
import { ReturnItem } from '../../modules/returns/entities/return-item.entity';
import { ReturnReasonMaster } from '../../modules/returns/entities/return-reason-master.entity';
import { ReturnAudit } from '../../modules/returns/entities/return-audit.entity';
import { ReverseShipment } from '../../modules/returns/entities/reverse-shipment.entity';
import { Review } from '../../modules/reviews/entities/review.entity';
import { ReviewImage } from '../../modules/reviews/entities/review-image.entity';
import { ReviewHelpfulVote } from '../../modules/reviews/entities/review-helpful-vote.entity';
import { ReviewReport } from '../../modules/reviews/entities/review-report.entity';
import { ProductQuestion } from '../../modules/questions/entities/product-question.entity';
import { ProductAnswer } from '../../modules/questions/entities/product-answer.entity';
import { FinancialTransaction } from '../../modules/finance-accounting/entities/financial-transaction.entity';
import { LedgerEntry } from '../../modules/finance-accounting/entities/ledger-entry.entity';
import { Settlement } from '../../modules/finance-accounting/entities/settlement.entity';
import { TaxRecord } from '../../modules/finance-accounting/entities/tax-record.entity';
import { ExpenseRecord } from '../../modules/finance-accounting/entities/expense-record.entity';
import { FinancialAudit } from '../../modules/finance-accounting/entities/financial-audit.entity';
import { DashboardSnapshot } from '../../modules/reports-bi/entities/dashboard-snapshot.entity';
import { SavedReport } from '../../modules/reports-bi/entities/saved-report.entity';
import { ReportExecutionLog } from '../../modules/reports-bi/entities/report-execution-log.entity';
import { AuditLog } from '../../modules/security-compliance/entities/audit-log.entity';
import { LoginActivity } from '../../modules/security-compliance/entities/login-activity.entity';
import { SecurityEvent } from '../../modules/security-compliance/entities/security-event.entity';
import { SecuritySession } from '../../modules/security-compliance/entities/security-session.entity';
import { PrivacyRequest } from '../../modules/security-compliance/entities/privacy-request.entity';
import { ConsentRecord } from '../../modules/security-compliance/entities/consent-record.entity';
import { EmailTemplate } from '../../modules/email-notifications/entities/email-template.entity';
import { EmailNotification } from '../../modules/email-notifications/entities/email-notification.entity';
import { EmailLog } from '../../modules/email-notifications/entities/email-log.entity';
import { EmailPreference } from '../../modules/email-notifications/entities/email-preference.entity';
import { EmailCampaign } from '../../modules/email-notifications/entities/email-campaign.entity';
import { SystemSetting } from '../../modules/system-settings-cms/entities/system-setting.entity';
import { CmsPage } from '../../modules/system-settings-cms/entities/cms-page.entity';
import { HomepageSection } from '../../modules/system-settings-cms/entities/homepage-section.entity';
import { ContactSetting } from '../../modules/system-settings-cms/entities/contact-setting.entity';
import { SiteConfiguration } from '../../modules/system-settings-cms/entities/site-configuration.entity';
import { OrderStatus } from '../../modules/orders/entities/order.entity';
import { PaymentStatus } from '../../modules/payments/entities/payment-status.enum';
import { ShipmentStatus } from '../../modules/shipments/entities/shipment-status.enum';
import { ReverseShipmentStatus } from '../../modules/returns/enums/reverse-shipment-status.enum';
import { TicketStatus } from '../../modules/support/enums/ticket-status.enum';
import { TicketPriority } from '../../modules/support/enums/ticket-priority.enum';
import { TicketCategory } from '../../modules/support/enums/ticket-category.enum';
import { SenderType } from '../../modules/support/enums/sender-type.enum';
import { ReturnRequestStatus } from '../../modules/returns/enums/return-request-status.enum';
import { ReturnReason } from '../../modules/returns/enums/return-reason.enum';
import { ReturnItemCondition } from '../../modules/returns/enums/return-item-condition.enum';
import { CouponType } from '../../modules/coupons-promotions/enums/coupon-type.enum';
import { PromotionType } from '../../modules/coupons-promotions/enums/promotion-type.enum';
import { CampaignType as CouponCampaignType } from '../../modules/coupons-promotions/enums/campaign-type.enum';
import { QuestionStatus } from '../../modules/questions/enums/question-status.enum';
import { ReviewStatus } from '../../modules/reviews/enums/review-status.enum';
import { NotificationStatus } from '../../modules/email-notifications/enums/notification-status.enum';
import { CampaignType as EmailCampaignType } from '../../modules/email-notifications/enums/campaign-type.enum';
import { CampaignStatus } from '../../modules/email-notifications/enums/campaign-status.enum';
import { TransactionalEmailType } from '../../modules/email-notifications/enums/transactional-email-type.enum';
import { TransactionType } from '../../modules/finance-accounting/enums/transaction-type.enum';
import { SettlementStatus } from '../../modules/finance-accounting/enums/settlement-status.enum';
import { ReportType } from '../../modules/reports-bi/enums/report-type.enum';
import { DashboardType } from '../../modules/reports-bi/enums/dashboard-type.enum';
import { SecurityEventType } from '../../modules/security-compliance/enums/security-event-type.enum';
import { SeverityLevel } from '../../modules/security-compliance/enums/severity-level.enum';
import { PrivacyRequestType } from '../../modules/security-compliance/enums/privacy-request-type.enum';
import { PrivacyRequestStatus } from '../../modules/security-compliance/enums/privacy-request-status.enum';
import { ConsentType } from '../../modules/security-compliance/enums/consent-type.enum';
import { CmsPageStatus } from '../../modules/system-settings-cms/enums/cms-page-status.enum';
import { CmsPageType } from '../../modules/system-settings-cms/enums/cms-page-type.enum';
import { ProductStatus } from '../../modules/products/entities/product.entity';
import { VariantStatus } from '../../modules/product-variants/entities/product-variant.entity';
import { PurchaseOrderStatus } from '../../modules/inventory-plus/enums/purchase-order-status.enum';
import { AuditActionType } from '../../modules/inventory-plus/enums/audit-action-type.enum';
import * as bcrypt from 'bcrypt';

dotenv.config();

// ─── Fixed UUIDs for cross-referencing ───────────────────────────────────────

const U = {
  // Admin
  admin: '00000000-0000-4000-8000-000000000001',
  // Customers (users)
  user1: '10000001-0000-4000-8000-000000000001',
  user2: '10000001-0000-4000-8000-000000000002',
  user3: '10000001-0000-4000-8000-000000000003',
  user4: '10000001-0000-4000-8000-000000000004',
  user5: '10000001-0000-4000-8000-000000000005',
  user6: '10000001-0000-4000-8000-000000000006',
  user7: '10000001-0000-4000-8000-000000000007',
  user8: '10000001-0000-4000-8000-000000000008',
  user9: '10000001-0000-4000-8000-000000000009',
  user10: '10000001-0000-4000-8000-000000000010',
  // Brands
  brand1: '20000001-0000-4000-8000-000000000001',
  brand2: '20000001-0000-4000-8000-000000000002',
  brand3: '20000001-0000-4000-8000-000000000003',
  brand4: '20000001-0000-4000-8000-000000000004',
  brand5: '20000001-0000-4000-8000-000000000005',
  brand6: '20000001-0000-4000-8000-000000000006',
  brand7: '20000001-0000-4000-8000-000000000007',
  brand8: '20000001-0000-4000-8000-000000000008',
  brand9: '20000001-0000-4000-8000-000000000009',
  brand10: '20000001-0000-4000-8000-000000000010',
  // Categories
  cat1: '30000001-0000-4000-8000-000000000001',
  cat2: '30000001-0000-4000-8000-000000000002',
  cat3: '30000001-0000-4000-8000-000000000003',
  cat4: '30000001-0000-4000-8000-000000000004',
  cat5: '30000001-0000-4000-8000-000000000005',
  cat6: '30000001-0000-4000-8000-000000000006',
  // Sub categories
  sub1: '40000001-0000-4000-8000-000000000001',
  sub2: '40000001-0000-4000-8000-000000000002',
  sub3: '40000001-0000-4000-8000-000000000003',
  sub4: '40000001-0000-4000-8000-000000000004',
  sub5: '40000001-0000-4000-8000-000000000005',
  sub6: '40000001-0000-4000-8000-000000000006',
  sub7: '40000001-0000-4000-8000-000000000007',
  sub8: '40000001-0000-4000-8000-000000000008',
  sub9: '40000001-0000-4000-8000-000000000009',
  sub10: '40000001-0000-4000-8000-000000000010',
  sub11: '40000001-0000-4000-8000-000000000011',
  sub12: '40000001-0000-4000-8000-000000000012',
  // Products
  prod1: '50000001-0000-4000-8000-000000000001',
  prod2: '50000001-0000-4000-8000-000000000002',
  prod3: '50000001-0000-4000-8000-000000000003',
  prod4: '50000001-0000-4000-8000-000000000004',
  prod5: '50000001-0000-4000-8000-000000000005',
  prod6: '50000001-0000-4000-8000-000000000006',
  prod7: '50000001-0000-4000-8000-000000000007',
  prod8: '50000001-0000-4000-8000-000000000008',
  prod9: '50000001-0000-4000-8000-000000000009',
  prod10: '50000001-0000-4000-8000-000000000010',
  prod11: '50000001-0000-4000-8000-000000000011',
  prod12: '50000001-0000-4000-8000-000000000012',
  prod13: '50000001-0000-4000-8000-000000000013',
  prod14: '50000001-0000-4000-8000-000000000014',
  prod15: '50000001-0000-4000-8000-000000000015',
  // Warehouses
  wh1: '60000001-0000-4000-8000-000000000001',
  wh2: '60000001-0000-4000-8000-000000000002',
  // Addresses
  addr1: '70000001-0000-4000-8000-000000000001',
  addr2: '70000001-0000-4000-8000-000000000002',
  addr3: '70000001-0000-4000-8000-000000000003',
  addr4: '70000001-0000-4000-8000-000000000004',
  addr5: '70000001-0000-4000-8000-000000000005',
  // Orders
  order1: '80000001-0000-4000-8000-000000000001',
  order2: '80000001-0000-4000-8000-000000000002',
  order3: '80000001-0000-4000-8000-000000000003',
  order4: '80000001-0000-4000-8000-000000000004',
  order5: '80000001-0000-4000-8000-000000000005',
  // Support tickets
  ticket1: '90000001-0000-4000-8000-000000000001',
  ticket2: '90000001-0000-4000-8000-000000000002',
  ticket3: '90000001-0000-4000-8000-000000000003',
  ticket4: '90000001-0000-4000-8000-000000000004',
  ticket5: '90000001-0000-4000-8000-000000000005',
};

const variantPrefix = 'a0000001-0000-4000-8000-000000000000';
const attrPrefix = 'b0000001-0000-4000-8000-000000000000';
const attrValPrefix = 'c0000001-0000-4000-8000-000000000000';

function vid(n: number): string {
  const suffix = n.toString().padStart(2, '00');
  return `${variantPrefix.slice(0, -2)}${suffix}`;
}
function aid(n: number): string {
  const suffix = n.toString().padStart(2, '00');
  return `${attrPrefix.slice(0, -2)}${suffix}`;
}
function avid(n: number): string {
  const suffix = n.toString().padStart(2, '00');
  return `${attrValPrefix.slice(0, -2)}${suffix}`;
}

// ─── Clear existing data in reverse-dependency order ─────────────────────────

async function clearData() {
  const tableNames = [
    'report_execution_logs', 'saved_reports', 'dashboard_snapshots',
    'financial_audits', 'expense_records', 'tax_records', 'settlements', 'ledger_entries', 'financial_transactions',
    'email_logs', 'email_notifications', 'email_campaigns', 'email_preferences', 'email_templates',
    'audit_logs', 'login_activities', 'security_events', 'security_sessions', 'privacy_requests', 'consent_records',
    'contact_settings', 'homepage_sections', 'site_configurations', 'cms_pages', 'system_settings',
    'return_audits', 'return_items', 'return_requests', 'reverse_shipments', 'return_reason_masters',
    'ticket_ratings', 'ticket_sla_logs', 'ticket_audits', 'ticket_attachments', 'ticket_notes', 'ticket_assignments', 'ticket_messages', 'support_tickets', 'ticket_tags',
    'review_reports', 'review_helpful_votes', 'review_images', 'reviews',
    'product_answers', 'product_questions',
    'shipment_tracking_logs', 'shipments',
    'payment_refunds', 'payment_logs', 'payments', 'payment_methods',
    'order_items', 'cart_items', 'carts', 'wishlist_items', 'wishlists',
    'coupon_usages', 'coupons', 'promotion_products', 'promotion_categories', 'promotions', 'campaigns',
    'product_variant_attributes', 'product_variants', 'product_images', 'product_tag_mappings', 'products',
    'product_tags', 'product_collections', 'collections',
    'inventory', 'stock_alerts', 'stock_adjustments', 'inventory_audits',
    'goods_receipt_items', 'goods_receipts', 'purchase_order_items', 'purchase_orders',
    'suppliers', 'warehouses', 'delivery_settings',
    'attribute_values', 'attributes', 'sub_categories', 'categories', 'brands', 'addresses',
    'admin_users', 'users',
  ];
  const queryRunner = AppDataSource.createQueryRunner();
  for (const name of tableNames) {
    try { await queryRunner.query(`DELETE FROM "${name}"`); } catch { /* table may not exist */ }
  }
  await queryRunner.release();
  console.log('  Existing data cleared');
}

// ─── Helper ──────────────────────────────────────────────────────────────────

async function seed() {
  console.log('Initialising database connection...');
  await AppDataSource.initialize();
  await clearData();
  const now = new Date();

  // ───────────────────────── USERS (10) ──────────────────────────────────────
  const userRepo = AppDataSource.getRepository(User);
  const users: User[] = [];
  const userData = [
    { id: U.user1, firstName: 'Ahmed', lastName: 'Ali', email: 'ahmed.ali@example.com', mobile: '+971501111111' },
    { id: U.user2, firstName: 'Sara', lastName: 'Mohammed', email: 'sara.mohammed@example.com', mobile: '+971502222222' },
    { id: U.user3, firstName: 'Omar', lastName: 'Hassan', email: 'omar.hassan@example.com', mobile: '+971503333333' },
    { id: U.user4, firstName: 'Fatima', lastName: 'Khalid', email: 'fatima.khalid@example.com', mobile: '+971504444444' },
    { id: U.user5, firstName: 'Khalid', lastName: 'Rashid', email: 'khalid.rashid@example.com', mobile: '+971505555555' },
    { id: U.user6, firstName: 'Noor', lastName: 'Yousef', email: 'noor.yousef@example.com', mobile: '+971506666666' },
    { id: U.user7, firstName: 'Layla', lastName: 'Ibrahim', email: 'layla.ibrahim@example.com', mobile: '+971507777777' },
    { id: U.user8, firstName: 'Hassan', lastName: 'Ahmad', email: 'hassan.ahmad@example.com', mobile: '+971508888888' },
    { id: U.user9, firstName: 'Mariam', lastName: 'Saeed', email: 'mariam.saeed@example.com', mobile: '+971509999999' },
    { id: U.user10, firstName: 'Yusuf', lastName: 'Nasser', email: 'yusuf.nasser@example.com', mobile: '+971500000001' },
  ];
  for (const d of userData) {
    const exists = await userRepo.findOne({ where: { email: d.email } });
    if (!exists) {
      const u = userRepo.create({ ...d, passwordHash: await bcrypt.hash('Customer@123', 12), isEmailVerified: true, isActive: true });
      users.push(await userRepo.save(u));
    } else {
      users.push(exists);
    }
  }
  console.log(`  Users: ${users.length}`);

  // ───────────────────────── BRANDS (10) ─────────────────────────────────────
  const brandRepo = AppDataSource.getRepository(Brand);
  const brandData = [
    { id: U.brand1, name: 'Nike', slug: 'nike', description: 'American sportswear giant' },
    { id: U.brand2, name: 'Adidas', slug: 'adidas', description: 'German sportswear brand' },
    { id: U.brand3, name: 'Puma', slug: 'puma', description: 'German athletic brand' },
    { id: U.brand4, name: 'Under Armour', slug: 'under-armour', description: 'American sports clothing' },
    { id: U.brand5, name: 'Reebok', slug: 'reebok', description: 'Fitness and lifestyle brand' },
    { id: U.brand6, name: 'New Balance', slug: 'new-balance', description: 'Athletic footwear brand' },
    { id: U.brand7, name: 'ASICS', slug: 'asics', description: 'Japanese sportswear brand' },
    { id: U.brand8, name: 'Columbia', slug: 'columbia', description: 'Outdoor recreation brand' },
    { id: U.brand9, name: 'The North Face', slug: 'the-north-face', description: 'Outdoor clothing brand' },
    { id: U.brand10, name: 'Wilson', slug: 'wilson', description: 'Sports equipment brand' },
  ];
  const brands = await Promise.all(brandData.map(async d => {
    const exists = await brandRepo.findOne({ where: { slug: d.slug } });
    if (!exists) return brandRepo.save(brandRepo.create({ ...d, isActive: true }));
    return exists;
  }));
  console.log(`  Brands: ${brands.length}`);

  // ───────────────────────── CATEGORIES (6) ──────────────────────────────────
  const catRepo = AppDataSource.getRepository(Category);
  const catData = [
    { id: U.cat1, name: 'Running', slug: 'running', description: 'Running shoes & gear', sortOrder: 1 },
    { id: U.cat2, name: 'Football', slug: 'football', description: 'Football boots & kits', sortOrder: 2 },
    { id: U.cat3, name: 'Basketball', slug: 'basketball', description: 'Basketball shoes & apparel', sortOrder: 3 },
    { id: U.cat4, name: 'Training & Gym', slug: 'training-gym', description: 'Workout clothing & accessories', sortOrder: 4 },
    { id: U.cat5, name: 'Swimming', slug: 'swimming', description: 'Swimwear & equipment', sortOrder: 5 },
    { id: U.cat6, name: 'Outdoor', slug: 'outdoor', description: 'Outdoor & camping gear', sortOrder: 6 },
  ];
  const cats = await Promise.all(catData.map(async d => {
    const exists = await catRepo.findOne({ where: { slug: d.slug } });
    if (!exists) return catRepo.save(catRepo.create({ ...d, isActive: true }));
    return exists;
  }));
  console.log(`  Categories: ${cats.length}`);

  // ───────────────────────── SUB CATEGORIES (12) ─────────────────────────────
  const subRepo = AppDataSource.getRepository(SubCategory);
  const subData = [
    { id: U.sub1, name: 'Running Shoes', slug: 'running-shoes', categoryId: U.cat1, sortOrder: 1 },
    { id: U.sub2, name: 'Running Apparel', slug: 'running-apparel', categoryId: U.cat1, sortOrder: 2 },
    { id: U.sub3, name: 'Football Boots', slug: 'football-boots', categoryId: U.cat2, sortOrder: 1 },
    { id: U.sub4, name: 'Football Kits', slug: 'football-kits', categoryId: U.cat2, sortOrder: 2 },
    { id: U.sub5, name: 'Basketball Shoes', slug: 'basketball-shoes', categoryId: U.cat3, sortOrder: 1 },
    { id: U.sub6, name: 'Basketball Jerseys', slug: 'basketball-jerseys', categoryId: U.cat3, sortOrder: 2 },
    { id: U.sub7, name: 'Gym Wear', slug: 'gym-wear', categoryId: U.cat4, sortOrder: 1 },
    { id: U.sub8, name: 'Weightlifting Gear', slug: 'weightlifting-gear', categoryId: U.cat4, sortOrder: 2 },
    { id: U.sub9, name: 'Swimwear', slug: 'swimwear', categoryId: U.cat5, sortOrder: 1 },
    { id: U.sub10, name: 'Swimming Accessories', slug: 'swimming-accessories', categoryId: U.cat5, sortOrder: 2 },
    { id: U.sub11, name: 'Camping Gear', slug: 'camping-gear', categoryId: U.cat6, sortOrder: 1 },
    { id: U.sub12, name: 'Hiking', slug: 'hiking', categoryId: U.cat6, sortOrder: 2 },
  ];
  const subs = await Promise.all(subData.map(async d => {
    const exists = await subRepo.findOne({ where: { slug: d.slug } });
    if (!exists) return subRepo.save(subRepo.create({ ...d, isActive: true }));
    return exists;
  }));
  console.log(`  SubCategories: ${subs.length}`);

  // ───────────────────────── ATTRIBUTES (6) ──────────────────────────────────
  const attrRepo = AppDataSource.getRepository(Attribute);
  const attrData = [
    { id: aid(1), name: 'Size', slug: 'size', isFilterable: true },
    { id: aid(2), name: 'Color', slug: 'color', isFilterable: true },
    { id: aid(3), name: 'Material', slug: 'material', isFilterable: true },
    { id: aid(4), name: 'Gender', slug: 'gender', isFilterable: true },
    { id: aid(5), name: 'Sport Type', slug: 'sport-type', isFilterable: true },
    { id: aid(6), name: 'Shoe Size (EU)', slug: 'shoe-size-eu', isFilterable: true },
  ];
  const attrs = await Promise.all(attrData.map(async d => {
    const exists = await attrRepo.findOne({ where: { slug: d.slug } });
    if (!exists) return attrRepo.save(attrRepo.create({ ...d, sortOrder: 0 }));
    return exists;
  }));
  console.log(`  Attributes: ${attrs.length}`);

  // ───────────────────────── ATTRIBUTE VALUES (24) ───────────────────────────
  const avRepo = AppDataSource.getRepository(AttributeValue);
  const avData = [
    { id: avid(1), attributeId: aid(4), value: 'Men', slug: 'men', sortOrder: 1 },
    { id: avid(2), attributeId: aid(4), value: 'Women', slug: 'women', sortOrder: 2 },
    { id: avid(3), attributeId: aid(4), value: 'Unisex', slug: 'unisex', sortOrder: 3 },
    { id: avid(4), attributeId: aid(1), value: 'S', slug: 's', sortOrder: 1 },
    { id: avid(5), attributeId: aid(1), value: 'M', slug: 'm', sortOrder: 2 },
    { id: avid(6), attributeId: aid(1), value: 'L', slug: 'l', sortOrder: 3 },
    { id: avid(7), attributeId: aid(1), value: 'XL', slug: 'xl', sortOrder: 4 },
    { id: avid(8), attributeId: aid(2), value: 'Black', slug: 'black', sortOrder: 1 },
    { id: avid(9), attributeId: aid(2), value: 'White', slug: 'white', sortOrder: 2 },
    { id: avid(10), attributeId: aid(2), value: 'Blue', slug: 'blue', sortOrder: 3 },
    { id: avid(11), attributeId: aid(2), value: 'Red', slug: 'red', sortOrder: 4 },
    { id: avid(12), attributeId: aid(2), value: 'Green', slug: 'green', sortOrder: 5 },
    { id: avid(13), attributeId: aid(3), value: 'Cotton', slug: 'cotton', sortOrder: 1 },
    { id: avid(14), attributeId: aid(3), value: 'Polyester', slug: 'polyester', sortOrder: 2 },
    { id: avid(15), attributeId: aid(3), value: 'Leather', slug: 'leather', sortOrder: 3 },
    { id: avid(16), attributeId: aid(3), value: 'Mesh', slug: 'mesh', sortOrder: 4 },
    { id: avid(17), attributeId: aid(5), value: 'Running', slug: 'running', sortOrder: 1 },
    { id: avid(18), attributeId: aid(5), value: 'Football', slug: 'football', sortOrder: 2 },
    { id: avid(19), attributeId: aid(5), value: 'Basketball', slug: 'basketball', sortOrder: 3 },
    { id: avid(20), attributeId: aid(5), value: 'Training', slug: 'training', sortOrder: 4 },
    { id: avid(21), attributeId: aid(6), value: '42', slug: 'eu-42', sortOrder: 1 },
    { id: avid(22), attributeId: aid(6), value: '43', slug: 'eu-43', sortOrder: 2 },
    { id: avid(23), attributeId: aid(6), value: '44', slug: 'eu-44', sortOrder: 3 },
    { id: avid(24), attributeId: aid(6), value: '45', slug: 'eu-45', sortOrder: 4 },
  ];
  const avs = await Promise.all(avData.map(async d => {
    const exists = await avRepo.findOne({ where: { slug: d.slug, attributeId: d.attributeId } });
    if (!exists) return avRepo.save(avRepo.create(d));
    return exists;
  }));
  console.log(`  AttributeValues: ${avs.length}`);

  // ───────────────────────── PRODUCT TAGS (10) ───────────────────────────────
  const tagRepo = AppDataSource.getRepository(ProductTag);
  const tagData = [
    { name: 'Best Seller', slug: 'best-seller' },
    { name: 'New Arrival', slug: 'new-arrival' },
    { name: 'Limited Edition', slug: 'limited-edition' },
    { name: 'Eco Friendly', slug: 'eco-friendly' },
    { name: 'Premium', slug: 'premium' },
    { name: 'Budget', slug: 'budget' },
    { name: 'Pro Series', slug: 'pro-series' },
    { name: 'Team Edition', slug: 'team-edition' },
    { name: 'Seasonal', slug: 'seasonal' },
    { name: 'Clearance', slug: 'clearance' },
  ];
  const tags = await Promise.all(tagData.map(async d => {
    const exists = await tagRepo.findOne({ where: { slug: d.slug } });
    if (!exists) return tagRepo.save(tagRepo.create(d));
    return exists;
  }));
  console.log(`  ProductTags: ${tags.length}`);

  // ───────────────────────── PRODUCTS (15) ───────────────────────────────────
  const prodRepo = AppDataSource.getRepository(Product);
  const prodData = [
    { id: U.prod1, brandId: U.brand1, categoryId: U.cat1, subCategoryId: U.sub1, name: 'Nike Air Zoom Pegasus 40', slug: 'nike-air-zoom-pegasus-40', description: 'Responsive everyday running shoe with Zoom Air cushioning', shortDescription: 'Everyday running shoe', basePrice: 5499, salePrice: 4399, sku: 'NIKE-PEG-40', status: ProductStatus.ACTIVE, isActive: true, isFeatured: true, sortOrder: 1 },
    { id: U.prod2, brandId: U.brand1, categoryId: U.cat4, subCategoryId: U.sub7, name: 'Nike Dri-FIT Training Tee', slug: 'nike-dri-fit-training-tee', description: 'Moisture-wicking training t-shirt for intense workouts', shortDescription: 'Training t-shirt', basePrice: 1499, salePrice: 1199, sku: 'NIKE-DF-TEE', status: ProductStatus.ACTIVE, isActive: true, isFeatured: false, sortOrder: 2 },
    { id: U.prod3, brandId: U.brand2, categoryId: U.cat2, subCategoryId: U.sub3, name: 'Adidas Predator Edge', slug: 'adidas-predator-edge', description: 'Precision football boot with Demonskin rubber elements', shortDescription: 'Football boot', basePrice: 6999, salePrice: 5599, sku: 'ADIDAS-PRED-EDGE', status: ProductStatus.ACTIVE, isActive: true, isFeatured: true, sortOrder: 3 },
    { id: U.prod4, brandId: U.brand2, categoryId: U.cat1, subCategoryId: U.sub2, name: 'Adidas Running Ultraboost Light', slug: 'adidas-ultraboost-light', description: 'Ultra-comfortable running shoe with Light BOOST midsole', shortDescription: 'Running shoe', basePrice: 7999, salePrice: 6399, sku: 'ADIDAS-UB-LIGHT', status: ProductStatus.ACTIVE, isActive: true, isFeatured: true, sortOrder: 4 },
    { id: U.prod5, brandId: U.brand3, categoryId: U.cat3, subCategoryId: U.sub5, name: 'Puma Court Pro Basketball Shoe', slug: 'puma-court-pro-basketball', description: 'High-top basketball shoe with cushioned support', shortDescription: 'Basketball shoe', basePrice: 4999, salePrice: 3999, sku: 'PUMA-CP-HOOP', status: ProductStatus.ACTIVE, isActive: true, isFeatured: false, sortOrder: 5 },
    { id: U.prod6, brandId: U.brand4, categoryId: U.cat4, subCategoryId: U.sub7, name: 'Under Armour Rush Seamless Leggings', slug: 'ua-rush-seamless-leggings', description: 'Seamless training leggings with mineral-infused fabric', shortDescription: 'Training leggings', basePrice: 3499, salePrice: 2799, sku: 'UA-RUSH-LEG', status: ProductStatus.ACTIVE, isActive: true, isFeatured: false, sortOrder: 6 },
    { id: U.prod7, brandId: U.brand5, categoryId: U.cat4, subCategoryId: U.sub8, name: 'Reebok Weightlifting Belt', slug: 'reebok-weightlifting-belt', description: 'Premium leather weightlifting belt for heavy lifts', shortDescription: 'Weightlifting belt', basePrice: 2999, salePrice: 2499, sku: 'REEBOK-WLBELT', status: ProductStatus.ACTIVE, isActive: true, isFeatured: false, sortOrder: 7 },
    { id: U.prod8, brandId: U.brand6, categoryId: U.cat1, subCategoryId: U.sub1, name: 'New Balance Fresh Foam 1080v12', slug: 'nb-fresh-foam-1080v12', description: 'Plush cushioned running shoe with Fresh Foam midsole', shortDescription: 'Cushioned running shoe', basePrice: 6499, salePrice: 5199, sku: 'NB-1080V12', status: ProductStatus.ACTIVE, isActive: true, isFeatured: false, sortOrder: 8 },
    { id: U.prod9, brandId: U.brand7, categoryId: U.cat1, subCategoryId: U.sub1, name: 'ASICS Gel-Nimbus 25', slug: 'asics-gel-nimbus-25', description: 'Premium cushioned running shoe with PureGEL technology', shortDescription: 'Premium running shoe', basePrice: 7499, salePrice: 5999, sku: 'ASICS-NIMBUS25', status: ProductStatus.ACTIVE, isActive: true, isFeatured: false, sortOrder: 9 },
    { id: U.prod10, brandId: U.brand8, categoryId: U.cat6, subCategoryId: U.sub11, name: 'Columbia Voyager Jacket', slug: 'columbia-voyager-jacket', description: 'Waterproof breathable jacket for outdoor adventures', shortDescription: 'Waterproof jacket', basePrice: 4499, salePrice: 3599, sku: 'COL-VOYAGER-JKT', status: ProductStatus.ACTIVE, isActive: true, isFeatured: true, sortOrder: 10 },
    { id: U.prod11, brandId: U.brand9, categoryId: U.cat6, subCategoryId: U.sub12, name: 'The North Face Hiking Boots', slug: 'tnf-hiking-boots', description: 'Sturdy waterproof hiking boots with Vibram soles', shortDescription: 'Hiking boots', basePrice: 8999, salePrice: 7199, sku: 'TNF-HIKE-BOOT', status: ProductStatus.ACTIVE, isActive: true, isFeatured: false, sortOrder: 11 },
    { id: U.prod12, brandId: U.brand10, categoryId: U.cat3, subCategoryId: U.sub6, name: 'Wilson Evolution Basketball Jersey', slug: 'wilson-evolution-jersey', description: 'Official game basketball jersey with moisture-wicking fabric', shortDescription: 'Basketball jersey', basePrice: 2499, salePrice: 1999, sku: 'WILSON-EVO-JER', status: ProductStatus.ACTIVE, isActive: true, isFeatured: false, sortOrder: 12 },
    { id: U.prod13, brandId: U.brand2, categoryId: U.cat2, subCategoryId: U.sub4, name: 'Adidas Arsenal Home Kit 2025/26', slug: 'adidas-arsenal-away-kit-2526', description: 'Official Arsenal home jersey with heat-sealed crest', shortDescription: 'Football kit', basePrice: 3999, salePrice: 3199, sku: 'ADIDAS-ARS-HOME', status: ProductStatus.ACTIVE, isActive: true, isFeatured: true, sortOrder: 13 },
    { id: U.prod14, brandId: U.brand1, categoryId: U.cat5, subCategoryId: U.sub9, name: 'Nike Swim Jammer', slug: 'nike-swim-jammer', description: 'Competition swim jammer with water-repellent finish', shortDescription: 'Swim jammer', basePrice: 1999, salePrice: 1599, sku: 'NIKE-SWIM-JAM', status: ProductStatus.ACTIVE, isActive: true, isFeatured: false, sortOrder: 14 },
    { id: U.prod15, brandId: U.brand3, categoryId: U.cat4, subCategoryId: U.sub7, name: 'Puma Studio Yoga Mat', slug: 'puma-studio-yoga-mat', description: 'Extra thick yoga mat with alignment lines', shortDescription: 'Yoga mat', basePrice: 2999, salePrice: 2399, sku: 'PUMA-YOGA-MAT', status: ProductStatus.ACTIVE, isActive: true, isFeatured: false, sortOrder: 15 },
  ];
  const prods = await Promise.all(prodData.map(async d => {
    const exists = await prodRepo.findOne({ where: { slug: d.slug } });
    if (!exists) return prodRepo.save(prodRepo.create(d));
    return exists;
  }));
  console.log(`  Products: ${prods.length}`);

  // ───────────────────────── PRODUCT IMAGES (30) ────────────────────────────
  const imgRepo = AppDataSource.getRepository(ProductImage);
  for (let i = 0; i < prods.length; i++) {
    const p = prods[i];
    const existing = await imgRepo.count({ where: { productId: p.id } });
    if (existing === 0) {
      await imgRepo.save(imgRepo.create({ productId: p.id, imageUrl: `https://picsum.photos/seed/${p.slug}-1/800/800`, altText: p.name, sortOrder: 1, isPrimary: true }));
      await imgRepo.save(imgRepo.create({ productId: p.id, imageUrl: `https://picsum.photos/seed/${p.slug}-2/800/800`, altText: `${p.name} - Angle`, sortOrder: 2, isPrimary: false }));
    }
  }
  console.log(`  ProductImages: seeded 2 per product`);

  // ───────────────────────── PRODUCT VARIANTS (30) ───────────────────────────
  const variantRepo = AppDataSource.getRepository(ProductVariant);
  const variantData: Array<{ id: string; productId: string; sku: string; price: number; status: VariantStatus; isDefault: boolean; sortOrder: number }> = [];
  let vIdx = 1;
  for (const p of prodData) {
    if (vIdx > 30) break;
    variantData.push({ id: vid(vIdx), productId: p.id, sku: `${p.sku}-BLK-M`, price: p.salePrice, status: VariantStatus.ACTIVE, isDefault: true, sortOrder: 1 }); vIdx++;
    if (vIdx > 30) break;
    variantData.push({ id: vid(vIdx), productId: p.id, sku: `${p.sku}-WHT-L`, price: p.salePrice, status: VariantStatus.ACTIVE, isDefault: false, sortOrder: 2 }); vIdx++;
  }
  const variants = await Promise.all(variantData.map(async d => {
    const exists = await variantRepo.findOne({ where: { sku: d.sku } });
    if (!exists) return variantRepo.save(variantRepo.create(d));
    return exists;
  }));
  console.log(`  Variants: ${variants.length}`);

  // ───────────────────────── PRODUCT VARIANT ATTRIBUTES ──────────────────────
  const pvaRepo = AppDataSource.getRepository(ProductVariantAttribute);
  let pvaCount = 0;
  for (let i = 0; i < variants.length; i++) {
    const v = variants[i];
    const existing = await pvaRepo.count({ where: { variantId: v.id } });
    if (existing === 0) {
      const isBlack = v.sku.includes('BLK');
      const isM = v.sku.endsWith('-M');
      await pvaRepo.save(pvaRepo.create({ variantId: v.id, attributeId: aid(2), attributeValueId: isBlack ? avid(8) : avid(9) }));
      await pvaRepo.save(pvaRepo.create({ variantId: v.id, attributeId: aid(1), attributeValueId: isM ? avid(5) : avid(6) }));
      pvaCount += 2;
    }
  }
  console.log(`  VariantAttributes: ${pvaCount}`);

  // ───────────────────────── PRODUCT TAG MAPPINGS ────────────────────────────
  const ptmRepo = AppDataSource.getRepository(ProductTagMapping);
  let ptmCount = 0;
  for (let i = 0; i < prods.length; i++) {
    const p = prods[i];
    const existing = await ptmRepo.count({ where: { productId: p.id } });
    if (existing === 0) {
      const tagIdx = i % tags.length;
      await ptmRepo.save(ptmRepo.create({ productId: p.id, tagId: tags[tagIdx].id }));
      ptmCount++;
      if (i + 1 < tags.length) {
        await ptmRepo.save(ptmRepo.create({ productId: p.id, tagId: tags[(tagIdx + 1) % tags.length].id }));
        ptmCount++;
      }
    }
  }
  console.log(`  ProductTagMappings: ${ptmCount}`);

  // ───────────────────────── COLLECTIONS (6) ─────────────────────────────────
  const collRepo = AppDataSource.getRepository(Collection);
  const collData = [
    { name: 'Summer Essentials', slug: 'summer-essentials', description: 'Gear up for summer sports' },
    { name: 'Running Collection', slug: 'running-collection', description: 'Everything for runners' },
    { name: 'Football Fan Favorites', slug: 'football-fan-favorites', description: 'Top football gear' },
    { name: 'Gym Warriors', slug: 'gym-warriors', description: 'Training equipment & apparel' },
    { name: 'New Season Arrivals', slug: 'new-season-arrivals', description: 'Latest products' },
    { name: 'Outlet Deals', slug: 'outlet-deals', description: 'Best discounts' },
  ];
  const colls = await Promise.all(collData.map(async d => {
    const exists = await collRepo.findOne({ where: { slug: d.slug } });
    if (!exists) return collRepo.save(collRepo.create({ ...d, isActive: true }));
    return exists;
  }));
  console.log(`  Collections: ${colls.length}`);

  // ───────────────────────── PRODUCT COLLECTIONS ─────────────────────────────
  const pcRepo = AppDataSource.getRepository(ProductCollection);
  let pcCount = 0;
  for (let i = 0; i < prods.length; i += 3) {
    const ci = Math.floor(i / 3) % colls.length;
    const existing = await pcRepo.findOne({ where: { productId: prods[i].id, collectionId: colls[ci].id } });
    if (!existing) {
      await pcRepo.save(pcRepo.create({ productId: prods[i].id, collectionId: colls[ci].id }));
      pcCount++;
    }
  }
  console.log(`  ProductCollections: ${pcCount}`);

  // ───────────────────────── WAREHOUSES (2) ──────────────────────────────────
  const whRepo = AppDataSource.getRepository(Warehouse);
  const whData = [
    { id: U.wh1, name: 'Dubai Main Warehouse', code: 'DXB-MAIN', phone: '+97148001111', email: 'warehouse-dxb@sports.com', address: 'Al Quoz Industrial Area', city: 'Dubai', state: 'Dubai', country: 'UAE', postalCode: '00000', latitude: 25.135, longitude: 55.3044, isActive: true },
    { id: U.wh2, name: 'Abu Dhabi Distribution Center', code: 'AUH-DIST', phone: '+97128002222', email: 'warehouse-auh@sports.com', address: 'ICAD Industrial City', city: 'Abu Dhabi', state: 'Abu Dhabi', country: 'UAE', postalCode: '00000', latitude: 24.3997, longitude: 54.5702, isActive: true },
  ];
  const whs = await Promise.all(whData.map(async d => {
    const exists = await whRepo.findOne({ where: { code: d.code } });
    if (!exists) return whRepo.save(whRepo.create(d));
    return exists;
  }));
  console.log(`  Warehouses: ${whs.length}`);

  // ───────────────────────── INVENTORY (30 records) ──────────────────────────
  const invRepo = AppDataSource.getRepository(Inventory);
  let invCount = 0;
  for (const v of variants) {
    const exists = await invRepo.findOne({ where: { variantId: v.id } });
    if (!exists) {
      const qty = 50 + Math.floor(Math.random() * 200);
      const reserved = Math.floor(Math.random() * 10);
      await invRepo.save(invRepo.create({ variantId: v.id, quantity: qty, reservedQuantity: reserved, availableQuantity: qty - reserved, lowStockThreshold: 20 }));
      invCount++;
    }
  }
  console.log(`  Inventory: ${invCount}`);

  // ───────────────────────── DELIVERY SETTINGS ───────────────────────────────
  const dsRepo = AppDataSource.getRepository(DeliverySetting);
  const dsExists = await dsRepo.count();
  if (dsExists === 0) {
    await dsRepo.save(dsRepo.create({ perKmCharge: 2.5, freeShippingThreshold: 20000, maxDeliveryDistanceKm: 50, isActive: true }));
  }
  console.log('  DeliverySettings: done');

  // ───────────────────────── PAYMENT METHODS (4) ─────────────────────────────
  const pmRepo = AppDataSource.getRepository(PaymentMethod);
  const pmData = [
    { name: 'Credit/Debit Card', code: 'card', description: 'Visa, Mastercard, etc.', isActive: true, sortOrder: 1 },
    { name: 'Stripe', code: 'stripe', description: 'Online payment via Stripe', isActive: true, sortOrder: 2 },
    { name: 'Cash on Delivery', code: 'cod', description: 'Pay on delivery', isActive: true, sortOrder: 3 },
    { name: 'Bank Transfer', code: 'bank-transfer', description: 'Direct bank transfer', isActive: true, sortOrder: 4 },
  ];
  const pms = await Promise.all(pmData.map(async d => {
    const exists = await pmRepo.findOne({ where: { code: d.code } });
    if (!exists) return pmRepo.save(pmRepo.create(d));
    return exists;
  }));
  console.log(`  PaymentMethods: ${pms.length}`);

  // ───────────────────────── ADDRESSES (5) ───────────────────────────────────
  const addrRepo = AppDataSource.getRepository(Address);
  const addrData = [
    { id: U.addr1, userId: U.user1, fullName: 'Ahmed Ali', phone: '+971501111111', addressLine1: 'Villa 12, Al Wasl Road', city: 'Dubai', state: 'Dubai', country: 'UAE', postalCode: '00000', latitude: 25.2048, longitude: 55.2708, isDefault: true, label: 'Home' },
    { id: U.addr2, userId: U.user2, fullName: 'Sara Mohammed', phone: '+971502222222', addressLine1: 'Apartment 304, Al Reem Island', city: 'Abu Dhabi', state: 'Abu Dhabi', country: 'UAE', postalCode: '00000', latitude: 24.4672, longitude: 54.3921, isDefault: true, label: 'Home' },
    { id: U.addr3, userId: U.user3, fullName: 'Omar Hassan', phone: '+971503333333', addressLine1: 'Building 7, The Pearl', city: 'Doha', state: 'Doha', country: 'Qatar', postalCode: '00000', latitude: 25.3645, longitude: 51.5389, isDefault: true, label: 'Home' },
    { id: U.addr4, userId: U.user4, fullName: 'Fatima Khalid', phone: '+971504444444', addressLine1: 'Office 201, Sama Tower', city: 'Dubai', state: 'Dubai', country: 'UAE', postalCode: '00000', latitude: 25.2048, longitude: 55.2708, isDefault: true, label: 'Office' },
    { id: U.addr5, userId: U.user5, fullName: 'Khalid Rashid', phone: '+971505555555', addressLine1: 'Flat 15, Marina Walk', city: 'Dubai', state: 'Dubai', country: 'UAE', postalCode: '00000', latitude: 25.2048, longitude: 55.2708, isDefault: true, label: 'Home' },
  ];
  const addrs = await Promise.all(addrData.map(async d => {
    const exists = await addrRepo.findOne({ where: { id: d.id } });
    if (!exists) return addrRepo.save(addrRepo.create(d));
    return exists;
  }));
  console.log(`  Addresses: ${addrs.length}`);

  // ───────────────────────── SUPPLIERS (8) ───────────────────────────────────
  const suppRepo = AppDataSource.getRepository(Supplier);
  const suppData = [
    { name: 'SportDirect Trading', code: 'SPORT-DIRECT', email: 'info@sportdirect.ae', phone: '+97148001001', contactPerson: 'Raj Patel', isActive: true },
    { name: 'ProFit FZCO', code: 'PROFIT-FZCO', email: 'orders@profit.ae', phone: '+97148002002', contactPerson: 'John Smith', isActive: true },
    { name: 'Global Sports LLC', code: 'GLOBAL-SPORT', email: 'sales@globalsports.com', phone: '+97148003003', contactPerson: 'Maria Khan', isActive: true },
    { name: 'Athletic Gear Intl', code: 'ATHLETIC-INTL', email: 'info@athleticgear.com', phone: '+97148004004', contactPerson: 'David Chen', isActive: true },
    { name: 'Elite Fitness ME', code: 'ELITE-FIT-ME', email: 'contact@elitefitness.ae', phone: '+97148005005', contactPerson: 'Aisha Rahman', isActive: true },
    { name: 'Outdoor Pro Supplies', code: 'OUTDOOR-PRO', email: 'info@outdoorpro.ae', phone: '+97148006006', contactPerson: 'Tom Wilson', isActive: true },
    { name: 'Team Sport Trading', code: 'TEAM-SPORT', email: 'orders@teamsport.ae', phone: '+97148007007', contactPerson: 'Hassan Al Mansouri', isActive: true },
    { name: 'Aqua Sports ME', code: 'AQUA-SPORT-ME', email: 'info@aquasports.ae', phone: '+97148008008', contactPerson: 'Lisa Bennett', isActive: true },
  ];
  const suppliers = await Promise.all(suppData.map(async d => {
    const exists = await suppRepo.findOne({ where: { code: d.code } });
    if (!exists) return suppRepo.save(suppRepo.create({ ...d, address: 'Dubai, UAE' }));
    return exists;
  }));
  console.log(`  Suppliers: ${suppliers.length}`);

  // ───────────────────────── PURCHASE ORDERS (8) ─────────────────────────────
  const poRepo = AppDataSource.getRepository(PurchaseOrder);
  const poItemRepo = AppDataSource.getRepository(PurchaseOrderItem);
  const poData = [
    { poNumber: 'PO-2026-0001', supplierId: suppliers[0].id, status: PurchaseOrderStatus.RECEIVED, notes: 'Q1 restock - running shoes' },
    { poNumber: 'PO-2026-0002', supplierId: suppliers[1].id, status: PurchaseOrderStatus.APPROVED, notes: 'Training apparel order' },
    { poNumber: 'PO-2026-0003', supplierId: suppliers[2].id, status: PurchaseOrderStatus.RECEIVED, notes: 'Football boots restock' },
    { poNumber: 'PO-2026-0004', supplierId: suppliers[3].id, status: PurchaseOrderStatus.DRAFT, notes: 'Basketball gear order' },
    { poNumber: 'PO-2026-0005', supplierId: suppliers[4].id, status: PurchaseOrderStatus.RECEIVED, notes: 'Gym equipment bulk' },
    { poNumber: 'PO-2026-0006', supplierId: suppliers[5].id, status: PurchaseOrderStatus.APPROVED, notes: 'Outdoor gear seasonal' },
    { poNumber: 'PO-2026-0007', supplierId: suppliers[6].id, status: PurchaseOrderStatus.CANCELLED, notes: 'Cancelled - budget hold' },
    { poNumber: 'PO-2026-0008', supplierId: suppliers[7].id, status: PurchaseOrderStatus.DRAFT, notes: 'Swimwear summer stock' },
  ];
  const pos = await Promise.all(poData.map(async d => {
    const exists = await poRepo.findOne({ where: { poNumber: d.poNumber } });
    if (!exists) return poRepo.save(poRepo.create({ ...d, createdAt: now, updatedAt: now }));
    return exists;
  }));
  console.log(`  PurchaseOrders: ${pos.length}`);

  // ───────────────────────── PURCHASE ORDER ITEMS ────────────────────────────
  let poiCount = 0;
  for (const po of pos) {
    const existing = await poItemRepo.count({ where: { purchaseOrderId: po.id } });
    if (existing === 0) {
      const idx = pos.indexOf(po);
      const v = variants[idx % variants.length];
      const qty = 10 + Math.floor(Math.random() * 40);
      const cost = Math.floor((idx + 1) * 1000 * (0.5 + Math.random() * 0.3));
      await poItemRepo.save(poItemRepo.create({ purchaseOrderId: po.id, variantId: v.id, quantity: qty, costPrice: cost, lineTotal: qty * cost }));
      poiCount++;
      if (idx + 1 < variants.length) {
        const v2 = variants[(idx + 1) % variants.length];
        const qty2 = 5 + Math.floor(Math.random() * 30);
        await poItemRepo.save(poItemRepo.create({ purchaseOrderId: po.id, variantId: v2.id, quantity: qty2, costPrice: cost, lineTotal: qty2 * cost }));
        poiCount++;
      }
    }
  }
  console.log(`  PurchaseOrderItems: ${poiCount}`);

  // ───────────────────────── GOODS RECEIPTS ──────────────────────────────────
  const grRepo = AppDataSource.getRepository(GoodsReceipt);
  const grItemRepo = AppDataSource.getRepository(GoodsReceiptItem);
  let grCount = 0;
  for (const po of pos.filter(p => p.status === PurchaseOrderStatus.RECEIVED)) {
    const exists = await grRepo.findOne({ where: { purchaseOrderId: po.id } });
    if (!exists) {
      const gr = await grRepo.save(grRepo.create({ receiptNumber: `GR-${po.poNumber}`, purchaseOrderId: po.id, notes: 'Received in full' }));
      const items = await poItemRepo.find({ where: { purchaseOrderId: po.id } });
      for (const item of items) {
        await grItemRepo.save(grItemRepo.create({ receiptId: gr.id, variantId: item.variantId, quantityReceived: item.quantity }));
      }
      grCount++;
    }
  }
  console.log(`  GoodsReceipts: ${grCount}`);

  // ───────────────────────── CARTS ────────────────────────────────────────────
  const cartRepo = AppDataSource.getRepository(Cart);
  const cartItemRepo = AppDataSource.getRepository(CartItem);
  let cartCount = 0;
  for (let i = 0; i < 5; i++) {
    const u = users[i];
    const exists = await cartRepo.findOne({ where: { userId: u.id } });
    if (!exists) {
      const v = variants[i * 2];
      const cart = await cartRepo.save(cartRepo.create({ userId: u.id, subtotal: v.price, totalItems: 1 }));
      await cartItemRepo.save(cartItemRepo.create({ cartId: cart.id, variantId: v.id, quantity: 1, unitPrice: v.price, lineTotal: v.price }));
      cartCount++;
    }
  }
  console.log(`  Carts: ${cartCount}`);

  // ───────────────────────── WISHLISTS ────────────────────────────────────────
  const wlRepo = AppDataSource.getRepository(Wishlist);
  const wlItemRepo = AppDataSource.getRepository(WishlistItem);
  let wlCount = 0;
  for (let i = 0; i < 5; i++) {
    const u = users[i];
    const exists = await wlRepo.findOne({ where: { userId: u.id } });
    if (!exists) {
      const wl = await wlRepo.save(wlRepo.create({ userId: u.id, totalItems: 2 }));
      await wlItemRepo.save(wlItemRepo.create({ wishlistId: wl.id, productId: prods[i * 3].id, variantId: variants[i * 2].id }));
      await wlItemRepo.save(wlItemRepo.create({ wishlistId: wl.id, productId: prods[(i * 3 + 1) % prods.length].id, variantId: variants[(i * 2 + 1) % variants.length].id }));
      wlCount++;
    }
  }
  console.log(`  Wishlists: ${wlCount}`);

  // ───────────────────────── ORDERS (5) ───────────────────────────────────────
  const orderRepo = AppDataSource.getRepository(Order);
  const oiRepo = AppDataSource.getRepository(OrderItem);
  const orderData = [
    { id: U.order1, userId: U.user1, orderNumber: 'ORD-2026-00001', status: OrderStatus.DELIVERED, subtotal: 4399, shippingAmount: 0, totalAmount: 4399, paidAmount: 4399, paymentStatus: PaymentStatus.PAID, shippingAddressId: U.addr1, warehouseId: U.wh1 },
    { id: U.order2, userId: U.user2, orderNumber: 'ORD-2026-00002', status: OrderStatus.SHIPPED, subtotal: 7998, shippingAmount: 0, totalAmount: 7998, paidAmount: 7998, paymentStatus: PaymentStatus.PAID, shippingAddressId: U.addr2, warehouseId: U.wh1 },
    { id: U.order3, userId: U.user3, orderNumber: 'ORD-2026-00003', status: OrderStatus.PENDING, subtotal: 11998, shippingAmount: 500, totalAmount: 12498, paidAmount: 0, paymentStatus: PaymentStatus.PENDING, shippingAddressId: U.addr3, warehouseId: U.wh2 },
    { id: U.order4, userId: U.user1, orderNumber: 'ORD-2026-00004', status: OrderStatus.PROCESSING, subtotal: 5199, shippingAmount: 0, totalAmount: 5199, paidAmount: 5199, paymentStatus: PaymentStatus.PAID, shippingAddressId: U.addr1, warehouseId: U.wh1 },
    { id: U.order5, userId: U.user5, orderNumber: 'ORD-2026-00005', status: OrderStatus.CANCELLED, subtotal: 6399, shippingAmount: 0, totalAmount: 6399, paidAmount: 0, paymentStatus: PaymentStatus.REFUNDED, shippingAddressId: U.addr5, warehouseId: U.wh2 },
  ];
  const orderItemMap: Record<string, Array<{ productId: string; variantId: string; productName: string; sku: string; quantity: number; unitPrice: number; totalPrice: number }>> = {
    [U.order1]: [{ productId: U.prod1, variantId: variants[0].id, productName: 'Nike Air Zoom Pegasus 40', sku: variants[0].sku, quantity: 1, unitPrice: 4399, totalPrice: 4399 }],
    [U.order2]: [{ productId: U.prod4, variantId: variants[6].id, productName: 'Adidas Running Ultraboost Light', sku: variants[6].sku, quantity: 1, unitPrice: 6399, totalPrice: 6399 }, { productId: U.prod2, variantId: variants[2].id, productName: 'Nike Dri-FIT Training Tee', sku: variants[2].sku, quantity: 1, unitPrice: 1199, totalPrice: 1199 }],
    [U.order3]: [{ productId: U.prod10, variantId: variants[18].id, productName: 'Columbia Voyager Jacket', sku: variants[18].sku, quantity: 2, unitPrice: 3599, totalPrice: 7198 }, { productId: U.prod11, variantId: variants[20].id, productName: 'The North Face Hiking Boots', sku: variants[20].sku, quantity: 1, unitPrice: 4800, totalPrice: 4800 }],
    [U.order4]: [{ productId: U.prod8, variantId: variants[14].id, productName: 'New Balance Fresh Foam 1080v12', sku: variants[14].sku, quantity: 1, unitPrice: 5199, totalPrice: 5199 }],
    [U.order5]: [{ productId: U.prod4, variantId: variants[6].id, productName: 'Adidas Running Ultraboost Light', sku: variants[6].sku, quantity: 1, unitPrice: 6399, totalPrice: 6399 }],
  };
  const orders = await Promise.all(orderData.map(async d => {
    const exists = await orderRepo.findOne({ where: { orderNumber: d.orderNumber } });
    if (!exists) {
      const order = await orderRepo.save(orderRepo.create({
        id: d.id, userId: d.userId, orderNumber: d.orderNumber, status: d.status,
        subtotal: d.subtotal, shippingAmount: d.shippingAmount, discountAmount: 0, totalAmount: d.totalAmount,
        paidAmount: d.paidAmount, paymentStatus: d.paymentStatus,
        shippingAddressId: d.shippingAddressId, warehouseId: d.warehouseId,
      }));
      const items = orderItemMap[d.id] || [];
      for (const it of items) {
        await oiRepo.save(oiRepo.create({ orderId: order.id, ...it }));
      }
      return order;
    }
    return exists;
  }));
  console.log(`  Orders: ${orders.length}`);

  // ───────────────────────── PAYMENTS ─────────────────────────────────────────
  const payRepo = AppDataSource.getRepository(Payment);
  const payLogRepo = AppDataSource.getRepository(PaymentLog);
  const payRefundRepo = AppDataSource.getRepository(PaymentRefund);
  let payCount = 0;
  for (const o of orders.filter(o => o.paymentStatus === PaymentStatus.PAID || o.paymentStatus === PaymentStatus.REFUNDED)) {
    const exists = await payRepo.findOne({ where: { orderId: o.id } });
    if (!exists) {
      const pay = await payRepo.save(payRepo.create({ orderId: o.id, paymentMethodId: pms[0].id, transactionNumber: `TXN-${o.orderNumber}`, amount: o.totalAmount, status: PaymentStatus.PAID }));
      await payLogRepo.save(payLogRepo.create({ paymentId: pay.id, action: 'PAYMENT_CAPTURED', message: 'Payment captured successfully' }));
      if (o.paymentStatus === PaymentStatus.REFUNDED) {
        await payRefundRepo.save(payRefundRepo.create({ paymentId: pay.id, refundAmount: o.totalAmount, reason: 'Order cancelled by customer', processedAt: new Date() }));
      }
      payCount++;
    }
  }
  console.log(`  Payments: ${payCount}`);

  // ───────────────────────── SHIPMENTS ────────────────────────────────────────
  const shipRepo = AppDataSource.getRepository(Shipment);
  const trackRepo = AppDataSource.getRepository(ShipmentTrackingLog);
  let shipCount = 0;
  for (const o of orders.filter(o => o.status !== OrderStatus.PENDING && o.status !== OrderStatus.CANCELLED)) {
    const exists = await shipRepo.findOne({ where: { orderId: o.id } });
    if (!exists) {
      const shipStatus = o.status === OrderStatus.DELIVERED ? ShipmentStatus.DELIVERED : o.status === OrderStatus.SHIPPED ? ShipmentStatus.OUT_FOR_DELIVERY : ShipmentStatus.PACKED;
      const s = await shipRepo.save(shipRepo.create({
        orderId: o.id, warehouseId: U.wh1, trackingNumber: `TRK-${o.orderNumber}`,
        status: shipStatus,
      }));
      await trackRepo.save(trackRepo.create({ shipmentId: s.id, status: s.status, note: `Shipment ${s.status.toLowerCase()}` }));
      if (o.status === OrderStatus.DELIVERED) {
        await trackRepo.save(trackRepo.create({ shipmentId: s.id, status: ShipmentStatus.DELIVERED, note: 'Package delivered successfully' }));
      }
      shipCount++;
    }
  }
  console.log(`  Shipments: ${shipCount}`);

  // ───────────────────────── SUPPORT TICKETS (5) ──────────────────────────────
  const ticketRepo = AppDataSource.getRepository(SupportTicket);
  const msgRepo = AppDataSource.getRepository(TicketMessage);
  const assignRepo = AppDataSource.getRepository(TicketAssignment);
  const noteRepo = AppDataSource.getRepository(TicketNote);
  const auditRepo = AppDataSource.getRepository(TicketAudit);
  const tagTicketRepo = AppDataSource.getRepository(TicketTag);
  const slaRepo = AppDataSource.getRepository(TicketSlaLog);
  const ratingRepo = AppDataSource.getRepository(TicketRating);
  const attRepo = AppDataSource.getRepository(TicketAttachment);

  // Get or create admin user
  const adminRepo = AppDataSource.getRepository(AdminUser);
  let admin = await adminRepo.findOne({ where: { email: 'admin@sport.com' } });
  if (!admin) {
    admin = await adminRepo.save(adminRepo.create({ id: U.admin, name: 'Super Admin', email: 'admin@sport.com', passwordHash: await bcrypt.hash('SuperAdmin@123', 12), isActive: true }));
  }
  const adminId = admin.id;

  const ticketData: Array<{ id: string; customerId: string; ticketNumber: string; status: TicketStatus; priority: TicketPriority; category: TicketCategory; subject: string; description: string }> = [
    { id: U.ticket1, customerId: U.user1, ticketNumber: 'TKT-2026-00001', status: TicketStatus.RESOLVED, priority: TicketPriority.LOW, category: TicketCategory.ORDER_ISSUE, subject: 'Wrong size delivered', description: 'I ordered size 42 but received size 44 in my running shoes.' },
    { id: U.ticket2, customerId: U.user2, ticketNumber: 'TKT-2026-00002', status: TicketStatus.IN_PROGRESS, priority: TicketPriority.HIGH, category: TicketCategory.PAYMENT_ISSUE, subject: 'Double charge on my card', description: 'My card was charged twice for order ORD-2026-00002.' },
    { id: U.ticket3, customerId: U.user3, ticketNumber: 'TKT-2026-00003', status: TicketStatus.OPEN, priority: TicketPriority.MEDIUM, category: TicketCategory.PRODUCT_ISSUE, subject: 'Product defect inquiry', description: 'My Columbia jacket has a stitching defect on the left sleeve.' },
    { id: U.ticket4, customerId: U.user4, ticketNumber: 'TKT-2026-00004', status: TicketStatus.CLOSED, priority: TicketPriority.LOW, category: TicketCategory.SHIPPING_ISSUE, subject: 'Shipping delay question', description: 'My order is delayed, when will it arrive?' },
    { id: U.ticket5, customerId: U.user5, ticketNumber: 'TKT-2026-00005', status: TicketStatus.OPEN, priority: TicketPriority.URGENT, category: TicketCategory.RETURN_ISSUE, subject: 'Return not processed', description: 'I returned my order 5 days ago but no refund yet.' },
  ];
  for (const d of ticketData) {
    const exists = await ticketRepo.findOne({ where: { ticketNumber: d.ticketNumber } });
    if (exists) continue;
    const t = await ticketRepo.save(ticketRepo.create(d));
    await msgRepo.save(msgRepo.create({ ticketId: t.id, senderId: d.customerId, senderType: SenderType.CUSTOMER, message: d.description }));
    if (d.status !== TicketStatus.OPEN) {
      await assignRepo.save(assignRepo.create({ ticketId: t.id, assignedTo: adminId, assignedBy: adminId }));
      await msgRepo.save(msgRepo.create({ ticketId: t.id, senderId: adminId, senderType: SenderType.ADMIN, message: `Thank you for contacting us. We are looking into your issue regarding: ${d.subject}` }));
    }
    if (d.status === TicketStatus.RESOLVED || d.status === TicketStatus.CLOSED) {
      await msgRepo.save(msgRepo.create({ ticketId: t.id, senderId: adminId, senderType: SenderType.ADMIN, message: 'This ticket has been resolved. Please let us know if you need further assistance.' }));
      await slaRepo.save(slaRepo.create({ ticketId: t.id, firstResponseAt: new Date(Date.now() - 86400000), resolvedAt: new Date(), responseMinutes: 45, resolutionMinutes: 2880 }));
      await ratingRepo.save(ratingRepo.create({ ticketId: t.id, rating: 4, comment: 'Quick response, issue resolved.' }));
    }
    if (d.status === TicketStatus.CLOSED) {
      await tagTicketRepo.save(tagTicketRepo.create({ ticketId: t.id, tag: 'completed' }));
    }
    await noteRepo.save(noteRepo.create({ ticketId: t.id, note: `Initial ticket created by customer`, createdBy: adminId }));
    await auditRepo.save(auditRepo.create({ ticketId: t.id, action: 'CREATED', performedBy: d.customerId }));
    await attRepo.save(attRepo.create({ ticketId: t.id, fileUrl: 'https://picsum.photos/seed/ticket-attachment/400/300', fileName: 'issue-photo.jpg', uploadedBy: d.customerId }));
  }
  console.log('  SupportTickets: 5');

  // ───────────────────────── RETURN REASONS (6) ──────────────────────────────
  const rrRepo = AppDataSource.getRepository(ReturnReasonMaster);
  const rrData = [
    { code: 'DEFECTIVE', title: 'Defective / Damaged', isActive: true },
    { code: 'WRONG_ITEM', title: 'Wrong item received', isActive: true },
    { code: 'SIZE_ISSUE', title: 'Size / Fit issue', isActive: true },
    { code: 'NOT_AS_DESC', title: 'Not as described', isActive: true },
    { code: 'LATE_DELIVERY', title: 'Late delivery', isActive: true },
    { code: 'CHANGED_MIND', title: 'Changed mind', isActive: true },
  ];
  for (const d of rrData) {
    const exists = await rrRepo.findOne({ where: { code: d.code } });
    if (!exists) await rrRepo.save(rrRepo.create(d));
  }
  console.log('  ReturnReasons: 6');

  // ───────────────────────── RETURN REQUESTS (3) ─────────────────────────────
  const retRepo = AppDataSource.getRepository(ReturnRequest);
  const retItemRepo = AppDataSource.getRepository(ReturnItem);
  const retAuditRepo = AppDataSource.getRepository(ReturnAudit);
  const revShipRepo = AppDataSource.getRepository(ReverseShipment);
  const retData = [
    { returnNumber: 'RET-2026-00001', orderId: U.order1, userId: U.user1, status: ReturnRequestStatus.APPROVED, reason: ReturnReason.WRONG_SIZE, notes: 'Wrong shoe size delivered' },
    { returnNumber: 'RET-2026-00002', orderId: U.order4, userId: U.user1, status: ReturnRequestStatus.REQUESTED, reason: ReturnReason.DEFECTIVE, notes: 'Stitching came undone' },
    { returnNumber: 'RET-2026-00003', orderId: U.order2, userId: U.user2, status: ReturnRequestStatus.REFUNDED, reason: ReturnReason.WRONG_ITEM, notes: 'Received wrong color variant' },
  ];
  for (const d of retData) {
    const exists = await retRepo.findOne({ where: { returnNumber: d.returnNumber } });
    if (exists) continue;
    const rt = await retRepo.save(retRepo.create({ ...d, requestedAt: new Date() }));
    const orderItems = await oiRepo.find({ where: { orderId: d.orderId } });
    if (orderItems.length > 0) {
      await retItemRepo.save(retItemRepo.create({ returnRequestId: rt.id, orderItemId: orderItems[0].id, quantity: 1, reason: d.reason, condition: ReturnItemCondition.DAMAGED, refundAmount: orderItems[0].totalPrice }));
    }
    await retAuditRepo.save(retAuditRepo.create({ returnRequestId: rt.id, action: 'CREATED', performedBy: null, notes: 'Return initiated by customer' }));
    if (d.status === ReturnRequestStatus.APPROVED || d.status === ReturnRequestStatus.REFUNDED) {
      await retAuditRepo.save(retAuditRepo.create({ returnRequestId: rt.id, action: 'APPROVED', performedBy: adminId, notes: 'Return approved' }));
      await revShipRepo.save(revShipRepo.create({ returnRequestId: rt.id, courierName: 'Aramex', trackingNumber: `RET-TRK-${d.returnNumber}`, status: ReverseShipmentStatus.PICKED_UP }));
    }
    if (d.status === ReturnRequestStatus.REFUNDED) {
      await retAuditRepo.save(retAuditRepo.create({ returnRequestId: rt.id, action: 'REFUNDED', performedBy: adminId, notes: 'Refund processed' }));
    }
  }
  console.log('  ReturnRequests: 3');

  // ───────────────────────── REVIEWS (10) ─────────────────────────────────────
  const revRepo = AppDataSource.getRepository(Review);
  const revImgRepo = AppDataSource.getRepository(ReviewImage);
  const voteRepo = AppDataSource.getRepository(ReviewHelpfulVote);
  const reportRepo = AppDataSource.getRepository(ReviewReport);
  for (let i = 0; i < 10; i++) {
    const u = users[i % users.length];
    const p = prods[i % prods.length];
    const o = orders[i % orders.length];
    const existing = await revRepo.findOne({ where: { userId: u.id, productId: p.id } });
    if (existing) continue;
    const ratings = [5, 4, 5, 3, 4, 5, 2, 4, 5, 4];
    const titles = ['Amazing product!', 'Great value', 'Perfect fit', 'Good but could improve', 'Love it!', 'Excellent quality', 'Not what I expected', 'Great purchase', 'Highly recommend', 'Solid choice'];
    const reviews = ['Really happy with this purchase. Quality exceeded expectations.', 'Good product for the price. Shipping was fast.', 'Perfect fit and comfortable. Will buy again.', 'Decent quality but a bit pricey.', 'Love the design and comfort level is great.', 'Excellent build quality. Very satisfied.', 'Expected better based on reviews. Okay for the price.', 'Great purchase, fast delivery, exactly as described.', 'Highly recommend to anyone looking for quality gear.', 'Solid product, does what it says. Good value.'];
    const ois = await oiRepo.find({ where: { orderId: o.id } });
    const oi = ois[i % ois.length];
    if (!oi) continue;
    const existingItemReview = await revRepo.findOne({ where: { orderItemId: oi.id } });
    if (existingItemReview) continue;
    const r = await revRepo.save(revRepo.create({
      userId: u.id, productId: p.id, variantId: variants[i % variants.length].id,
      orderId: o.id, orderItemId: oi.id,
      rating: ratings[i], title: titles[i], comment: reviews[i],
      isVerifiedPurchase: true, status: i < 8 ? ReviewStatus.APPROVED : ReviewStatus.PENDING, helpfulCount: Math.floor(Math.random() * 20),
    }));
    await revImgRepo.save(revImgRepo.create({ reviewId: r.id, imageUrl: `https://picsum.photos/seed/review-${i}/400/400`, sortOrder: 1 }));
    if (i < 3) {
      const voter = users[(i + 3) % users.length];
      const vExists = await voteRepo.findOne({ where: { reviewId: r.id, userId: voter.id } });
      if (!vExists) await voteRepo.save(voteRepo.create({ reviewId: r.id, userId: voter.id }));
    }
  }
  console.log('  Reviews: 10');

  // ───────────────────────── QUESTIONS (6) ────────────────────────────────────
  const qRepo = AppDataSource.getRepository(ProductQuestion);
  const aRepo = AppDataSource.getRepository(ProductAnswer);
  const qData = [
    { productId: U.prod1, userId: U.user6, question: 'Is this shoe true to size?', status: QuestionStatus.ANSWERED },
    { productId: U.prod3, userId: U.user7, question: 'Are these boots suitable for artificial grass?', status: QuestionStatus.ANSWERED },
    { productId: U.prod6, userId: U.user8, question: 'Is this machine washable?', status: QuestionStatus.OPEN },
    { productId: U.prod10, userId: U.user9, question: 'Is this jacket waterproof for heavy rain?', status: QuestionStatus.ANSWERED },
    { productId: U.prod13, userId: U.user10, question: 'Does this jersey have player names on the back?', status: QuestionStatus.OPEN },
    { productId: U.prod15, userId: U.user1, question: 'What is the thickness of this mat in mm?', status: QuestionStatus.ANSWERED },
  ];
  for (const d of qData) {
    const exists = await qRepo.findOne({ where: { productId: d.productId, userId: d.userId, question: d.question } });
    if (exists) continue;
    const q = await qRepo.save(qRepo.create(d));
    if (d.status === QuestionStatus.ANSWERED) {
      await aRepo.save(aRepo.create({ questionId: q.id, userId: adminId, answer: 'Thank you for your question. Yes, this product meets the expected standards. Please contact support for specific details.', isAdminAnswer: true }));
    }
  }
  console.log('  Questions: 6');

  // ───────────────────────── COUPONS (5) ──────────────────────────────────────
  const coupRepo = AppDataSource.getRepository(Coupon);
  const coupData = [
    { code: 'WELCOME10', type: CouponType.PERCENTAGE, value: 10, minimumOrderAmount: 5000, maxUses: 100, maxUsesPerUser: 1, isActive: true },
    { code: 'SPORTS20', type: CouponType.PERCENTAGE, value: 20, minimumOrderAmount: 10000, maxUses: 50, maxUsesPerUser: 1, isActive: true },
    { code: 'FLAT500', type: CouponType.FIXED_AMOUNT, value: 500, minimumOrderAmount: 3000, maxUses: 200, maxUsesPerUser: 3, isActive: true },
    { code: 'SUMMER25', type: CouponType.PERCENTAGE, value: 25, minimumOrderAmount: 15000, maxUses: 30, maxUsesPerUser: 1, isActive: true },
    { code: 'FREESHIP', type: CouponType.FREE_SHIPPING, value: 0, minimumOrderAmount: 15000, maxUses: 500, maxUsesPerUser: 5, isActive: true },
  ];
  for (const d of coupData) {
    const exists = await coupRepo.findOne({ where: { code: d.code } });
    if (!exists) await coupRepo.save(coupRepo.create({
      ...d, startDate: new Date('2026-01-01'), endDate: new Date('2026-12-31'),
    }));
  }
  console.log('  Coupons: 5');

  // ───────────────────────── PROMOTIONS (4) ──────────────────────────────────
  const promRepo = AppDataSource.getRepository(Promotion);
  const promProdRepo = AppDataSource.getRepository(PromotionProduct);
  const promCatRepo = AppDataSource.getRepository(PromotionCategory);
  const promData = [
    { name: 'Summer Sale', description: 'Up to 30% off summer essentials', type: PromotionType.PRODUCT_DISCOUNT, discountValue: 15, isActive: true, priority: 1 },
    { name: 'Clearance Blowout', description: 'Last chance deals', type: PromotionType.FLASH_SALE, discountValue: 40, isActive: true, priority: 2 },
    { name: 'Buy More Save More', description: 'Discount on bulk purchases', type: PromotionType.CART_DISCOUNT, discountValue: 10, isActive: true, priority: 3 },
    { name: 'Loyalty Bonus', description: 'Exclusive discount for returning customers', type: PromotionType.CART_DISCOUNT, discountValue: 2000, isActive: true, priority: 4 },
  ];
  for (const d of promData) {
    const exists = await promRepo.findOne({ where: { name: d.name } });
    if (!exists) {
      const prom = await promRepo.save(promRepo.create({ ...d, startDate: new Date('2026-06-01'), endDate: new Date('2026-08-31') }));
      const prodIdx = promData.indexOf(d) * 3;
      if (prodIdx < prods.length) {
        await promProdRepo.save(promProdRepo.create({ promotionId: prom.id, productId: prods[prodIdx].id }));
      }
      if (promData.indexOf(d) < 3) {
        await promCatRepo.save(promCatRepo.create({ promotionId: prom.id, categoryId: cats[promData.indexOf(d)].id }));
      }
    }
  }
  console.log('  Promotions: 4');

  // ───────────────────────── CAMPAIGNS (3) ────────────────────────────────────
  const campRepo = AppDataSource.getRepository(Campaign);
  const campData = [
    { name: 'Summer Fitness Challenge', description: 'Promoting summer fitness gear', type: CouponCampaignType.SUMMER_SALE, discountValue: 15, isActive: true },
    { name: 'Back to Sport', description: 'New season, new gear', type: CouponCampaignType.CUSTOM, discountValue: 10, isActive: true },
    { name: 'Weekend Flash Sale', description: '48-hour flash sale', type: CouponCampaignType.CLEARANCE, discountValue: 25, isActive: true },
  ];
  for (const d of campData) {
    const exists = await campRepo.findOne({ where: { name: d.name } });
    if (!exists) await campRepo.save(campRepo.create({ ...d, startDate: new Date('2026-06-01'), endDate: new Date('2026-08-31') }));
  }
  console.log('  Campaigns: 3');

  // ───────────────────────── EMAIL TEMPLATES (4) ─────────────────────────────
  const etRepo = AppDataSource.getRepository(EmailTemplate);
  const etData = [
    { code: 'WELCOME_EMAIL', name: 'Welcome Email', subjectTemplate: 'Welcome to Sports!', bodyTemplate: '<h1>Welcome {{name}}!</h1><p>Thank you for joining.</p>', active: true },
    { code: 'ORDER_CONFIRMATION', name: 'Order Confirmation', subjectTemplate: 'Order #{{orderNumber}} Confirmed', bodyTemplate: '<h1>Order Confirmed</h1><p>Your order #{{orderNumber}} has been placed.</p>', active: true },
    { code: 'SHIPPING_UPDATE', name: 'Shipping Update', subjectTemplate: 'Your Order #{{orderNumber}} Has Shipped', bodyTemplate: '<h1>Shipped!</h1><p>Track your order: {{trackingUrl}}</p>', active: true },
    { code: 'RESET_PASSWORD', name: 'Password Reset', subjectTemplate: 'Reset Your Password', bodyTemplate: '<h1>Password Reset</h1><p>Click <a href="{{resetLink}}">here</a> to reset.</p>', active: true },
  ];
  for (const d of etData) {
    const exists = await etRepo.findOne({ where: { code: d.code } });
    if (!exists) await etRepo.save(etRepo.create(d));
  }
  console.log('  EmailTemplates: 4');

  // ───────────────────────── EMAIL PREFERENCES ───────────────────────────────
  const epRefRepo = AppDataSource.getRepository(EmailPreference);
  for (const u of users.slice(0, 5)) {
    const exists = await epRefRepo.findOne({ where: { userId: u.id } });
    if (!exists) await epRefRepo.save(epRefRepo.create({ userId: u.id, marketingEmailsEnabled: true, transactionalEmailsEnabled: true }));
  }
  console.log('  EmailPreferences: 5');

  // ───────────────────────── EMAIL NOTIFICATIONS ─────────────────────────────
  const notifRepo = AppDataSource.getRepository(EmailNotification);
  const logRepo = AppDataSource.getRepository(EmailLog);
  for (const o of orders) {
    const u = users.find(us => us.id === o.userId);
    if (!u) continue;
    const subject = `Order #${o.orderNumber} - ${o.status}`;
    const exists = await notifRepo.findOne({ where: { recipientEmail: u.email, subject } });
    if (!exists) {
      const n = await notifRepo.save(notifRepo.create({ userId: u.id, recipientEmail: u.email, subject, body: `Your order #${o.orderNumber} is ${o.status.toLowerCase()}.`, status: NotificationStatus.SENT, type: TransactionalEmailType.ORDER_CREATED, sentAt: new Date() }));
      await logRepo.save(logRepo.create({ notificationId: n.id, provider: 'smtp', status: NotificationStatus.SENT, deliveredAt: new Date() }));
    }
  }
  console.log('  EmailNotifications: seeded per order');

  // ───────────────────────── EMAIL CAMPAIGNS ─────────────────────────────────
  const ecRepo = AppDataSource.getRepository(EmailCampaign);
  const ecData = [
    { name: 'June Newsletter', subject: 'Your Monthly Sports Update', body: '<h1>June Newsletter</h1><p>Check out our latest arrivals!</p>', type: EmailCampaignType.PROMOTIONAL, status: CampaignStatus.SENT, scheduledAt: new Date('2026-06-01'), sentAt: new Date('2026-06-01'), totalRecipients: 500 },
    { name: 'Summer Sale Alert', subject: 'Summer Sale - Up to 40% Off!', body: '<h1>Summer Sale</h1><p>Don\'t miss out on our biggest sale of the season.</p>', type: EmailCampaignType.PROMOTIONAL, status: CampaignStatus.SCHEDULED, scheduledAt: new Date('2026-07-01'), totalRecipients: 1000 },
  ];
  for (const d of ecData) {
    const exists = await ecRepo.findOne({ where: { name: d.name } });
    if (!exists) await ecRepo.save(ecRepo.create(d));
  }
  console.log('  EmailCampaigns: 2');

  // ───────────────────────── FINANCIAL TRANSACTIONS ──────────────────────────
  const ftRepo = AppDataSource.getRepository(FinancialTransaction);
  const leRepo = AppDataSource.getRepository(LedgerEntry);
  for (const o of orders) {
    const exists = await ftRepo.findOne({ where: { referenceId: o.id } });
    if (!exists) {
      const ft = await ftRepo.save(ftRepo.create({
        transactionNumber: `FT-${o.orderNumber}`, type: TransactionType.ORDER_PAYMENT, amount: o.totalAmount, status: o.paymentStatus === PaymentStatus.PAID ? 'COMPLETED' : 'PENDING',
        referenceType: 'ORDER', referenceId: o.id, description: `Payment for order #${o.orderNumber}`,
      }));
      await leRepo.save(leRepo.create({ transactionId: ft.id, accountCode: '4000', accountName: 'Sales Revenue', creditAmount: o.totalAmount, debitAmount: 0 }));
      await leRepo.save(leRepo.create({ transactionId: ft.id, accountCode: '1000', accountName: 'Cash/Bank', debitAmount: o.totalAmount, creditAmount: 0 }));
    }
  }
  console.log('  FinancialTransactions: seeded');

  // ───────────────────────── SETTLEMENTS (3) ─────────────────────────────────
  const settRepo = AppDataSource.getRepository(Settlement);
  const settData = [
    { settlementNumber: 'STL-2026-00001', supplierId: suppliers[0].id, amount: 50000, status: SettlementStatus.COMPLETED, settlementDate: new Date('2026-06-01'), dueDate: new Date('2026-06-15'), description: 'Monthly payment - Nike products' },
    { settlementNumber: 'STL-2026-00002', supplierId: suppliers[1].id, amount: 35000, status: SettlementStatus.PENDING, settlementDate: new Date('2026-06-15'), dueDate: new Date('2026-06-30'), description: 'Training apparel settlement' },
    { settlementNumber: 'STL-2026-00003', supplierId: suppliers[2].id, amount: 75000, status: SettlementStatus.PROCESSING, settlementDate: new Date('2026-06-10'), dueDate: new Date('2026-06-25'), description: 'Football equipment settlement' },
  ];
  for (const d of settData) {
    const exists = await settRepo.findOne({ where: { settlementNumber: d.settlementNumber } });
    if (!exists) await settRepo.save(settRepo.create(d));
  }
  console.log('  Settlements: 3');

  // ───────────────────────── EXPENSE RECORDS (5) ─────────────────────────────
  const expRepo = AppDataSource.getRepository(ExpenseRecord);
  const expData = [
    { category: 'RENT', amount: 50000, expenseDate: new Date('2026-06-01'), description: 'Warehouse rent June 2026', vendorName: 'Dubai Properties', createdBy: adminId },
    { category: 'UTILITIES', amount: 8500, expenseDate: new Date('2026-06-05'), description: 'Electricity & water bill', vendorName: 'DEWA', createdBy: adminId },
    { category: 'SALARY', amount: 120000, expenseDate: new Date('2026-06-01'), description: 'Staff salaries June', vendorName: 'Internal', createdBy: adminId },
    { category: 'LOGISTICS', amount: 15000, expenseDate: new Date('2026-06-08'), description: 'Shipping partner fees', vendorName: 'Aramex', createdBy: adminId },
    { category: 'MARKETING', amount: 25000, expenseDate: new Date('2026-06-10'), description: 'Social media campaign', vendorName: 'Meta Ads', createdBy: adminId },
  ];
  for (const d of expData) {
    const exists = await expRepo.findOne({ where: { description: d.description, expenseDate: d.expenseDate } });
    if (!exists) await expRepo.save(expRepo.create(d));
  }
  console.log('  ExpenseRecords: 5');

  // ───────────────────────── TAX RECORDS ─────────────────────────────────────
  const taxRepo = AppDataSource.getRepository(TaxRecord);
  for (const o of orders) {
    const exists = await taxRepo.findOne({ where: { orderId: o.id } });
    if (!exists) await taxRepo.save(taxRepo.create({ orderId: o.id, taxableAmount: o.totalAmount, taxAmount: Math.round(o.totalAmount * 0.05), taxRate: 5, taxType: 'VAT', taxDate: new Date() }));
  }
  console.log('  TaxRecords: seeded');

  // ───────────────────────── FINANCIAL AUDITS ────────────────────────────────
  const faRepo = AppDataSource.getRepository(FinancialAudit);
  const faData = [
    { actionType: 'RECONCILIATION', entityType: 'ORDER', entityId: U.order1, performedBy: adminId, details: { status: 'verified' }, notes: 'Monthly reconciliation completed' },
    { actionType: 'AUDIT', entityType: 'SETTLEMENT', entityId: null, performedBy: adminId, details: { status: 'audited' }, notes: 'Q2 settlement audit' },
  ];
  for (const d of faData) {
    await faRepo.save(faRepo.create(d));
  }
  console.log('  FinancialAudits: 2');

  // ───────────────────────── DASHBOARD SNAPSHOTS ─────────────────────────────
  const dashRepo = AppDataSource.getRepository(DashboardSnapshot);
  const dashData = [
    { snapshotDate: new Date('2026-06-15'), dashboardType: DashboardType.MAIN, metricsJson: { totalRevenue: 125000, totalOrders: 45, activeUsers: 120, conversionRate: 3.2 } },
    { snapshotDate: new Date('2026-06-14'), dashboardType: DashboardType.MAIN, metricsJson: { totalRevenue: 118000, totalOrders: 42, activeUsers: 115, conversionRate: 3.1 } },
    { snapshotDate: new Date('2026-06-15'), dashboardType: DashboardType.FINANCE, metricsJson: { revenue: 125000, expenses: 218500, profit: -93500, pendingInvoices: 8 } },
  ];
  for (const d of dashData) {
    await dashRepo.save(dashRepo.create(d));
  }
  console.log('  DashboardSnapshots: 3');

  // ───────────────────────── SAVED REPORTS (3) ───────────────────────────────
  const srRepo = AppDataSource.getRepository(SavedReport);
  const srData = [
    { name: 'Monthly Sales Report', reportType: ReportType.SALES, filtersJson: { dateRange: 'last_30_days' }, createdBy: adminId },
    { name: 'Top Products Q2', reportType: ReportType.PRODUCTS, filtersJson: { period: 'Q2_2026', limit: 10 }, createdBy: adminId },
    { name: 'Customer Acquisition', reportType: ReportType.CUSTOMERS, filtersJson: { channel: 'all' }, createdBy: adminId },
  ];
  for (const d of srData) {
    const exists = await srRepo.findOne({ where: { name: d.name, createdBy: d.createdBy } });
    if (!exists) await srRepo.save(srRepo.create(d));
  }
  console.log('  SavedReports: 3');

  // ───────────────────────── REPORT EXECUTION LOGS ───────────────────────────
  const relRepo = AppDataSource.getRepository(ReportExecutionLog);
  const relData = [
    { reportName: 'Monthly Sales Report', executedBy: adminId, executionTimeMs: 1234, generatedAt: new Date() },
    { reportName: 'Inventory Summary', executedBy: adminId, executionTimeMs: 567, generatedAt: new Date() },
    { reportName: 'Revenue Analytics', executedBy: adminId, executionTimeMs: 2345, generatedAt: new Date() },
  ];
  for (const d of relData) {
    await relRepo.save(relRepo.create(d));
  }
  console.log('  ReportExecutionLogs: 3');

  // ───────────────────────── AUDIT LOGS (5) ──────────────────────────────────
  const alRepo = AppDataSource.getRepository(AuditLog);
  const alData = [
    { userId: adminId, action: 'USER_LOGIN', entityType: 'AdminUser', entityId: adminId, ipAddress: '192.168.1.1' },
    { userId: U.user1, action: 'ORDER_CREATED', entityType: 'Order', entityId: U.order1, ipAddress: '10.0.0.1' },
    { userId: U.user2, action: 'ORDER_CREATED', entityType: 'Order', entityId: U.order2, ipAddress: '10.0.0.2' },
    { userId: adminId, action: 'PRODUCT_UPDATED', entityType: 'Product', entityId: U.prod1, ipAddress: '192.168.1.1' },
    { userId: U.user3, action: 'TICKET_CREATED', entityType: 'SupportTicket', entityId: U.ticket3, ipAddress: '10.0.0.3' },
  ];
  for (const d of alData) {
    await alRepo.save(alRepo.create(d));
  }
  console.log('  AuditLogs: 5');

  // ───────────────────────── LOGIN ACTIVITIES ────────────────────────────────
  const laRepo = AppDataSource.getRepository(LoginActivity);
  for (const u of users.slice(0, 5)) {
    const exists = await laRepo.findOne({ where: { userId: u.id } });
    if (!exists) await laRepo.save(laRepo.create({ userId: u.id, email: u.email, ipAddress: '10.0.0.1', status: 'SUCCESS', loginAt: new Date() }));
  }
  console.log('  LoginActivities: 5');

  // ───────────────────────── SECURITY EVENTS ─────────────────────────────────
  const seRepo = AppDataSource.getRepository(SecurityEvent);
  const seData = [
    { eventType: SecurityEventType.LOGIN_FAILED, severity: SeverityLevel.LOW, userId: U.user1, details: { attempts: 3 }, ipAddress: '192.168.1.100' },
    { eventType: SecurityEventType.PASSWORD_CHANGED, severity: SeverityLevel.MEDIUM, userId: U.user2, details: { changedBy: 'user' } },
    { eventType: SecurityEventType.ACCOUNT_LOCKED, severity: SeverityLevel.HIGH, userId: U.user6, details: { reason: 'excessive_failures' }, ipAddress: '10.0.0.99' },
  ];
  for (const d of seData) {
    await seRepo.save(seRepo.create(d));
  }
  console.log('  SecurityEvents: 3');

  // ───────────────────────── SECURITY SESSIONS ───────────────────────────────
  const ssRepo = AppDataSource.getRepository(SecuritySession);
  for (const u of users.slice(0, 3)) {
    const exists = await ssRepo.findOne({ where: { userId: u.id } });
    if (!exists) await ssRepo.save(ssRepo.create({ userId: u.id, tokenId: `${u.id}`, ipAddress: '10.0.0.1', expiresAt: new Date(Date.now() + 86400000) }));
  }
  console.log('  SecuritySessions: 3');

  // ───────────────────────── PRIVACY REQUESTS ────────────────────────────────
  const prRepo = AppDataSource.getRepository(PrivacyRequest);
  const prData = [
    { userId: U.user6, requestType: PrivacyRequestType.EXPORT_DATA, status: PrivacyRequestStatus.COMPLETED, processedAt: new Date() },
    { userId: U.user7, requestType: PrivacyRequestType.DELETE_ACCOUNT, status: PrivacyRequestStatus.PENDING },
    { userId: U.user8, requestType: PrivacyRequestType.EXPORT_DATA, status: PrivacyRequestStatus.PROCESSING, processedAt: new Date() },
  ];
  for (const d of prData) {
    await prRepo.save(prRepo.create(d));
  }
  console.log('  PrivacyRequests: 3');

  // ───────────────────────── CONSENT RECORDS ─────────────────────────────────
  const crRepo = AppDataSource.getRepository(ConsentRecord);
  for (const u of users.slice(0, 5)) {
    const exists = await crRepo.findOne({ where: { userId: u.id, consentType: ConsentType.MARKETING } });
    if (!exists) {
      await crRepo.save(crRepo.create({ userId: u.id, consentType: ConsentType.MARKETING, accepted: true, acceptedAt: new Date() }));
      await crRepo.save(crRepo.create({ userId: u.id, consentType: ConsentType.COOKIES, accepted: true, acceptedAt: new Date() }));
    }
  }
  console.log('  ConsentRecords: 10');

  // ───────────────────────── SYSTEM SETTINGS (8) ─────────────────────────────
  const sysRepo = AppDataSource.getRepository(SystemSetting);
  const sysData = [
    { key: 'store_name', value: 'Sports E-Commerce', category: 'general' },
    { key: 'store_email', value: 'support@sports.com', category: 'general' },
    { key: 'currency', value: 'AED', category: 'general' },
    { key: 'tax_rate', value: '5', category: 'tax' },
    { key: 'shipping_free_threshold', value: '20000', category: 'shipping' },
    { key: 'max_order_items', value: '50', category: 'order' },
    { key: 'default_page_size', value: '20', category: 'ui' },
    { key: 'maintenance_mode', value: 'false', category: 'system' },
  ];
  for (const d of sysData) {
    const exists = await sysRepo.findOne({ where: { key: d.key } });
    if (!exists) await sysRepo.save(sysRepo.create(d));
  }
  console.log('  SystemSettings: 8');

  // ───────────────────────── CMS PAGES (4) ───────────────────────────────────
  const cmsRepo = AppDataSource.getRepository(CmsPage);
  const cmsData = [
    { title: 'About Us', slug: 'about-us', content: '<h1>About Sports E-Commerce</h1><p>Your one-stop shop for premium sports gear.</p>', status: CmsPageStatus.PUBLISHED, pageType: CmsPageType.ABOUT_US },
    { title: 'Privacy Policy', slug: 'privacy-policy', content: '<h1>Privacy Policy</h1><p>We respect your privacy.</p>', status: CmsPageStatus.PUBLISHED, pageType: CmsPageType.PRIVACY_POLICY },
    { title: 'Terms & Conditions', slug: 'terms-conditions', content: '<h1>Terms & Conditions</h1><p>Please read these terms carefully.</p>', status: CmsPageStatus.PUBLISHED, pageType: CmsPageType.TERMS_AND_CONDITIONS },
    { title: 'Shipping Information', slug: 'shipping-info', content: '<h1>Shipping Info</h1><p>Free shipping on orders over 200 AED.</p>', status: CmsPageStatus.PUBLISHED, pageType: CmsPageType.CUSTOM_PAGE },
  ];
  for (const d of cmsData) {
    const exists = await cmsRepo.findOne({ where: { slug: d.slug } });
    if (!exists) await cmsRepo.save(cmsRepo.create(d));
  }
  console.log('  CmsPages: 4');

  // ───────────────────────── HOMEPAGE SECTIONS (5) ───────────────────────────
  const hsRepo = AppDataSource.getRepository(HomepageSection);
  const hsData = [
    { sectionKey: 'hero_banner', title: 'Hero Banner', contentJson: { heading: 'Summer Sale!', subheading: 'Up to 40% off', ctaText: 'Shop Now', ctaLink: '/collections/summer-essentials', bgColor: '#1a1a2e' }, sortOrder: 1 },
    { sectionKey: 'featured_products', title: 'Featured Products', contentJson: { heading: 'Featured Products', productIds: [U.prod1, U.prod3, U.prod4, U.prod10, U.prod13].join(',') }, sortOrder: 2 },
    { sectionKey: 'categories_grid', title: 'Shop by Category', contentJson: { heading: 'Shop by Sport' }, sortOrder: 3 },
    { sectionKey: 'new_arrivals', title: 'New Arrivals', contentJson: { heading: 'Just Landed' }, sortOrder: 4 },
    { sectionKey: 'brands_carousel', title: 'Brands', contentJson: { heading: 'Premium Brands' }, sortOrder: 5 },
  ];
  for (const d of hsData) {
    const exists = await hsRepo.findOne({ where: { sectionKey: d.sectionKey } });
    if (!exists) await hsRepo.save(hsRepo.create(d));
  }
  console.log('  HomepageSections: 5');

  // ───────────────────────── CONTACT SETTINGS (1) ────────────────────────────
  const csRepo = AppDataSource.getRepository(ContactSetting);
  const csExists = await csRepo.count();
  if (csExists === 0) {
    await csRepo.save(csRepo.create({ email: 'support@sports.com', phone: '+97148000000', address: 'Dubai, UAE', supportHours: 'Mon-Sat 9AM-9PM GST' }));
  }
  console.log('  ContactSettings: done');

  // ───────────────────────── SITE CONFIGURATION (1) ──────────────────────────
  const scRepo = AppDataSource.getRepository(SiteConfiguration);
  const scExists = await scRepo.count();
  if (scExists === 0) {
    await scRepo.save(scRepo.create({ siteName: 'Sports E-Commerce', logoUrl: 'https://via.placeholder.com/200x60?text=Sports', faviconUrl: 'https://via.placeholder.com/32', maintenanceMode: false }));
  }
  console.log('  SiteConfiguration: done');

  // ───────────────────────── STOCK ADJUSTMENTS ───────────────────────────────
  const saRepo = AppDataSource.getRepository(StockAdjustment);
  const saData = [
    { variantId: variants[0].id, previousQuantity: 100, newQuantity: 95, reason: 'Damaged stock - water damage', adjustedBy: adminId },
    { variantId: variants[2].id, previousQuantity: 80, newQuantity: 82, reason: 'Found miscount during audit', adjustedBy: adminId },
    { variantId: variants[5].id, previousQuantity: 60, newQuantity: 55, reason: 'Quality check failed items removed', adjustedBy: adminId },
  ];
  for (const d of saData) {
    await saRepo.save(saRepo.create(d));
  }
  console.log('  StockAdjustments: 3');

  // ───────────────────────── STOCK ALERTS ────────────────────────────────────
  const salRepo = AppDataSource.getRepository(StockAlert);
  const salData = [
    { variantId: variants[0].id, currentQuantity: 15, thresholdQuantity: 20, alertType: 'LOW_STOCK' as const, isResolved: false, triggeredAt: new Date() },
    { variantId: variants[3].id, currentQuantity: 0, thresholdQuantity: 10, alertType: 'OUT_OF_STOCK' as const, isResolved: false, triggeredAt: new Date() },
    { variantId: variants[7].id, currentQuantity: 50, thresholdQuantity: 20, alertType: 'LOW_STOCK' as const, isResolved: true, triggeredAt: new Date(Date.now() - 86400000), resolvedAt: new Date() },
  ];
  for (const d of salData) {
    await salRepo.save(salRepo.create(d));
  }
  console.log('  StockAlerts: 3');

  // ───────────────────────── INVENTORY AUDITS ────────────────────────────────
  const iaRepo = AppDataSource.getRepository(InventoryAudit);
  const iaData = [
    { variantId: variants[0].id, actionType: AuditActionType.MANUAL_ADJUST, beforeQuantity: 100, afterQuantity: 98, referenceType: 'MANUAL', notes: 'Minor discrepancy corrected', performedBy: adminId },
    { variantId: variants[1].id, actionType: AuditActionType.ADJUSTMENT, beforeQuantity: 50, afterQuantity: 55, performedBy: adminId },
  ];
  for (const d of iaData) {
    await iaRepo.save(iaRepo.create(d));
  }
  console.log('  InventoryAudits: 2');

  // ───────────────────────── COUPON USAGES ───────────────────────────────────
  const cuRepo = AppDataSource.getRepository(CouponUsage);
  for (let i = 0; i < 3; i++) {
    const coupon = await coupRepo.findOne({ where: { code: ['WELCOME10', 'SPORTS20', 'FLAT500'][i] } });
    if (coupon) {
      const exists = await cuRepo.findOne({ where: { couponId: coupon.id, userId: users[i].id, orderId: orders[i].id } });
      if (!exists) await cuRepo.save(cuRepo.create({ couponId: coupon.id, userId: users[i].id, orderId: orders[i].id, discountAmount: Math.round(orders[i].totalAmount * (coupon.value / 100)), usedAt: new Date() }));
    }
  }
  console.log('  CouponUsages: 3');

  // ───────────────────────── CONNECTIONS ─────────────────────────────────────
  await AppDataSource.destroy();
  console.log('\nSeed data completed successfully!');
}

seed().catch((err) => {
  console.error('Seed data failed:', err);
  process.exit(1);
});
