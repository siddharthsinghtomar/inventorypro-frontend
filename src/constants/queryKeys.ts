/**
 * Centralized React Query Key Constants for InventoryPro ERP
 */
export const QUERY_KEYS = {
  // Analytics & Dashboard
  dashboardStats: ["analytics", "dashboard-stats"],
  salesReport: ["analytics", "sales-report"],
  inventoryReport: ["analytics", "inventory-report"],

  // Inventory & Stock
  stocks: ["inventory", "stocks"],
  stockAlerts: ["inventory", "alerts"],
  stockMovements: ["inventory", "movements"],
  warehouses: ["inventory", "warehouses"],

  // Products & Catalog
  products: ["products"],
  productDetail: (id: string) => ["products", id],
  categories: ["categories"],
  brands: ["brands"],
  units: ["units"],

  // Sales & POS
  sales: ["sales"],
  saleDetail: (id: string) => ["sales", id],

  // Purchases
  purchases: ["purchases"],
  purchaseDetail: (id: string) => ["purchases", id],

  // Customers & Suppliers
  customers: ["customers"],
  customerDetail: (id: string) => ["customers", id],
  suppliers: ["suppliers"],
  supplierDetail: (id: string) => ["suppliers", id],

  // Finance
  expenses: ["expenses"],
} as const;

/**
 * Invalidate all queries affected by stock-changing operations (Sale, Purchase, Return, Adjustment)
 */
export const STOCK_AFFECTED_QUERY_KEYS = [
  QUERY_KEYS.dashboardStats,
  QUERY_KEYS.stocks,
  QUERY_KEYS.stockAlerts,
  QUERY_KEYS.stockMovements,
  QUERY_KEYS.products,
  QUERY_KEYS.sales,
  QUERY_KEYS.purchases,
  QUERY_KEYS.customers,
  QUERY_KEYS.suppliers,
  QUERY_KEYS.inventoryReport,
  QUERY_KEYS.salesReport,
] as const;
