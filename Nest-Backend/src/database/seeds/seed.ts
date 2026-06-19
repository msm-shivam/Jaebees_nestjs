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
import { User } from '../../modules/users/entities/user.entity';
import {
  DefaultPermissions,
  DefaultRoles,
} from '../../common/constants/roles.constants';
import { ALL_PERMISSIONS } from '../../common/constants/permissions-data.constant';
import * as bcrypt from 'bcrypt';

dotenv.config();

// ─── Permission Definitions ─────────────────────────────────────────────────

const PERMISSIONS = ALL_PERMISSIONS;

// ─── Role → Permission Mappings ──────────────────────────────────────────────

const ROLE_PERMISSIONS: Record<DefaultRoles, DefaultPermissions[]> = {
  [DefaultRoles.SUPER_ADMIN]: Object.values(DefaultPermissions),
  [DefaultRoles.PRODUCT_MANAGER]: [
    DefaultPermissions.CATALOG_VIEW,
    DefaultPermissions.CATALOG_MANAGE,
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
    DefaultPermissions.SUPPLIER_VIEW,
    DefaultPermissions.PURCHASE_ORDER_VIEW,
    DefaultPermissions.INVENTORY_ANALYTICS_VIEW,
  ],
  [DefaultRoles.INVENTORY_MANAGER]: [
    DefaultPermissions.CATALOG_VIEW,
    DefaultPermissions.INVENTORY_CREATE,
    DefaultPermissions.INVENTORY_VIEW,
    DefaultPermissions.INVENTORY_UPDATE,
    DefaultPermissions.INVENTORY_ADJUST,
    DefaultPermissions.INVENTORY_RECEIVE,
    DefaultPermissions.SUPPLIER_VIEW,
    DefaultPermissions.SUPPLIER_CREATE,
    DefaultPermissions.SUPPLIER_UPDATE,
    DefaultPermissions.PURCHASE_ORDER_VIEW,
    DefaultPermissions.PURCHASE_ORDER_CREATE,
    DefaultPermissions.INVENTORY_ANALYTICS_VIEW,
    DefaultPermissions.PRODUCT_VIEW,
    DefaultPermissions.VARIANT_VIEW,
    DefaultPermissions.REPORTS_VIEW,
    DefaultPermissions.DASHBOARD_VIEW,
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
    DefaultPermissions.DELIVERY_CHARGE_VIEW,
    DefaultPermissions.DELIVERY_CHARGE_MANAGE,
    DefaultPermissions.COUPON_VIEW,
    DefaultPermissions.PROMOTION_VIEW,
    DefaultPermissions.CAMPAIGN_VIEW,
    DefaultPermissions.USER_VIEW,
    DefaultPermissions.INVENTORY_VIEW,
    DefaultPermissions.INVENTORY_RECEIVE,
    DefaultPermissions.SUPPLIER_VIEW,
    DefaultPermissions.PURCHASE_ORDER_VIEW,
    DefaultPermissions.INVENTORY_ANALYTICS_VIEW,
    DefaultPermissions.RETURN_VIEW,
    DefaultPermissions.RETURN_APPROVE,
    DefaultPermissions.RETURN_REJECT,
    DefaultPermissions.RETURN_RECEIVE,
  ],
  [DefaultRoles.FINANCE_MANAGER]: [
    DefaultPermissions.FINANCE_VIEW,
    DefaultPermissions.FINANCE_MANAGE,
    DefaultPermissions.FINANCE_EXPORT,
    DefaultPermissions.SETTLEMENT_VIEW,
    DefaultPermissions.SETTLEMENT_MANAGE,
    DefaultPermissions.ORDER_VIEW,
    DefaultPermissions.PAYMENT_VIEW,
    DefaultPermissions.PAYMENT_UPDATE,
    DefaultPermissions.REFUND_VIEW,
    DefaultPermissions.REFUND_CREATE,
    DefaultPermissions.REFUND_UPDATE,
    DefaultPermissions.RETURN_VIEW,
    DefaultPermissions.RETURN_REFUND,
    DefaultPermissions.REPORTS_VIEW,
    DefaultPermissions.DASHBOARD_VIEW,
    DefaultPermissions.DELIVERY_CHARGE_VIEW,
  ],
  [DefaultRoles.SUPPORT_MANAGER]: [
    DefaultPermissions.SUPPORT_VIEW,
    DefaultPermissions.SUPPORT_UPDATE,
    DefaultPermissions.SUPPORT_ASSIGN,
    DefaultPermissions.SUPPORT_REPLY,
    DefaultPermissions.SUPPORT_RESOLVE,
    DefaultPermissions.SUPPORT_NOTE,
    DefaultPermissions.USER_VIEW,
    DefaultPermissions.ORDER_VIEW,
    DefaultPermissions.REVIEW_VIEW,
    DefaultPermissions.QUESTION_VIEW,
    DefaultPermissions.NOTIFICATION_VIEW,
    DefaultPermissions.NOTIFICATION_MANAGE,
    DefaultPermissions.EMAIL_TEMPLATE_VIEW,
    DefaultPermissions.EMAIL_TEMPLATE_CREATE,
    DefaultPermissions.EMAIL_TEMPLATE_UPDATE,
    DefaultPermissions.EMAIL_TEMPLATE_DELETE,
    DefaultPermissions.RETURN_VIEW,
    DefaultPermissions.REPORTS_VIEW,
    DefaultPermissions.DASHBOARD_VIEW,
  ],
  [DefaultRoles.MARKETING_MANAGER]: [
    DefaultPermissions.NOTIFICATION_VIEW,
    DefaultPermissions.NOTIFICATION_SEND,
    DefaultPermissions.NOTIFICATION_MANAGE,
    DefaultPermissions.EMAIL_TEMPLATE_VIEW,
    DefaultPermissions.EMAIL_TEMPLATE_CREATE,
    DefaultPermissions.EMAIL_TEMPLATE_UPDATE,
    DefaultPermissions.EMAIL_TEMPLATE_DELETE,
    DefaultPermissions.CAMPAIGN_VIEW,
    DefaultPermissions.CAMPAIGN_MANAGE,
    DefaultPermissions.CAMPAIGN_CREATE,
    DefaultPermissions.CAMPAIGN_UPDATE,
    DefaultPermissions.CAMPAIGN_DELETE,
    DefaultPermissions.COUPON_CREATE,
    DefaultPermissions.COUPON_VIEW,
    DefaultPermissions.COUPON_UPDATE,
    DefaultPermissions.COUPON_DELETE,
    DefaultPermissions.PROMOTION_VIEW,
    DefaultPermissions.SEARCH_ANALYTICS_VIEW,
    DefaultPermissions.SEARCH_ANALYTICS_MANAGE,
    DefaultPermissions.CATALOG_VIEW,
    DefaultPermissions.PRODUCT_VIEW,
    DefaultPermissions.REVIEW_VIEW,
    DefaultPermissions.USER_VIEW,
    DefaultPermissions.DASHBOARD_VIEW,
    DefaultPermissions.CMS_VIEW,
    DefaultPermissions.CMS_MANAGE,
  ],
  [DefaultRoles.WAREHOUSE_MANAGER]: [
    DefaultPermissions.CATALOG_VIEW,
    DefaultPermissions.INVENTORY_VIEW,
    DefaultPermissions.INVENTORY_CREATE,
    DefaultPermissions.INVENTORY_UPDATE,
    DefaultPermissions.INVENTORY_ADJUST,
    DefaultPermissions.INVENTORY_RECEIVE,
    DefaultPermissions.SUPPLIER_CREATE,
    DefaultPermissions.SUPPLIER_VIEW,
    DefaultPermissions.SUPPLIER_UPDATE,
    DefaultPermissions.SUPPLIER_DELETE,
    DefaultPermissions.PURCHASE_ORDER_CREATE,
    DefaultPermissions.PURCHASE_ORDER_VIEW,
    DefaultPermissions.PURCHASE_ORDER_UPDATE,
    DefaultPermissions.PURCHASE_ORDER_APPROVE,
    DefaultPermissions.PURCHASE_ORDER_CANCEL,
    DefaultPermissions.INVENTORY_ANALYTICS_VIEW,
    DefaultPermissions.PRODUCT_VIEW,
    DefaultPermissions.VARIANT_VIEW,
    DefaultPermissions.WAREHOUSE_VIEW,
    DefaultPermissions.RETURN_VIEW,
    DefaultPermissions.RETURN_RECEIVE,
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
    {
      slug: DefaultRoles.WAREHOUSE_MANAGER,
      name: 'Warehouse Manager',
      description:
        'Manages suppliers, purchase orders, goods receipt, and inventory operations.',
    },
    {
      slug: DefaultRoles.MARKETING_MANAGER,
      name: 'Marketing Manager',
      description:
        'Manages email campaigns, templates, notifications, and promotions.',
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

    const permsForRole =
      def.slug === DefaultRoles.SUPER_ADMIN
        ? [...permissionMap.values()]
        : ROLE_PERMISSIONS[def.slug]
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

  // ─── Dummy Users ────────────────────────────────────────────────────────────
  const userRepo = AppDataSource.getRepository(User);
  const userPasswordHash = await bcrypt.hash('User@123', 12);
  const dummyUsers = [
    {
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@example.com',
      mobile: '1234567890',
      passwordHash: userPasswordHash,
      isEmailVerified: true,
      isActive: true,
    },
    {
      firstName: 'Jane',
      lastName: 'Smith',
      email: 'jane.smith@example.com',
      mobile: '0987654321',
      passwordHash: userPasswordHash,
      isEmailVerified: true,
      isActive: true,
    },
  ];

  console.log('\n👤 Seeding dummy users...');
  for (const u of dummyUsers) {
    const existingUser = await userRepo.findOne({ where: { email: u.email } });
    if (!existingUser) {
      await userRepo.save(userRepo.create(u));
      console.log(`  ✅ Created dummy user: ${u.email}`);
    } else {
      console.log(`  ⏭  Dummy user already exists: ${u.email}`);
    }
  }

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
