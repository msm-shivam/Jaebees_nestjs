export enum DefaultRoles {
  SUPER_ADMIN = 'super_admin',
  PRODUCT_MANAGER = 'product_manager',
  INVENTORY_MANAGER = 'inventory_manager',
  ORDER_MANAGER = 'order_manager',
  FINANCE_MANAGER = 'finance_manager',
  SUPPORT_MANAGER = 'support_manager',
}

export enum DefaultPermissions {
  // Product
  PRODUCT_CREATE = 'product.create',
  PRODUCT_UPDATE = 'product.update',
  PRODUCT_DELETE = 'product.delete',
  PRODUCT_VIEW = 'product.view',
  // Inventory
  INVENTORY_VIEW = 'inventory.view',
  INVENTORY_UPDATE = 'inventory.update',
  // Order
  ORDER_VIEW = 'order.view',
  ORDER_UPDATE = 'order.update',
  // Finance
  FINANCE_VIEW = 'finance.view',
  FINANCE_EXPORT = 'finance.export',
  // Users
  USER_VIEW = 'user.view',
  USER_UPDATE = 'user.update',
  USER_DELETE = 'user.delete',
  // Admin
  ADMIN_CREATE = 'admin.create',
  ADMIN_UPDATE = 'admin.update',
  ADMIN_DELETE = 'admin.delete',
  // RBAC
  ROLES_MANAGE = 'roles.manage',
  PERMISSIONS_MANAGE = 'permissions.manage',
  // Support
  SUPPORT_VIEW = 'support.view',
  SUPPORT_UPDATE = 'support.update',

  // Categories
  CATEGORY_CREATE = 'category.create',
  CATEGORY_UPDATE = 'category.update',
  CATEGORY_DELETE = 'category.delete',

  // Brands
  BRAND_CREATE = 'brand.create',
  BRAND_UPDATE = 'brand.update',
  BRAND_DELETE = 'brand.delete',
}
