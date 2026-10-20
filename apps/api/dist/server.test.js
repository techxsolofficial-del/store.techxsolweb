import { test, describe, before } from 'node:test';
import assert from 'node:assert';
import { createApp } from './app.js';
import { generateToken } from './middleware/auth.js';
import { formatPkr, normalizePakistanPhone, buildWhatsAppOrderLink, } from '@dropship/shared';
describe('Dropshipping Ecommerce Platform Test Suite', () => {
    let app;
    let server;
    let baseUrl;
    let adminToken;
    before(async () => {
        app = createApp();
        await new Promise((resolve) => {
            server = app.listen(0, () => {
                const addr = server.address();
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
        const body = await res.json();
        assert.strictEqual(body.status, 'healthy');
    });
    test('Public API: GET /api/products returns catalog with active products', async () => {
        const res = await fetch(`${baseUrl}/api/products`);
        assert.strictEqual(res.status, 200);
        const body = await res.json();
        assert.ok(body.success);
        assert.ok(Array.isArray(body.data));
        assert.ok(body.data.length >= 3);
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
                    productId: 'p1111111-1111-1111-1111-111111111111',
                    variantId: 'v-blk',
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
        const body = await res.json();
        assert.ok(body.success);
        assert.ok(body.data.orderReference.startsWith('ORD-'));
        assert.strictEqual(body.data.subtotalPkr, 2999);
        assert.strictEqual(body.data.totalPayablePkr, 2999 + 250); // 3249 with standard delivery
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
                    productId: 'p1111111-1111-1111-1111-111111111111',
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
        const body = await res.json();
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
        const body = await res.json();
        assert.ok(body.success);
        assert.ok(typeof body.data.totalOrders === 'number');
    });
    test('Admin API: Transition order status to confirmed and assign supplier fulfilment', async () => {
        // 1. Update status to confirmed
        const statusRes = await fetch(`${baseUrl}/api/admin/orders/ord-demo-1/status`, {
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
        const fulRes = await fetch(`${baseUrl}/api/admin/orders/ord-demo-1/fulfilments`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${adminToken}`,
            },
            body: JSON.stringify({
                supplierId: 's1111111-1111-1111-1111-111111111111',
                courierName: 'Trax Logistics',
                trackingNumber: 'TRX998877PK',
                courierChargePkr: 250,
            }),
        });
        assert.strictEqual(fulRes.status, 200);
    });
});
//# sourceMappingURL=server.test.js.map