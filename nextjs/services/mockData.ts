// Extended Mock Database for Sports Ecommerce Admin Panel

// --- Catalog ---
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

export const INITIAL_PRODUCTS: Product[] = [
  { id: '1', name: 'Nike Air Max 270', sku: 'NK-AM270-001', category: 'Running', brand: 'Nike', price: 150, stock: 45, status: 'active', image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=150' },
  { id: '2', name: 'Adidas Ultraboost 22', sku: 'AD-UB22-002', category: 'Running', brand: 'Adidas', price: 180, stock: 28, status: 'active', image: 'https://images.unsplash.com/photo-1551107696-a4b0c5a0d9a2?w=150' },
  { id: '3', name: 'Puma Velocity Nitro', sku: 'PM-VN-003', category: 'Running', brand: 'Puma', price: 120, stock: 15, status: 'active', image: 'https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=150' },
  { id: '4', name: 'Under Armour Curry 9', sku: 'UA-C9-004', category: 'Basketball', brand: 'Under Armour', price: 160, stock: 0, status: 'out of stock', image: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=150' },
  { id: '5', name: 'Nike Zoom Fly 5', sku: 'NK-ZF5-005', category: 'Running', brand: 'Nike', price: 170, stock: 32, status: 'active', image: 'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=150' },
];

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  status: 'active' | 'inactive';
}

export const INITIAL_CATEGORIES: Category[] = [
  { id: '1', name: 'Running', slug: 'running', description: 'Performance road and trail running footwear', status: 'active' },
  { id: '2', name: 'Basketball', slug: 'basketball', description: 'High-top court sneakers and gears', status: 'active' },
  { id: '3', name: 'Training', slug: 'training', description: 'Cross-training and gym workout shoes', status: 'active' },
];

export interface Brand {
  id: string;
  name: string;
  code: string;
  status: 'active' | 'inactive';
}

export const INITIAL_BRANDS: Brand[] = [
  { id: '1', name: 'Nike', code: 'NK', status: 'active' },
  { id: '2', name: 'Adidas', code: 'AD', status: 'active' },
  { id: '3', name: 'Puma', code: 'PM', status: 'active' },
];

export interface Review {
  id: string;
  productName: string;
  customerName: string;
  rating: number;
  comment: string;
  status: 'approved' | 'pending' | 'rejected';
}

export const INITIAL_REVIEWS: Review[] = [
  { id: '1', productName: 'Nike Air Max 270', customerName: 'Liam Neeson', rating: 5, comment: 'Super comfortable for daily running! Highly recommended.', status: 'approved' },
  { id: '2', productName: 'Adidas Ultraboost 22', customerName: 'Scarlett J.', rating: 4, comment: 'Great fit and cushioning, but slightly heavy.', status: 'approved' },
];

// --- Inventory ---
export interface Supplier {
  id: string;
  name: string;
  contact: string;
  email: string;
  phone: string;
  status: 'active' | 'inactive';
}

export const INITIAL_SUPPLIERS: Supplier[] = [
  { id: '1', name: 'Alpha Sports Wholesale', contact: 'Mark Ruffalo', email: 'mark@alphasports.com', phone: '+1 555-0192', status: 'active' },
  { id: '2', name: 'Apex Gear Ltd', contact: 'Elizabeth Olsen', email: 'elizabeth@apexgear.net', phone: '+1 555-0144', status: 'active' },
  { id: '3', name: 'Dynamic Footwear Dist.', contact: 'Paul Bettany', email: 'paul@dynamicfootwear.org', phone: '+1 555-0188', status: 'inactive' },
];

export interface PurchaseOrder {
  id: string;
  poNumber: string;
  supplier: string;
  orderDate: string;
  status: 'pending' | 'completed' | 'cancelled';
  totalAmount: number;
}

export const INITIAL_PURCHASE_ORDERS: PurchaseOrder[] = [
  { id: '1', poNumber: 'PO-2026-001', supplier: 'Alpha Sports Wholesale', orderDate: '2026-06-01', status: 'completed', totalAmount: 4500 },
  { id: '2', poNumber: 'PO-2026-002', supplier: 'Apex Gear Ltd', orderDate: '2026-06-10', status: 'pending', totalAmount: 1800 },
];

// --- Inventory Extended ---
export interface GoodsReceipt {
  id: string;
  receiptNumber: string;
  poNumber: string;
  supplier: string;
  receivedDate: string;
  status: 'completed' | 'pending' | 'cancelled';
  itemsReceived: number;
}

export const INITIAL_GOODS_RECEIPTS: GoodsReceipt[] = [
  { id: '1', receiptNumber: 'GR-2026-001', poNumber: 'PO-2026-001', supplier: 'Alpha Sports Wholesale', receivedDate: '2026-06-05', status: 'completed', itemsReceived: 100 },
  { id: '2', receiptNumber: 'GR-2026-002', poNumber: 'PO-2026-002', supplier: 'Apex Gear Ltd', receivedDate: '2026-06-12', status: 'pending', itemsReceived: 50 },
];

export interface StockAdjustment {
  id: string;
  productName: string;
  sku: string;
  adjustment: number;
  reason: string;
  date: string;
}

export const INITIAL_STOCK_ADJUSTMENTS: StockAdjustment[] = [
  { id: '1', productName: 'Nike Air Max 270', sku: 'NK-AM270-001', adjustment: -5, reason: 'Damaged stock', date: '2026-06-10' },
  { id: '2', productName: 'Adidas Ultraboost 22', sku: 'AD-UB22-002', adjustment: 10, reason: 'Found in warehouse', date: '2026-06-09' },
];

// --- Orders ---
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

export const INITIAL_ORDERS: Order[] = [
  { id: '1', orderNumber: 'ORD-8492', customerName: 'Liam Neeson', phone: '+1 555-0101', amount: 150.00, status: 'delivered', paymentStatus: 'paid', date: '2026-06-12' },
  { id: '2', orderNumber: 'ORD-8491', customerName: 'Scarlett J.', phone: '+1 555-0102', amount: 180.00, status: 'processing', paymentStatus: 'paid', date: '2026-06-12' },
  { id: '3', orderNumber: 'ORD-8490', customerName: 'Chris Evans', phone: '+1 555-0103', amount: 120.00, status: 'pending', paymentStatus: 'pending', date: '2026-06-11' },
];

// --- Orders Extended ---
export interface Shipment {
  id: string;
  orderNumber: string;
  carrier: string;
  trackingNumber: string;
  shippedDate: string;
  status: 'shipped' | 'in_transit' | 'delivered';
}

export const INITIAL_SHIPMENTS: Shipment[] = [
  { id: '1', orderNumber: 'ORD-8492', carrier: 'UPS', trackingNumber: '1Z999AA10123456784', shippedDate: '2026-06-11', status: 'delivered' },
  { id: '2', orderNumber: 'ORD-8491', carrier: 'FedEx', trackingNumber: '794654789012', shippedDate: '2026-06-12', status: 'in_transit' },
];

export interface Return {
  id: string;
  orderNumber: string;
  customerName: string;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  requestedDate: string;
}

export const INITIAL_RETURNS: Return[] = [
  { id: '1', orderNumber: 'ORD-8488', customerName: 'Tom Holland', reason: 'Wrong size', status: 'pending', requestedDate: '2026-06-11' },
  { id: '2', orderNumber: 'ORD-8489', customerName: 'Robert Downey', reason: 'Defective product', status: 'approved', requestedDate: '2026-06-10' },
];

// --- Customers ---
export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  status: 'active' | 'inactive';
  registrationDate: string;
}

