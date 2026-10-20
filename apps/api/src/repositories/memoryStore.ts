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
  private categories: Category[] = [
    {
      id: 'c1111111-1111-1111-1111-111111111111',
      name: 'Smart Gadgets & Audio',
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
      name: 'Home & Kitchen Gadgets',
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

  private products: Product[] = [
    {
      id: 'p1111111-1111-1111-1111-111111111111',
      categoryId: 'c1111111-1111-1111-1111-111111111111',
      categoryName: 'Smart Gadgets & Audio',
      categorySlug: 'smart-gadgets',
      name: 'AeroPods Pro Wireless Earbuds with ANC & Deep Bass',
      slug: 'aeropods-pro-wireless-earbuds',
      shortDescription: 'True Wireless Bluetooth 5.3 earbuds with Active Noise Cancellation and 28-hour playtime.',
      description: 'Experience crisp, studio-grade acoustics and rich bass with the AeroPods Pro. Designed for high performance, these wireless earbuds feature smart touch controls, IPX5 water resistance for workouts, low latency gaming mode, and seamless instant pairing with all Android and iPhone devices across Pakistan. Package includes charging case, Type-C cable, and 3 ear tip sizes.',
      basePricePkr: 2999,
      compareAtPricePkr: 4500,
      sku: 'AP-PRO-BLK',
      isActive: true,
      isFeatured: true,
      images: [
        {
          id: 'img-1',
          url: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=800&auto=format&fit=crop&q=80',
          isPrimary: true,
          altText: 'AeroPods Pro Black Charging Case',
        },
        {
          id: 'img-2',
          url: 'https://images.unsplash.com/photo-1606220588913-b3aacb4d2f46?w=800&auto=format&fit=crop&q=80',
          isPrimary: false,
          altText: 'AeroPods In-Ear Close-up',
        },
      ],
      variants: [
        { id: 'v-blk', name: 'Matte Black', sku: 'AP-PRO-BLK', priceDeltaPkr: 0, isAvailable: true },
        { id: 'v-wht', name: 'Glossy White', sku: 'AP-PRO-WHT', priceDeltaPkr: 0, isAvailable: true },
      ],
      supplierOffers: [
        {
          id: 'off-1',
          productId: 'p1111111-1111-1111-1111-111111111111',
          supplierId: 's1111111-1111-1111-1111-111111111111',
          supplierName: 'Shah Alam Wholesale Hub',
          supplierSku: 'SA-EAR-PRO',
          supplierCostPkr: 1650,
          isAvailable: true,
          leadTimeDays: 1,
          notes: 'In stock. Wholesale bulk tier.',
          updatedAt: new Date().toISOString(),
        },
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'p2222222-2222-2222-2222-222222222222',
      categoryId: 'c2222222-2222-2222-2222-222222222222',
      categoryName: 'Home & Kitchen Gadgets',
      categorySlug: 'home-kitchen',
      name: '14-in-1 Multifunction Vegetable & Onion Chopper',
      slug: '14-in-1-multifunction-vegetable-chopper',
      shortDescription: 'Premium stainless-steel blade vegetable chopper with container and hand protector.',
      description: 'Cut meal prep time by 70%. This heavy-duty 14-in-1 kitchen mandoline dicer effortlessly chops onions, potatoes, tomatoes, and vegetables with zero eye irritation. Features 8 interchangeable 420-grade stainless steel blades, large 1.5L BPA-free catch container, drain basket, and ergonomic safety pusher.',
      basePricePkr: 1950,
      compareAtPricePkr: 2800,
      sku: 'KIT-CHOP-14',
      isActive: true,
      isFeatured: true,
      images: [
        {
          id: 'img-3',
          url: 'https://images.unsplash.com/photo-1584990347449-39906f3630f5?w=800&auto=format&fit=crop&q=80',
          isPrimary: true,
          altText: 'Multifunction Vegetable Chopper Kit',
        },
      ],
      variants: [
        { id: 'v-grn', name: 'Classic Forest Green', sku: 'KIT-CHOP-GRN', priceDeltaPkr: 0, isAvailable: true },
        { id: 'v-gry', name: 'Modern Slate Grey', sku: 'KIT-CHOP-GRY', priceDeltaPkr: 0, isAvailable: true },
      ],
      supplierOffers: [
        {
          id: 'off-2',
          productId: 'p2222222-2222-2222-2222-222222222222',
          supplierId: 's2222222-2222-2222-2222-222222222222',
          supplierName: 'Bolton Market Imports',
          supplierSku: 'BM-CHOP-14',
          supplierCostPkr: 1050,
          isAvailable: true,
          leadTimeDays: 2,
          notes: 'Reliable packaging. Boxed with unboxing seal.',
          updatedAt: new Date().toISOString(),
        },
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'p3333333-3333-3333-3333-333333333333',
      categoryId: 'c3333333-3333-3333-3333-333333333333',
      categoryName: 'Personal Care & Grooming',
      categorySlug: 'personal-care',
      name: 'Rechargeable Vintage T9 Hair & Beard Trimmer',
      slug: 'vintage-t9-rechargeable-hair-trimmer',
      shortDescription: 'All-metal cordless zero-gapped precision detailer with USB rechargeable battery.',
      description: 'Engineered for professional barbers and home grooming, the Vintage T9 features a high-torque rotary motor, titanium coated T-blade for ultra-sharp lining, 1200mAh battery providing 180 minutes of runtime, and 4 attachment combs (1.5mm, 2mm, 3mm, 4mm).',
      basePricePkr: 1699,
      compareAtPricePkr: 2400,
      sku: 'TRIM-T9-GOLD',
      isActive: true,
      isFeatured: true,
      images: [
        {
          id: 'img-4',
          url: 'https://images.unsplash.com/photo-1621607512214-68297480165e?w=800&auto=format&fit=crop&q=80',
          isPrimary: true,
          altText: 'Vintage T9 Cordless Trimmer Gold',
        },
      ],
      variants: [
        { id: 'v-gold', name: 'Dragon Gold Edition', sku: 'TRIM-T9-GLD', priceDeltaPkr: 0, isAvailable: true },
        { id: 'v-blk-trim', name: 'Stealth Black Edition', sku: 'TRIM-T9-BLK', priceDeltaPkr: 0, isAvailable: true },
      ],
      supplierOffers: [
        {
          id: 'off-3',
          productId: 'p3333333-3333-3333-3333-333333333333',
          supplierId: 's1111111-1111-1111-1111-111111111111',
          supplierName: 'Shah Alam Wholesale Hub',
          supplierSku: 'SA-TRIM-T9',
          supplierCostPkr: 850,
          isAvailable: true,
          leadTimeDays: 1,
          notes: 'Includes lubricant oil and cleaning brush.',
          updatedAt: new Date().toISOString(),
        },
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'p4444444-4444-4444-4444-444444444444',
      categoryId: 'c1111111-1111-1111-1111-111111111111',
      categoryName: 'Smart Gadgets & Audio',
      categorySlug: 'smart-gadgets',
      name: 'Smart Fitness Tracker Watch with Blood Pressure & Heart Rate',
      slug: 'smart-fitness-tracker-watch',
      shortDescription: 'Waterproof health smartwatch with 1.4-inch HD display, sleep monitor, and WhatsApp call alerts.',
      description: 'Stay on top of your fitness journey with 24/7 pulse tracking, step counter, blood oxygen saturation monitor, sleep analysis, and instant WhatsApp / SMS vibration alerts. Magnetic fast charger included. Up to 7 days standby.',
      basePricePkr: 2499,
      compareAtPricePkr: 3800,
      sku: 'SW-FIT-01',
      isActive: true,
      isFeatured: false,
      images: [
        {
          id: 'img-5',
          url: 'https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?w=800&auto=format&fit=crop&q=80',
          isPrimary: true,
          altText: 'Smartwatch Fitness Tracker',
        },
      ],
      variants: [
        { id: 'v-sw-blk', name: 'Silicone Black Strap', sku: 'SW-FIT-BLK', priceDeltaPkr: 0, isAvailable: true },
        { id: 'v-sw-blu', name: 'Navy Blue Strap', sku: 'SW-FIT-BLU', priceDeltaPkr: 0, isAvailable: true },
      ],
      supplierOffers: [
        {
          id: 'off-4',
          productId: 'p4444444-4444-4444-4444-444444444444',
          supplierId: 's1111111-1111-1111-1111-111111111111',
          supplierName: 'Shah Alam Wholesale Hub',
          supplierSku: 'SA-WATCH-FIT',
          supplierCostPkr: 1350,
          isAvailable: true,
          leadTimeDays: 1,
          notes: 'Ready for dispatch.',
          updatedAt: new Date().toISOString(),
        },
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ];

  private customers: Customer[] = [
    {
      id: 'cust-demo-1',
      name: 'Hamza Khan',
      phone: '03001234567',
      city: 'Lahore',
      deliveryAddress: 'House 42, Block B, Gulberg III, Lahore',
      deliveryInstructions: 'Call before arriving',
      createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    },
    {
      id: 'cust-demo-2',
      name: 'Zainab Ahmed',
      phone: '03219876543',
      city: 'Karachi',
      deliveryAddress: 'Flat 402, Al-Noor Heights, Clifton Block 2, Karachi',
      deliveryInstructions: 'Leave with building security if unavailable',
      createdAt: new Date(Date.now() - 86400000 * 4).toISOString(),
    },
  ];

  private orders: Order[] = [
    {
      id: 'ord-demo-1',
      orderReference: 'ORD-20261017-7A2F',
      trackingToken: 'tr_8f93e21a4',
      customerId: 'cust-demo-1',
      customer: {
        id: 'cust-demo-1',
        name: 'Hamza Khan',
        phone: '03001234567',
        city: 'Lahore',
        deliveryAddress: 'House 42, Block B, Gulberg III, Lahore',
        deliveryInstructions: 'Call before arriving',
        createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
      },
      sourceChannel: 'website',
      orderStatus: 'dispatched',
      paymentMethod: 'cod',
      paymentStatus: 'unpaid',
      subtotalPkr: 2999,
      deliveryChargePkr: 250,
      discountPkr: 0,
      totalPayablePkr: 3249,
      estimatedProfitPkr: 1349, // 3249 - 1650 (supplier cost) - 250 (est courier) = 1349
      actualProfitPkr: 0,
      internalNotes: 'Customer confirmed via phone call. Trax tracking assigned.',
      items: [
        {
          id: 'item-1',
          orderId: 'ord-demo-1',
          productId: 'p1111111-1111-1111-1111-111111111111',
          productSlug: 'aeropods-pro-wireless-earbuds',
          productNameSnapshot: 'AeroPods Pro Wireless Earbuds with ANC & Deep Bass',
          variantSnapshot: { id: 'v-blk', name: 'Matte Black' },
          imageSnapshot: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=800&auto=format&fit=crop&q=80',
          quantity: 1,
          unitPricePkr: 2999,
          supplierCostPkr: 1650,
          totalPricePkr: 2999,
        },
      ],
      fulfilments: [
        {
          id: 'ful-1',
          orderId: 'ord-demo-1',
          supplierId: 's1111111-1111-1111-1111-111111111111',
          supplierName: 'Shah Alam Wholesale Hub',
          supplierOrderRef: 'SA-ORD-902',
          courierName: 'Trax Logistics',
          trackingNumber: 'TRX78291039PK',
          trackingUrl: 'https://trax.pk/tracking?cn=TRX78291039PK',
          status: 'dispatched',
          dispatchedAt: new Date(Date.now() - 86400000).toISOString(),
          courierChargePkr: 240,
          returnChargePkr: 0,
          createdAt: new Date(Date.now() - 86400000).toISOString(),
          updatedAt: new Date(Date.now() - 86400000).toISOString(),
        },
      ],
      statusHistory: [
        {
          id: 'hist-1',
          orderId: 'ord-demo-1',
          previousStatus: null,
          newStatus: 'pending_confirmation',
          actorName: 'Website Customer',
          notes: 'Customer submitted COD order on website',
          createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
        },
        {
          id: 'hist-2',
          orderId: 'ord-demo-1',
          previousStatus: 'pending_confirmation',
          newStatus: 'confirmed',
          actorName: 'Store Owner',
          notes: 'Address verified by phone call',
          createdAt: new Date(Date.now() - 86400000 * 1.5).toISOString(),
        },
        {
          id: 'hist-3',
          orderId: 'ord-demo-1',
          previousStatus: 'confirmed',
          newStatus: 'dispatched',
          actorName: 'Store Owner',
          notes: 'Dispatched via Trax CN TRX78291039PK',
          createdAt: new Date(Date.now() - 86400000).toISOString(),
        },
      ],
      transactions: [],
      createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
      updatedAt: new Date(Date.now() - 86400000).toISOString(),
    },
    {
      id: 'ord-demo-2',
      orderReference: 'ORD-20261015-3B9X',
      trackingToken: 'tr_2c71a93e1',
      customerId: 'cust-demo-2',
      customer: {
        id: 'cust-demo-2',
        name: 'Zainab Ahmed',
        phone: '03219876543',
        city: 'Karachi',
        deliveryAddress: 'Flat 402, Al-Noor Heights, Clifton Block 2, Karachi',
        deliveryInstructions: 'Leave with building security if unavailable',
        createdAt: new Date(Date.now() - 86400000 * 4).toISOString(),
      },
      sourceChannel: 'whatsapp',
      orderStatus: 'delivered',
      paymentMethod: 'cod',
      paymentStatus: 'settled',
      subtotalPkr: 1950,
      deliveryChargePkr: 250,
      discountPkr: 0,
      totalPayablePkr: 2200,
      estimatedProfitPkr: 900,
      actualProfitPkr: 920, // 2200 collected - 1050 supplier - 230 courier = 920
      internalNotes: 'Order received via WhatsApp inquiry and confirmed immediately.',
      items: [
        {
          id: 'item-2',
          orderId: 'ord-demo-2',
          productId: 'p2222222-2222-2222-2222-222222222222',
          productSlug: '14-in-1-multifunction-vegetable-chopper',
          productNameSnapshot: '14-in-1 Multifunction Vegetable & Onion Chopper',
          variantSnapshot: { id: 'v-grn', name: 'Classic Forest Green' },
          imageSnapshot: 'https://images.unsplash.com/photo-1584990347449-39906f3630f5?w=800&auto=format&fit=crop&q=80',
          quantity: 1,
          unitPricePkr: 1950,
          supplierCostPkr: 1050,
          totalPricePkr: 1950,
        },
      ],
      fulfilments: [
        {
          id: 'ful-2',
          orderId: 'ord-demo-2',
          supplierId: 's2222222-2222-2222-2222-222222222222',
          supplierName: 'Bolton Market Imports',
          supplierOrderRef: 'BM-ORD-441',
          courierName: 'Leopards Courier',
          trackingNumber: 'LEO4829104PK',
          status: 'delivered',
          dispatchedAt: new Date(Date.now() - 86400000 * 3).toISOString(),
          deliveredAt: new Date(Date.now() - 86400000).toISOString(),
          courierChargePkr: 230,
          returnChargePkr: 0,
          createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
          updatedAt: new Date(Date.now() - 86400000).toISOString(),
        },
      ],
      statusHistory: [
        {
          id: 'hist-2-1',
          orderId: 'ord-demo-2',
          previousStatus: null,
          newStatus: 'pending_confirmation',
          actorName: 'WhatsApp Channel',
          notes: 'Entered manually from WhatsApp chat',
          createdAt: new Date(Date.now() - 86400000 * 4).toISOString(),
        },
        {
          id: 'hist-2-2',
          orderId: 'ord-demo-2',
          previousStatus: 'pending_confirmation',
          newStatus: 'delivered',
          actorName: 'Leopards Courier Webhook/Log',
          notes: 'Customer signed parcel and paid COD Rs. 2,200',
          createdAt: new Date(Date.now() - 86400000).toISOString(),
        },
      ],
      transactions: [
        {
          id: 'txn-1',
          orderId: 'ord-demo-2',
          transactionType: 'cod_collection',
          amountPkr: 2200,
          referenceNumber: 'COD-LEO-48291',
          status: 'completed',
          notes: 'Cash on delivery remitted into bank account',
          createdAt: new Date(Date.now() - 86400000).toISOString(),
        },
        {
          id: 'txn-2',
          orderId: 'ord-demo-2',
          transactionType: 'supplier_payout',
          amountPkr: 1050,
          referenceNumber: 'SUP-BM-091',
          status: 'completed',
          notes: 'Settled with Bolton Market Imports',
          createdAt: new Date(Date.now() - 86400000).toISOString(),
        },
        {
          id: 'txn-3',
          orderId: 'ord-demo-2',
          transactionType: 'courier_fee',
          amountPkr: 230,
          referenceNumber: 'CR-LEO-88',
          status: 'completed',
          notes: 'Leopards delivery charges deducted',
          createdAt: new Date(Date.now() - 86400000).toISOString(),
        },
      ],
      createdAt: new Date(Date.now() - 86400000 * 4).toISOString(),
      updatedAt: new Date(Date.now() - 86400000).toISOString(),
    },
  ];

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
    aboutText: 'BazaarPK Direct is a premier Pakistani dropshipping storefront curating high-utility gadgets, home essentials, and grooming devices with nationwide Cash on Delivery.',
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
    return this.products[idx];
  }

  async deleteProduct(id: string): Promise<boolean> {
    const initialLen = this.products.length;
    this.products = this.products.filter((p) => p.id !== id);
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
      return existing;
    }
    const newCust: Customer = {
      ...data,
      id: `cust-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    this.customers.push(newCust);
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
    return order;
  }

  async addOrderInternalNote(orderId: string, note: string): Promise<Order | null> {
    const order = this.orders.find((o) => o.id === orderId);
    if (!order) return null;
    const existing = order.internalNotes ? `${order.internalNotes}\n` : '';
    const dateStamp = new Date().toLocaleString('en-PK');
    order.internalNotes = `${existing}[${dateStamp}] ${note}`;
    order.updatedAt = new Date().toISOString();
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
    return { ...this.settings };
  }
}

