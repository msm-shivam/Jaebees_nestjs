/**
 * Seed script — runs standalone via:
 *   npm run seed
 *
 * Seeds:
 *   1. All system permissions
 *   2. All default roles
 *   3. Role ↔ Permission mappings
 *   4. Super Admin account (admin@sport.com / SuperAdmin@123)
 */
import 'reflect-metadata';
import * as dotenv from 'dotenv';
import { AppDataSource } from '../data-source';
import { Permission } from '../../modules/rbac/entities/permission.entity';
import { Role } from '../../modules/rbac/entities/role.entity';
import { AdminUser } from '../../modules/admin/entities/admin-user.entity';
import {
  DefaultPermissions,
  DefaultRoles,
} from '../../common/constants/roles.constants';
import * as bcrypt from 'bcrypt';

dotenv.config();

// ─── Permission Definitions ─────────────────────────────────────────────────

interface PermissionDef {
  slug: DefaultPermissions;
  name: string;
  module: string;
}

const PERMISSIONS: PermissionDef[] = [
  {
    slug: DefaultPermissions.PRODUCT_CREATE,
    name: 'Create Product',
    module: 'product',
  },
  {
    slug: DefaultPermissions.PRODUCT_UPDATE,
    name: 'Update Product',
    module: 'product',
  },
  {
    slug: DefaultPermissions.PRODUCT_DELETE,
    name: 'Delete Product',
    module: 'product',
  },
  {
    slug: DefaultPermissions.PRODUCT_VIEW,
    name: 'View Product',
    module: 'product',
  },
  {
    slug: DefaultPermissions.PRODUCT_PUBLISH,
    name: 'Publish Product',
    module: 'product',
  },
  {
    slug: DefaultPermissions.PRODUCT_ARCHIVE,
    name: 'Archive Product',
    module: 'product',
  },
  // Product Variant
  {
    slug: DefaultPermissions.VARIANT_CREATE,
    name: 'Create Variant',
    module: 'variant',
  },
  {
    slug: DefaultPermissions.VARIANT_UPDATE,
    name: 'Update Variant',
    module: 'variant',
  },
  {
    slug: DefaultPermissions.VARIANT_DELETE,
    name: 'Delete Variant',
    module: 'variant',
  },
  {
    slug: DefaultPermissions.VARIANT_VIEW,
    name: 'View Variant',
    module: 'variant',
  },
  // Inventory
  {
    slug: DefaultPermissions.INVENTORY_CREATE,
    name: 'Create Inventory',
    module: 'inventory',
  },
  {
    slug: DefaultPermissions.INVENTORY_VIEW,
    name: 'View Inventory',
    module: 'inventory',
  },
  {
    slug: DefaultPermissions.INVENTORY_UPDATE,
    name: 'Update Inventory',
    module: 'inventory',
  },
  {
    slug: DefaultPermissions.INVENTORY_ADJUST,
    name: 'Adjust Inventory',
    module: 'inventory',
  },
  { slug: DefaultPermissions.ORDER_VIEW, name: 'View Orders', module: 'order' },
  {
    slug: DefaultPermissions.ORDER_UPDATE,
    name: 'Update Orders',
    module: 'order',
  },
  {
    slug: DefaultPermissions.ORDER_CANCEL,
    name: 'Cancel Orders',
    module: 'order',
  },
  {
    slug: DefaultPermissions.FINANCE_VIEW,
    name: 'View Finance',
    module: 'finance',
  },
  {
    slug: DefaultPermissions.FINANCE_EXPORT,
    name: 'Export Finance',
    module: 'finance',
  },
  { slug: DefaultPermissions.USER_VIEW, name: 'View Users', module: 'user' },
  {
    slug: DefaultPermissions.USER_UPDATE,
    name: 'Update Users',
    module: 'user',
  },
  {
    slug: DefaultPermissions.USER_DELETE,
    name: 'Delete Users',
    module: 'user',
  },
  {
    slug: DefaultPermissions.ADMIN_CREATE,
    name: 'Create Admin',
    module: 'admin',
  },
  {
    slug: DefaultPermissions.ADMIN_UPDATE,
    name: 'Update Admin',
    module: 'admin',
  },
  {
    slug: DefaultPermissions.ADMIN_DELETE,
    name: 'Delete Admin',
    module: 'admin',
  },
  {
    slug: DefaultPermissions.ROLES_MANAGE,
    name: 'Manage Roles',
    module: 'rbac',
  },
  {
    slug: DefaultPermissions.PERMISSIONS_MANAGE,
    name: 'Manage Permissions',
    module: 'rbac',
  },
  {
    slug: DefaultPermissions.SUPPORT_VIEW,
    name: 'View Support',
    module: 'support',
  },
  {
    slug: DefaultPermissions.SUPPORT_UPDATE,
    name: 'Update Support',
    module: 'support',
  },
  // Address
  {
    slug: DefaultPermissions.ADDRESS_CREATE,
    name: 'Create Address',
    module: 'address',
  },
  {
    slug: DefaultPermissions.ADDRESS_VIEW,
    name: 'View Address',
    module: 'address',
  },
  {
    slug: DefaultPermissions.ADDRESS_UPDATE,
    name: 'Update Address',
    module: 'address',
  },
  {
    slug: DefaultPermissions.ADDRESS_DELETE,
    name: 'Delete Address',
    module: 'address',
  },
  // Warehouse
  {
    slug: DefaultPermissions.WAREHOUSE_CREATE,
    name: 'Create Warehouse',
    module: 'warehouse',
  },
  {
    slug: DefaultPermissions.WAREHOUSE_VIEW,
    name: 'View Warehouse',
    module: 'warehouse',
  },
  {
    slug: DefaultPermissions.WAREHOUSE_UPDATE,
    name: 'Update Warehouse',
    module: 'warehouse',
  },
  {
    slug: DefaultPermissions.WAREHOUSE_DELETE,
    name: 'Delete Warehouse',
    module: 'warehouse',
  },
  // Delivery
  {
    slug: DefaultPermissions.DELIVERY_MANAGE,
    name: 'Manage Delivery',
    module: 'delivery',
  },
  // Shipment
  {
    slug: DefaultPermissions.SHIPMENT_VIEW,
    name: 'View Shipments',
    module: 'shipment',
  },
  {
    slug: DefaultPermissions.SHIPMENT_UPDATE,
    name: 'Update Shipments',
    module: 'shipment',
  },
  // Payment
  {
    slug: DefaultPermissions.PAYMENT_CREATE,
    name: 'Create Payment',
    module: 'payment',
  },
  {
    slug: DefaultPermissions.PAYMENT_VIEW,
    name: 'View Payment',
    module: 'payment',
  },
  {
    slug: DefaultPermissions.PAYMENT_UPDATE,
    name: 'Update Payment',
    module: 'payment',
  },
  {
    slug: DefaultPermissions.PAYMENT_DELETE,
    name: 'Delete Payment',
    module: 'payment',
  },
  // Refund
  {
    slug: DefaultPermissions.REFUND_CREATE,
    name: 'Create Refund',
    module: 'refund',
  },
  {
    slug: DefaultPermissions.REFUND_VIEW,
    name: 'View Refund',
    module: 'refund',
  },
  {
    slug: DefaultPermissions.REFUND_UPDATE,
    name: 'Update Refund',
    module: 'refund',
  },
  // Payment Method
  {
    slug: DefaultPermissions.PAYMENT_METHOD_CREATE,
    name: 'Create Payment Method',
    module: 'payment_method',
  },
  {
    slug: DefaultPermissions.PAYMENT_METHOD_VIEW,
    name: 'View Payment Method',
    module: 'payment_method',
  },
  {
    slug: DefaultPermissions.PAYMENT_METHOD_UPDATE,
    name: 'Update Payment Method',
    module: 'payment_method',
  },
  {
    slug: DefaultPermissions.PAYMENT_METHOD_DELETE,
    name: 'Delete Payment Method',
    module: 'payment_method',
  },
  // Brand
  {
    slug: DefaultPermissions.BRAND_CREATE,
    name: 'Create Brand',
    module: 'brand',
  },
  { slug: DefaultPermissions.BRAND_VIEW, name: 'View Brand', module: 'brand' },
  {
    slug: DefaultPermissions.BRAND_UPDATE,
    name: 'Update Brand',
    module: 'brand',
  },
  {
    slug: DefaultPermissions.BRAND_DELETE,
    name: 'Delete Brand',
    module: 'brand',
  },
  // Category
  {
    slug: DefaultPermissions.CATEGORY_CREATE,
    name: 'Create Category',
    module: 'category',
  },
  {
    slug: DefaultPermissions.CATEGORY_VIEW,
    name: 'View Category',
    module: 'category',
  },
  {
    slug: DefaultPermissions.CATEGORY_UPDATE,
    name: 'Update Category',
    module: 'category',
  },
  {
    slug: DefaultPermissions.CATEGORY_DELETE,
    name: 'Delete Category',
    module: 'category',
  },
  // Collection
  {
    slug: DefaultPermissions.COLLECTION_CREATE,
    name: 'Create Collection',
    module: 'collection',
  },
  {
    slug: DefaultPermissions.COLLECTION_VIEW,
    name: 'View Collection',
    module: 'collection',
  },
  {
    slug: DefaultPermissions.COLLECTION_UPDATE,
    name: 'Update Collection',
    module: 'collection',
  },
  {
    slug: DefaultPermissions.COLLECTION_DELETE,
    name: 'Delete Collection',
    module: 'collection',
  },
  // Attribute
  {
    slug: DefaultPermissions.ATTRIBUTE_CREATE,
    name: 'Create Attribute',
    module: 'attribute',
  },
  {
    slug: DefaultPermissions.ATTRIBUTE_VIEW,
    name: 'View Attribute',
    module: 'attribute',
  },
  {
    slug: DefaultPermissions.ATTRIBUTE_UPDATE,
    name: 'Update Attribute',
    module: 'attribute',
  },
  {
    slug: DefaultPermissions.ATTRIBUTE_DELETE,
    name: 'Delete Attribute',
    module: 'attribute',
  },
  // Tag
  { slug: DefaultPermissions.TAG_CREATE, name: 'Create Tag', module: 'tag' },
  { slug: DefaultPermissions.TAG_VIEW, name: 'View Tag', module: 'tag' },
  { slug: DefaultPermissions.TAG_UPDATE, name: 'Update Tag', module: 'tag' },
  { slug: DefaultPermissions.TAG_DELETE, name: 'Delete Tag', module: 'tag' },
  {
    slug: DefaultPermissions.COUPON_CREATE,
    name: 'Create Coupon',
    module: 'coupon',
  },
  {
    slug: DefaultPermissions.COUPON_VIEW,
    name: 'View Coupon',
    module: 'coupon',
  },
  {
    slug: DefaultPermissions.COUPON_UPDATE,
    name: 'Update Coupon',
    module: 'coupon',
  },
  {
    slug: DefaultPermissions.COUPON_DELETE,
    name: 'Delete Coupon',
    module: 'coupon',
  },
  {
    slug: DefaultPermissions.PROMOTION_CREATE,
    name: 'Create Promotion',
    module: 'promotion',
  },
  {
    slug: DefaultPermissions.PROMOTION_VIEW,
    name: 'View Promotion',
    module: 'promotion',
  },
  {
    slug: DefaultPermissions.PROMOTION_UPDATE,
    name: 'Update Promotion',
    module: 'promotion',
  },
  {
    slug: DefaultPermissions.PROMOTION_DELETE,
    name: 'Delete Promotion',
    module: 'promotion',
  },
  // Wishlist
  {
    slug: DefaultPermissions.WISHLIST_VIEW,
    name: 'View Wishlist',
    module: 'wishlist',
  },
  // Review
  {
    slug: DefaultPermissions.REVIEW_VIEW,
    name: 'View Review',
    module: 'review',
  },
  {
    slug: DefaultPermissions.REVIEW_CREATE,
    name: 'Create Review',
    module: 'review',
  },
  {
    slug: DefaultPermissions.REVIEW_UPDATE,
    name: 'Update Review',
    module: 'review',
  },
  {
    slug: DefaultPermissions.REVIEW_DELETE,
    name: 'Delete Review',
    module: 'review',
  },
  {
    slug: DefaultPermissions.REVIEW_APPROVE,
    name: 'Approve Review',
    module: 'review',
  },
  {
    slug: DefaultPermissions.REVIEW_REJECT,
    name: 'Reject Review',
    module: 'review',
  },
  {
    slug: DefaultPermissions.REVIEW_MODERATE,
    name: 'Moderate Review',
    module: 'review',
  },
  // Question
  {
    slug: DefaultPermissions.QUESTION_VIEW,
    name: 'View Question',
    module: 'question',
  },
  {
    slug: DefaultPermissions.QUESTION_ANSWER,
    name: 'Answer Question',
    module: 'question',
  },
  {
    slug: DefaultPermissions.QUESTION_DELETE,
    name: 'Delete Question',
    module: 'question',
  },
  // Notification
  {
    slug: DefaultPermissions.NOTIFICATION_VIEW,
    name: 'View Notification Logs',
    module: 'notification',
  },
  {
    slug: DefaultPermissions.NOTIFICATION_MANAGE,
    name: 'Manage Notifications',
    module: 'notification',
  },
  {
    slug: DefaultPermissions.EMAIL_TEMPLATE_VIEW,
    name: 'View Email Templates',
    module: 'email_template',
  },
  {
    slug: DefaultPermissions.EMAIL_TEMPLATE_CREATE,
    name: 'Create Email Templates',
    module: 'email_template',
  },
  {
    slug: DefaultPermissions.EMAIL_TEMPLATE_UPDATE,
    name: 'Update Email Templates',
    module: 'email_template',
  },
  {
    slug: DefaultPermissions.EMAIL_TEMPLATE_DELETE,
    name: 'Delete Email Templates',
    module: 'email_template',
  },
  // Search
  {
    slug: DefaultPermissions.SEARCH_ANALYTICS_VIEW,
    name: 'View Search Analytics',
    module: 'search',
  },
  {
    slug: DefaultPermissions.SEARCH_ANALYTICS_MANAGE,
    name: 'Manage Search Analytics',
    module: 'search',
  },
  // Campaign
  {
    slug: DefaultPermissions.CAMPAIGN_CREATE,
    name: 'Create Campaign',
    module: 'campaign',
  },
  {
    slug: DefaultPermissions.CAMPAIGN_VIEW,
    name: 'View Campaign',
    module: 'campaign',
  },
  {
    slug: DefaultPermissions.CAMPAIGN_UPDATE,
    name: 'Update Campaign',
    module: 'campaign',
  },
  {
    slug: DefaultPermissions.CAMPAIGN_DELETE,
    name: 'Delete Campaign',
    module: 'campaign',
  },
];