export const INITIAL_CUSTOMERS: Customer[] = [
  { id: '1', name: 'Liam Neeson', email: 'liam@taken.com', phone: '+1 555-0101', status: 'active', registrationDate: '2026-01-15' },
  { id: '2', name: 'Scarlett J.', email: 'scarlett@widow.com', phone: '+1 555-0102', status: 'active', registrationDate: '2026-02-20' },
  { id: '3', name: 'Chris Evans', email: 'cap@shield.com', phone: '+1 555-0103', status: 'inactive', registrationDate: '2026-03-05' },
];

// --- Customers Extended ---
export interface CustomerActivity {
  id: string;
  customerName: string;
  action: string;
  details: string;
  date: string;
}

export const INITIAL_CUSTOMER_ACTIVITIES: CustomerActivity[] = [
  { id: '1', customerName: 'Liam Neeson', action: 'purchase', details: 'Ordered Nike Air Max 270', date: '2026-06-12' },
  { id: '2', customerName: 'Scarlett J.', action: 'review', details: 'Reviewed Adidas Ultraboost', date: '2026-06-11' },
  { id: '3', customerName: 'Chris Evans', action: 'login', details: 'Account login from new device', date: '2026-06-10' },
];

// --- Marketing ---
export interface Coupon {
  id: string;
  code: string;
  title: string;
  discount: string;
  status: 'active' | 'expired';
}

export const INITIAL_COUPONS: Coupon[] = [
  { id: '1', code: 'SUMMER20', title: 'Summer Kickoff Discount', discount: '20%', status: 'active' },
  { id: '2', code: 'RUN10', title: 'Running Shoes Promo', discount: '10%', status: 'active' },
  { id: '3', code: 'WELCOME5', title: 'New User Sign Up', discount: '$5 Off', status: 'expired' },
];

