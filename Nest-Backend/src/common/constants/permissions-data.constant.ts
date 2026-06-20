import { DefaultPermissions } from './roles.constants';

export interface PermissionDef {
  slug: DefaultPermissions;
  name: string;
  module: string;
}

export const ALL_PERMISSIONS: PermissionDef[] = [
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
  {
    slug: DefaultPermissions.INVENTORY_RECEIVE,
    name: 'Receive Inventory',
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
    slug: DefaultPermissions.FINANCE_MANAGE,
    name: 'Manage Finance',
    module: 'finance',
  },
  {
    slug: DefaultPermissions.FINANCE_EXPORT,
    name: 'Export Finance',
    module: 'finance',
  },
  {
    slug: DefaultPermissions.SETTLEMENT_VIEW,
    name: 'View Settlements',
    module: 'settlement',
  },
  {
    slug: DefaultPermissions.SETTLEMENT_MANAGE,
    name: 'Manage Settlements',
    module: 'settlement',
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
  {
    slug: DefaultPermissions.SUPPORT_ASSIGN,
    name: 'Assign Support Tickets',
    module: 'support',
  },
  {
    slug: DefaultPermissions.SUPPORT_REPLY,
    name: 'Reply To Support Tickets',
    module: 'support',
  },
  {
    slug: DefaultPermissions.SUPPORT_RESOLVE,
    name: 'Resolve Support Tickets',
    module: 'support',
  },
  {
    slug: DefaultPermissions.SUPPORT_NOTE,
    name: 'Add Internal Notes',
    module: 'support',
  },
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
  {
    slug: DefaultPermissions.DELIVERY_MANAGE,
    name: 'Manage Delivery',
    module: 'delivery',
  },
  {
    slug: DefaultPermissions.DELIVERY_CHARGE_VIEW,
    name: 'View Delivery Charges',
    module: 'delivery_charge',
  },
  {
    slug: DefaultPermissions.DELIVERY_CHARGE_MANAGE,
    name: 'Manage Delivery Charges',
    module: 'delivery_charge',
  },
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
  {
    slug: DefaultPermissions.WISHLIST_VIEW,
    name: 'View Wishlist',
    module: 'wishlist',
  },
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
  {
    slug: DefaultPermissions.NOTIFICATION_VIEW,
    name: 'View Notification Logs',
    module: 'notification',
  },
  {
    slug: DefaultPermissions.NOTIFICATION_SEND,
    name: 'Send Notifications',
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
  {
    slug: DefaultPermissions.CAMPAIGN_MANAGE,
    name: 'Manage Campaigns',
    module: 'campaign',
  },
  {
    slug: DefaultPermissions.SUPPLIER_CREATE,
    name: 'Create Supplier',
    module: 'supplier',
  },
  {
    slug: DefaultPermissions.SUPPLIER_VIEW,
    name: 'View Supplier',
    module: 'supplier',
  },
  {
    slug: DefaultPermissions.SUPPLIER_UPDATE,
    name: 'Update Supplier',
    module: 'supplier',
  },
  {
    slug: DefaultPermissions.SUPPLIER_DELETE,
    name: 'Delete Supplier',
    module: 'supplier',
  },
  {
    slug: DefaultPermissions.PURCHASE_ORDER_CREATE,
    name: 'Create Purchase Order',
    module: 'purchase_order',
  },
  {
    slug: DefaultPermissions.PURCHASE_ORDER_VIEW,
    name: 'View Purchase Order',
    module: 'purchase_order',
  },
  {
    slug: DefaultPermissions.PURCHASE_ORDER_UPDATE,
    name: 'Update Purchase Order',
    module: 'purchase_order',
  },
  {
    slug: DefaultPermissions.PURCHASE_ORDER_APPROVE,
    name: 'Approve Purchase Order',
    module: 'purchase_order',
  },
  {
    slug: DefaultPermissions.PURCHASE_ORDER_CANCEL,
    name: 'Cancel Purchase Order',
    module: 'purchase_order',
  },
  {
    slug: DefaultPermissions.INVENTORY_ANALYTICS_VIEW,
    name: 'View Inventory Analytics',
    module: 'inventory_analytics',
  },
  {
    slug: DefaultPermissions.RETURN_VIEW,
    name: 'View Returns',
    module: 'return',
  },
  {
    slug: DefaultPermissions.RETURN_APPROVE,
    name: 'Approve Returns',
    module: 'return',
  },
  {
    slug: DefaultPermissions.RETURN_REJECT,
    name: 'Reject Returns',
    module: 'return',
  },
  {
    slug: DefaultPermissions.RETURN_RECEIVE,
    name: 'Receive Returns',
    module: 'return',
  },
  {
    slug: DefaultPermissions.RETURN_REFUND,
    name: 'Refund Returns',
    module: 'return',
  },
  {
    slug: DefaultPermissions.REPORTS_VIEW,
    name: 'View Reports',
    module: 'reports',
  },
  {
    slug: DefaultPermissions.DASHBOARD_VIEW,
    name: 'View Dashboards',
    module: 'dashboard',
  },
  {
    slug: DefaultPermissions.AUDIT_VIEW,
    name: 'View Audit Logs',
    module: 'audit',
  },
  {
    slug: DefaultPermissions.SECURITY_VIEW,
    name: 'View Security',
    module: 'security',
  },
  {
    slug: DefaultPermissions.SECURITY_MANAGE,
    name: 'Manage Security',
    module: 'security',
  },
  {
    slug: DefaultPermissions.PRIVACY_MANAGE,
    name: 'Manage Privacy Requests',
    module: 'privacy',
  },
  {
    slug: DefaultPermissions.SETTINGS_VIEW,
    name: 'View Settings',
    module: 'settings',
  },
  {
    slug: DefaultPermissions.SETTINGS_MANAGE,
    name: 'Manage Settings',
    module: 'settings',
  },
  { slug: DefaultPermissions.CMS_VIEW, name: 'View CMS', module: 'cms' },
  { slug: DefaultPermissions.CMS_MANAGE, name: 'Manage CMS', module: 'cms' },
  {
    slug: DefaultPermissions.CATALOG_VIEW,
    name: 'View Catalog',
    module: 'catalog',
  },
  {
    slug: DefaultPermissions.CATALOG_MANAGE,
    name: 'Manage Catalog',
    module: 'catalog',
  },
  {
    slug: DefaultPermissions.CUSTOMER_VIEW,
    name: 'View Customers',
    module: 'customer',
  },
  {
    slug: DefaultPermissions.CUSTOMER_STATS,
    name: 'View Customer Stats',
    module: 'customer',
  },
  {
    slug: DefaultPermissions.WISHLIST_ADMIN_VIEW,
    name: 'Admin View Wishlist',
    module: 'wishlist',
  },
];