// ─── Role → Permission Mappings ──────────────────────────────────────────────

const ROLE_PERMISSIONS: Record<DefaultRoles, DefaultPermissions[]> = {
  [DefaultRoles.SUPER_ADMIN]: Object.values(DefaultPermissions),
  [DefaultRoles.PRODUCT_MANAGER]: [
    DefaultPermissions.PRODUCT_CREATE,
    DefaultPermissions.PRODUCT_UPDATE,
    DefaultPermissions.PRODUCT_DELETE,
    DefaultPermissions.PRODUCT_VIEW,
    DefaultPermissions.PRODUCT_PUBLISH,
    DefaultPermissions.PRODUCT_ARCHIVE,
    DefaultPermissions.VARIANT_CREATE,
    DefaultPermissions.VARIANT_UPDATE,
    DefaultPermissions.VARIANT_DELETE,
    DefaultPermissions.VARIANT_VIEW,
    DefaultPermissions.INVENTORY_VIEW,
    DefaultPermissions.BRAND_CREATE,
    DefaultPermissions.BRAND_VIEW,
    DefaultPermissions.BRAND_UPDATE,
    DefaultPermissions.BRAND_DELETE,
    DefaultPermissions.CATEGORY_CREATE,
    DefaultPermissions.CATEGORY_VIEW,
    DefaultPermissions.CATEGORY_UPDATE,
    DefaultPermissions.CATEGORY_DELETE,
    DefaultPermissions.COLLECTION_CREATE,
    DefaultPermissions.COLLECTION_VIEW,
    DefaultPermissions.COLLECTION_UPDATE,
    DefaultPermissions.COLLECTION_DELETE,
    DefaultPermissions.ATTRIBUTE_CREATE,
    DefaultPermissions.ATTRIBUTE_VIEW,
    DefaultPermissions.ATTRIBUTE_UPDATE,
    DefaultPermissions.ATTRIBUTE_DELETE,
    DefaultPermissions.TAG_CREATE,
    DefaultPermissions.TAG_VIEW,
    DefaultPermissions.TAG_UPDATE,
    DefaultPermissions.TAG_DELETE,
    DefaultPermissions.COUPON_CREATE,
    DefaultPermissions.COUPON_VIEW,
    DefaultPermissions.COUPON_UPDATE,
    DefaultPermissions.COUPON_DELETE,
    DefaultPermissions.PROMOTION_VIEW,
        DefaultPermissions.REVIEW_VIEW,
        DefaultPermissions.REVIEW_APPROVE,
        DefaultPermissions.REVIEW_REJECT,
        DefaultPermissions.REVIEW_MODERATE,
        DefaultPermissions.QUESTION_VIEW,
        DefaultPermissions.QUESTION_ANSWER,
        DefaultPermissions.NOTIFICATION_VIEW,
        DefaultPermissions.EMAIL_TEMPLATE_VIEW,
        DefaultPermissions.EMAIL_TEMPLATE_CREATE,
        DefaultPermissions.EMAIL_TEMPLATE_UPDATE,
        DefaultPermissions.EMAIL_TEMPLATE_DELETE,
        DefaultPermissions.SEARCH_ANALYTICS_VIEW,
        DefaultPermissions.SEARCH_ANALYTICS_MANAGE,
        DefaultPermissions.CAMPAIGN_CREATE,
        DefaultPermissions.CAMPAIGN_VIEW,
        DefaultPermissions.CAMPAIGN_UPDATE,
        DefaultPermissions.CAMPAIGN_DELETE,
      ],
  [DefaultRoles.INVENTORY_MANAGER]: [
    DefaultPermissions.INVENTORY_CREATE,
    DefaultPermissions.INVENTORY_VIEW,
    DefaultPermissions.INVENTORY_UPDATE,
    DefaultPermissions.INVENTORY_ADJUST,
    DefaultPermissions.PRODUCT_VIEW,
    DefaultPermissions.VARIANT_VIEW,
  ],
  [DefaultRoles.ORDER_MANAGER]: [
    DefaultPermissions.ORDER_VIEW,
    DefaultPermissions.ORDER_UPDATE,
    DefaultPermissions.ORDER_CANCEL,
    DefaultPermissions.PAYMENT_VIEW,
    DefaultPermissions.WAREHOUSE_VIEW,
    DefaultPermissions.SHIPMENT_VIEW,
    DefaultPermissions.SHIPMENT_UPDATE,
    DefaultPermissions.DELIVERY_MANAGE,
    DefaultPermissions.COUPON_VIEW,
    DefaultPermissions.PROMOTION_VIEW,
    DefaultPermissions.CAMPAIGN_VIEW,
    DefaultPermissions.USER_VIEW,
  ],
  [DefaultRoles.FINANCE_MANAGER]: [
    DefaultPermissions.FINANCE_VIEW,
    DefaultPermissions.FINANCE_EXPORT,
    DefaultPermissions.ORDER_VIEW,
    DefaultPermissions.PAYMENT_VIEW,
    DefaultPermissions.PAYMENT_UPDATE,
    DefaultPermissions.REFUND_VIEW,
    DefaultPermissions.REFUND_CREATE,
    DefaultPermissions.REFUND_UPDATE,
  ],
  [DefaultRoles.SUPPORT_MANAGER]: [
    DefaultPermissions.SUPPORT_VIEW,
    DefaultPermissions.SUPPORT_UPDATE,
    DefaultPermissions.USER_VIEW,
    DefaultPermissions.ORDER_VIEW,
        DefaultPermissions.REVIEW_VIEW,
        DefaultPermissions.QUESTION_VIEW,
        DefaultPermissions.NOTIFICATION_VIEW,
        DefaultPermissions.NOTIFICATION_MANAGE,
        DefaultPermissions.EMAIL_TEMPLATE_VIEW,
      ],
};

