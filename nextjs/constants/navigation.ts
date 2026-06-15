import { type ComponentType } from 'react';
import {
  LayoutDashboard,
  ShoppingBag,
  Warehouse,
  ShoppingCart,
  Users,
  Percent,
  LifeBuoy,
  DollarSign,
  BarChart3,
  FileText,
  Settings,
} from 'lucide-react';

export interface MenuItem {
  title: string;
  href: string;
  icon?: ComponentType<{ size?: number; className?: string }>;
  permission?: string;
  submenu?: MenuItem[];
}

export const SIDEBAR_ITEMS: MenuItem[] = [
  {
    title: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
    permission: 'dashboard.view',
  },
  {
    title: 'Catalog',
    href: '/catalog',
    icon: ShoppingBag,
    permission: 'catalog.view',
    submenu: [
      { title: 'Products', href: '/catalog/products', permission: 'catalog.view' },
      { title: 'Categories', href: '/catalog/categories', permission: 'catalog.view' },
      { title: 'Brands', href: '/catalog/brands', permission: 'catalog.view' },
      { title: 'Reviews', href: '/catalog/reviews', permission: 'review.view' },
    ],
  },
  {
    title: 'Inventory',
    href: '/inventory',
    icon: Warehouse,
    permission: 'inventory.view',
    submenu: [
      { title: 'Stock Levels', href: '/inventory/stock', permission: 'inventory.view' },
      { title: 'Suppliers', href: '/inventory/suppliers', permission: 'supplier.view' },
      { title: 'Purchase Orders', href: '/inventory/purchase-orders', permission: 'purchase_order.view' },
      { title: 'Goods Receipts', href: '/inventory/goods-receipts', permission: 'goods_receipt.view' },
      { title: 'Stock Adjustments', href: '/inventory/stock-adjustments', permission: 'stock_adjustment.view' },
    ],
  },
  {
    title: 'Orders',
    href: '/orders',
    icon: ShoppingCart,
    permission: 'orders.view',
    submenu: [
      { title: 'All Orders', href: '/orders', permission: 'orders.view' },
      { title: 'Shipments', href: '/orders/shipments', permission: 'shipment.view' },
      { title: 'Returns', href: '/orders/returns', permission: 'return.view' },
    ],
  },
  {
    title: 'Customers',
    href: '/customers',
    icon: Users,
    permission: 'customers.view',
    submenu: [
      { title: 'All Customers', href: '/customers', permission: 'customers.view' },
      { title: 'Customer Activity', href: '/customers/activity', permission: 'customers-activity.view' },
    ],
  },
  {
    title: 'Marketing',
    href: '/marketing',
    icon: Percent,
    permission: 'marketing.view',
    submenu: [
      { title: 'Coupons', href: '/marketing/coupons', permission: 'marketing.view' },
      { title: 'Promotions', href: '/marketing/promotions', permission: 'marketing.view' },
      { title: 'Campaigns', href: '/marketing/campaigns', permission: 'marketing.view' },
      { title: 'Email Templates', href: '/marketing/email-templates', permission: 'marketing.view' },
    ],
  },
  {
    title: 'Support',
    href: '/support',
    icon: LifeBuoy,
    permission: 'support.view',
    submenu: [
      { title: 'Tickets', href: '/support/tickets', permission: 'support.tickets' },
      { title: 'Analytics', href: '/support/analytics', permission: 'support.analytics' },
    ],
  },
  {
    title: 'Finance',
    href: '/finance',
    icon: DollarSign,
    permission: 'finance.view',
    submenu: [
      { title: 'Transactions', href: '/finance/transactions', permission: 'finance.transactions' },
      { title: 'Settlements', href: '/finance/settlements', permission: 'finance.settlements' },
      { title: 'Expenses', href: '/finance/expenses', permission: 'finance.expenses' },
    ],
  },
  {
    title: 'Reports',
    href: '/reports',
    icon: BarChart3,
    permission: 'reports.view',
  },
  {
    title: 'CMS',
    href: '/cms',
    icon: FileText,
    permission: 'cms.view',
    submenu: [
      { title: 'Pages', href: '/cms/pages', permission: 'cms.pages' },
      { title: 'Homepage Sections', href: '/cms/sections', permission: 'cms.sections' },
    ],
  },
  {
    title: 'Administration',
    href: '/administration',
    icon: Settings,
    permission: 'admin.view',
    submenu: [
      { title: 'Users', href: '/administration/users', permission: 'admin.users' },
      { title: 'Roles', href: '/administration/roles', permission: 'admin.roles' },
      { title: 'Permissions', href: '/administration/permissions', permission: 'admin.permissions' },
      { title: 'Audit Logs', href: '/administration/audit-logs', permission: 'admin.audit-logs' },
      { title: 'Security Logs', href: '/administration/security-logs', permission: 'admin.security-logs' },
      { title: 'Privacy Requests', href: '/administration/privacy-requests', permission: 'admin.privacy-requests' },
    ],
  },
];
