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
  PRODUCT_PUBLISH = 'product.publish',
  PRODUCT_ARCHIVE = 'product.archive',
  // Product Variant
  VARIANT_CREATE = 'variant.create',
  VARIANT_UPDATE = 'variant.update',
  VARIANT_DELETE = 'variant.delete',
  VARIANT_VIEW = 'variant.view',
  // Inventory
  INVENTORY_CREATE = 'inventory.create',
  INVENTORY_VIEW = 'inventory.view',
  INVENTORY_UPDATE = 'inventory.update',
  INVENTORY_ADJUST = 'inventory.adjust',
  // Order
  ORDER_VIEW = 'order.view',
  ORDER_UPDATE = 'order.update',
  ORDER_CANCEL = 'order.cancel',
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
  // Brand
  BRAND_CREATE = 'brand.create',
  BRAND_VIEW = 'brand.view',
  BRAND_UPDATE = 'brand.update',
  BRAND_DELETE = 'brand.delete',
  // Category
  CATEGORY_CREATE = 'category.create',
  CATEGORY_VIEW = 'category.view',
  CATEGORY_UPDATE = 'category.update',
  CATEGORY_DELETE = 'category.delete',
  // Collection
  COLLECTION_CREATE = 'collection.create',
  COLLECTION_VIEW = 'collection.view',
  COLLECTION_UPDATE = 'collection.update',
  COLLECTION_DELETE = 'collection.delete',
  // Attribute
  ATTRIBUTE_CREATE = 'attribute.create',
  ATTRIBUTE_VIEW = 'attribute.view',
  ATTRIBUTE_UPDATE = 'attribute.update',
  ATTRIBUTE_DELETE = 'attribute.delete',
  // Tag
  TAG_CREATE = 'tag.create',
  TAG_VIEW = 'tag.view',
  TAG_UPDATE = 'tag.update',
  TAG_DELETE = 'tag.delete',
}