// ─── Role Definitions ────────────────────────────────────────────────────────

const ROLES: Array<{ slug: DefaultRoles; name: string; description: string }> =
  [
    {
      slug: DefaultRoles.SUPER_ADMIN,
      name: 'Super Admin',
      description: 'Full access to all system features and configurations.',
    },
    {
      slug: DefaultRoles.PRODUCT_MANAGER,
      name: 'Product Manager',
      description: 'Manages product catalog, categories, and inventory.',
    },
    {
      slug: DefaultRoles.INVENTORY_MANAGER,
      name: 'Inventory Manager',
      description: 'Manages stock levels and warehouse operations.',
    },
    {
      slug: DefaultRoles.ORDER_MANAGER,
      name: 'Order Manager',
      description: 'Manages customer orders and fulfillment.',
    },
    {
      slug: DefaultRoles.FINANCE_MANAGER,
      name: 'Finance Manager',
      description: 'Manages financial reports and payment reconciliation.',
    },
    {
      slug: DefaultRoles.SUPPORT_MANAGER,
      name: 'Support Manager',
      description: 'Handles customer support tickets and inquiries.',
    },
  ];

// ─── Super Admin Account ─────────────────────────────────────────────────────

const SUPER_ADMIN = {
  name: 'Super Admin',
  email: 'admin@sport.com',
  password: 'SuperAdmin@123',
};

