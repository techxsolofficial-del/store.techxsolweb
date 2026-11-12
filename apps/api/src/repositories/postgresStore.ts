import pg from 'pg';
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

const { Pool } = pg;

export function toValidUuid(id?: string): string {
  if (!id) return crypto.randomUUID();
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (uuidRegex.test(id)) return id;
  // Deterministically map arbitrary IDs (like 'prod-12345') to valid UUIDs
  const md5 = crypto.createHash('md5').update(id).digest('hex');
  return `${md5.slice(0, 8)}-${md5.slice(8, 12)}-4${md5.slice(13, 16)}-a${md5.slice(17, 20)}-${md5.slice(20, 32)}`;
}

export class PostgresStore implements IDataStore {
  private pool: pg.Pool;
  private initPromise: Promise<void> | null = null;

  constructor(connectionString: string) {
    const isLocal =
      connectionString.includes('localhost') ||
      connectionString.includes('127.0.0.1');

    this.pool = new Pool({
      connectionString,
      ssl: isLocal ? false : { rejectUnauthorized: false },
      max: 10,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 10000,
    });

    this.pool.on('error', (err) => {
      console.error('[PostgresStore] Unexpected database pool error:', err);
    });
  }

  private async ensureInitialized(): Promise<void> {
    if (!this.initPromise) {
      this.initPromise = this.initSchemaAndSeed();
    }
    return this.initPromise;
  }

