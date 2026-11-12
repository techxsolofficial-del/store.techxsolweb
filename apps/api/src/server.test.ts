import { test, describe, before, after } from 'node:test';
import assert from 'node:assert';
import { createApp } from './app.js';
import { Express } from 'express';
import { generateToken } from './middleware/auth.js';
import {
  formatPkr,
  normalizePakistanPhone,
  buildWhatsAppOrderLink,
} from '@dropship/shared';
import http from 'http';

describe('Dropshipping Ecommerce Platform Test Suite', () => {
  let app: Express;
  let server: http.Server;
  let baseUrl: string;
  let adminToken: string;
  let testProductId: string;
  let testOrderId: string;

  before(async () => {
    app = createApp();
    await new Promise<void>((resolve) => {
      server = app.listen(0, () => {
        const addr = server.address() as any;
        baseUrl = `http://localhost:${addr.port}`;
        resolve();
      });
    });

    adminToken = generateToken({
      id: 'test-admin',
      email: 'admin@bazaarpk.com',
      displayName: 'Admin User',
      role: 'admin',
    });
  });

  after(async () => {
    if (server) {
      await new Promise<void>((resolve) => {
        server.close(() => resolve());
      });
    }
  });

  test('Utility: Currency formatting in PKR', () => {
    assert.strictEqual(formatPkr(2500), 'Rs. 2,500');
    assert.strictEqual(formatPkr(0), 'Rs. 0');
  });

  test('Utility: Pakistani phone number normalization', () => {
    assert.strictEqual(normalizePakistanPhone('0300-1234567', 'local'), '03001234567');
    assert.strictEqual(normalizePakistanPhone('+92 321 9876543', 'local'), '03219876543');
    assert.strictEqual(normalizePakistanPhone('03001234567', 'international'), '923001234567');
  });

  test('Utility: WhatsApp Click-to-Chat Order Link Builder', () => {
    const link = buildWhatsAppOrderLink({
      businessPhone: '03001234567',
      items: [{ name: 'AeroPods Pro', quantity: 2, unitPricePkr: 2999 }],
      subtotalPkr: 5998,
      deliveryChargePkr: 0,
      totalPkr: 5998,
      customerName: 'Ali Raza',
      city: 'Islamabad',
    });

    assert.ok(link.startsWith('https://wa.me/923001234567?text='));
    assert.ok(decodeURIComponent(link).includes('AeroPods Pro'));
    assert.ok(decodeURIComponent(link).includes('Rs. 5,998'));
  });

  test('Public API: GET /api/health', async () => {
    const res = await fetch(`${baseUrl}/api/health`);
    assert.strictEqual(res.status, 200);
    const body = (await res.json()) as any;
    assert.strictEqual(body.status, 'healthy');
  });

  test('Admin API: Create Product persists with unique ID and appears in catalog', async () => {
    // 1. Fetch categories to get a valid categoryId
    const catRes = await fetch(`${baseUrl}/api/categories`);
    const catBody = (await catRes.json()) as any;
    const categoryId = catBody.data[0]?.id || 'c1111111-1111-1111-1111-111111111111';

    // 2. Create product via Admin API
    const newProduct = {
      categoryId,
      name: 'Wireless Bluetooth Earbuds Pro 2',
      slug: `earbuds-pro-2-${Date.now()}`,
      shortDescription: 'High quality ANC wireless earbuds with premium audio.',
      description: 'Long battery life, water resistant, deep bass sound designed for daily commute.',
      basePricePkr: 2499,
      compareAtPricePkr: 3499,
      sku: `EB-TEST-${Date.now().toString().slice(-4)}`,
      isActive: true,
      isFeatured: true,
      images: [
        {
          id: 'img-1',
          url: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=800',
          isPrimary: true,
        },
      ],
      variants: [],
      supplierOffers: [
        {
          supplierId: 'b1111111-1111-4111-a111-111111111111',
          supplierSku: 'SUP-EB-01',
          supplierCostPkr: 1400,
          isAvailable: true,
          leadTimeDays: 1,
        },
      ],
    };

    const res = await fetch(`${baseUrl}/api/admin/products`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify(newProduct),
    });

    assert.strictEqual(res.status, 201);
    const body = (await res.json()) as any;
    assert.ok(body.success);
    assert.ok(body.data.id);
    testProductId = body.data.id;
    assert.strictEqual(body.data.name, newProduct.name);
  });

  test('Public API: GET /api/products returns catalog with the newly created product', async () => {
    const res = await fetch(`${baseUrl}/api/products`);
    assert.strictEqual(res.status, 200);
    const body = (await res.json()) as any;
    assert.ok(body.success);
    assert.ok(Array.isArray(body.data));
    const found = body.data.find((p: any) => p.id === testProductId);
    assert.ok(found, 'Created product must be present in public catalog');
  });

  test('Public API: POST /api/orders validates customer details and recalculates server-side total', async () => {
    const orderPayload = {
      customer: {
        name: 'Saad Farooq',
        phone: '0333 5556677',
        city: 'Rawalpindi',
        deliveryAddress: 'House 18, Street 4, Satellite Town',
      },
      items: [
        {
          productId: testProductId,
          quantity: 1,
        },
      ],
      sourceChannel: 'website',
    };

    const res = await fetch(`${baseUrl}/api/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(orderPayload),
    });

    assert.strictEqual(res.status, 201);
    const body = (await res.json()) as any;
    assert.ok(body.success);
    assert.ok(body.data.orderReference.startsWith('ORD-'));
    assert.strictEqual(body.data.subtotalPkr, 2499);
    assert.strictEqual(body.data.totalPayablePkr, 2499 + 250); // 2749 with standard delivery
    testOrderId = body.data.id;
  });

  test('Public API: POST /api/orders rejects invalid Pakistani phone number', async () => {
    const invalidPayload = {
      customer: {
        name: 'Test Name',
        phone: '12345', // invalid
        city: 'Lahore',
        deliveryAddress: 'Test Address 123',
      },
      items: [
        {
          productId: testProductId,
          quantity: 1,
        },
      ],
    };

    const res = await fetch(`${baseUrl}/api/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(invalidPayload),
    });

    assert.strictEqual(res.status, 400);
    const body = (await res.json()) as any;
    assert.strictEqual(body.success, false);
    assert.strictEqual(body.error.code, 'VALIDATION_ERROR');
  });

  test('Security: Admin endpoints reject requests without token', async () => {
    const res = await fetch(`${baseUrl}/api/admin/dashboard`);
    assert.strictEqual(res.status, 401);
  });

  test('Admin API: Access allowed with valid token and returns dashboard metrics', async () => {
    const res = await fetch(`${baseUrl}/api/admin/dashboard`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    assert.strictEqual(res.status, 200);
    const body = (await res.json()) as any;
    assert.ok(body.success);
    assert.ok(typeof body.data.totalOrders === 'number');
  });

  test('Admin API: Transition order status to confirmed and assign supplier fulfilment', async () => {
    // 1. Update status to confirmed
    const statusRes = await fetch(`${baseUrl}/api/admin/orders/${testOrderId}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        status: 'confirmed',
        notes: 'Customer verified order details',
      }),
    });
    assert.strictEqual(statusRes.status, 200);

    // 2. Assign fulfilment
    const fulRes = await fetch(`${baseUrl}/api/admin/orders/${testOrderId}/fulfilments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        supplierId: 'b1111111-1111-4111-a111-111111111111',
        courierName: 'Trax Logistics',
        trackingNumber: 'TRX998877PK',
        courierChargePkr: 250,
      }),
    });
    assert.strictEqual(fulRes.status, 200);
  });

  test('Admin API: Edit product changes price and details permanently', async () => {
    const updatePayload = {
      name: 'Wireless Bluetooth Earbuds Pro 2 (Updated Edition)',
      basePricePkr: 2999,
    };

    const res = await fetch(`${baseUrl}/api/admin/products/${testProductId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify(updatePayload),
    });

    assert.strictEqual(res.status, 200);
    const body = (await res.json()) as any;
    assert.ok(body.success);
    assert.strictEqual(body.data.name, updatePayload.name);
    assert.strictEqual(body.data.basePricePkr, 2999);
  });

  test('Admin API: Delete product removes only selected product', async () => {
    const res = await fetch(`${baseUrl}/api/admin/products/${testProductId}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${adminToken}`,
      },
    });

    assert.strictEqual(res.status, 200);

    // Verify product no longer appears in public storefront
    const pubRes = await fetch(`${baseUrl}/api/products`);
    const pubBody = (await pubRes.json()) as any;
    const found = pubBody.data.find((p: any) => p.id === testProductId);
    assert.strictEqual(found, undefined, 'Deleted product must not appear publicly');
  });
});
