import fs from 'fs';
import path from 'path';
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
  DEFAULT_STORE_SETTINGS,
} from '@dropship/shared';
import { IDataStore, ProductFilters, OrderFilters } from './types.js';

export class InMemoryStore implements IDataStore {
  private storageFilePath: string = process.env.VERCEL
    ? '/tmp/dropship_store_state.json'
    : path.join(process.cwd(), 'dropship_store_state.json');

  private categories: Category[] = [
    {
      id: 'c1111111-1111-1111-1111-111111111111',
      name: 'Smart Gadgets & Electronics',
      slug: 'smart-gadgets',
      description: 'High-demand wireless earbuds, smartwatches, and smartphone accessories.',
      image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&auto=format&fit=crop&q=80',
      isActive: true,
      displayOrder: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'c2222222-2222-2222-2222-222222222222',
      name: 'Home & Kitchen Essentials',
      slug: 'home-kitchen',
      description: 'Time-saving kitchen gadgets and home organizers for modern Pakistani households.',
      image: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=600&auto=format&fit=crop&q=80',
      isActive: true,
      displayOrder: 2,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'c3333333-3333-3333-3333-333333333333',
      name: 'Personal Care & Grooming',
      slug: 'personal-care',
      description: 'Electric shavers, facial care devices, and wellness tools.',
      image: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=600&auto=format&fit=crop&q=80',
      isActive: true,
      displayOrder: 3,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ];

  private suppliers: Supplier[] = [
    {
      id: 's1111111-1111-1111-1111-111111111111',
      businessName: 'Shah Alam Wholesale Hub',
      contactName: 'Mian Tariq',
      phone: '03008451122',
      email: 'tariq@shahalamhub.pk',
      city: 'Lahore',
      address: 'Shop # 45, Hall Road / Shah Alam Market, Lahore',
      fulfilmentTerms: 'Dispatches same-day if order confirmed before 2:00 PM. Uses Trax and Call Courier.',
      returnPolicy: '7 days replacement warranty for dead-on-arrival electronics.',
      payoutTerms: 'Weekly bank settlement every Monday after courier COD remittance.',
      isActive: true,
      notes: 'Primary supplier for audio and electronics.',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 's2222222-2222-2222-2222-222222222222',
      businessName: 'Bolton Market Imports',
      contactName: 'Muhammad Asif',
      phone: '03212894567',
      email: 'asif@boltonimports.pk',
      city: 'Karachi',
      address: 'Plaza 12, Bolton Market, Karachi',
      fulfilmentTerms: 'Next-day dispatch. Operates directly with TCS & Leopards.',
      returnPolicy: 'Replacement if reported within 5 days of delivery with parcel unboxing video.',
      payoutTerms: '10 days credit cycle.',
      isActive: true,
      notes: 'Best wholesale rates for kitchen and home tools.',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ];

  // Completely reset: Zero dummy products, zero dummy customers, zero dummy orders
  private products: Product[] = [];
  private customers: Customer[] = [];
  private orders: Order[] = [];

  constructor() {
    this.loadFromDisk();
  }

  private loadFromDisk(): void {
    try {
      let targetPath = this.storageFilePath;
      if (!fs.existsSync(targetPath)) {
        const fallbacks = [
          path.join(process.cwd(), 'dropship_store_state.json'),
          path.join(process.cwd(), '..', 'dropship_store_state.json'),
          path.join(__dirname, '..', '..', 'dropship_store_state.json'),
        ];
        for (const fb of fallbacks) {
          if (fs.existsSync(fb)) {
            targetPath = fb;
            break;
          }
        }
      }

      if (fs.existsSync(targetPath)) {
        const raw = fs.readFileSync(targetPath, 'utf8');
        const data = JSON.parse(raw);
        if (Array.isArray(data.categories) && data.categories.length > 0) this.categories = data.categories;
        if (Array.isArray(data.suppliers) && data.suppliers.length > 0) this.suppliers = data.suppliers;
        if (Array.isArray(data.products)) this.products = data.products;
        if (Array.isArray(data.customers)) this.customers = data.customers;
        if (Array.isArray(data.orders)) this.orders = data.orders;
        if (data.settings) this.settings = { ...this.settings, ...data.settings };

        // If on Vercel and loaded from fallback seed, persist to /tmp
        if (targetPath !== this.storageFilePath) {
          try {
            fs.writeFileSync(this.storageFilePath, raw, 'utf8');
          } catch {
            // ignore
          }
        }
      }
    } catch (e) {
      // Fallback cleanly to in-memory state
    }
  }

  private saveToDisk(): void {
    try {
      const data = {
        categories: this.categories,
        suppliers: this.suppliers,
        products: this.products,
        customers: this.customers,
        orders: this.orders,
        settings: this.settings,
      };
      const json = JSON.stringify(data, null, 2);
      fs.writeFileSync(this.storageFilePath, json, 'utf8');

      // Also persist to root repository state file if accessible
      const rootPath = path.join(process.cwd(), 'dropship_store_state.json');
      if (rootPath !== this.storageFilePath) {
        try {
          fs.writeFileSync(rootPath, json, 'utf8');
        } catch {
          // ignore readonly error in serverless
        }
      }
    } catch (e) {
      // Disk writing fails gracefully
    }
  }

  private settings: StoreSettings = {
    storeName: DEFAULT_STORE_SETTINGS.store_name,
    tagline: DEFAULT_STORE_SETTINGS.tagline,
    whatsappNumber: DEFAULT_STORE_SETTINGS.whatsapp_number,
    supportEmail: DEFAULT_STORE_SETTINGS.support_email,
    supportPhone: DEFAULT_STORE_SETTINGS.support_phone,
    currency: DEFAULT_STORE_SETTINGS.currency,
    defaultDeliveryChargePkr: DEFAULT_STORE_SETTINGS.default_delivery_charge_pkr,
    freeDeliveryThresholdPkr: DEFAULT_STORE_SETTINGS.free_delivery_threshold_pkr,
    estimatedDeliveryDays: DEFAULT_STORE_SETTINGS.estimated_delivery_days,
    codTerms: DEFAULT_STORE_SETTINGS.cod_terms,
    returnPolicySummary: '7-day easy replacement policy for damaged or defective products.',
    aboutText: 'ApnaBuy is a premier Pakistani online shopping storefront curating high-utility gadgets, home essentials, and grooming devices with nationwide Cash on Delivery.',
  };

  // Categories
  async getCategories(activeOnly = true): Promise<Category[]> {
    if (activeOnly) {
      return this.categories.filter((c) => c.isActive).sort((a, b) => a.displayOrder - b.displayOrder);
    }
    return [...this.categories].sort((a, b) => a.displayOrder - b.displayOrder);
  }

  async getCategoryById(id: string): Promise<Category | null> {
    return this.categories.find((c) => c.id === id) || null;
  }

  async getCategoryBySlug(slug: string): Promise<Category | null> {
    return this.categories.find((c) => c.slug === slug) || null;
  }

  async createCategory(data: Omit<Category, 'id' | 'createdAt' | 'updatedAt'>): Promise<Category> {
    const category: Category = {
      ...data,
      id: `cat-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.categories.push(category);
    this.saveToDisk();
    return category;
  }

  async updateCategory(id: string, updates: Partial<Category>): Promise<Category | null> {
    const idx = this.categories.findIndex((c) => c.id === id);
    if (idx === -1) return null;
    this.categories[idx] = {
      ...this.categories[idx],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    this.saveToDisk();
    return this.categories[idx];
  }

  // Products
  async getProducts(filters?: ProductFilters): Promise<{ products: Product[]; total: number }> {
    let list = [...this.products];

    if (filters?.activeOnly !== false) {
      list = list.filter((p) => p.isActive);
    }

    if (filters?.categoryId) {
      list = list.filter((p) => p.categoryId === filters.categoryId);
    }

    if (filters?.categorySlug) {
      list = list.filter((p) => p.categorySlug === filters.categorySlug);
    }

    if (filters?.featured) {
      list = list.filter((p) => p.isFeatured);
    }

    if (filters?.search) {
      const q = filters.search.toLowerCase();
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          p.shortDescription.toLowerCase().includes(q) ||
          p.sku.toLowerCase().includes(q)
      );
    }

    if (filters?.sortBy === 'price_asc') {
      list.sort((a, b) => a.basePricePkr - b.basePricePkr);
    } else if (filters?.sortBy === 'price_desc') {
      list.sort((a, b) => b.basePricePkr - a.basePricePkr);
    } else {
      list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }

    const total = list.length;
    const page = filters?.page || 1;
    const limit = filters?.limit || 20;
    const start = (page - 1) * limit;
    const paginated = list.slice(start, start + limit);

    return { products: paginated, total };
  }

  async getProductById(id: string): Promise<Product | null> {
    return this.products.find((p) => p.id === id) || null;
  }

  async getProductBySlug(slug: string): Promise<Product | null> {
    return this.products.find((p) => p.slug === slug) || null;
  }

  async createProduct(data: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>): Promise<Product> {
    const category = this.categories.find((c) => c.id === data.categoryId);
    const product: Product = {
      ...data,
      id: `prod-${Date.now()}`,
      categoryName: category?.name,
      categorySlug: category?.slug,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.products.unshift(product);
    this.saveToDisk();
    return product;
  }

  async updateProduct(id: string, updates: Partial<Product>): Promise<Product | null> {
    const idx = this.products.findIndex((p) => p.id === id);
    if (idx === -1) return null;
    let categoryName = this.products[idx].categoryName;
    let categorySlug = this.products[idx].categorySlug;
    if (updates.categoryId && updates.categoryId !== this.products[idx].categoryId) {
      const cat = this.categories.find((c) => c.id === updates.categoryId);
      if (cat) {
        categoryName = cat.name;
        categorySlug = cat.slug;
      }
    }
    this.products[idx] = {
      ...this.products[idx],
      ...updates,
      categoryName,
      categorySlug,
      updatedAt: new Date().toISOString(),
    };
    this.saveToDisk();
    return this.products[idx];
  }

  async deleteProduct(id: string): Promise<boolean> {
    const initialLen = this.products.length;
    this.products = this.products.filter((p) => p.id !== id);
    this.saveToDisk();
    return this.products.length < initialLen;
  }

  // Suppliers
  async getSuppliers(activeOnly = false): Promise<Supplier[]> {
    if (activeOnly) {
      return this.suppliers.filter((s) => s.isActive);
    }
    return [...this.suppliers];
  }

  async getSupplierById(id: string): Promise<Supplier | null> {
    return this.suppliers.find((s) => s.id === id) || null;
  }

  async createSupplier(data: Omit<Supplier, 'id' | 'createdAt' | 'updatedAt'>): Promise<Supplier> {
    const supplier: Supplier = {
      ...data,
      id: `sup-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.suppliers.push(supplier);
    this.saveToDisk();
    return supplier;
  }

  async updateSupplier(id: string, updates: Partial<Supplier>): Promise<Supplier | null> {
    const idx = this.suppliers.findIndex((s) => s.id === id);
    if (idx === -1) return null;
    this.suppliers[idx] = {
      ...this.suppliers[idx],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    this.saveToDisk();
    return this.suppliers[idx];
  }

  // Customers
  async findOrCreateCustomer(data: Omit<Customer, 'id' | 'createdAt'>): Promise<Customer> {
    const existing = this.customers.find((c) => c.phone === data.phone);
    if (existing) {
      existing.name = data.name;
      existing.city = data.city;
      existing.deliveryAddress = data.deliveryAddress;
      if (data.deliveryInstructions) existing.deliveryInstructions = data.deliveryInstructions;
      this.saveToDisk();
      return existing;
    }
    const newCust: Customer = {
      ...data,
      id: `cust-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    this.customers.push(newCust);
    this.saveToDisk();
    return newCust;
  }

  async getCustomerById(id: string): Promise<Customer | null> {
    return this.customers.find((c) => c.id === id) || null;
  }

  // Orders
  async getOrders(filters?: OrderFilters): Promise<{ orders: Order[]; total: number }> {
    let list = [...this.orders];

    if (filters?.status) {
      list = list.filter((o) => o.orderStatus === filters.status);
    }

    if (filters?.paymentStatus) {
      list = list.filter((o) => o.paymentStatus === filters.paymentStatus);
    }

    if (filters?.channel) {
      list = list.filter((o) => o.sourceChannel === filters.channel);
    }

    if (filters?.city) {
      list = list.filter((o) => o.customer?.city?.toLowerCase() === filters.city?.toLowerCase());
    }

    if (filters?.search) {
      const q = filters.search.toLowerCase();
      list = list.filter(
        (o) =>
          o.orderReference.toLowerCase().includes(q) ||
          o.customer?.name.toLowerCase().includes(q) ||
          o.customer?.phone.includes(q)
      );
    }

    list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    const total = list.length;
    const page = filters?.page || 1;
    const limit = filters?.limit || 20;
    const start = (page - 1) * limit;

    return { orders: list.slice(start, start + limit), total };
  }

  async getOrderById(id: string): Promise<Order | null> {
    return this.orders.find((o) => o.id === id) || null;
  }

  async getOrderByReference(reference: string): Promise<Order | null> {
    return this.orders.find((o) => o.orderReference.toLowerCase() === reference.toLowerCase()) || null;
  }

  async createOrder(data: Omit<Order, 'id' | 'createdAt' | 'updatedAt'>): Promise<Order> {
    const order: Order = {
      ...data,
      id: `ord-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.orders.unshift(order);
    this.saveToDisk();
    return order;
  }

  async updateOrderStatus(
    orderId: string,
    newStatus: OrderStatus,
    paymentStatus?: PaymentStatus,
    notes?: string,
    actorId?: string,
    actorName?: string
  ): Promise<Order | null> {
    const order = this.orders.find((o) => o.id === orderId);
    if (!order) return null;

    const prevStatus = order.orderStatus;
    order.orderStatus = newStatus;
    if (paymentStatus) {
      order.paymentStatus = paymentStatus;
    }

    if (!order.statusHistory) order.statusHistory = [];
    order.statusHistory.push({
      id: `hist-${Date.now()}`,
      orderId,
      previousStatus: prevStatus,
      newStatus,
      actorId,
      actorName: actorName || 'Admin',
      notes,
      createdAt: new Date().toISOString(),
    });

    order.updatedAt = new Date().toISOString();
    this.saveToDisk();
    return order;
  }

  async addOrderFulfilment(
    orderId: string,
    fulfilmentData: Omit<Fulfilment, 'id' | 'orderId' | 'createdAt' | 'updatedAt'>
  ): Promise<Order | null> {
    const order = this.orders.find((o) => o.id === orderId);
    if (!order) return null;

    const supplier = this.suppliers.find((s) => s.id === fulfilmentData.supplierId);

    const fulfilment: Fulfilment = {
      ...fulfilmentData,
      id: `ful-${Date.now()}`,
      orderId,
      supplierName: supplier?.businessName,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    if (!order.fulfilments) order.fulfilments = [];
    order.fulfilments.push(fulfilment);

    // If order was confirmed, advance to processing/sent_to_supplier
    if (order.orderStatus === 'confirmed' || order.orderStatus === 'pending_confirmation') {
      order.orderStatus = 'sent_to_supplier';
      order.statusHistory?.push({
        id: `hist-${Date.now()}`,
        orderId,
        previousStatus: order.orderStatus,
        newStatus: 'sent_to_supplier',
        actorName: 'Admin',
        notes: `Assigned to supplier: ${supplier?.businessName || 'Supplier'}`,
        createdAt: new Date().toISOString(),
      });
    }

    order.updatedAt = new Date().toISOString();
    this.saveToDisk();
    return order;
  }

  async updateOrderFulfilment(orderId: string, fulfilmentId: string, updates: Partial<Fulfilment>): Promise<Order | null> {
    const order = this.orders.find((o) => o.id === orderId);
    if (!order || !order.fulfilments) return null;

    const fulIdx = order.fulfilments.findIndex((f) => f.id === fulfilmentId);
    if (fulIdx === -1) return null;

    order.fulfilments[fulIdx] = {
      ...order.fulfilments[fulIdx],
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    // Auto synchronize order status if fulfilment dispatched/delivered/returned
    if (updates.status === 'dispatched' && order.orderStatus !== 'dispatched') {
      await this.updateOrderStatus(orderId, 'dispatched', undefined, `Fulfilment dispatched with ${updates.courierName || 'courier'}`);
    } else if (updates.status === 'delivered' && order.orderStatus !== 'delivered') {
      await this.updateOrderStatus(orderId, 'delivered', 'cod_collected', 'Parcel delivered and COD cash collected by courier');
    } else if (updates.status === 'failed' && order.orderStatus !== 'delivery_failed') {
      await this.updateOrderStatus(orderId, 'delivery_failed', undefined, `Delivery failed: ${updates.failureReason || 'Refused/Unreachable'}`);
    } else if (updates.status === 'returned' && order.orderStatus !== 'returned') {
      await this.updateOrderStatus(orderId, 'returned', undefined, `Parcel returned to origin`);
    }

    // Recompute actual profit
    this.recalculateOrderActualProfit(order);

    order.updatedAt = new Date().toISOString();
    this.saveToDisk();
    return order;
  }

  async addFinancialTransaction(
    orderId: string,
    txnData: Omit<FinancialTransaction, 'id' | 'orderId' | 'createdAt'>
  ): Promise<Order | null> {
    const order = this.orders.find((o) => o.id === orderId);
    if (!order) return null;

    const txn: FinancialTransaction = {
      ...txnData,
      id: `txn-${Date.now()}`,
      orderId,
      createdAt: new Date().toISOString(),
    };

    if (!order.transactions) order.transactions = [];
    order.transactions.push(txn);

    // If transaction is COD collection, update payment status to settled or cod_collected
    if (txn.transactionType === 'cod_collection' && txn.status === 'completed') {
      order.paymentStatus = 'settled';
    }

    this.recalculateOrderActualProfit(order);
    order.updatedAt = new Date().toISOString();
    this.saveToDisk();
    return order;
  }

  async addOrderInternalNote(orderId: string, note: string): Promise<Order | null> {
    const order = this.orders.find((o) => o.id === orderId);
    if (!order) return null;
    const existing = order.internalNotes ? `${order.internalNotes}\n` : '';
    const dateStamp = new Date().toLocaleString('en-PK');
    order.internalNotes = `${existing}[${dateStamp}] ${note}`;
    order.updatedAt = new Date().toISOString();
    this.saveToDisk();
    return order;
  }

  private recalculateOrderActualProfit(order: Order): void {
    const totalCollected = (order.transactions || [])
      .filter((t) => t.transactionType === 'cod_collection' && t.status === 'completed')
      .reduce((sum, t) => sum + t.amountPkr, 0);

    const supplierCosts = (order.transactions || [])
      .filter((t) => t.transactionType === 'supplier_payout' && t.status === 'completed')
      .reduce((sum, t) => sum + t.amountPkr, 0);

    const courierFees = (order.fulfilments || []).reduce((sum, f) => sum + (f.courierChargePkr || 0) + (f.returnChargePkr || 0), 0);

    if (totalCollected > 0) {
      order.actualProfitPkr = totalCollected - supplierCosts - courierFees;
    }
  }

  // Dashboard & Metrics
  async getDashboardMetrics(): Promise<DashboardMetrics> {
    const totalOrders = this.orders.length;
    const pendingConfirmation = this.orders.filter((o) => o.orderStatus === 'pending_confirmation').length;
    const confirmedOrders = this.orders.filter((o) => o.orderStatus === 'confirmed' || o.orderStatus === 'processing' || o.orderStatus === 'sent_to_supplier').length;
    const dispatchedOrders = this.orders.filter((o) => o.orderStatus === 'dispatched').length;
    const deliveredOrders = this.orders.filter((o) => o.orderStatus === 'delivered').length;
    const returnedOrders = this.orders.filter((o) => o.orderStatus === 'returned' || o.orderStatus === 'delivery_failed').length;

    const totalRevenuePkr = this.orders
      .filter((o) => o.orderStatus === 'delivered' || o.paymentStatus === 'settled' || o.paymentStatus === 'cod_collected')
      .reduce((sum, o) => sum + o.totalPayablePkr, 0);

    const totalEstimatedProfitPkr = this.orders.reduce((sum, o) => sum + (o.estimatedProfitPkr || 0), 0);
    const totalActualProfitPkr = this.orders.reduce((sum, o) => sum + (o.actualProfitPkr || 0), 0);

    const unsettledCodPkr = this.orders
      .filter((o) => (o.orderStatus === 'delivered' || o.orderStatus === 'dispatched') && o.paymentStatus !== 'settled')
      .reduce((sum, o) => sum + o.totalPayablePkr, 0);

    const recentOrders = this.orders.slice(0, 10);

    return {
      totalOrders,
      pendingConfirmation,
      confirmedOrders,
      dispatchedOrders,
      deliveredOrders,
      returnedOrders,
      totalRevenuePkr,
      totalEstimatedProfitPkr,
      totalActualProfitPkr,
      unsettledCodPkr,
      recentOrders,
    };
  }

  // Store Settings
  async getStoreSettings(): Promise<StoreSettings> {
    return { ...this.settings };
  }

  async updateStoreSettings(updates: Partial<StoreSettings>): Promise<StoreSettings> {
    this.settings = { ...this.settings, ...updates };
    this.saveToDisk();
    return { ...this.settings };
  }
}