  private async initSchemaAndSeed(): Promise<void> {
    const client = await this.pool.connect();
    try {
      // 1. Enable extension if available
      try {
        await client.query('CREATE EXTENSION IF NOT EXISTS "uuid-ossp";');
      } catch {
        // Fallback to gen_random_uuid() which is built-in to modern PostgreSQL
      }

      // 2. Create tables if they do not exist
      await client.query(`
        CREATE TABLE IF NOT EXISTS categories (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          name VARCHAR(100) NOT NULL,
          slug VARCHAR(120) NOT NULL UNIQUE,
          description TEXT,
          image_url TEXT,
          is_active BOOLEAN NOT NULL DEFAULT TRUE,
          display_order INT NOT NULL DEFAULT 0,
          created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
          updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        );

        CREATE TABLE IF NOT EXISTS suppliers (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          business_name VARCHAR(150) NOT NULL,
          contact_name VARCHAR(100) NOT NULL,
          phone VARCHAR(50) NOT NULL,
          email VARCHAR(255),
          city VARCHAR(100) NOT NULL DEFAULT 'Lahore',
          address TEXT,
          fulfilment_terms TEXT,
          return_policy TEXT,
          payout_terms TEXT,
          is_active BOOLEAN NOT NULL DEFAULT TRUE,
          notes TEXT,
          created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
          updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        );

        CREATE TABLE IF NOT EXISTS products (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          category_id UUID NOT NULL REFERENCES categories(id) ON DELETE RESTRICT,
          name VARCHAR(255) NOT NULL,
          slug VARCHAR(255) NOT NULL UNIQUE,
          short_description VARCHAR(300) NOT NULL,
          description TEXT NOT NULL,
          base_price_pkr INT NOT NULL CHECK (base_price_pkr >= 0),
          compare_at_price_pkr INT CHECK (compare_at_price_pkr >= base_price_pkr),
          sku VARCHAR(100) NOT NULL UNIQUE,
          is_active BOOLEAN NOT NULL DEFAULT TRUE,
          is_featured BOOLEAN NOT NULL DEFAULT FALSE,
          images JSONB NOT NULL DEFAULT '[]'::JSONB,
          variants JSONB NOT NULL DEFAULT '[]'::JSONB,
          created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
          updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        );

        CREATE TABLE IF NOT EXISTS product_supplier_offers (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
          supplier_id UUID NOT NULL REFERENCES suppliers(id) ON DELETE RESTRICT,
          supplier_sku VARCHAR(100) NOT NULL,
          supplier_cost_pkr INT NOT NULL CHECK (supplier_cost_pkr >= 0),
          is_available BOOLEAN NOT NULL DEFAULT TRUE,
          lead_time_days INT NOT NULL DEFAULT 2 CHECK (lead_time_days >= 0),
          notes TEXT,
          created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
          updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
          CONSTRAINT uq_product_supplier UNIQUE(product_id, supplier_id)
        );

        CREATE TABLE IF NOT EXISTS customers (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          name VARCHAR(150) NOT NULL,
          phone VARCHAR(50) NOT NULL,
          alternate_phone VARCHAR(50),
          city VARCHAR(100) NOT NULL,
          delivery_address TEXT NOT NULL,
          delivery_instructions TEXT,
          created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
          updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        );

        CREATE TABLE IF NOT EXISTS orders (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          order_reference VARCHAR(50) NOT NULL UNIQUE,
          tracking_token VARCHAR(100) NOT NULL UNIQUE,
          customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE RESTRICT,
          source_channel VARCHAR(30) NOT NULL DEFAULT 'website',
          order_status VARCHAR(50) NOT NULL DEFAULT 'pending_confirmation',
          payment_method VARCHAR(30) NOT NULL DEFAULT 'cod',
          payment_status VARCHAR(50) NOT NULL DEFAULT 'unpaid',
          subtotal_pkr INT NOT NULL CHECK (subtotal_pkr >= 0),
          delivery_charge_pkr INT NOT NULL DEFAULT 0 CHECK (delivery_charge_pkr >= 0),
          discount_pkr INT NOT NULL DEFAULT 0 CHECK (discount_pkr >= 0),
          total_payable_pkr INT NOT NULL CHECK (total_payable_pkr >= 0),
          estimated_profit_pkr INT NOT NULL DEFAULT 0,
          actual_profit_pkr INT NOT NULL DEFAULT 0,
          internal_notes TEXT,
          created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
          updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        );

        CREATE TABLE IF NOT EXISTS order_items (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
          product_id UUID REFERENCES products(id) ON DELETE SET NULL,
          product_name_snapshot VARCHAR(255) NOT NULL,
          variant_snapshot JSONB,
          image_snapshot TEXT,
          quantity INT NOT NULL CHECK (quantity > 0),
          unit_price_pkr INT NOT NULL CHECK (unit_price_pkr >= 0),
          supplier_cost_pkr INT NOT NULL DEFAULT 0 CHECK (supplier_cost_pkr >= 0),
          total_price_pkr INT NOT NULL CHECK (total_price_pkr >= 0),
          created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        );

        CREATE TABLE IF NOT EXISTS fulfilments (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
          supplier_id UUID NOT NULL REFERENCES suppliers(id) ON DELETE RESTRICT,
          supplier_order_ref VARCHAR(100),
          courier_name VARCHAR(100),
          tracking_number VARCHAR(100),
          tracking_url TEXT,
          status VARCHAR(50) NOT NULL DEFAULT 'assigned',
          dispatched_at TIMESTAMPTZ,
          delivered_at TIMESTAMPTZ,
          failure_reason TEXT,
          courier_charge_pkr INT NOT NULL DEFAULT 0 CHECK (courier_charge_pkr >= 0),
          return_charge_pkr INT NOT NULL DEFAULT 0 CHECK (return_charge_pkr >= 0),
          created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
          updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        );

        CREATE TABLE IF NOT EXISTS order_status_history (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
          previous_status VARCHAR(50),
          new_status VARCHAR(50) NOT NULL,
          actor_id UUID,
          actor_name VARCHAR(100),
          notes TEXT,
          created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        );

        CREATE TABLE IF NOT EXISTS financial_transactions (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
          transaction_type VARCHAR(50) NOT NULL,
          amount_pkr INT NOT NULL CHECK (amount_pkr > 0),
          reference_number VARCHAR(100),
          status VARCHAR(50) NOT NULL DEFAULT 'completed',
          notes TEXT,
          created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        );

        CREATE TABLE IF NOT EXISTS store_settings (
          key VARCHAR(100) PRIMARY KEY,
          value JSONB NOT NULL,
          updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        );
      `);

      // 3. Seed default categories if empty
      const catCheck = await client.query('SELECT COUNT(*)::int AS count FROM categories;');
      if (catCheck.rows[0].count === 0) {
        await client.query(`
          INSERT INTO categories (id, name, slug, description, image_url, is_active, display_order)
          VALUES
            ('c1111111-1111-1111-1111-111111111111', 'Smart Gadgets & Electronics', 'smart-gadgets', 'High-demand wireless earbuds, smartwatches, and smartphone accessories.', 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&auto=format&fit=crop&q=80', TRUE, 1),
            ('c2222222-2222-2222-2222-222222222222', 'Home & Kitchen Essentials', 'home-kitchen', 'Time-saving kitchen gadgets and home organizers for modern Pakistani households.', 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=600&auto=format&fit=crop&q=80', TRUE, 2),
            ('c3333333-3333-3333-3333-333333333333', 'Personal Care & Grooming', 'personal-care', 'Electric shavers, facial care devices, and wellness tools.', 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=600&auto=format&fit=crop&q=80', TRUE, 3)
          ON CONFLICT (slug) DO NOTHING;
        `);
      }

      // 4. Seed default suppliers if empty
      const supCheck = await client.query('SELECT COUNT(*)::int AS count FROM suppliers;');
      if (supCheck.rows[0].count === 0) {
        await client.query(`
          INSERT INTO suppliers (id, business_name, contact_name, phone, email, city, address, fulfilment_terms, return_policy, payout_terms, is_active, notes)
          VALUES
            ('s1111111-1111-1111-1111-111111111111', 'Shah Alam Wholesale Hub', 'Mian Tariq', '03008451122', 'tariq@shahalamhub.pk', 'Lahore', 'Shop # 45, Hall Road / Shah Alam Market, Lahore', 'Dispatches same-day if order confirmed before 2:00 PM. Uses Trax and Call Courier.', '7 days replacement warranty for dead-on-arrival electronics.', 'Weekly bank settlement every Monday after courier COD remittance.', TRUE, 'Primary supplier for audio and electronics.'),
            ('s2222222-2222-2222-2222-222222222222', 'Bolton Market Imports', 'Muhammad Asif', '03212894567', 'asif@boltonimports.pk', 'Karachi', 'Plaza 12, Bolton Market, Karachi', 'Next-day dispatch. Operates directly with TCS & Leopards.', 'Replacement if reported within 5 days of delivery with parcel unboxing video.', '10 days credit cycle.', TRUE, 'Best wholesale rates for kitchen and home tools.')
          ON CONFLICT (id) DO NOTHING;
        `);
      }

      // 5. Seed default store settings if empty
      const setCheck = await client.query('SELECT COUNT(*)::int AS count FROM store_settings;');
      if (setCheck.rows[0].count === 0) {
        const defaultSettings: StoreSettings = {
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
        await client.query(
          'INSERT INTO store_settings (key, value) VALUES ($1, $2) ON CONFLICT (key) DO NOTHING;',
          ['main_settings', JSON.stringify(defaultSettings)]
        );
      }

      console.log('[PostgresStore] Database schema verified and initialized successfully.');
    } catch (err) {
      console.error('[PostgresStore] Database schema initialization error:', err);
      throw err;
    } finally {
      client.release();
    }
  }

  // --- Mappers ---
  private mapCategoryRow(row: any): Category {
    return {
      id: row.id,
      name: row.name,
      slug: row.slug,
      description: row.description || '',
      image: row.image_url || '',
      isActive: Boolean(row.is_active),
      displayOrder: Number(row.display_order || 0),
      createdAt: new Date(row.created_at).toISOString(),
      updatedAt: new Date(row.updated_at).toISOString(),
    };
  }

  private mapSupplierRow(row: any): Supplier {
    return {
      id: row.id,
      businessName: row.business_name,
      contactName: row.contact_name,
      phone: row.phone,
      email: row.email || undefined,
      city: row.city || 'Lahore',
      address: row.address || undefined,
      fulfilmentTerms: row.fulfilment_terms || undefined,
      returnPolicy: row.return_policy || undefined,
      payoutTerms: row.payout_terms || undefined,
      isActive: Boolean(row.is_active),
      notes: row.notes || undefined,
      createdAt: new Date(row.created_at).toISOString(),
      updatedAt: new Date(row.updated_at).toISOString(),
    };
  }

  private mapProductRow(row: any): Product {
    const images: ProductImage[] =
      typeof row.images === 'string' ? JSON.parse(row.images) : row.images || [];
    const variants: ProductVariant[] =
      typeof row.variants === 'string' ? JSON.parse(row.variants) : row.variants || [];
    const supplierOffers: ProductSupplierOffer[] =
      typeof row.supplier_offers === 'string'
        ? JSON.parse(row.supplier_offers)
        : row.supplier_offers || [];

    return {
      id: row.id,
      categoryId: row.category_id,
      categoryName: row.category_name || undefined,
      categorySlug: row.category_slug || undefined,
      name: row.name,
      slug: row.slug,
      shortDescription: row.short_description,
      description: row.description,
      basePricePkr: Number(row.base_price_pkr),
      compareAtPricePkr: row.compare_at_price_pkr ? Number(row.compare_at_price_pkr) : undefined,
      sku: row.sku,
      isActive: Boolean(row.is_active),
      isFeatured: Boolean(row.is_featured),
      images,
      variants,
      supplierOffers,
      createdAt: new Date(row.created_at).toISOString(),
      updatedAt: new Date(row.updated_at).toISOString(),
    };
  }

  // --- Categories ---
  async getCategories(activeOnly = true): Promise<Category[]> {
    await this.ensureInitialized();
    const query = activeOnly
      ? 'SELECT * FROM categories WHERE is_active = TRUE ORDER BY display_order ASC, name ASC;'
      : 'SELECT * FROM categories ORDER BY display_order ASC, name ASC;';
    const res = await this.pool.query(query);
    return res.rows.map((r) => this.mapCategoryRow(r));
  }

  async getCategoryById(id: string): Promise<Category | null> {
    await this.ensureInitialized();
    const res = await this.pool.query('SELECT * FROM categories WHERE id = $1;', [toValidUuid(id)]);
    if (res.rows.length === 0) return null;
    return this.mapCategoryRow(res.rows[0]);
  }

  async getCategoryBySlug(slug: string): Promise<Category | null> {
    await this.ensureInitialized();
    const res = await this.pool.query('SELECT * FROM categories WHERE slug = $1;', [slug]);
    if (res.rows.length === 0) return null;
    return this.mapCategoryRow(res.rows[0]);
  }

  async createCategory(data: Omit<Category, 'id' | 'createdAt' | 'updatedAt'>): Promise<Category> {
    await this.ensureInitialized();
    const id = toValidUuid();
    const now = new Date().toISOString();
    const res = await this.pool.query(
      `INSERT INTO categories (id, name, slug, description, image_url, is_active, display_order, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING *;`,
      [
        id,
        data.name,
        data.slug,
        data.description || null,
        data.image || null,
        data.isActive !== undefined ? data.isActive : true,
        data.displayOrder || 0,
        now,
        now,
      ]
    );
    return this.mapCategoryRow(res.rows[0]);
  }

  async updateCategory(id: string, updates: Partial<Category>): Promise<Category | null> {
    await this.ensureInitialized();
    const existing = await this.getCategoryById(id);
    if (!existing) return null;

    const now = new Date().toISOString();
    const setClauses: string[] = ['updated_at = $1'];
    const values: any[] = [now];
    let paramIdx = 2;

    if (updates.name !== undefined) {
      setClauses.push(`name = $${paramIdx++}`);
      values.push(updates.name);
    }
    if (updates.slug !== undefined) {
      setClauses.push(`slug = $${paramIdx++}`);
      values.push(updates.slug);
    }
    if (updates.description !== undefined) {
      setClauses.push(`description = $${paramIdx++}`);
      values.push(updates.description);
    }
    if (updates.image !== undefined) {
      setClauses.push(`image_url = $${paramIdx++}`);
      values.push(updates.image);
    }
    if (updates.isActive !== undefined) {
      setClauses.push(`is_active = $${paramIdx++}`);
      values.push(updates.isActive);
    }
    if (updates.displayOrder !== undefined) {
      setClauses.push(`display_order = $${paramIdx++}`);
      values.push(updates.displayOrder);
    }

    values.push(toValidUuid(id));
    const query = `UPDATE categories SET ${setClauses.join(', ')} WHERE id = $${paramIdx} RETURNING *;`;
    const res = await this.pool.query(query, values);
    if (res.rows.length === 0) return null;
    return this.mapCategoryRow(res.rows[0]);
  }

  // --- Products ---
  async getProducts(filters?: ProductFilters): Promise<{ products: Product[]; total: number }> {
    await this.ensureInitialized();
    const conditions: string[] = [];
    const params: any[] = [];
    let paramIdx = 1;

    if (filters?.activeOnly !== false) {
      conditions.push('p.is_active = TRUE');
    }

    if (filters?.categoryId) {
      conditions.push(`p.category_id = $${paramIdx++}`);
      params.push(toValidUuid(filters.categoryId));
    }

    if (filters?.categorySlug) {
      conditions.push(`c.slug = $${paramIdx++}`);
      params.push(filters.categorySlug);
    }

    if (filters?.featured) {
      conditions.push('p.is_featured = TRUE');
    }

    if (filters?.search) {
      const q = `%${filters.search.toLowerCase()}%`;
      conditions.push(
        `(LOWER(p.name) LIKE $${paramIdx} OR LOWER(p.description) LIKE $${paramIdx} OR LOWER(p.short_description) LIKE $${paramIdx} OR LOWER(p.sku) LIKE $${paramIdx})`
      );
      params.push(q);
      paramIdx++;
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    const countRes = await this.pool.query(
      `SELECT COUNT(*)::int AS count
       FROM products p
       LEFT JOIN categories c ON c.id = p.category_id
       ${whereClause};`,
      params
    );
    const total = countRes.rows[0]?.count || 0;

    let orderBy = 'p.created_at DESC';
    if (filters?.sortBy === 'price_asc') {
      orderBy = 'p.base_price_pkr ASC';
    } else if (filters?.sortBy === 'price_desc') {
      orderBy = 'p.base_price_pkr DESC';
    }

    const page = Math.max(1, filters?.page || 1);
    const limit = Math.max(1, filters?.limit || 20);
    const offset = (page - 1) * limit;

    const dataQuery = `
      SELECT 
        p.id,
        p.category_id,
        c.name AS category_name,
        c.slug AS category_slug,
        p.name,
        p.slug,
        p.short_description,
        p.description,
        p.base_price_pkr,
        p.compare_at_price_pkr,
        p.sku,
        p.is_active,
        p.is_featured,
        p.images,
        p.variants,
        p.created_at,
        p.updated_at,
        COALESCE(
          (SELECT jsonb_agg(
            jsonb_build_object(
              'id', pso.id,
              'productId', pso.product_id,
              'supplierId', pso.supplier_id,
              'supplierName', s.business_name,
              'supplierSku', pso.supplier_sku,
              'supplierCostPkr', pso.supplier_cost_pkr,
              'isAvailable', pso.is_available,
              'leadTimeDays', pso.lead_time_days,
              'notes', pso.notes,
              'updatedAt', pso.updated_at
            )
          )
          FROM product_supplier_offers pso
          LEFT JOIN suppliers s ON s.id = pso.supplier_id
          WHERE pso.product_id = p.id
          ), '[]'::jsonb
        ) AS supplier_offers
      FROM products p
      LEFT JOIN categories c ON c.id = p.category_id
      ${whereClause}
      ORDER BY ${orderBy}
      LIMIT $${paramIdx++} OFFSET $${paramIdx++};
    `;

    const dataParams = [...params, limit, offset];
    const res = await this.pool.query(dataQuery, dataParams);
    const products = res.rows.map((row) => this.mapProductRow(row));

    return { products, total };
  }

  async getProductById(id: string): Promise<Product | null> {
    await this.ensureInitialized();
    const query = `
      SELECT 
        p.id,
        p.category_id,
        c.name AS category_name,
        c.slug AS category_slug,
        p.name,
        p.slug,
        p.short_description,
        p.description,
        p.base_price_pkr,
        p.compare_at_price_pkr,
        p.sku,
        p.is_active,
        p.is_featured,
        p.images,
        p.variants,
        p.created_at,
        p.updated_at,
        COALESCE(
          (SELECT jsonb_agg(
            jsonb_build_object(
              'id', pso.id,
              'productId', pso.product_id,
              'supplierId', pso.supplier_id,
              'supplierName', s.business_name,
              'supplierSku', pso.supplier_sku,
              'supplierCostPkr', pso.supplier_cost_pkr,
              'isAvailable', pso.is_available,
              'leadTimeDays', pso.lead_time_days,
              'notes', pso.notes,
              'updatedAt', pso.updated_at
            )
          )
          FROM product_supplier_offers pso
          LEFT JOIN suppliers s ON s.id = pso.supplier_id
          WHERE pso.product_id = p.id
          ), '[]'::jsonb
        ) AS supplier_offers
      FROM products p
      LEFT JOIN categories c ON c.id = p.category_id
      WHERE p.id = $1;
    `;
    const res = await this.pool.query(query, [toValidUuid(id)]);
    if (res.rows.length === 0) return null;
    return this.mapProductRow(res.rows[0]);
  }

  async getProductBySlug(slug: string): Promise<Product | null> {
    await this.ensureInitialized();
    const query = `
      SELECT 
        p.id,
        p.category_id,
        c.name AS category_name,
        c.slug AS category_slug,
        p.name,
        p.slug,
        p.short_description,
        p.description,
        p.base_price_pkr,
        p.compare_at_price_pkr,
        p.sku,
        p.is_active,
        p.is_featured,
        p.images,
        p.variants,
        p.created_at,
        p.updated_at,
        COALESCE(
          (SELECT jsonb_agg(
            jsonb_build_object(
              'id', pso.id,
              'productId', pso.product_id,
              'supplierId', pso.supplier_id,
              'supplierName', s.business_name,
              'supplierSku', pso.supplier_sku,
              'supplierCostPkr', pso.supplier_cost_pkr,
              'isAvailable', pso.is_available,
              'leadTimeDays', pso.lead_time_days,
              'notes', pso.notes,
              'updatedAt', pso.updated_at
            )
          )
          FROM product_supplier_offers pso
          LEFT JOIN suppliers s ON s.id = pso.supplier_id
          WHERE pso.product_id = p.id
          ), '[]'::jsonb
        ) AS supplier_offers
      FROM products p
      LEFT JOIN categories c ON c.id = p.category_id
      WHERE p.slug = $1;
    `;
    const res = await this.pool.query(query, [slug]);
    if (res.rows.length === 0) return null;
    return this.mapProductRow(res.rows[0]);
  }

  async createProduct(data: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>): Promise<Product> {
    await this.ensureInitialized();
    const id = toValidUuid();
    const now = new Date().toISOString();
    const categoryId = toValidUuid(data.categoryId);

    let catName = data.categoryName;
    let catSlug = data.categorySlug;
    if (!catName || !catSlug) {
      const catRes = await this.pool.query('SELECT name, slug FROM categories WHERE id = $1;', [categoryId]);
      if (catRes.rows.length > 0) {
        catName = catRes.rows[0].name;
        catSlug = catRes.rows[0].slug;
      }
    }

    const query = `
      INSERT INTO products (
        id, category_id, name, slug, short_description, description,
        base_price_pkr, compare_at_price_pkr, sku, is_active, is_featured,
        images, variants, created_at, updated_at
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15
      ) RETURNING *;
    `;

    const values = [
      id,
      categoryId,
      data.name,
      data.slug,
      data.shortDescription,
      data.description,
      data.basePricePkr,
      data.compareAtPricePkr || null,
      data.sku,
      data.isActive !== undefined ? data.isActive : true,
      data.isFeatured !== undefined ? data.isFeatured : false,
      JSON.stringify(data.images || []),
      JSON.stringify(data.variants || []),
      now,
      now,
    ];

    await this.pool.query(query, values);

    // Persist supplier offers if provided
    const savedOffers: ProductSupplierOffer[] = [];
    if (data.supplierOffers && Array.isArray(data.supplierOffers) && data.supplierOffers.length > 0) {
      for (const offer of data.supplierOffers) {
        const offerId = toValidUuid(offer.id);
        const supplierId = toValidUuid(offer.supplierId);
        await this.pool.query(
          `INSERT INTO product_supplier_offers (
            id, product_id, supplier_id, supplier_sku, supplier_cost_pkr,
            is_available, lead_time_days, notes, created_at, updated_at
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
          ON CONFLICT (product_id, supplier_id) DO UPDATE SET
            supplier_sku = EXCLUDED.supplier_sku,
            supplier_cost_pkr = EXCLUDED.supplier_cost_pkr,
            is_available = EXCLUDED.is_available,
            lead_time_days = EXCLUDED.lead_time_days,
            notes = EXCLUDED.notes,
            updated_at = EXCLUDED.updated_at;`,
          [
            offerId,
            id,
            supplierId,
            offer.supplierSku || `SUP-${data.sku}`,
            offer.supplierCostPkr,
            offer.isAvailable !== false,
            offer.leadTimeDays || 2,
            offer.notes || null,
            now,
            now,
          ]
        );
        savedOffers.push({
          id: offerId,
          productId: id,
          supplierId,
          supplierSku: offer.supplierSku || `SUP-${data.sku}`,
          supplierCostPkr: offer.supplierCostPkr,
          isAvailable: offer.isAvailable !== false,
          leadTimeDays: offer.leadTimeDays || 2,
          notes: offer.notes,
          updatedAt: now,
        });
      }
    }

    const created = await this.getProductById(id);
    if (!created) {
      return {
        ...data,
        id,
        categoryId,
        categoryName: catName,
        categorySlug: catSlug,
        supplierOffers: savedOffers,
        createdAt: now,
        updatedAt: now,
      };
    }
    return created;
  }

  async updateProduct(id: string, updates: Partial<Product>): Promise<Product | null> {
    await this.ensureInitialized();
    const existing = await this.getProductById(id);
    if (!existing) return null;

    const now = new Date().toISOString();
    const setClauses: string[] = ['updated_at = $1'];
    const values: any[] = [now];
    let paramIdx = 2;

    if (updates.name !== undefined) {
      setClauses.push(`name = $${paramIdx++}`);
      values.push(updates.name);
    }
    if (updates.slug !== undefined) {
      setClauses.push(`slug = $${paramIdx++}`);
      values.push(updates.slug);
    }
    if (updates.categoryId !== undefined) {
      setClauses.push(`category_id = $${paramIdx++}`);
      values.push(toValidUuid(updates.categoryId));
    }
    if (updates.shortDescription !== undefined) {
      setClauses.push(`short_description = $${paramIdx++}`);
      values.push(updates.shortDescription);
    }
    if (updates.description !== undefined) {
      setClauses.push(`description = $${paramIdx++}`);
      values.push(updates.description);
    }
    if (updates.basePricePkr !== undefined) {
      setClauses.push(`base_price_pkr = $${paramIdx++}`);
      values.push(updates.basePricePkr);
    }
    if (updates.compareAtPricePkr !== undefined) {
      setClauses.push(`compare_at_price_pkr = $${paramIdx++}`);
      values.push(updates.compareAtPricePkr || null);
    }
    if (updates.sku !== undefined) {
      setClauses.push(`sku = $${paramIdx++}`);
      values.push(updates.sku);
    }
    if (updates.isActive !== undefined) {
      setClauses.push(`is_active = $${paramIdx++}`);
      values.push(updates.isActive);
    }
    if (updates.isFeatured !== undefined) {
      setClauses.push(`is_featured = $${paramIdx++}`);
      values.push(updates.isFeatured);
    }
    if (updates.images !== undefined) {
      setClauses.push(`images = $${paramIdx++}`);
      values.push(JSON.stringify(updates.images));
    }
    if (updates.variants !== undefined) {
      setClauses.push(`variants = $${paramIdx++}`);
      values.push(JSON.stringify(updates.variants));
    }

    values.push(toValidUuid(id));
    const query = `UPDATE products SET ${setClauses.join(', ')} WHERE id = $${paramIdx};`;
    await this.pool.query(query, values);

    // Update supplier offers if present
    if (updates.supplierOffers && Array.isArray(updates.supplierOffers)) {
      for (const offer of updates.supplierOffers) {
        const offerId = toValidUuid(offer.id);
        const supplierId = toValidUuid(offer.supplierId);
        await this.pool.query(
          `INSERT INTO product_supplier_offers (
            id, product_id, supplier_id, supplier_sku, supplier_cost_pkr,
            is_available, lead_time_days, notes, created_at, updated_at
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
          ON CONFLICT (product_id, supplier_id) DO UPDATE SET
            supplier_sku = EXCLUDED.supplier_sku,
            supplier_cost_pkr = EXCLUDED.supplier_cost_pkr,
            is_available = EXCLUDED.is_available,
            lead_time_days = EXCLUDED.lead_time_days,
            notes = EXCLUDED.notes,
            updated_at = EXCLUDED.updated_at;`,
          [
            offerId,
            toValidUuid(id),
            supplierId,
            offer.supplierSku || `SUP-${updates.sku || existing.sku}`,
            offer.supplierCostPkr,
            offer.isAvailable !== false,
            offer.leadTimeDays || 2,
            offer.notes || null,
            now,
            now,
          ]
        );
      }
    }

    return this.getProductById(id);
  }

  async deleteProduct(id: string): Promise<boolean> {
    await this.ensureInitialized();
    const res = await this.pool.query('DELETE FROM products WHERE id = $1;', [toValidUuid(id)]);
    return (res.rowCount ?? 0) > 0;
  }

  // --- Suppliers ---
  async getSuppliers(activeOnly = false): Promise<Supplier[]> {
    await this.ensureInitialized();
    const query = activeOnly
      ? 'SELECT * FROM suppliers WHERE is_active = TRUE ORDER BY business_name ASC;'
      : 'SELECT * FROM suppliers ORDER BY business_name ASC;';
    const res = await this.pool.query(query);
    return res.rows.map((r) => this.mapSupplierRow(r));
  }

  async getSupplierById(id: string): Promise<Supplier | null> {
    await this.ensureInitialized();
    const res = await this.pool.query('SELECT * FROM suppliers WHERE id = $1;', [toValidUuid(id)]);
    if (res.rows.length === 0) return null;
    return this.mapSupplierRow(res.rows[0]);
  }

  async createSupplier(data: Omit<Supplier, 'id' | 'createdAt' | 'updatedAt'>): Promise<Supplier> {
    await this.ensureInitialized();
    const id = toValidUuid();
    const now = new Date().toISOString();
    const res = await this.pool.query(
      `INSERT INTO suppliers (
        id, business_name, contact_name, phone, email, city, address,
        fulfilment_terms, return_policy, payout_terms, is_active, notes,
        created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
      RETURNING *;`,
      [
        id,
        data.businessName,
        data.contactName,
        data.phone,
        data.email || null,
        data.city || 'Lahore',
        data.address || null,
        data.fulfilmentTerms || null,
        data.returnPolicy || null,
        data.payoutTerms || null,
        data.isActive !== undefined ? data.isActive : true,
        data.notes || null,
        now,
        now,
      ]
    );
    return this.mapSupplierRow(res.rows[0]);
  }

  async updateSupplier(id: string, updates: Partial<Supplier>): Promise<Supplier | null> {
    await this.ensureInitialized();
    const existing = await this.getSupplierById(id);
    if (!existing) return null;

    const now = new Date().toISOString();
    const setClauses: string[] = ['updated_at = $1'];
    const values: any[] = [now];
    let paramIdx = 2;

    if (updates.businessName !== undefined) {
      setClauses.push(`business_name = $${paramIdx++}`);
      values.push(updates.businessName);
    }
    if (updates.contactName !== undefined) {
      setClauses.push(`contact_name = $${paramIdx++}`);
      values.push(updates.contactName);
    }
    if (updates.phone !== undefined) {
      setClauses.push(`phone = $${paramIdx++}`);
      values.push(updates.phone);
    }
    if (updates.email !== undefined) {
      setClauses.push(`email = $${paramIdx++}`);
      values.push(updates.email);
    }
    if (updates.city !== undefined) {
      setClauses.push(`city = $${paramIdx++}`);
      values.push(updates.city);
    }
    if (updates.address !== undefined) {
      setClauses.push(`address = $${paramIdx++}`);
      values.push(updates.address);
    }
    if (updates.fulfilmentTerms !== undefined) {
      setClauses.push(`fulfilment_terms = $${paramIdx++}`);
      values.push(updates.fulfilmentTerms);
    }
    if (updates.returnPolicy !== undefined) {
      setClauses.push(`return_policy = $${paramIdx++}`);
      values.push(updates.returnPolicy);
    }
    if (updates.payoutTerms !== undefined) {
      setClauses.push(`payout_terms = $${paramIdx++}`);
      values.push(updates.payoutTerms);
    }
    if (updates.isActive !== undefined) {
      setClauses.push(`is_active = $${paramIdx++}`);
      values.push(updates.isActive);
    }
    if (updates.notes !== undefined) {
      setClauses.push(`notes = $${paramIdx++}`);
      values.push(updates.notes);
    }

    values.push(toValidUuid(id));
    const query = `UPDATE suppliers SET ${setClauses.join(', ')} WHERE id = $${paramIdx} RETURNING *;`;
    const res = await this.pool.query(query, values);
    if (res.rows.length === 0) return null;
    return this.mapSupplierRow(res.rows[0]);
  }

  // --- Customers ---
  async findOrCreateCustomer(data: Omit<Customer, 'id' | 'createdAt'>): Promise<Customer> {
    await this.ensureInitialized();
    const existing = await this.pool.query(
      'SELECT * FROM customers WHERE phone = $1 LIMIT 1;',
      [data.phone]
    );

    const now = new Date().toISOString();
    if (existing.rows.length > 0) {
      const cust = existing.rows[0];
      const res = await this.pool.query(
        `UPDATE customers
         SET name = $1, city = $2, delivery_address = $3, delivery_instructions = $4, updated_at = $5
         WHERE id = $6 RETURNING *;`,
        [
          data.name,
          data.city,
          data.deliveryAddress,
          data.deliveryInstructions || cust.delivery_instructions,
          now,
          cust.id,
        ]
      );
      return {
        id: res.rows[0].id,
        name: res.rows[0].name,
        phone: res.rows[0].phone,
        alternatePhone: res.rows[0].alternate_phone || undefined,
        city: res.rows[0].city,
        deliveryAddress: res.rows[0].delivery_address,
        deliveryInstructions: res.rows[0].delivery_instructions || undefined,
        createdAt: new Date(res.rows[0].created_at).toISOString(),
      };
    }

    const id = toValidUuid();
    const res = await this.pool.query(
      `INSERT INTO customers (
        id, name, phone, alternate_phone, city, delivery_address, delivery_instructions, created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *;`,
      [
        id,
        data.name,
        data.phone,
        data.alternatePhone || null,
        data.city,
        data.deliveryAddress,
        data.deliveryInstructions || null,
        now,
        now,
      ]
    );

    return {
      id: res.rows[0].id,
      name: res.rows[0].name,
      phone: res.rows[0].phone,
      alternatePhone: res.rows[0].alternate_phone || undefined,
      city: res.rows[0].city,
      deliveryAddress: res.rows[0].delivery_address,
      deliveryInstructions: res.rows[0].delivery_instructions || undefined,
      createdAt: new Date(res.rows[0].created_at).toISOString(),
    };
  }

  async getCustomerById(id: string): Promise<Customer | null> {
    await this.ensureInitialized();
    const res = await this.pool.query('SELECT * FROM customers WHERE id = $1;', [toValidUuid(id)]);
    if (res.rows.length === 0) return null;
    const r = res.rows[0];
    return {
      id: r.id,
      name: r.name,
      phone: r.phone,
      alternatePhone: r.alternate_phone || undefined,
      city: r.city,
      deliveryAddress: r.delivery_address,
      deliveryInstructions: r.delivery_instructions || undefined,
      createdAt: new Date(r.created_at).toISOString(),
    };
  }

  // --- Orders ---
  private mapOrderRow(row: any): Order {
    return {
      id: row.id,
      orderReference: row.order_reference,
      trackingToken: row.tracking_token,
      customerId: row.customer_id,
      customer: row.customer_name
        ? {
            id: row.customer_id,
            name: row.customer_name,
            phone: row.customer_phone,
            alternatePhone: row.customer_alt_phone || undefined,
            city: row.customer_city,
            deliveryAddress: row.customer_address,
            deliveryInstructions: row.customer_instructions || undefined,
            createdAt: row.created_at,
          }
        : undefined,
      sourceChannel: row.source_channel,
      orderStatus: row.order_status,
      paymentMethod: row.payment_method,
      paymentStatus: row.payment_status,
      subtotalPkr: Number(row.subtotal_pkr),
      deliveryChargePkr: Number(row.delivery_charge_pkr),
      discountPkr: Number(row.discount_pkr),
      totalPayablePkr: Number(row.total_payable_pkr),
      estimatedProfitPkr: Number(row.estimated_profit_pkr || 0),
      actualProfitPkr: Number(row.actual_profit_pkr || 0),
      internalNotes: row.internal_notes || undefined,
      items: typeof row.items === 'string' ? JSON.parse(row.items) : row.items || [],
      fulfilments:
        typeof row.fulfilments === 'string'
          ? JSON.parse(row.fulfilments)
          : row.fulfilments || [],
      transactions:
        typeof row.transactions === 'string'
          ? JSON.parse(row.transactions)
          : row.transactions || [],
      statusHistory:
        typeof row.status_history === 'string'
          ? JSON.parse(row.status_history)
          : row.status_history || [],
      createdAt: new Date(row.created_at).toISOString(),
      updatedAt: new Date(row.updated_at).toISOString(),
    };
  }

  async getOrders(filters?: OrderFilters): Promise<{ orders: Order[]; total: number }> {
    await this.ensureInitialized();
    const conditions: string[] = [];
    const params: any[] = [];
    let paramIdx = 1;

    if (filters?.status) {
      conditions.push(`o.order_status = $${paramIdx++}`);
      params.push(filters.status);
    }
    if (filters?.paymentStatus) {
      conditions.push(`o.payment_status = $${paramIdx++}`);
      params.push(filters.paymentStatus);
    }
    if (filters?.channel) {
      conditions.push(`o.source_channel = $${paramIdx++}`);
      params.push(filters.channel);
    }
    if (filters?.city) {
      conditions.push(`LOWER(c.city) = LOWER($${paramIdx++})`);
      params.push(filters.city);
    }
    if (filters?.search) {
      const q = `%${filters.search.toLowerCase()}%`;
      conditions.push(
        `(LOWER(o.order_reference) LIKE $${paramIdx} OR LOWER(c.name) LIKE $${paramIdx} OR c.phone LIKE $${paramIdx})`
      );
      params.push(q);
      paramIdx++;
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    const countRes = await this.pool.query(
      `SELECT COUNT(*)::int AS count
       FROM orders o
       LEFT JOIN customers c ON c.id = o.customer_id
       ${whereClause};`,
      params
    );
    const total = countRes.rows[0]?.count || 0;

    const page = Math.max(1, filters?.page || 1);
    const limit = Math.max(1, filters?.limit || 20);
    const offset = (page - 1) * limit;

    const query = `
      SELECT 
        o.*,
        c.name AS customer_name,
        c.phone AS customer_phone,
        c.alternate_phone AS customer_alt_phone,
        c.city AS customer_city,
        c.delivery_address AS customer_address,
        c.delivery_instructions AS customer_instructions,
        COALESCE(
          (SELECT jsonb_agg(
            jsonb_build_object(
              'id', oi.id,
              'orderId', oi.order_id,
              'productId', oi.product_id,
              'productNameSnapshot', oi.product_name_snapshot,
              'variantSnapshot', oi.variant_snapshot,
              'imageSnapshot', oi.image_snapshot,
              'quantity', oi.quantity,
              'unitPricePkr', oi.unit_price_pkr,
              'supplierCostPkr', oi.supplier_cost_pkr,
              'totalPricePkr', oi.total_price_pkr
            )
          ) FROM order_items oi WHERE oi.order_id = o.id), '[]'::jsonb
        ) AS items,
        COALESCE(
          (SELECT jsonb_agg(
            jsonb_build_object(
              'id', f.id,
              'orderId', f.order_id,
              'supplierId', f.supplier_id,
              'supplierName', s.business_name,
              'supplierOrderRef', f.supplier_order_ref,
              'courierName', f.courier_name,
              'trackingNumber', f.tracking_number,
              'trackingUrl', f.tracking_url,
              'status', f.status,
              'dispatchedAt', f.dispatched_at,
              'deliveredAt', f.delivered_at,
              'failureReason', f.failure_reason,
              'courierChargePkr', f.courier_charge_pkr,
              'returnChargePkr', f.return_charge_pkr,
              'createdAt', f.created_at,
              'updatedAt', f.updated_at
            )
          ) FROM fulfilments f LEFT JOIN suppliers s ON s.id = f.supplier_id WHERE f.order_id = o.id), '[]'::jsonb
        ) AS fulfilments,
        COALESCE(
          (SELECT jsonb_agg(
            jsonb_build_object(
              'id', t.id,
              'orderId', t.order_id,
              'transactionType', t.transaction_type,
              'amountPkr', t.amount_pkr,
              'referenceNumber', t.reference_number,
              'status', t.status,
              'notes', t.notes,
              'createdAt', t.created_at
            )
          ) FROM financial_transactions t WHERE t.order_id = o.id), '[]'::jsonb
        ) AS transactions,
        COALESCE(
          (SELECT jsonb_agg(
            jsonb_build_object(
              'id', h.id,
              'orderId', h.order_id,
              'previousStatus', h.previous_status,
              'newStatus', h.new_status,
              'actorName', h.actor_name,
              'notes', h.notes,
              'createdAt', h.created_at
            ) ORDER BY h.created_at ASC
          ) FROM order_status_history h WHERE h.order_id = o.id), '[]'::jsonb
        ) AS status_history
      FROM orders o
      LEFT JOIN customers c ON c.id = o.customer_id
      ${whereClause}
      ORDER BY o.created_at DESC
      LIMIT $${paramIdx++} OFFSET $${paramIdx++};
    `;

    const res = await this.pool.query(query, [...params, limit, offset]);
    const orders = res.rows.map((r) => this.mapOrderRow(r));

    return { orders, total };
  }

  async getOrderById(id: string): Promise<Order | null> {
    await this.ensureInitialized();
    const query = `
      SELECT 
        o.*,
        c.name AS customer_name,
        c.phone AS customer_phone,
        c.alternate_phone AS customer_alt_phone,
        c.city AS customer_city,
        c.delivery_address AS customer_address,
        c.delivery_instructions AS customer_instructions,
        COALESCE(
          (SELECT jsonb_agg(
            jsonb_build_object(
              'id', oi.id,
              'orderId', oi.order_id,
              'productId', oi.product_id,
              'productNameSnapshot', oi.product_name_snapshot,
              'variantSnapshot', oi.variant_snapshot,
              'imageSnapshot', oi.image_snapshot,
              'quantity', oi.quantity,
              'unitPricePkr', oi.unit_price_pkr,
              'supplierCostPkr', oi.supplier_cost_pkr,
              'totalPricePkr', oi.total_price_pkr
            )
          ) FROM order_items oi WHERE oi.order_id = o.id), '[]'::jsonb
        ) AS items,
        COALESCE(
          (SELECT jsonb_agg(
            jsonb_build_object(
              'id', f.id,
              'orderId', f.order_id,
              'supplierId', f.supplier_id,
              'supplierName', s.business_name,
              'supplierOrderRef', f.supplier_order_ref,
              'courierName', f.courier_name,
              'trackingNumber', f.tracking_number,
              'trackingUrl', f.tracking_url,
              'status', f.status,
              'dispatchedAt', f.dispatched_at,
              'deliveredAt', f.delivered_at,
              'failureReason', f.failure_reason,
              'courierChargePkr', f.courier_charge_pkr,
              'returnChargePkr', f.return_charge_pkr,
              'createdAt', f.created_at,
              'updatedAt', f.updated_at
            )
          ) FROM fulfilments f LEFT JOIN suppliers s ON s.id = f.supplier_id WHERE f.order_id = o.id), '[]'::jsonb
        ) AS fulfilments,
        COALESCE(
          (SELECT jsonb_agg(
            jsonb_build_object(
              'id', t.id,
              'orderId', t.order_id,
              'transactionType', t.transaction_type,
              'amountPkr', t.amount_pkr,
              'referenceNumber', t.reference_number,
              'status', t.status,
              'notes', t.notes,
              'createdAt', t.created_at
            )
          ) FROM financial_transactions t WHERE t.order_id = o.id), '[]'::jsonb
        ) AS transactions,
        COALESCE(
          (SELECT jsonb_agg(
            jsonb_build_object(
              'id', h.id,
              'orderId', h.order_id,
              'previousStatus', h.previous_status,
              'newStatus', h.new_status,
              'actorName', h.actor_name,
              'notes', h.notes,
              'createdAt', h.created_at
            ) ORDER BY h.created_at ASC
          ) FROM order_status_history h WHERE h.order_id = o.id), '[]'::jsonb
        ) AS status_history
      FROM orders o
      LEFT JOIN customers c ON c.id = o.customer_id
      WHERE o.id = $1;
    `;
    const res = await this.pool.query(query, [toValidUuid(id)]);
    if (res.rows.length === 0) return null;
    return this.mapOrderRow(res.rows[0]);
  }

  async getOrderByReference(reference: string): Promise<Order | null> {
    await this.ensureInitialized();
    const query = `
      SELECT 
        o.*,
        c.name AS customer_name,
        c.phone AS customer_phone,
        c.alternate_phone AS customer_alt_phone,
        c.city AS customer_city,
        c.delivery_address AS customer_address,
        c.delivery_instructions AS customer_instructions,
        COALESCE(
          (SELECT jsonb_agg(
            jsonb_build_object(
              'id', oi.id,
              'orderId', oi.order_id,
              'productId', oi.product_id,
              'productNameSnapshot', oi.product_name_snapshot,
              'variantSnapshot', oi.variant_snapshot,
              'imageSnapshot', oi.image_snapshot,
              'quantity', oi.quantity,
              'unitPricePkr', oi.unit_price_pkr,
              'supplierCostPkr', oi.supplier_cost_pkr,
              'totalPricePkr', oi.total_price_pkr
            )
          ) FROM order_items oi WHERE oi.order_id = o.id), '[]'::jsonb
        ) AS items,
        COALESCE(
          (SELECT jsonb_agg(
            jsonb_build_object(
              'id', f.id,
              'orderId', f.order_id,
              'supplierId', f.supplier_id,
              'supplierName', s.business_name,
              'supplierOrderRef', f.supplier_order_ref,
              'courierName', f.courier_name,
              'trackingNumber', f.tracking_number,
              'trackingUrl', f.tracking_url,
              'status', f.status,
              'dispatchedAt', f.dispatched_at,
              'deliveredAt', f.delivered_at,
              'failureReason', f.failure_reason,
              'courierChargePkr', f.courier_charge_pkr,
              'returnChargePkr', f.return_charge_pkr,
              'createdAt', f.created_at,
              'updatedAt', f.updated_at
            )
          ) FROM fulfilments f LEFT JOIN suppliers s ON s.id = f.supplier_id WHERE f.order_id = o.id), '[]'::jsonb
        ) AS fulfilments,
        COALESCE(
          (SELECT jsonb_agg(
            jsonb_build_object(
              'id', t.id,
              'orderId', t.order_id,
              'transactionType', t.transaction_type,
              'amountPkr', t.amount_pkr,
              'referenceNumber', t.reference_number,
              'status', t.status,
              'notes', t.notes,
              'createdAt', t.created_at
            )
          ) FROM financial_transactions t WHERE t.order_id = o.id), '[]'::jsonb
        ) AS transactions,
        COALESCE(
          (SELECT jsonb_agg(
            jsonb_build_object(
              'id', h.id,
              'orderId', h.order_id,
              'previousStatus', h.previous_status,
              'newStatus', h.new_status,
              'actorName', h.actor_name,
              'notes', h.notes,
              'createdAt', h.created_at
            ) ORDER BY h.created_at ASC
          ) FROM order_status_history h WHERE h.order_id = o.id), '[]'::jsonb
        ) AS status_history
      FROM orders o
      LEFT JOIN customers c ON c.id = o.customer_id
      WHERE LOWER(o.order_reference) = LOWER($1);
    `;
    const res = await this.pool.query(query, [reference]);
    if (res.rows.length === 0) return null;
    return this.mapOrderRow(res.rows[0]);
  }

  async createOrder(data: Omit<Order, 'id' | 'createdAt' | 'updatedAt'>): Promise<Order> {
    await this.ensureInitialized();
    const client = await this.pool.connect();
    try {
      await client.query('BEGIN;');

      const orderId = toValidUuid();
      const customerId = toValidUuid(data.customerId);
      const now = new Date().toISOString();

      await client.query(
        `INSERT INTO orders (
          id, order_reference, tracking_token, customer_id, source_channel,
          order_status, payment_method, payment_status, subtotal_pkr,
          delivery_charge_pkr, discount_pkr, total_payable_pkr,
          estimated_profit_pkr, actual_profit_pkr, internal_notes,
          created_at, updated_at
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17
        );`,
        [
          orderId,
          data.orderReference,
          data.trackingToken,
          customerId,
          data.sourceChannel || 'website',
          data.orderStatus || 'pending_confirmation',
          data.paymentMethod || 'cod',
          data.paymentStatus || 'unpaid',
          data.subtotalPkr,
          data.deliveryChargePkr || 0,
          data.discountPkr || 0,
          data.totalPayablePkr,
          data.estimatedProfitPkr || 0,
          data.actualProfitPkr || 0,
          data.internalNotes || null,
          now,
          now,
        ]
      );

      // Insert Order Items
      if (data.items && data.items.length > 0) {
        for (const item of data.items) {
          const itemId = toValidUuid();
          await client.query(
            `INSERT INTO order_items (
              id, order_id, product_id, product_name_snapshot, variant_snapshot,
              image_snapshot, quantity, unit_price_pkr, supplier_cost_pkr,
              total_price_pkr, created_at
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11);`,
            [
              itemId,
              orderId,
              item.productId ? toValidUuid(item.productId) : null,
              item.productNameSnapshot,
              item.variantSnapshot ? JSON.stringify(item.variantSnapshot) : null,
              item.imageSnapshot || null,
              item.quantity,
              item.unitPricePkr,
              item.supplierCostPkr || 0,
              item.totalPricePkr,
              now,
            ]
          );
        }
      }

      // Initial status history
      const histId = toValidUuid();
      await client.query(
        `INSERT INTO order_status_history (
          id, order_id, previous_status, new_status, actor_name, notes, created_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7);`,
        [
          histId,
          orderId,
          null,
          data.orderStatus || 'pending_confirmation',
          'Customer',
          'Order placed via website checkout',
          now,
        ]
      );

      await client.query('COMMIT;');
      return (await this.getOrderById(orderId))!;
    } catch (err) {
      await client.query('ROLLBACK;');
      throw err;
    } finally {
      client.release();
    }
  }

  async updateOrderStatus(
    orderId: string,
    newStatus: OrderStatus,
    paymentStatus?: PaymentStatus,
    notes?: string,
    actorId?: string,
    actorName?: string
  ): Promise<Order | null> {
    await this.ensureInitialized();
    const existing = await this.getOrderById(orderId);
    if (!existing) return null;

    const now = new Date().toISOString();
    const client = await this.pool.connect();
    try {
      await client.query('BEGIN;');

      const updateQuery = paymentStatus
        ? 'UPDATE orders SET order_status = $1, payment_status = $2, updated_at = $3 WHERE id = $4;'
        : 'UPDATE orders SET order_status = $1, updated_at = $2 WHERE id = $3;';
      const params = paymentStatus
        ? [newStatus, paymentStatus, now, toValidUuid(orderId)]
        : [newStatus, now, toValidUuid(orderId)];

      await client.query(updateQuery, params);

      const histId = toValidUuid();
      await client.query(
        `INSERT INTO order_status_history (
          id, order_id, previous_status, new_status, actor_id, actor_name, notes, created_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8);`,
        [
          histId,
          toValidUuid(orderId),
          existing.orderStatus,
          newStatus,
          actorId ? toValidUuid(actorId) : null,
          actorName || 'Admin',
          notes || null,
          now,
        ]
      );

      await client.query('COMMIT;');
      return await this.getOrderById(orderId);
    } catch (err) {
      await client.query('ROLLBACK;');
      throw err;
    } finally {
      client.release();
    }
  }

  async addOrderFulfilment(
    orderId: string,
    fulfilmentData: Omit<Fulfilment, 'id' | 'orderId' | 'createdAt' | 'updatedAt'>
  ): Promise<Order | null> {
    await this.ensureInitialized();
    const id = toValidUuid();
    const now = new Date().toISOString();

    await this.pool.query(
      `INSERT INTO fulfilments (
        id, order_id, supplier_id, supplier_order_ref, courier_name,
        tracking_number, tracking_url, status, courier_charge_pkr,
        return_charge_pkr, created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12);`,
      [
        id,
        toValidUuid(orderId),
        toValidUuid(fulfilmentData.supplierId),
        fulfilmentData.supplierOrderRef || null,
        fulfilmentData.courierName || null,
        fulfilmentData.trackingNumber || null,
        fulfilmentData.trackingUrl || null,
        fulfilmentData.status || 'assigned',
        fulfilmentData.courierChargePkr || 0,
        fulfilmentData.returnChargePkr || 0,
        now,
        now,
      ]
    );

    // Auto update status if pending
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
    await this.ensureInitialized();
    const now = new Date().toISOString();
    const setClauses: string[] = ['updated_at = $1'];
    const values: any[] = [now];
    let paramIdx = 2;

    if (updates.status !== undefined) {
      setClauses.push(`status = $${paramIdx++}`);
      values.push(updates.status);
    }
    if (updates.courierName !== undefined) {
      setClauses.push(`courier_name = $${paramIdx++}`);
      values.push(updates.courierName);
    }
    if (updates.trackingNumber !== undefined) {
      setClauses.push(`tracking_number = $${paramIdx++}`);
      values.push(updates.trackingNumber);
    }
    if (updates.trackingUrl !== undefined) {
      setClauses.push(`tracking_url = $${paramIdx++}`);
      values.push(updates.trackingUrl);
    }
    if (updates.dispatchedAt !== undefined) {
      setClauses.push(`dispatched_at = $${paramIdx++}`);
      values.push(updates.dispatchedAt);
    }
    if (updates.deliveredAt !== undefined) {
      setClauses.push(`delivered_at = $${paramIdx++}`);
      values.push(updates.deliveredAt);
    }
    if (updates.failureReason !== undefined) {
      setClauses.push(`failure_reason = $${paramIdx++}`);
      values.push(updates.failureReason);
    }
    if (updates.courierChargePkr !== undefined) {
      setClauses.push(`courier_charge_pkr = $${paramIdx++}`);
      values.push(updates.courierChargePkr);
    }
    if (updates.returnChargePkr !== undefined) {
      setClauses.push(`return_charge_pkr = $${paramIdx++}`);
      values.push(updates.returnChargePkr);
    }

    values.push(toValidUuid(fulfilmentId));
    values.push(toValidUuid(orderId));

    const query = `UPDATE fulfilments SET ${setClauses.join(', ')} WHERE id = $${paramIdx++} AND order_id = $${paramIdx++};`;
    await this.pool.query(query, values);

    // Auto synch status
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
    await this.ensureInitialized();
    const id = toValidUuid();
    const now = new Date().toISOString();

    await this.pool.query(
      `INSERT INTO financial_transactions (
        id, order_id, transaction_type, amount_pkr, reference_number, status, notes, created_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8);`,
      [
        id,
        toValidUuid(orderId),
        txnData.transactionType,
        txnData.amountPkr,
        txnData.referenceNumber || null,
        txnData.status || 'completed',
        txnData.notes || null,
        now,
      ]
    );

    if (txnData.transactionType === 'cod_collection' && txnData.status === 'completed') {
      await this.pool.query(
        "UPDATE orders SET payment_status = 'settled', updated_at = $1 WHERE id = $2;",
        [now, toValidUuid(orderId)]
      );
    }

    return this.getOrderById(orderId);
  }

  async addOrderInternalNote(orderId: string, note: string): Promise<Order | null> {
    await this.ensureInitialized();
    const existing = await this.getOrderById(orderId);
    if (!existing) return null;

    const dateStamp = new Date().toLocaleString('en-PK');
    const updatedNotes = existing.internalNotes
      ? `${existing.internalNotes}\n[${dateStamp}] ${note}`
      : `[${dateStamp}] ${note}`;

    await this.pool.query(
      'UPDATE orders SET internal_notes = $1, updated_at = $2 WHERE id = $3;',
      [updatedNotes, new Date().toISOString(), toValidUuid(orderId)]
    );

    return this.getOrderById(orderId);
  }

  // --- Dashboard & Metrics ---
  async getDashboardMetrics(): Promise<DashboardMetrics> {
    await this.ensureInitialized();

    const countsRes = await this.pool.query(`
      SELECT 
        COUNT(*)::int AS total_orders,
        COUNT(CASE WHEN order_status = 'pending_confirmation' THEN 1 END)::int AS pending_confirmation,
        COUNT(CASE WHEN order_status IN ('confirmed', 'processing', 'sent_to_supplier') THEN 1 END)::int AS confirmed_orders,
        COUNT(CASE WHEN order_status = 'dispatched' THEN 1 END)::int AS dispatched_orders,
        COUNT(CASE WHEN order_status = 'delivered' THEN 1 END)::int AS delivered_orders,
        COUNT(CASE WHEN order_status IN ('returned', 'delivery_failed') THEN 1 END)::int AS returned_orders,
        COALESCE(SUM(CASE WHEN order_status = 'delivered' OR payment_status IN ('settled', 'cod_collected') THEN total_payable_pkr ELSE 0 END), 0)::int AS total_revenue_pkr,
        COALESCE(SUM(estimated_profit_pkr), 0)::int AS total_estimated_profit_pkr,
        COALESCE(SUM(actual_profit_pkr), 0)::int AS total_actual_profit_pkr,
        COALESCE(SUM(CASE WHEN order_status IN ('dispatched', 'delivered') AND payment_status != 'settled' THEN total_payable_pkr ELSE 0 END), 0)::int AS unsettled_cod_pkr
      FROM orders;
    `);

    const r = countsRes.rows[0];
    const { orders: recentOrders } = await this.getOrders({ limit: 10 });

    return {
      totalOrders: r.total_orders,
      pendingConfirmation: r.pending_confirmation,
      confirmedOrders: r.confirmed_orders,
      dispatchedOrders: r.dispatched_orders,
      deliveredOrders: r.delivered_orders,
      returnedOrders: r.returned_orders,
      totalRevenuePkr: r.total_revenue_pkr,
      totalEstimatedProfitPkr: r.total_estimated_profit_pkr,
      totalActualProfitPkr: r.total_actual_profit_pkr,
      unsettledCodPkr: r.unsettled_cod_pkr,
      recentOrders,
    };
  }

  // --- Store Settings ---
  async getStoreSettings(): Promise<StoreSettings> {
    await this.ensureInitialized();
    const res = await this.pool.query("SELECT value FROM store_settings WHERE key = 'main_settings';");
    if (res.rows.length === 0) {
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
    const val = res.rows[0].value;
    return typeof val === 'string' ? JSON.parse(val) : val;
  }

  async updateStoreSettings(updates: Partial<StoreSettings>): Promise<StoreSettings> {
    await this.ensureInitialized();
    const current = await this.getStoreSettings();
    const merged: StoreSettings = { ...current, ...updates };

    await this.pool.query(
      `INSERT INTO store_settings (key, value, updated_at)
       VALUES ('main_settings', $1, NOW())
       ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = NOW();`,
      [JSON.stringify(merged)]
    );

    return merged;
  }
}
