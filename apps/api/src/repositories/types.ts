import {
  Category,
  Product,
  Supplier,
  Customer,
  Order,
  StoreSettings,
  DashboardMetrics,
  OrderStatus,
  PaymentStatus,
  Fulfilment,
  FinancialTransaction,
} from '@dropship/shared';

export interface ProductFilters {
  categoryId?: string;
  categorySlug?: string;
  search?: string;
  featured?: boolean;
  activeOnly?: boolean;
  sortBy?: 'price_asc' | 'price_desc' | 'newest';
  page?: number;
  limit?: number;
}

export interface OrderFilters {
  status?: OrderStatus;
  paymentStatus?: PaymentStatus;
  search?: string;
  channel?: 'website' | 'whatsapp';
  city?: string;
  dateFrom?: string;
  dateTo?: string;
  page?: number;
  limit?: number;
}

export interface IDataStore {
  // Categories
  getCategories(activeOnly?: boolean): Promise<Category[]>;
  getCategoryById(id: string): Promise<Category | null>;
  getCategoryBySlug(slug: string): Promise<Category | null>;
  createCategory(category: Omit<Category, 'id' | 'createdAt' | 'updatedAt'>): Promise<Category>;
  updateCategory(id: string, updates: Partial<Category>): Promise<Category | null>;

  // Products
  getProducts(filters?: ProductFilters): Promise<{ products: Product[]; total: number }>;
  getProductById(id: string): Promise<Product | null>;
  getProductBySlug(slug: string): Promise<Product | null>;
  createProduct(product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>): Promise<Product>;
  updateProduct(id: string, updates: Partial<Product>): Promise<Product | null>;
  deleteProduct(id: string): Promise<boolean>;

  // Suppliers
  getSuppliers(activeOnly?: boolean): Promise<Supplier[]>;
  getSupplierById(id: string): Promise<Supplier | null>;
  createSupplier(supplier: Omit<Supplier, 'id' | 'createdAt' | 'updatedAt'>): Promise<Supplier>;
  updateSupplier(id: string, updates: Partial<Supplier>): Promise<Supplier | null>;

  // Customers
  findOrCreateCustomer(customer: Omit<Customer, 'id' | 'createdAt'>): Promise<Customer>;
  getCustomerById(id: string): Promise<Customer | null>;

  // Orders
  getOrders(filters?: OrderFilters): Promise<{ orders: Order[]; total: number }>;
  getOrderById(id: string): Promise<Order | null>;
  getOrderByReference(reference: string): Promise<Order | null>;
  createOrder(order: Omit<Order, 'id' | 'createdAt' | 'updatedAt'>): Promise<Order>;
  updateOrderStatus(
    orderId: string,
    newStatus: OrderStatus,
    paymentStatus?: PaymentStatus,
    notes?: string,
    actorId?: string,
    actorName?: string
  ): Promise<Order | null>;
  addOrderFulfilment(orderId: string, fulfilment: Omit<Fulfilment, 'id' | 'orderId' | 'createdAt' | 'updatedAt'>): Promise<Order | null>;
  updateOrderFulfilment(orderId: string, fulfilmentId: string, updates: Partial<Fulfilment>): Promise<Order | null>;
  addFinancialTransaction(orderId: string, transaction: Omit<FinancialTransaction, 'id' | 'orderId' | 'createdAt'>): Promise<Order | null>;
  addOrderInternalNote(orderId: string, note: string): Promise<Order | null>;

  // Dashboard & Metrics
  getDashboardMetrics(): Promise<DashboardMetrics>;

  // Store Settings
  getStoreSettings(): Promise<StoreSettings>;
  updateStoreSettings(settings: Partial<StoreSettings>): Promise<StoreSettings>;
}

