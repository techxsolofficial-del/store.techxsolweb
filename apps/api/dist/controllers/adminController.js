import { getDataStore } from '../repositories/index.js';
import { generateToken } from '../middleware/auth.js';
import { config } from '../config/index.js';
export class AdminController {
    // Admin Authentication
    static async login(req, res, next) {
        try {
            const { email, password } = req.body;
            // In production with Supabase Auth, verify with Supabase.
            // Here verify against configured admin credentials.
            if (email === config.adminDefault.email && password === config.adminDefault.password) {
                const token = generateToken({
                    id: 'admin-primary-1',
                    email,
                    displayName: config.adminDefault.displayName,
                    role: 'admin',
                });
                res.json({
                    success: true,
                    data: {
                        token,
                        user: {
                            id: 'admin-primary-1',
                            email,
                            displayName: config.adminDefault.displayName,
                            role: 'admin',
                        },
                    },
                });
                return;
            }
            res.status(401).json({
                success: false,
                error: {
                    code: 'INVALID_CREDENTIALS',
                    message: 'Invalid email or password.',
                },
            });
        }
        catch (err) {
            next(err);
        }
    }
    static async verifySession(req, res) {
        res.json({
            success: true,
            data: req.user,
        });
    }
    // Dashboard Metrics
    static async getDashboard(_req, res, next) {
        try {
            const store = getDataStore();
            const metrics = await store.getDashboardMetrics();
            res.json({
                success: true,
                data: metrics,
            });
        }
        catch (err) {
            next(err);
        }
    }
    // Products Management
    static async getProducts(req, res, next) {
        try {
            const store = getDataStore();
            const { search, category, page = '1', limit = '50' } = req.query;
            const { products, total } = await store.getProducts({
                search: search,
                categoryId: category,
                page: parseInt(page, 10),
                limit: parseInt(limit, 10),
                activeOnly: false,
            });
            res.json({
                success: true,
                data: products,
                pagination: { total, page: parseInt(page, 10), limit: parseInt(limit, 10) },
            });
        }
        catch (err) {
            next(err);
        }
    }
    static async createProduct(req, res, next) {
        try {
            const store = getDataStore();
            const input = req.body;
            const created = await store.createProduct(input);
            res.status(201).json({
                success: true,
                data: created,
                message: 'Product created successfully',
            });
        }
        catch (err) {
            next(err);
        }
    }
    static async updateProduct(req, res, next) {
        try {
            const store = getDataStore();
            const id = String(req.params.id);
            const updated = await store.updateProduct(id, req.body);
            if (!updated) {
                res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Product not found' } });
                return;
            }
            res.json({ success: true, data: updated, message: 'Product updated successfully' });
        }
        catch (err) {
            next(err);
        }
    }
    static async deleteProduct(req, res, next) {
        try {
            const store = getDataStore();
            const id = String(req.params.id);
            const success = await store.deleteProduct(id);
            if (!success) {
                res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Product not found' } });
                return;
            }
            res.json({ success: true, message: 'Product deleted successfully' });
        }
        catch (err) {
            next(err);
        }
    }
    // Categories Management
    static async getCategories(_req, res, next) {
        try {
            const store = getDataStore();
            const categories = await store.getCategories(false);
            res.json({ success: true, data: categories });
        }
        catch (err) {
            next(err);
        }
    }
    static async createCategory(req, res, next) {
        try {
            const store = getDataStore();
            const input = req.body;
            const created = await store.createCategory(input);
            res.status(201).json({ success: true, data: created, message: 'Category created' });
        }
        catch (err) {
            next(err);
        }
    }
    static async updateCategory(req, res, next) {
        try {
            const store = getDataStore();
            const id = String(req.params.id);
            const updated = await store.updateCategory(id, req.body);
            if (!updated) {
                res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Category not found' } });
                return;
            }
            res.json({ success: true, data: updated, message: 'Category updated' });
        }
        catch (err) {
            next(err);
        }
    }
    // Suppliers Management
    static async getSuppliers(_req, res, next) {
        try {
            const store = getDataStore();
            const suppliers = await store.getSuppliers(false);
            res.json({ success: true, data: suppliers });
        }
        catch (err) {
            next(err);
        }
    }
    static async createSupplier(req, res, next) {
        try {
            const store = getDataStore();
            const input = req.body;
            const created = await store.createSupplier(input);
            res.status(201).json({ success: true, data: created, message: 'Supplier created' });
        }
        catch (err) {
            next(err);
        }
    }
    static async updateSupplier(req, res, next) {
        try {
            const store = getDataStore();
            const id = String(req.params.id);
            const updated = await store.updateSupplier(id, req.body);
            if (!updated) {
                res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Supplier not found' } });
                return;
            }
            res.json({ success: true, data: updated, message: 'Supplier updated' });
        }
        catch (err) {
            next(err);
        }
    }
    // Orders Management
    static async getOrders(req, res, next) {
        try {
            const store = getDataStore();
            const { status, paymentStatus, channel, city, search, page = '1', limit = '30' } = req.query;
            const pageNum = parseInt(page, 10) || 1;
            const limitNum = parseInt(limit, 10) || 30;
            const { orders, total } = await store.getOrders({
                status: status,
                paymentStatus: paymentStatus,
                channel: channel,
                city: city,
                search: search,
                page: pageNum,
                limit: limitNum,
            });
            res.json({
                success: true,
                data: orders,
                pagination: {
                    page: pageNum,
                    limit: limitNum,
                    total,
                    totalPages: Math.ceil(total / limitNum),
                },
            });
        }
        catch (err) {
            next(err);
        }
    }
    static async getOrderById(req, res, next) {
        try {
            const store = getDataStore();
            const id = String(req.params.id);
            const order = await store.getOrderById(id);
            if (!order) {
                res.status(404).json({
                    success: false,
                    error: { code: 'ORDER_NOT_FOUND', message: 'Order not found' },
                });
                return;
            }
            res.json({ success: true, data: order });
        }
        catch (err) {
            next(err);
        }
    }
    static async updateOrderStatus(req, res, next) {
        try {
            const store = getDataStore();
            const id = String(req.params.id);
            const { status, paymentStatus, reason, notes } = req.body;
            const updated = await store.updateOrderStatus(id, status, paymentStatus, reason || notes, req.user?.id, req.user?.displayName);
            if (!updated) {
                res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Order not found' } });
                return;
            }
            res.json({ success: true, data: updated, message: 'Order status updated' });
        }
        catch (err) {
            next(err);
        }
    }
    static async addOrderNote(req, res, next) {
        try {
            const store = getDataStore();
            const id = String(req.params.id);
            const { note } = req.body;
            if (!note || typeof note !== 'string') {
                res.status(400).json({ success: false, error: { code: 'NOTE_REQUIRED', message: 'Note text is required' } });
                return;
            }
            const updated = await store.addOrderInternalNote(id, note);
            if (!updated) {
                res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Order not found' } });
                return;
            }
            res.json({ success: true, data: updated, message: 'Note added to order' });
        }
        catch (err) {
            next(err);
        }
    }
    static async addFulfilment(req, res, next) {
        try {
            const store = getDataStore();
            const id = String(req.params.id);
            const input = req.body;
            const updated = await store.addOrderFulfilment(id, {
                supplierId: input.supplierId,
                supplierOrderRef: input.supplierOrderRef,
                courierName: input.courierName,
                trackingNumber: input.trackingNumber,
                trackingUrl: input.trackingUrl,
                status: 'assigned',
                courierChargePkr: input.courierChargePkr || 0,
                returnChargePkr: 0,
            });
            if (!updated) {
                res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Order not found' } });
                return;
            }
            res.json({ success: true, data: updated, message: 'Fulfilment assigned' });
        }
        catch (err) {
            next(err);
        }
    }
    static async updateFulfilment(req, res, next) {
        try {
            const store = getDataStore();
            const id = String(req.params.id);
            const fulfilmentId = String(req.params.fulfilmentId);
            const input = req.body;
            const updated = await store.updateOrderFulfilment(id, fulfilmentId, input);
            if (!updated) {
                res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Order or fulfilment not found' } });
                return;
            }
            res.json({ success: true, data: updated, message: 'Fulfilment updated' });
        }
        catch (err) {
            next(err);
        }
    }
    static async addFinancialTransaction(req, res, next) {
        try {
            const store = getDataStore();
            const id = String(req.params.id);
            const input = req.body;
            const updated = await store.addFinancialTransaction(id, input);
            if (!updated) {
                res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Order not found' } });
                return;
            }
            res.json({ success: true, data: updated, message: 'Financial transaction recorded' });
        }
        catch (err) {
            next(err);
        }
    }
    // Reports
    static async getReports(_req, res, next) {
        try {
            const store = getDataStore();
            const { orders } = await store.getOrders({ limit: 1000 });
            const channelBreakdown = {
                website: orders.filter((o) => o.sourceChannel === 'website').length,
                whatsapp: orders.filter((o) => o.sourceChannel === 'whatsapp').length,
            };
            const statusBreakdown = {};
            let totalCollected = 0;
            let totalEstimatedProfit = 0;
            let totalActualProfit = 0;
            orders.forEach((o) => {
                statusBreakdown[o.orderStatus] = (statusBreakdown[o.orderStatus] || 0) + 1;
                totalEstimatedProfit += o.estimatedProfitPkr || 0;
                totalActualProfit += o.actualProfitPkr || 0;
                if (o.paymentStatus === 'settled' || o.paymentStatus === 'cod_collected') {
                    totalCollected += o.totalPayablePkr;
                }
            });
            res.json({
                success: true,
                data: {
                    channelBreakdown,
                    statusBreakdown,
                    financials: {
                        totalCollectedPkr: totalCollected,
                        totalEstimatedProfitPkr: totalEstimatedProfit,
                        totalActualProfitPkr: totalActualProfit,
                    },
                },
            });
        }
        catch (err) {
            next(err);
        }
    }
    // Settings
    static async getSettings(_req, res, next) {
        try {
            const store = getDataStore();
            const settings = await store.getStoreSettings();
            res.json({ success: true, data: settings });
        }
        catch (err) {
            next(err);
        }
    }
    static async updateSettings(req, res, next) {
        try {
            const store = getDataStore();
            const input = req.body;
            const updated = await store.updateStoreSettings(input);
            res.json({ success: true, data: updated, message: 'Settings saved successfully' });
        }
        catch (err) {
            next(err);
        }
    }
}
//# sourceMappingURL=adminController.js.map