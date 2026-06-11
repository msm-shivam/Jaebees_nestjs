export enum DefaultRoles {
  SUPER_ADMIN = 'super_admin',
  PRODUCT_MANAGER = 'product_manager',
  INVENTORY_MANAGER = 'inventory_manager',
  ORDER_MANAGER = 'order_manager',
  FINANCE_MANAGER = 'finance_manager',
  SUPPORT_MANAGER = 'support_manager',
  WAREHOUSE_MANAGER = 'warehouse_manager',
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
  // Address
  ADDRESS_CREATE = 'address.create',
  ADDRESS_VIEW = 'address.view',
  ADDRESS_UPDATE = 'address.update',
  ADDRESS_DELETE = 'address.delete',
  // Warehouse
  WAREHOUSE_CREATE = 'warehouse.create',
  WAREHOUSE_VIEW = 'warehouse.view',
  WAREHOUSE_UPDATE = 'warehouse.update',
  WAREHOUSE_DELETE = 'warehouse.delete',
  // Delivery
  DELIVERY_MANAGE = 'delivery.manage',
  // Shipment
  SHIPMENT_VIEW = 'shipment.view',
  SHIPMENT_UPDATE = 'shipment.update',
  // Payment
  PAYMENT_CREATE = 'payment.create',
  PAYMENT_VIEW = 'payment.view',
  PAYMENT_UPDATE = 'payment.update',
  PAYMENT_DELETE = 'payment.delete',
  // Refund
  REFUND_CREATE = 'refund.create',
  REFUND_VIEW = 'refund.view',
  REFUND_UPDATE = 'refund.update',
  // Payment Method
  PAYMENT_METHOD_CREATE = 'payment_method.create',
  PAYMENT_METHOD_VIEW = 'payment_method.view',
  PAYMENT_METHOD_UPDATE = 'payment_method.update',
  PAYMENT_METHOD_DELETE = 'payment_method.delete',
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
  // Coupon
  COUPON_CREATE = 'coupon.create',
  COUPON_VIEW = 'coupon.view',
  COUPON_UPDATE = 'coupon.update',
  COUPON_DELETE = 'coupon.delete',
  // Promotion
  PROMOTION_CREATE = 'promotion.create',
  PROMOTION_VIEW = 'promotion.view',
  PROMOTION_UPDATE = 'promotion.update',
  PROMOTION_DELETE = 'promotion.delete',
  // Campaign
  CAMPAIGN_CREATE = 'campaign.create',
  CAMPAIGN_VIEW = 'campaign.view',
  CAMPAIGN_UPDATE = 'campaign.update',
  CAMPAIGN_DELETE = 'campaign.delete',
  // Wishlist
  WISHLIST_VIEW = 'wishlist.view',
  // Review
  REVIEW_VIEW = 'review.view',
  REVIEW_CREATE = 'review.create',
  REVIEW_UPDATE = 'review.update',
  REVIEW_DELETE = 'review.delete',
  REVIEW_APPROVE = 'review.approve',
  REVIEW_REJECT = 'review.reject',
  REVIEW_MODERATE = 'review.moderate',
  // Question
  QUESTION_VIEW = 'question.view',
  QUESTION_ANSWER = 'question.answer',
  QUESTION_DELETE = 'question.delete',
  // Search
  SEARCH_ANALYTICS_VIEW = 'search_analytics.view',
  SEARCH_ANALYTICS_MANAGE = 'search_analytics.manage',
  // Notifications
  NOTIFICATION_VIEW = 'notification.view',
  NOTIFICATION_MANAGE = 'notification.manage',
  EMAIL_TEMPLATE_VIEW = 'email_template.view',
  EMAIL_TEMPLATE_CREATE = 'email_template.create',
  EMAIL_TEMPLATE_UPDATE = 'email_template.update',
  EMAIL_TEMPLATE_DELETE = 'email_template.delete',
  // Supplier
  SUPPLIER_CREATE = 'supplier.create',
  SUPPLIER_VIEW = 'supplier.view',
  SUPPLIER_UPDATE = 'supplier.update',
  SUPPLIER_DELETE = 'supplier.delete',
  // Purchase Order
  PURCHASE_ORDER_CREATE = 'purchase_order.create',
  PURCHASE_ORDER_VIEW = 'purchase_order.view',
  PURCHASE_ORDER_UPDATE = 'purchase_order.update',
  PURCHASE_ORDER_APPROVE = 'purchase_order.approve',
  PURCHASE_ORDER_CANCEL = 'purchase_order.cancel',
  // Inventory Receive
  INVENTORY_RECEIVE = 'inventory.receive',
  // Inventory Analytics
  INVENTORY_ANALYTICS_VIEW = 'inventory_analytics.view',
  // Returns (RMA)
  RETURN_VIEW = 'return.view',
  RETURN_APPROVE = 'return.approve',
  RETURN_REJECT = 'return.reject',
  RETURN_RECEIVE = 'return.receive',
  RETURN_REFUND = 'return.refund',
}
