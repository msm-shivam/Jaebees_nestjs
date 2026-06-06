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
import { DefaultPermissions, DefaultRoles } from '../../common/constants/roles.constants';
import * as bcrypt from 'bcrypt';

dotenv.config();

// ─── Permission Definitions ─────────────────────────────────────────────────

interface PermissionDef {
  slug: DefaultPermissions;
  name: string;
  module: string;
}

const PERMISSIONS: PermissionDef[] = [
  { slug: DefaultPermissions.PRODUCT_CREATE,       name: 'Create Product',       module: 'product' },
  { slug: DefaultPermissions.PRODUCT_UPDATE,       name: 'Update Product',       module: 'product' },
  { slug: DefaultPermissions.PRODUCT_DELETE,       name: 'Delete Product',       module: 'product' },
  { slug: DefaultPermissions.PRODUCT_VIEW,         name: 'View Product',         module: 'product' },
  { slug: DefaultPermissions.PRODUCT_PUBLISH,      name: 'Publish Product',      module: 'product' },
  { slug: DefaultPermissions.PRODUCT_ARCHIVE,      name: 'Archive Product',      module: 'product' },
  // Product Variant
  { slug: DefaultPermissions.VARIANT_CREATE,       name: 'Create Variant',       module: 'variant' },
  { slug: DefaultPermissions.VARIANT_UPDATE,       name: 'Update Variant',       module: 'variant' },
  { slug: DefaultPermissions.VARIANT_DELETE,       name: 'Delete Variant',       module: 'variant' },
  { slug: DefaultPermissions.VARIANT_VIEW,         name: 'View Variant',         module: 'variant' },
  // Inventory
  { slug: DefaultPermissions.INVENTORY_CREATE,     name: 'Create Inventory',     module: 'inventory' },
  { slug: DefaultPermissions.INVENTORY_VIEW,       name: 'View Inventory',       module: 'inventory' },
  { slug: DefaultPermissions.INVENTORY_UPDATE,     name: 'Update Inventory',     module: 'inventory' },
  { slug: DefaultPermissions.INVENTORY_ADJUST,     name: 'Adjust Inventory',     module: 'inventory' },
  { slug: DefaultPermissions.ORDER_VIEW,           name: 'View Orders',          module: 'order' },
  { slug: DefaultPermissions.ORDER_UPDATE,         name: 'Update Orders',        module: 'order' },
  { slug: DefaultPermissions.FINANCE_VIEW,         name: 'View Finance',         module: 'finance' },
  { slug: DefaultPermissions.FINANCE_EXPORT,       name: 'Export Finance',       module: 'finance' },
  { slug: DefaultPermissions.USER_VIEW,            name: 'View Users',           module: 'user' },
  { slug: DefaultPermissions.USER_UPDATE,          name: 'Update Users',         module: 'user' },
  { slug: DefaultPermissions.USER_DELETE,          name: 'Delete Users',         module: 'user' },
  { slug: DefaultPermissions.ADMIN_CREATE,         name: 'Create Admin',         module: 'admin' },
  { slug: DefaultPermissions.ADMIN_UPDATE,         name: 'Update Admin',         module: 'admin' },
  { slug: DefaultPermissions.ADMIN_DELETE,         name: 'Delete Admin',         module: 'admin' },
  { slug: DefaultPermissions.ROLES_MANAGE,         name: 'Manage Roles',         module: 'rbac' },
  { slug: DefaultPermissions.PERMISSIONS_MANAGE,   name: 'Manage Permissions',   module: 'rbac' },
  { slug: DefaultPermissions.SUPPORT_VIEW,         name: 'View Support',         module: 'support' },
  { slug: DefaultPermissions.SUPPORT_UPDATE,       name: 'Update Support',       module: 'support' },
  // Brand
  { slug: DefaultPermissions.BRAND_CREATE,       name: 'Create Brand',         module: 'brand' },
  { slug: DefaultPermissions.BRAND_VIEW,         name: 'View Brand',           module: 'brand' },
  { slug: DefaultPermissions.BRAND_UPDATE,       name: 'Update Brand',         module: 'brand' },
  { slug: DefaultPermissions.BRAND_DELETE,       name: 'Delete Brand',         module: 'brand' },
  // Category
  { slug: DefaultPermissions.CATEGORY_CREATE,    name: 'Create Category',      module: 'category' },
  { slug: DefaultPermissions.CATEGORY_VIEW,      name: 'View Category',        module: 'category' },
  { slug: DefaultPermissions.CATEGORY_UPDATE,    name: 'Update Category',      module: 'category' },
  { slug: DefaultPermissions.CATEGORY_DELETE,    name: 'Delete Category',      module: 'category' },
  // Collection
  { slug: DefaultPermissions.COLLECTION_CREATE,  name: 'Create Collection',    module: 'collection' },
  { slug: DefaultPermissions.COLLECTION_VIEW,    name: 'View Collection',      module: 'collection' },
  { slug: DefaultPermissions.COLLECTION_UPDATE,  name: 'Update Collection',    module: 'collection' },
  { slug: DefaultPermissions.COLLECTION_DELETE,  name: 'Delete Collection',    module: 'collection' },
  // Attribute
  { slug: DefaultPermissions.ATTRIBUTE_CREATE,   name: 'Create Attribute',     module: 'attribute' },
  { slug: DefaultPermissions.ATTRIBUTE_VIEW,     name: 'View Attribute',       module: 'attribute' },
  { slug: DefaultPermissions.ATTRIBUTE_UPDATE,   name: 'Update Attribute',     module: 'attribute' },
  { slug: DefaultPermissions.ATTRIBUTE_DELETE,   name: 'Delete Attribute',     module: 'attribute' },
  // Tag
  { slug: DefaultPermissions.TAG_CREATE,         name: 'Create Tag',           module: 'tag' },
  { slug: DefaultPermissions.TAG_VIEW,           name: 'View Tag',             module: 'tag' },
  { slug: DefaultPermissions.TAG_UPDATE,         name: 'Update Tag',           module: 'tag' },
  { slug: DefaultPermissions.TAG_DELETE,         name: 'Delete Tag',           module: 'tag' },
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
    DefaultPermissions.USER_VIEW,
  ],
  [DefaultRoles.FINANCE_MANAGER]: [
    DefaultPermissions.FINANCE_VIEW,
    DefaultPermissions.FINANCE_EXPORT,
    DefaultPermissions.ORDER_VIEW,
  ],
  [DefaultRoles.SUPPORT_MANAGER]: [
    DefaultPermissions.SUPPORT_VIEW,
    DefaultPermissions.SUPPORT_UPDATE,
    DefaultPermissions.USER_VIEW,
    DefaultPermissions.ORDER_VIEW,
  ],
};

// ─── Role Definitions ────────────────────────────────────────────────────────

const ROLES: Array<{ slug: DefaultRoles; name: string; description: string }> = [
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
  const roleRepo       = AppDataSource.getRepository(Role);
  const adminRepo      = AppDataSource.getRepository(AdminUser);

  // 1. Upsert permissions
  console.log('📋 Seeding permissions...');
  const permissionMap = new Map<DefaultPermissions, Permission>();
  for (const def of PERMISSIONS) {
    let perm = await permissionRepo.findOne({ where: { slug: def.slug } });
    if (!perm) {
      perm = permissionRepo.create({ name: def.name, slug: def.slug, module: def.module });
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