// --- Marketing Extended ---
export interface Promotion {
  id: string;
  title: string;
  discount: string;
  startDate: string;
  endDate: string;
  status: 'active' | 'scheduled' | 'ended';
}

export const INITIAL_PROMOTIONS: Promotion[] = [
  { id: '1', title: 'Summer Sale', discount: '25% Off', startDate: '2026-06-01', endDate: '2026-08-31', status: 'active' },
  { id: '2', title: 'New Arrivals', discount: '15% Off', startDate: '2026-07-01', endDate: '2026-07-15', status: 'scheduled' },
];

export interface Campaign {
  id: string;
  name: string;
  channel: string;
  budget: number;
  status: 'active' | 'paused' | 'completed';
}

export const INITIAL_CAMPAIGNS: Campaign[] = [
  { id: '1', name: 'Summer Launch', channel: 'Email', budget: 5000, status: 'active' },
  { id: '2', name: 'Social Media Push', channel: 'Instagram', budget: 3000, status: 'paused' },
];

export interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  status: 'active' | 'draft';
}

export const INITIAL_EMAIL_TEMPLATES: EmailTemplate[] = [
  { id: '1', name: 'Welcome Email', subject: 'Welcome to Sports E-commerce!', status: 'active' },
  { id: '2', name: 'Order Confirmation', subject: 'Your order has been confirmed', status: 'active' },
  { id: '3', name: 'Newsletter Q3', subject: 'Check out our latest arrivals', status: 'draft' },
];

// --- Support ---
export interface Ticket {
  id: string;
  ticketNumber: string;
  customerName: string;
  email: string;
  priority: 'low' | 'medium' | 'high';
  status: 'open' | 'pending' | 'resolved';
}

export const INITIAL_TICKETS: Ticket[] = [
  { id: '1', ticketNumber: 'TKT-1021', customerName: 'Liam Neeson', email: 'liam@taken.com', priority: 'high', status: 'open' },
  { id: '2', ticketNumber: 'TKT-1022', customerName: 'Scarlett J.', email: 'scarlett@widow.com', priority: 'medium', status: 'resolved' },
];

// --- Support Extended ---
export interface SupportAnalytics {
  id: string;
  metric: string;
  value: number;
  trend: 'up' | 'down';
  period: string;
}

export const INITIAL_SUPPORT_ANALYTICS: SupportAnalytics[] = [
  { id: '1', metric: 'Avg Response Time', value: 2.5, trend: 'down', period: 'hours' },
  { id: '2', metric: 'Tickets Resolved', value: 142, trend: 'up', period: 'this week' },
  { id: '3', metric: 'Customer Satisfaction', value: 94, trend: 'up', period: 'percentage' },
];

// --- Finance ---
export interface Transaction {
  id: string;
  transactionNumber: string;
  amount: number;
  type: 'sale' | 'refund' | 'expense';
  status: 'success' | 'failed' | 'pending';
  date: string;
}

export const INITIAL_TRANSACTIONS: Transaction[] = [
  { id: '1', transactionNumber: 'TXN-9021', amount: 150.00, type: 'sale', status: 'success', date: '2026-06-12' },
  { id: '2', transactionNumber: 'TXN-9022', amount: 180.00, type: 'sale', status: 'success', date: '2026-06-12' },
  { id: '3', transactionNumber: 'TXN-9023', amount: 45.00, type: 'refund', status: 'success', date: '2026-06-11' },
];

// --- Finance Extended ---
export interface Settlement {
  id: string;
  settlementNumber: string;
  amount: number;
  status: 'completed' | 'pending' | 'failed';
  date: string;
}

export const INITIAL_SETTLEMENTS: Settlement[] = [
  { id: '1', settlementNumber: 'STL-2026-001', amount: 12500, status: 'completed', date: '2026-06-10' },
  { id: '2', settlementNumber: 'STL-2026-002', amount: 8400, status: 'pending', date: '2026-06-12' },
];

export interface Expense {
  id: string;
  category: string;
  description: string;
  amount: number;
  status: 'approved' | 'pending' | 'rejected';
  date: string;
}

export const INITIAL_EXPENSES: Expense[] = [
  { id: '1', category: 'Utilities', description: 'Electricity bill - June', amount: 1200, status: 'approved', date: '2026-06-01' },
  { id: '2', category: 'Office Supplies', description: 'Printer ink and paper', amount: 250, status: 'pending', date: '2026-06-11' },
];

// --- CMS ---
export interface CmsPage {
  id: string;
  title: string;
  slug: string;
  status: 'published' | 'draft';
}

export const INITIAL_CMS_PAGES: CmsPage[] = [
  { id: '1', title: 'About Us', slug: 'about-us', status: 'published' },
  { id: '2', title: 'Shipping Policy', slug: 'shipping-policy', status: 'published' },
  { id: '3', title: 'Terms & Conditions', slug: 'terms-and-conditions', status: 'draft' },
];

