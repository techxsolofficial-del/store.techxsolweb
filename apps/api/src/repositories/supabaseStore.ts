import { createClient, SupabaseClient } from '@supabase/supabase-js';
import crypto from 'crypto';
import {
  Category,
  Product,
  ProductImage,
  ProductVariant,
  ProductSupplierOffer,
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
import { toValidUuid } from './postgresStore.js';
import { InMemoryStore } from './memoryStore.js';

export class SupabaseStore implements IDataStore {
  private client: SupabaseClient;
  public fallbackStore: InMemoryStore = new InMemoryStore();
  public isUsingFallback = false;

  constructor(supabaseUrl: string, supabaseKey: string) {
    this.client = createClient(supabaseUrl, supabaseKey, {
      auth: { persistSession: false },
    });
    console.log('[SupabaseStore] Initialized Supabase REST client.');

    return new Proxy(this, {
      get(target: any, prop: string | symbol) {
        const orig = target[prop];
        if (typeof orig === 'function' && !String(prop).startsWith('map')) {
          return async function (...args: any[]) {
            if (target.isUsingFallback) {
              const fallbackFn = target.fallbackStore[prop];
              if (typeof fallbackFn === 'function') {
                return fallbackFn.apply(target.fallbackStore, args);
              }
            }
            try {
              return await orig.apply(target, args);
            } catch (err: any) {
              console.error(`[SupabaseStore] Method ${String(prop)} failed:`, err?.message || err);
              console.warn(`[SupabaseStore] Switching to resilient in-memory fallback store for ${String(prop)}.`);
              target.isUsingFallback = true;
              const fallbackFn = target.fallbackStore[prop];
              if (typeof fallbackFn === 'function') {
                return fallbackFn.apply(target.fallbackStore, args);
              }
              throw err;
            }
          };
        }
        return orig;
      },
    });
  }

  // --- Mappers ---
  private mapCategory(c: any): Category {
    return {
      id: c.id,
      name: c.name,
      slug: c.slug,
      description: c.description || '',
      image: c.image_url || c.image || '',
      isActive: Boolean(c.is_active),
      displayOrder: Number(c.display_order || 0),
      createdAt: new Date(c.created_at).toISOString(),
      updatedAt: new Date(c.updated_at).toISOString(),
    };
  }

  private mapSupplier(s: any): Supplier {
    return {
      id: s.id,
      businessName: s.business_name,
      contactName: s.contact_name,
      phone: s.phone,
      email: s.email || undefined,
      city: s.city || 'Lahore',
      address: s.address || undefined,
      fulfilmentTerms: s.fulfilment_terms || undefined,
      returnPolicy: s.return_policy || undefined,
      payoutTerms: s.payout_terms || undefined,
      isActive: Boolean(s.is_active),
      notes: s.notes || undefined,
      createdAt: new Date(s.created_at).toISOString(),
      updatedAt: new Date(s.updated_at).toISOString(),
    };
  }

  private mapProduct(p: any): Product {
    const images: ProductImage[] =
      typeof p.images === 'string' ? JSON.parse(p.images) : p.images || [];
    const variants: ProductVariant[] =
      typeof p.variants === 'string' ? JSON.parse(p.variants) : p.variants || [];

    const rawOffers = p.product_supplier_offers || [];
    const supplierOffers: ProductSupplierOffer[] = rawOffers.map((o: any) => ({
      id: o.id,
      productId: o.product_id || p.id,
      supplierId: o.supplier_id,
      supplierName: o.suppliers?.business_name || o.supplier_name,
      supplierSku: o.supplier_sku,
      supplierCostPkr: Number(o.supplier_cost_pkr),
      isAvailable: Boolean(o.is_available),
      leadTimeDays: Number(o.lead_time_days || 2),
      notes: o.notes || undefined,
      updatedAt: o.updated_at || new Date().toISOString(),
    }));

    return {
      id: p.id,
      categoryId: p.category_id,
      categoryName: p.categories?.name || p.category_name,
      categorySlug: p.categories?.slug || p.category_slug,
      name: p.name,
      slug: p.slug,
      shortDescription: p.short_description,
      description: p.description,
      basePricePkr: Number(p.base_price_pkr),
      compareAtPricePkr: p.compare_at_price_pkr ? Number(p.compare_at_price_pkr) : undefined,
      sku: p.sku,
      isActive: Boolean(p.is_active),
      isFeatured: Boolean(p.is_featured),
      images,
      variants,
      supplierOffers,
      createdAt: new Date(p.created_at).toISOString(),
      updatedAt: new Date(p.updated_at).toISOString(),
    };
  }

  // --- Categories ---
  async getCategories(activeOnly = true): Promise<Category[]> {
    let q = this.client
      .from('categories')
      .select('*')
      .order('display_order', { ascending: true });
    if (activeOnly) {
      q = q.eq('is_active', true);
    }
    const { data, error } = await q;
    if (error) throw error;
    return (data || []).map((c) => this.mapCategory(c));
  }

  async getCategoryById(id: string): Promise<Category | null> {
    const { data, error } = await this.client
      .from('categories')
      .select('*')
      .eq('id', toValidUuid(id))
      .maybeSingle();
    if (error) throw error;
    return data ? this.mapCategory(data) : null;
  }

  async getCategoryBySlug(slug: string): Promise<Category | null> {
    const { data, error } = await this.client
      .from('categories')
      .select('*')
      .eq('slug', slug)
      .maybeSingle();
    if (error) throw error;
    return data ? this.mapCategory(data) : null;
  }

  async createCategory(data: Omit<Category, 'id' | 'createdAt' | 'updatedAt'>): Promise<Category> {
    const id = toValidUuid();
    const now = new Date().toISOString();
    const { data: created, error } = await this.client
      .from('categories')
      .insert({
        id,
        name: data.name,
        slug: data.slug,
        description: data.description || null,
        image_url: data.image || null,
        is_active: data.isActive !== undefined ? data.isActive : true,
        display_order: data.displayOrder || 0,
        created_at: now,
        updated_at: now,
      })
      .select()
      .single();
    if (error) throw error;
    return this.mapCategory(created);
  }

  async updateCategory(id: string, updates: Partial<Category>): Promise<Category | null> {
    const now = new Date().toISOString();
    const payload: any = { updated_at: now };
    if (updates.name !== undefined) payload.name = updates.name;
    if (updates.slug !== undefined) payload.slug = updates.slug;
    if (updates.description !== undefined) payload.description = updates.description;
    if (updates.image !== undefined) payload.image_url = updates.image;
    if (updates.isActive !== undefined) payload.is_active = updates.isActive;
    if (updates.displayOrder !== undefined) payload.display_order = updates.displayOrder;

    const { data, error } = await this.client
      .from('categories')
      .update(payload)
      .eq('id', toValidUuid(id))
      .select()
      .maybeSingle();
    if (error) throw error;
    return data ? this.mapCategory(data) : null;
  }

  // --- Products ---
  async getProducts(filters?: ProductFilters): Promise<{ products: Product[]; total: number }> {
    let q = this.client
      .from('products')
      .select('*, categories(name, slug), product_supplier_offers(*, suppliers(business_name))', { count: 'exact' });

    if (filters?.activeOnly !== false) {
      q = q.eq('is_active', true);
    }
    if (filters?.categoryId) {
      q = q.eq('category_id', toValidUuid(filters.categoryId));
    }
    if (filters?.featured) {
      q = q.eq('is_featured', true);
    }
    if (filters?.search) {
      q = q.ilike('name', `%${filters.search}%`);
    }

    if (filters?.sortBy === 'price_asc') {
      q = q.order('base_price_pkr', { ascending: true });
    } else if (filters?.sortBy === 'price_desc') {
      q = q.order('base_price_pkr', { ascending: false });
    } else {
      q = q.order('created_at', { ascending: false });
    }

    const page = Math.max(1, filters?.page || 1);
    const limit = Math.max(1, filters?.limit || 20);
    const start = (page - 1) * limit;
    q = q.range(start, start + limit - 1);

    const { data, count, error } = await q;
    if (error) throw error;

    let products = (data || []).map((p) => this.mapProduct(p));
    if (filters?.categorySlug) {
      products = products.filter((p) => p.categorySlug === filters.categorySlug);
    }

    return { products, total: count || products.length };
  }

  async getProductById(id: string): Promise<Product | null> {
    const { data, error } = await this.client
      .from('products')
      .select('*, categories(name, slug), product_supplier_offers(*, suppliers(business_name))')
      .eq('id', toValidUuid(id))
      .maybeSingle();
    if (error) throw error;
    return data ? this.mapProduct(data) : null;
  }

  async getProductBySlug(slug: string): Promise<Product | null> {
    const { data, error } = await this.client
      .from('products')
      .select('*, categories(name, slug), product_supplier_offers(*, suppliers(business_name))')
      .eq('slug', slug)
      .maybeSingle();
    if (error) throw error;
    return data ? this.mapProduct(data) : null;
  }

  async createProduct(data: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>): Promise<Product> {
    const id = toValidUuid();
    const now = new Date().toISOString();
    const categoryId = toValidUuid(data.categoryId);

    const { error } = await this.client.from('products').insert({
      id,
      category_id: categoryId,
      name: data.name,
      slug: data.slug,
      short_description: data.shortDescription,
      description: data.description,
      base_price_pkr: data.basePricePkr,
      compare_at_price_pkr: data.compareAtPricePkr || null,
      sku: data.sku,
      is_active: data.isActive !== undefined ? data.isActive : true,
      is_featured: data.isFeatured !== undefined ? data.isFeatured : false,
      images: data.images || [],
      variants: data.variants || [],
      created_at: now,
      updated_at: now,
    });
    if (error) throw error;

    if (data.supplierOffers && Array.isArray(data.supplierOffers) && data.supplierOffers.length > 0) {
      for (const offer of data.supplierOffers) {
        await this.client.from('product_supplier_offers').upsert({
          id: toValidUuid(offer.id),
          product_id: id,
          supplier_id: toValidUuid(offer.supplierId),
          supplier_sku: offer.supplierSku || `SUP-${data.sku}`,
          supplier_cost_pkr: offer.supplierCostPkr,
          is_available: offer.isAvailable !== false,
          lead_time_days: offer.leadTimeDays || 2,
          notes: offer.notes || null,
          created_at: now,
          updated_at: now,
        });
      }
    }

    const created = await this.getProductById(id);
    return created!;
  }

  async updateProduct(id: string, updates: Partial<Product>): Promise<Product | null> {
    const now = new Date().toISOString();
    const payload: any = { updated_at: now };

    if (updates.name !== undefined) payload.name = updates.name;
    if (updates.slug !== undefined) payload.slug = updates.slug;
    if (updates.categoryId !== undefined) payload.category_id = toValidUuid(updates.categoryId);
    if (updates.shortDescription !== undefined) payload.short_description = updates.shortDescription;
    if (updates.description !== undefined) payload.description = updates.description;
    if (updates.basePricePkr !== undefined) payload.base_price_pkr = updates.basePricePkr;
    if (updates.compareAtPricePkr !== undefined) payload.compare_at_price_pkr = updates.compareAtPricePkr || null;
    if (updates.sku !== undefined) payload.sku = updates.sku;
    if (updates.isActive !== undefined) payload.is_active = updates.isActive;
    if (updates.isFeatured !== undefined) payload.is_featured = updates.isFeatured;
    if (updates.images !== undefined) payload.images = updates.images;
    if (updates.variants !== undefined) payload.variants = updates.variants;

    const { error } = await this.client
      .from('products')
      .update(payload)
      .eq('id', toValidUuid(id));
    if (error) throw error;

    if (updates.supplierOffers && Array.isArray(updates.supplierOffers)) {
      for (const offer of updates.supplierOffers) {
        await this.client.from('product_supplier_offers').upsert({
          id: toValidUuid(offer.id),
          product_id: toValidUuid(id),
          supplier_id: toValidUuid(offer.supplierId),
          supplier_sku: offer.supplierSku || `SUP-${updates.sku || 'SKU'}`,
          supplier_cost_pkr: offer.supplierCostPkr,
          is_available: offer.isAvailable !== false,
          lead_time_days: offer.leadTimeDays || 2,
          notes: offer.notes || null,
          updated_at: now,
        });
      }
    }

    return this.getProductById(id);
  }

  async deleteProduct(id: string): Promise<boolean> {
    const { error } = await this.client.from('products').delete().eq('id', toValidUuid(id));
    if (error) throw error;
    return true;
  }

  // --- Suppliers ---
  async getSuppliers(activeOnly = false): Promise<Supplier[]> {
    let q = this.client.from('suppliers').select('*').order('business_name', { ascending: true });
    if (activeOnly) q = q.eq('is_active', true);
    const { data, error } = await q;
    if (error) throw error;
    return (data || []).map((s) => this.mapSupplier(s));
  }

  async getSupplierById(id: string): Promise<Supplier | null> {
    const { data, error } = await this.client
      .from('suppliers')
      .select('*')
      .eq('id', toValidUuid(id))
      .maybeSingle();
    if (error) throw error;
    return data ? this.mapSupplier(data) : null;
  }

  async createSupplier(data: Omit<Supplier, 'id' | 'createdAt' | 'updatedAt'>): Promise<Supplier> {
    const id = toValidUuid();
    const now = new Date().toISOString();
    const { data: created, error } = await this.client
      .from('suppliers')
      .insert({
        id,
        business_name: data.businessName,
        contact_name: data.contactName,
        phone: data.phone,
        email: data.email || null,
        city: data.city || 'Lahore',
        address: data.address || null,
        fulfilment_terms: data.fulfilmentTerms || null,
        return_policy: data.returnPolicy || null,
        payout_terms: data.payoutTerms || null,
        is_active: data.isActive !== undefined ? data.isActive : true,
        notes: data.notes || null,
        created_at: now,
        updated_at: now,
      })
      .select()
      .single();
    if (error) throw error;
    return this.mapSupplier(created);
  }

  async updateSupplier(id: string, updates: Partial<Supplier>): Promise<Supplier | null> {
    const now = new Date().toISOString();
    const payload: any = { updated_at: now };
    if (updates.businessName !== undefined) payload.business_name = updates.businessName;
    if (updates.contactName !== undefined) payload.contact_name = updates.contactName;
    if (updates.phone !== undefined) payload.phone = updates.phone;
    if (updates.email !== undefined) payload.email = updates.email;
    if (updates.city !== undefined) payload.city = updates.city;
    if (updates.address !== undefined) payload.address = updates.address;
    if (updates.fulfilmentTerms !== undefined) payload.fulfilment_terms = updates.fulfilmentTerms;
    if (updates.returnPolicy !== undefined) payload.return_policy = updates.returnPolicy;
    if (updates.payoutTerms !== undefined) payload.payout_terms = updates.payoutTerms;
    if (updates.isActive !== undefined) payload.is_active = updates.isActive;
    if (updates.notes !== undefined) payload.notes = updates.notes;

    const { data, error } = await this.client
      .from('suppliers')
      .update(payload)
      .eq('id', toValidUuid(id))
      .select()
      .maybeSingle();
    if (error) throw error;
    return data ? this.mapSupplier(data) : null;
  }

  // --- Customers ---
  async findOrCreateCustomer(data: Omit<Customer, 'id' | 'createdAt'>): Promise<Customer> {
    const { data: existing } = await this.client
      .from('customers')
      .select('*')
      .eq('phone', data.phone)
      .maybeSingle();

    const now = new Date().toISOString();
    if (existing) {
      const { data: updated } = await this.client
        .from('customers')
        .update({
          name: data.name,
          city: data.city,
          delivery_address: data.deliveryAddress,
          delivery_instructions: data.deliveryInstructions || existing.delivery_instructions,
          updated_at: now,
        })
        .eq('id', existing.id)
        .select()
        .single();
      return {
        id: updated.id,
        name: updated.name,
        phone: updated.phone,
        alternatePhone: updated.alternate_phone,
        city: updated.city,
        deliveryAddress: updated.delivery_address,
        deliveryInstructions: updated.delivery_instructions,
        createdAt: updated.created_at,
      };
    }

    const id = toValidUuid();
    const { data: created, error } = await this.client
      .from('customers')
      .insert({
        id,
        name: data.name,
        phone: data.phone,
        alternate_phone: data.alternatePhone || null,
        city: data.city,
        delivery_address: data.deliveryAddress,
        delivery_instructions: data.deliveryInstructions || null,
        created_at: now,
        updated_at: now,
      })
      .select()
      .single();
    if (error) throw error;

    return {
      id: created.id,
      name: created.name,
      phone: created.phone,
      alternatePhone: created.alternate_phone,
      city: created.city,
      deliveryAddress: created.delivery_address,
      deliveryInstructions: created.delivery_instructions,
      createdAt: created.created_at,
    };
  }

  async getCustomerById(id: string): Promise<Customer | null> {
    const { data, error } = await this.client
      .from('customers')
      .select('*')
      .eq('id', toValidUuid(id))
      .maybeSingle();
    if (error) throw error;
    if (!data) return null;
    return {
      id: data.id,
      name: data.name,
      phone: data.phone,
      alternatePhone: data.alternate_phone,
      city: data.city,
      deliveryAddress: data.delivery_address,
      deliveryInstructions: data.delivery_instructions,
      createdAt: data.created_at,
    };
  }

  // --- Orders ---
  private mapOrder(o: any): Order {
    return {
      id: o.id,
      orderReference: o.order_reference,
      trackingToken: o.tracking_token,
      customerId: o.customer_id,
      customer: o.customers
        ? {
            id: o.customers.id,
            name: o.customers.name,
            phone: o.customers.phone,
            alternatePhone: o.customers.alternate_phone,
            city: o.customers.city,
            deliveryAddress: o.customers.delivery_address,
            deliveryInstructions: o.customers.delivery_instructions,
            createdAt: o.customers.created_at,
          }
        : undefined,
      sourceChannel: o.source_channel,
      orderStatus: o.order_status,
      paymentMethod: o.payment_method,
      paymentStatus: o.payment_status,
      subtotalPkr: Number(o.subtotal_pkr),
      deliveryChargePkr: Number(o.delivery_charge_pkr),
      discountPkr: Number(o.discount_pkr),
      totalPayablePkr: Number(o.total_payable_pkr),
      estimatedProfitPkr: Number(o.estimated_profit_pkr || 0),
      actualProfitPkr: Number(o.actual_profit_pkr || 0),
      internalNotes: o.internal_notes || undefined,
      items: (o.order_items || []).map((i: any) => ({
        id: i.id,
        orderId: i.order_id,
        productId: i.product_id,
        productNameSnapshot: i.product_name_snapshot,
        variantSnapshot: i.variant_snapshot,
        imageSnapshot: i.image_snapshot,
        quantity: i.quantity,
        unitPricePkr: Number(i.unit_price_pkr),
        supplierCostPkr: Number(i.supplier_cost_pkr || 0),
        totalPricePkr: Number(i.total_price_pkr),
      })),
      fulfilments: (o.fulfilments || []).map((f: any) => ({
        id: f.id,
        orderId: f.order_id,
        supplierId: f.supplier_id,
        supplierName: f.suppliers?.business_name,
        supplierOrderRef: f.supplier_order_ref,
        courierName: f.courier_name,
        trackingNumber: f.tracking_number,
        trackingUrl: f.tracking_url,
        status: f.status,
        dispatchedAt: f.dispatched_at,
        deliveredAt: f.delivered_at,
        failureReason: f.failure_reason,
        courierChargePkr: Number(f.courier_charge_pkr || 0),
        returnChargePkr: Number(f.return_charge_pkr || 0),
        createdAt: f.created_at,
        updatedAt: f.updated_at,
      })),
      transactions: (o.financial_transactions || []).map((t: any) => ({
        id: t.id,
        orderId: t.order_id,
        transactionType: t.transaction_type,
        amountPkr: Number(t.amount_pkr),
        referenceNumber: t.reference_number,
        status: t.status,
        notes: t.notes,
        createdAt: t.created_at,
      })),
      statusHistory: (o.order_status_history || []).map((h: any) => ({
        id: h.id,
        orderId: h.order_id,
        previousStatus: h.previous_status,
        newStatus: h.new_status,
        actorName: h.actor_name,
        notes: h.notes,
        createdAt: h.created_at,
      })),
      createdAt: new Date(o.created_at).toISOString(),
      updatedAt: new Date(o.updated_at).toISOString(),
    };
  }

  async getOrders(filters?: OrderFilters): Promise<{ orders: Order[]; total: number }> {
    let q = this.client
      .from('orders')
      .select(
        '*, customers(*), order_items(*), fulfilments(*, suppliers(business_name)), financial_transactions(*), order_status_history(*)',
        { count: 'exact' }
      )
      .order('created_at', { ascending: false });

    if (filters?.status) q = q.eq('order_status', filters.status);
    if (filters?.paymentStatus) q = q.eq('payment_status', filters.paymentStatus);
    if (filters?.channel) q = q.eq('source_channel', filters.channel);
    if (filters?.search) q = q.ilike('order_reference', `%${filters.search}%`);

    const page = Math.max(1, filters?.page || 1);
    const limit = Math.max(1, filters?.limit || 20);
    const start = (page - 1) * limit;
    q = q.range(start, start + limit - 1);

    const { data, count, error } = await q;
    if (error) throw error;

    const orders = (data || []).map((o) => this.mapOrder(o));
    return { orders, total: count || orders.length };
  }

  async getOrderById(id: string): Promise<Order | null> {
    const { data, error } = await this.client
      .from('orders')
      .select(
        '*, customers(*), order_items(*), fulfilments(*, suppliers(business_name)), financial_transactions(*), order_status_history(*)'
      )
      .eq('id', toValidUuid(id))
      .maybeSingle();
    if (error) throw error;
    return data ? this.mapOrder(data) : null;
  }

  async getOrderByReference(reference: string): Promise<Order | null> {
    const { data, error } = await this.client
      .from('orders')
      .select(
        '*, customers(*), order_items(*), fulfilments(*, suppliers(business_name)), financial_transactions(*), order_status_history(*)'
      )
      .ilike('order_reference', reference)
      .maybeSingle();
    if (error) throw error;
    return data ? this.mapOrder(data) : null;
  }

  async createOrder(data: Omit<Order, 'id' | 'createdAt' | 'updatedAt'>): Promise<Order> {
    const orderId = toValidUuid();
    const customerId = toValidUuid(data.customerId);
    const now = new Date().toISOString();

    const { error: orderErr } = await this.client.from('orders').insert({
      id: orderId,
      order_reference: data.orderReference,
      tracking_token: data.trackingToken,
      customer_id: customerId,
      source_channel: data.sourceChannel || 'website',
      order_status: data.orderStatus || 'pending_confirmation',
      payment_method: data.paymentMethod || 'cod',
      payment_status: data.paymentStatus || 'unpaid',
      subtotal_pkr: data.subtotalPkr,
      delivery_charge_pkr: data.deliveryChargePkr || 0,
      discount_pkr: data.discountPkr || 0,
      total_payable_pkr: data.totalPayablePkr,
      estimated_profit_pkr: data.estimatedProfitPkr || 0,
      actual_profit_pkr: data.actualProfitPkr || 0,
      internal_notes: data.internalNotes || null,
      created_at: now,
      updated_at: now,
    });
    if (orderErr) throw orderErr;

    if (data.items && data.items.length > 0) {
      const itemsToInsert = data.items.map((i) => ({
        id: toValidUuid(),
        order_id: orderId,
        product_id: i.productId ? toValidUuid(i.productId) : null,
        product_name_snapshot: i.productNameSnapshot,
        variant_snapshot: i.variantSnapshot || null,
        image_snapshot: i.imageSnapshot || null,
        quantity: i.quantity,
        unit_price_pkr: i.unitPricePkr,
        supplier_cost_pkr: i.supplierCostPkr || 0,
        total_price_pkr: i.totalPricePkr,
        created_at: now,
      }));
      await this.client.from('order_items').insert(itemsToInsert);
    }

    await this.client.from('order_status_history').insert({
      id: toValidUuid(),
      order_id: orderId,
      previous_status: null,
      new_status: data.orderStatus || 'pending_confirmation',
      actor_name: 'Customer',
      notes: 'Order placed via website checkout',
      created_at: now,
    });

    return (await this.getOrderById(orderId))!;
  }

  async updateOrderStatus(
    orderId: string,
    newStatus: OrderStatus,
    paymentStatus?: PaymentStatus,
    notes?: string,
    actorId?: string,
    actorName?: string
  ): Promise<Order | null> {
    const existing = await this.getOrderById(orderId);
    if (!existing) return null;

    const now = new Date().toISOString();
    const payload: any = { order_status: newStatus, updated_at: now };
    if (paymentStatus) payload.payment_status = paymentStatus;

    await this.client.from('orders').update(payload).eq('id', toValidUuid(orderId));

    await this.client.from('order_status_history').insert({
      id: toValidUuid(),
      order_id: toValidUuid(orderId),
      previous_status: existing.orderStatus,
      new_status: newStatus,
      actor_id: actorId ? toValidUuid(actorId) : null,
      actor_name: actorName || 'Admin',
      notes: notes || null,
      created_at: now,
    });

    return this.getOrderById(orderId);
  }

  async addOrderFulfilment(
    orderId: string,
    fulfilmentData: Omit<Fulfilment, 'id' | 'orderId' | 'createdAt' | 'updatedAt'>
  ): Promise<Order | null> {
    const id = toValidUuid();
    const now = new Date().toISOString();

    await this.client.from('fulfilments').insert({
      id,
      order_id: toValidUuid(orderId),
      supplier_id: toValidUuid(fulfilmentData.supplierId),
      supplier_order_ref: fulfilmentData.supplierOrderRef || null,
      courier_name: fulfilmentData.courierName || null,
      tracking_number: fulfilmentData.trackingNumber || null,
      tracking_url: fulfilmentData.trackingUrl || null,
      status: fulfilmentData.status || 'assigned',
      courier_charge_pkr: fulfilmentData.courierChargePkr || 0,
      return_charge_pkr: fulfilmentData.returnChargePkr || 0,
      created_at: now,
      updated_at: now,
    });

    const order = await this.getOrderById(orderId);
    if (order && (order.orderStatus === 'confirmed' || order.orderStatus === 'pending_confirmation')) {
      await this.updateOrderStatus(orderId, 'sent_to_supplier', undefined, 'Assigned to dropshipping supplier');
    }

    return this.getOrderById(orderId);
  }

  async updateOrderFulfilment(
    orderId: string,
    fulfilmentId: string,
    updates: Partial<Fulfilment>
  ): Promise<Order | null> {
    const now = new Date().toISOString();
    const payload: any = { updated_at: now };
    if (updates.status !== undefined) payload.status = updates.status;
    if (updates.courierName !== undefined) payload.courier_name = updates.courierName;
    if (updates.trackingNumber !== undefined) payload.tracking_number = updates.trackingNumber;
    if (updates.trackingUrl !== undefined) payload.tracking_url = updates.trackingUrl;
    if (updates.dispatchedAt !== undefined) payload.dispatched_at = updates.dispatchedAt;
    if (updates.deliveredAt !== undefined) payload.delivered_at = updates.deliveredAt;
    if (updates.failureReason !== undefined) payload.failure_reason = updates.failureReason;
    if (updates.courierChargePkr !== undefined) payload.courier_charge_pkr = updates.courierChargePkr;
    if (updates.returnChargePkr !== undefined) payload.return_charge_pkr = updates.returnChargePkr;

    await this.client
      .from('fulfilments')
      .update(payload)
      .eq('id', toValidUuid(fulfilmentId));

    if (updates.status === 'dispatched') {
      await this.updateOrderStatus(orderId, 'dispatched', undefined, `Dispatched with ${updates.courierName || 'courier'}`);
    } else if (updates.status === 'delivered') {
      await this.updateOrderStatus(orderId, 'delivered', 'cod_collected', 'Delivered and COD collected');
    } else if (updates.status === 'failed') {
      await this.updateOrderStatus(orderId, 'delivery_failed', undefined, `Delivery failed: ${updates.failureReason || 'Refused'}`);
    } else if (updates.status === 'returned') {
      await this.updateOrderStatus(orderId, 'returned', undefined, 'Parcel returned to origin');
    }

    return this.getOrderById(orderId);
  }

  async addFinancialTransaction(
    orderId: string,
    txnData: Omit<FinancialTransaction, 'id' | 'orderId' | 'createdAt'>
  ): Promise<Order | null> {
    const id = toValidUuid();
    const now = new Date().toISOString();

    await this.client.from('financial_transactions').insert({
      id,
      order_id: toValidUuid(orderId),
      transaction_type: txnData.transactionType,
      amount_pkr: txnData.amountPkr,
      reference_number: txnData.referenceNumber || null,
      status: txnData.status || 'completed',
      notes: txnData.notes || null,
      created_at: now,
    });

    if (txnData.transactionType === 'cod_collection' && txnData.status === 'completed') {
      await this.client
        .from('orders')
        .update({ payment_status: 'settled', updated_at: now })
        .eq('id', toValidUuid(orderId));
    }

    return this.getOrderById(orderId);
  }

  async addOrderInternalNote(orderId: string, note: string): Promise<Order | null> {
    const existing = await this.getOrderById(orderId);
    if (!existing) return null;

    const dateStamp = new Date().toLocaleString('en-PK');
    const updatedNotes = existing.internalNotes
      ? `${existing.internalNotes}\n[${dateStamp}] ${note}`
      : `[${dateStamp}] ${note}`;

    await this.client
      .from('orders')
      .update({ internal_notes: updatedNotes, updated_at: new Date().toISOString() })
      .eq('id', toValidUuid(orderId));

    return this.getOrderById(orderId);
  }

  // --- Dashboard & Metrics ---
  async getDashboardMetrics(): Promise<DashboardMetrics> {
    const { data: orders } = await this.client.from('orders').select('*');
    const list = orders || [];

    const totalOrders = list.length;
    const pendingConfirmation = list.filter((o) => o.order_status === 'pending_confirmation').length;
    const confirmedOrders = list.filter((o) => ['confirmed', 'processing', 'sent_to_supplier'].includes(o.order_status)).length;
    const dispatchedOrders = list.filter((o) => o.order_status === 'dispatched').length;
    const deliveredOrders = list.filter((o) => o.order_status === 'delivered').length;
    const returnedOrders = list.filter((o) => ['returned', 'delivery_failed'].includes(o.order_status)).length;

    const totalRevenuePkr = list
      .filter((o) => o.order_status === 'delivered' || ['settled', 'cod_collected'].includes(o.payment_status))
      .reduce((sum, o) => sum + Number(o.total_payable_pkr || 0), 0);

    const totalEstimatedProfitPkr = list.reduce((sum, o) => sum + Number(o.estimated_profit_pkr || 0), 0);
    const totalActualProfitPkr = list.reduce((sum, o) => sum + Number(o.actual_profit_pkr || 0), 0);

    const unsettledCodPkr = list
      .filter((o) => ['dispatched', 'delivered'].includes(o.order_status) && o.payment_status !== 'settled')
      .reduce((sum, o) => sum + Number(o.total_payable_pkr || 0), 0);

    const { orders: recentOrders } = await this.getOrders({ limit: 10 });

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

  // --- Store Settings ---
  async getStoreSettings(): Promise<StoreSettings> {
    const { data } = await this.client
      .from('store_settings')
      .select('value')
      .eq('key', 'main_settings')
      .maybeSingle();

    if (!data) {
      return {
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
    }
    const val = data.value;
    return typeof val === 'string' ? JSON.parse(val) : val;
  }

  async updateStoreSettings(updates: Partial<StoreSettings>): Promise<StoreSettings> {
    const current = await this.getStoreSettings();
    const merged: StoreSettings = { ...current, ...updates };

    await this.client
      .from('store_settings')
      .upsert({
        key: 'main_settings',
        value: merged,
        updated_at: new Date().toISOString(),
      });

    return merged;
  }
}
