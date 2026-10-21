import { Router } from 'express';
import { PublicController } from '../controllers/publicController.js';
import { validateRequest } from '../middleware/validate.js';
import { createOrderSchema } from '@dropship/shared';
import { getDataStore } from '../repositories/index.js';
import rateLimit from 'express-rate-limit';

const router = Router();

// Rate limiter for checkout to protect against spam bots
const orderLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // Max 20 checkout attempts per IP per 15 min
  message: {
    success: false,
    error: {
      code: 'TOO_MANY_REQUESTS',
      message: 'Too many order requests from this IP. Please wait a few minutes before trying again.',
    },
  },
});

router.get('/health', async (_req, res) => {
  try {
    const store = getDataStore();
    const prods = await store.getProducts({ activeOnly: false });
    const cats = await store.getCategories(false);
    const orders = await store.getOrders();
    res.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      service: 'Dropship Pakistan API',
      version: '1.0.0',
      stats: {
        productsCount: prods.total,
        categoriesCount: cats.length,
        ordersCount: orders.total,
      },
    });
  } catch (e: any) {
    res.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      service: 'Dropship Pakistan API',
      version: '1.0.0',
      error: e.message,
    });
  }
});

router.get('/settings/public', PublicController.getPublicSettings);
router.get('/categories', PublicController.getCategories);
router.get('/products', PublicController.getProducts);
router.get('/products/:slug', PublicController.getProductBySlug);
router.post('/orders', orderLimiter, validateRequest(createOrderSchema), PublicController.createOrder);
router.get('/orders/track/:reference', PublicController.trackOrder);

export default router;