// ─── Seed Runner ─────────────────────────────────────────────────────────────

async function seed() {
  console.log('🌱 Initialising database connection...');
  await AppDataSource.initialize();

  const permissionRepo = AppDataSource.getRepository(Permission);
  const roleRepo = AppDataSource.getRepository(Role);
  const adminRepo = AppDataSource.getRepository(AdminUser);

  // 1. Upsert permissions
  console.log('📋 Seeding permissions...');
  const permissionMap = new Map<DefaultPermissions, Permission>();
  for (const def of PERMISSIONS) {
    let perm = await permissionRepo.findOne({ where: { slug: def.slug } });
    if (!perm) {
      perm = permissionRepo.create({
        name: def.name,
        slug: def.slug,
        module: def.module,
      });
      perm = await permissionRepo.save(perm);
      console.log(`  ✅ Created permission: ${def.slug}`);
    } else {
      console.log(`  ⏭  Skipped (exists): ${def.slug}`);
    }
    permissionMap.set(def.slug, perm);
  }

  // 2. Upsert roles and assign permissions
  console.log('\n🎭 Seeding roles...');
  const roleMap = new Map<DefaultRoles, Role>();
  for (const def of ROLES) {
    let role = await roleRepo.findOne({
      where: { slug: def.slug },
      relations: { permissions: true },
    });

    if (!role) {
      role = roleRepo.create({
        name: def.name,
        slug: def.slug,
        description: def.description,
        permissions: [],
      });
      console.log(`  ✅ Created role: ${def.slug}`);
    } else {
      console.log(`  ⏭  Updating permissions for: ${def.slug}`);
    }

    const permsForRole = ROLE_PERMISSIONS[def.slug]
      .map((slug) => permissionMap.get(slug))
      .filter((p): p is Permission => !!p);

    role.permissions = permsForRole;
    role = await roleRepo.save(role);
    roleMap.set(def.slug, role);
  }

  // 3. Upsert Super Admin
  console.log('\n👤 Seeding super admin account...');
  let superAdmin = await adminRepo.findOne({
    where: { email: SUPER_ADMIN.email },
    relations: { roles: true },
  });

  if (!superAdmin) {
    const passwordHash = await bcrypt.hash(SUPER_ADMIN.password, 12);
    superAdmin = adminRepo.create({
      name: SUPER_ADMIN.name,
      email: SUPER_ADMIN.email,
      passwordHash,
      isActive: true,
      roles: [],
    });
    console.log(`  ✅ Created super admin: ${SUPER_ADMIN.email}`);
  } else {
    console.log(`  ⏭  Super admin already exists: ${SUPER_ADMIN.email}`);
  }

  const superAdminRole = roleMap.get(DefaultRoles.SUPER_ADMIN);
  if (superAdminRole) {
    const hasRole = superAdmin.roles?.some((r) => r.id === superAdminRole.id);
    if (!hasRole) {
      superAdmin.roles = [...(superAdmin.roles ?? []), superAdminRole];
    }
  }

  await adminRepo.save(superAdmin);

  await AppDataSource.destroy();

  console.log('\n✨ Seed completed successfully!\n');
  console.log('─────────────────────────────────────────');
  console.log('  Super Admin Credentials');
  console.log('  Email   :', SUPER_ADMIN.email);
  console.log('  Password:', SUPER_ADMIN.password);
  console.log('─────────────────────────────────────────\n');
}

seed().catch((err) => {
  console.error('❌ Seed failed:', err);
  process.exit(1);
});
