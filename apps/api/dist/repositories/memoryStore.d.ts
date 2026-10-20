import { Category, Product, Supplier, Customer, Order, StoreSettings, DashboardMetrics, OrderStatus, PaymentStatus, Fulfilment, FinancialTransaction } from '@dropship/shared';
import { IDataStore, ProductFilters, OrderFilters } from './types.js';
export declare class InMemoryStore implements IDataStore {
    private categories;
    private suppliers;
    private products;
    private customers;
    private orders;
    private settings;
    getCategories(activeOnly?: boolean): Promise<Category[]>;
    getCategoryById(id: string): Promise<Category | null>;
    getCategoryBySlug(slug: string): Promise<Category | null>;
    createCategory(data: Omit<Category, 'id' | 'createdAt' | 'updatedAt'>): Promise<Category>;
    updateCategory(id: string, updates: Partial<Category>): Promise<Category | null>;
    getProducts(filters?: ProductFilters): Promise<{
        products: Product[];
        total: number;
    }>;
    getProductById(id: string): Promise<Product | null>;
    getProductBySlug(slug: string): Promise<Product | null>;
    createProduct(data: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>): Promise<Product>;
    updateProduct(id: string, updates: Partial<Product>): Promise<Product | null>;
    deleteProduct(id: string): Promise<boolean>;
    getSuppliers(activeOnly?: boolean): Promise<Supplier[]>;
    getSupplierById(id: string): Promise<Supplier | null>;
    createSupplier(data: Omit<Supplier, 'id' | 'createdAt' | 'updatedAt'>): Promise<Supplier>;
    updateSupplier(id: string, updates: Partial<Supplier>): Promise<Supplier | null>;
    findOrCreateCustomer(data: Omit<Customer, 'id' | 'createdAt'>): Promise<Customer>;
    getCustomerById(id: string): Promise<Customer | null>;
    getOrders(filters?: OrderFilters): Promise<{
        orders: Order[];
        total: number;
    }>;
    getOrderById(id: string): Promise<Order | null>;
    getOrderByReference(reference: string): Promise<Order | null>;
    createOrder(data: Omit<Order, 'id' | 'createdAt' | 'updatedAt'>): Promise<Order>;
    updateOrderStatus(orderId: string, newStatus: OrderStatus, paymentStatus?: PaymentStatus, notes?: string, actorId?: string, actorName?: string): Promise<Order | null>;
    addOrderFulfilment(orderId: string, fulfilmentData: Omit<Fulfilment, 'id' | 'orderId' | 'createdAt' | 'updatedAt'>): Promise<Order | null>;
    updateOrderFulfilment(orderId: string, fulfilmentId: string, updates: Partial<Fulfilment>): Promise<Order | null>;
    addFinancialTransaction(orderId: string, txnData: Omit<FinancialTransaction, 'id' | 'orderId' | 'createdAt'>): Promise<Order | null>;
    addOrderInternalNote(orderId: string, note: string): Promise<Order | null>;
    private recalculateOrderActualProfit;
    getDashboardMetrics(): Promise<DashboardMetrics>;
    getStoreSettings(): Promise<StoreSettings>;
    updateStoreSettings(updates: Partial<StoreSettings>): Promise<StoreSettings>;
}
