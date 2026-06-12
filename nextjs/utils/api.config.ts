const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api/v1';

export const API_PATHS = {
  auth: {
    login: `${API_BASE_URL}/auth/login`,
    forgotPassword: `${API_BASE_URL}/auth/forgot-password`,
    resetPassword: `${API_BASE_URL}/auth/reset-password`,
    me: `${API_BASE_URL}/auth/me`,
  },
  catalog: {
    products: `${API_BASE_URL}/catalog/products`,
    categories: `${API_BASE_URL}/catalog/categories`,
    brands: `${API_BASE_URL}/catalog/brands`,
    reviews: `${API_BASE_URL}/catalog/reviews`,
  },
  inventory: {
    stock: `${API_BASE_URL}/inventory/stock`,
    suppliers: `${API_BASE_URL}/inventory/suppliers`,
    purchaseOrders: `${API_BASE_URL}/inventory/purchase-orders`,
    goodsReceipts: `${API_BASE_URL}/inventory/goods-receipts`,
    stockAdjustments: `${API_BASE_URL}/inventory/stock-adjustments`,
  },
  orders: {
    list: `${API_BASE_URL}/orders`,
    shipments: `${API_BASE_URL}/orders/shipments`,
    returns: `${API_BASE_URL}/orders/returns`,
  },
  customers: {
    list: `${API_BASE_URL}/customers`,
    activity: `${API_BASE_URL}/customers/activity`,
  },
  marketing: {
    coupons: `${API_BASE_URL}/marketing/coupons`,
    promotions: `${API_BASE_URL}/marketing/promotions`,
    campaigns: `${API_BASE_URL}/marketing/campaigns`,
    emailTemplates: `${API_BASE_URL}/marketing/email-templates`,
  },
  support: {
    tickets: `${API_BASE_URL}/support/tickets`,
    analytics: `${API_BASE_URL}/support/analytics`,
  },
  finance: {
    transactions: `${API_BASE_URL}/finance/transactions`,
    settlements: `${API_BASE_URL}/finance/settlements`,
    expenses: `${API_BASE_URL}/finance/expenses`,
  },
  reports: {
    generate: `${API_BASE_URL}/reports/generate`,
    export: `${API_BASE_URL}/reports/export`,
  },
  cms: {
    pages: `${API_BASE_URL}/cms/pages`,
    sections: `${API_BASE_URL}/cms/sections`,
  },
  administration: {
    users: `${API_BASE_URL}/admin/users`,
    roles: `${API_BASE_URL}/admin/roles`,
    permissions: `${API_BASE_URL}/admin/permissions`,
    auditLogs: `${API_BASE_URL}/admin/audit-logs`,
    securityLogs: `${API_BASE_URL}/admin/security-logs`,
    privacyRequests: `${API_BASE_URL}/admin/privacy-requests`,
  },
};

export default API_PATHS;
