export interface DashboardMetrics {
  totalOrders: number;
  totalRevenue: number;
  totalCustomers: number;
  totalProducts: number;
  openTickets: number;
  pendingReturns: number;
  lowStockProducts: number;
}

export interface DashboardCharts {
  revenue: { month: string; revenue: number; target: number }[];
  orders: { day: string; orders: number; completed: number }[];
  inventory: { name: string; value: number; color: string }[];
}

export interface DashboardData {
  metrics: DashboardMetrics;
  charts: DashboardCharts;
}

export interface Product {
  id: string;
  name: string;
  sku: string;
  category: string;
  brand: string;
  price: number;
  stock: number;
  status: 'active' | 'inactive' | 'out of stock';
  image?: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  status: 'active' | 'inactive';
}

export interface Brand {
  id: string;
  name: string;
  code: string;
  status: 'active' | 'inactive';
}

export interface Review {
  id: string;
  productName: string;
  customerName: string;
  rating: number;
  comment: string;
  status: 'approved' | 'pending' | 'rejected';
}

export interface Supplier {
  id: string;
  name: string;
  contact: string;
  email: string;
  phone: string;
  status: 'active' | 'inactive';
}

export interface PurchaseOrder {
  id: string;
  poNumber: string;
  supplier: string;
  orderDate: string;
  status: 'pending' | 'completed' | 'cancelled';
  totalAmount: number;
}

export interface GoodsReceipt {
  id: string;
  receiptNumber: string;
  poNumber: string;
  supplier: string;
  receivedDate: string;
  status: 'completed' | 'pending' | 'cancelled';
  itemsReceived: number;
}

export interface StockAdjustment {
  id: string;
  productName: string;
  sku: string;
  adjustment: number;
  reason: string;
  date: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  customerName: string;
  phone: string;
  amount: number;
  status: 'pending' | 'processing' | 'delivered' | 'cancelled';
  paymentStatus: 'paid' | 'pending' | 'failed';
  date: string;
}

export interface Shipment {
  id: string;
  orderNumber: string;
  carrier: string;
  trackingNumber: string;
  shippedDate: string;
  status: 'shipped' | 'in_transit' | 'delivered';
}

export interface Return {
  id: string;
  orderNumber: string;
  customerName: string;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  requestedDate: string;
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  status: 'active' | 'inactive';
  registrationDate: string;
}

export interface CustomerActivity {
  id: string;
  customerName: string;
  action: string;
  details: string;
  date: string;
}

export interface Coupon {
  id: string;
  code: string;
  title: string;
  discount: string;
  status: 'active' | 'expired';
}

export interface Promotion {
  id: string;
  title: string;
  discount: string;
  startDate: string;
  endDate: string;
  status: 'active' | 'scheduled' | 'ended';
}

export interface Campaign {
  id: string;
  name: string;
  channel: string;
  budget: number;
  status: 'active' | 'paused' | 'completed';
}

export interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  status: 'active' | 'draft';
}

export interface Ticket {
  id: string;
  ticketNumber: string;
  customerName: string;
  email: string;
  priority: 'low' | 'medium' | 'high';
  status: 'open' | 'pending' | 'resolved';
}

export interface SupportAnalytics {
  id: string;
  metric: string;
  value: number;
  trend: 'up' | 'down';
  period: string;
}

export interface Transaction {
  id: string;
  transactionNumber: string;
  amount: number;
  type: 'sale' | 'refund' | 'expense';
  status: 'success' | 'failed' | 'pending';
  date: string;
}

export interface Settlement {
  id: string;
  settlementNumber: string;
  amount: number;
  status: 'completed' | 'pending' | 'failed';
  date: string;
}

export interface Expense {
  id: string;
  category: string;
  description: string;
  amount: number;
  status: 'approved' | 'pending' | 'rejected';
  date: string;
}

export interface CmsPage {
  id: string;
  title: string;
  slug: string;
  status: 'published' | 'draft';
}

export interface CmsSection {
  id: string;
  name: string;
  type: string;
  status: 'active' | 'inactive';
}

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: string;
  status: 'active' | 'inactive';
}

export interface Role {
  id: string;
  name: string;
  description: string;
  usersCount: number;
  status: 'active' | 'inactive';
}

export interface Permission {
  id: string;
  name: string;
  slug: string;
  module: string;
  description: string;
}

export interface AuditLog {
  id: string;
  user: string;
  action: string;
  resource: string;
  details: string;
  timestamp: string;
}

export interface SecurityLog {
  id: string;
  user: string;
  action: string;
  ipAddress: string;
  status: 'success' | 'failed';
  timestamp: string;
}

export interface CatalogOverview {
  totalProducts: number;
  totalCategories: number;
  totalBrands: number;
  totalReviews: number;
  totalVariants: number;
}

export interface CatalogSummaryItem {
  label: string;
  value: number;
  color?: string;
}

export interface CatalogSummary {
  items: CatalogSummaryItem[];
}

export interface CatalogQuickLink {
  label: string;
  href: string;
  description: string;
}

export interface CatalogAnalytics {
  averageRating: number;
  reviewCount: number;
  lowStockCount: number;
  outOfStockCount: number;
  topCategory: string | null;
  topBrand: string | null;
}

export interface PrivacyRequest {
  id: string;
  customerName: string;
  email: string;
  requestType: 'data_export' | 'data_deletion' | 'opt_out';
  status: 'pending' | 'approved' | 'completed' | 'rejected';
  requestedDate: string;
}