// --- CMS Extended ---
export interface CmsSection {
  id: string;
  name: string;
  type: string;
  status: 'active' | 'inactive';
}

export const INITIAL_CMS_SECTIONS: CmsSection[] = [
  { id: '1', name: 'Hero Banner', type: 'banner', status: 'active' },
  { id: '2', name: 'Featured Products', type: 'grid', status: 'active' },
  { id: '3', name: 'Testimonials', type: 'carousel', status: 'inactive' },
];

// --- Administration ---
export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: string;
  status: 'active' | 'inactive';
}

export const INITIAL_ADMIN_USERS: AdminUser[] = [
  { id: '1', name: 'Jane Doe', email: 'admin@sports-ecommerce.com', role: 'Administrator', status: 'active' },
  { id: '2', name: 'John Smith', email: 'john@sports-ecommerce.com', role: 'Editor', status: 'active' },
  { id: '3', name: 'Mary Watson', email: 'mary@sports-ecommerce.com', role: 'Support Agent', status: 'inactive' },
];

export interface Role {
  id: string;
  name: string;
  description: string;
  usersCount: number;
  status: 'active' | 'inactive';
}

export const INITIAL_ROLES: Role[] = [
  { id: '1', name: 'Administrator', description: 'Full system access', usersCount: 3, status: 'active' },
  { id: '2', name: 'Editor', description: 'Can manage catalog and CMS', usersCount: 5, status: 'active' },
  { id: '3', name: 'Support Agent', description: 'Can manage tickets', usersCount: 8, status: 'active' },
];

export interface Permission {
  id: string;
  name: string;
  slug: string;
  module: string;
  description: string;
}

export const INITIAL_PERMISSIONS: Permission[] = [
  { id: '1', name: 'View Dashboard', slug: 'dashboard.view', module: 'Dashboard', description: 'Access to dashboard' },
  { id: '2', name: 'View Catalog', slug: 'catalog.view', module: 'Catalog', description: 'View catalog items' },
  { id: '3', name: 'Create Product', slug: 'product.create', module: 'Catalog', description: 'Create new products' },
  { id: '4', name: 'Edit Product', slug: 'product.update', module: 'Catalog', description: 'Edit existing products' },
  { id: '5', name: 'Delete Product', slug: 'product.delete', module: 'Catalog', description: 'Delete products' },
  { id: '6', name: 'View Orders', slug: 'orders.view', module: 'Orders', description: 'View orders' },
  { id: '7', name: 'Manage Users', slug: 'admin.users', module: 'Administration', description: 'Manage admin users' },
];

export interface AuditLog {
  id: string;
  user: string;
  action: string;
  resource: string;
  details: string;
  timestamp: string;
}

export const INITIAL_AUDIT_LOGS: AuditLog[] = [
  { id: '1', user: 'Jane Doe', action: 'update', resource: 'Product', details: 'Updated Nike Air Max 270 price', timestamp: '2026-06-12 10:30:00' },
  { id: '2', user: 'John Smith', action: 'create', resource: 'Order', details: 'Created order ORD-8493', timestamp: '2026-06-12 09:15:00' },
  { id: '3', user: 'Jane Doe', action: 'delete', resource: 'User', details: 'Deactivated user account', timestamp: '2026-06-11 16:45:00' },
];

export interface SecurityLog {
  id: string;
  user: string;
  action: string;
  ipAddress: string;
  status: 'success' | 'failed';
  timestamp: string;
}

export const INITIAL_SECURITY_LOGS: SecurityLog[] = [
  { id: '1', user: 'Jane Doe', action: 'login', ipAddress: '192.168.1.100', status: 'success', timestamp: '2026-06-12 08:00:00' },
  { id: '2', user: 'Unknown', action: 'login', ipAddress: '10.0.0.50', status: 'failed', timestamp: '2026-06-12 07:55:00' },
  { id: '3', user: 'John Smith', action: 'logout', ipAddress: '192.168.1.101', status: 'success', timestamp: '2026-06-11 18:00:00' },
];

export interface PrivacyRequest {
  id: string;
  customerName: string;
  email: string;
  requestType: 'data_export' | 'data_deletion' | 'opt_out';
  status: 'pending' | 'approved' | 'completed' | 'rejected';
  requestedDate: string;
}

export const INITIAL_PRIVACY_REQUESTS: PrivacyRequest[] = [
  { id: '1', customerName: 'Liam Neeson', email: 'liam@taken.com', requestType: 'data_export', status: 'pending', requestedDate: '2026-06-10' },
  { id: '2', customerName: 'Scarlett J.', email: 'scarlett@widow.com', requestType: 'data_deletion', status: 'approved', requestedDate: '2026-06-08' },
];
