import { Request, Response, NextFunction } from 'express';
import {
  CreateOrderInput,
  TrackOrderInput,
  generateOrderReference,
  normalizePakistanPhone,
  maskPhoneNumber,
  maskAddress,
  ORDER_STATUS_LABELS,
  PAYMENT_STATUS_LABELS,
  OrderItem,
  Order,
  PublicOrderTrackingResult,
} from '@dropship/shared';
import { getDataStore } from '../repositories/index.js';
import crypto from 'crypto';

// In-memory idempotency cache for duplicate request prevention
const idempotencyCache = new Map<string, { response: any; timestamp: number }>();

export class PublicController {
  static async getPublicSettings(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const store = getDataStore();
      const settings = await store.getStoreSettings();
      res.json({
        success: true,
        data: settings,
      });
    } catch (err) {
      next(err);
    }
  }

  static async getCategories(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const store = getDataStore();
      const categories = await store.getCategories(true);
      res.json({
        success: true,
        data: categories,
      });
    } catch (err) {
      next(err);
    }
  }

  static async getProducts(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const store = getDataStore();
      const {
        category,
        search,
        featured,
        sort,
        page = '1',
        limit = '20',
      } = req.query;

      const pageNum = Math.max(1, parseInt(page as string, 10) || 1);
      const limitNum = Math.min(50, Math.max(1, parseInt(limit as string, 10) || 20));

      const { products, total } = await store.getProducts({
        categorySlug: category as string,
        search: search as string,
        featured: featured === 'true',
        sortBy: sort as any,
        page: pageNum,
        limit: limitNum,
        activeOnly: true,
      });

      res.json({
        success: true,
        data: products,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          totalPages: Math.ceil(total / limitNum),
        },
      });
    } catch (err) {
      next(err);
    }
  }

  static async getProductBySlug(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const store = getDataStore();
      const slug = String(req.params.slug);
      const product = await store.getProductBySlug(slug);

      if (!product || !product.isActive) {
        res.status(404).json({
          success: false,
          error: {
            code: 'PRODUCT_NOT_FOUND',
            message: 'The requested product is not available or has been unlisted.',
          },
        });
        return;
      }

      res.json({
        success: true,
        data: product,
      });
    } catch (err) {
      next(err);
    }
  }

  static async createOrder(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const idempotencyKey = req.headers['x-idempotency-key'] as string;
      if (idempotencyKey && idempotencyCache.has(idempotencyKey)) {
        const cached = idempotencyCache.get(idempotencyKey)!;
        if (Date.now() - cached.timestamp < 1000 * 60 * 10) {
          res.status(200).json(cached.response);
          return;
        }
      }

      const input = req.body as CreateOrderInput;
      const store = getDataStore();
      const settings = await store.getStoreSettings();

      // 1. Process customer
      const normalizedPhone = normalizePakistanPhone(input.customer.phone, 'local');
      const customer = await store.findOrCreateCustomer({
        name: input.customer.name.trim(),
        phone: normalizedPhone,
        alternatePhone: input.customer.alternatePhone ? normalizePakistanPhone(input.customer.alternatePhone, 'local') : undefined,
        city: input.customer.city.trim(),
        deliveryAddress: input.customer.deliveryAddress.trim(),
        deliveryInstructions: input.customer.deliveryInstructions?.trim(),
      });

      // 2. Server-Side Price & Product Verification (Zero Client Trust)
      let calculatedSubtotal = 0;
      let calculatedSupplierCost = 0;
      const orderItems: OrderItem[] = [];

      for (const itemInput of input.items) {
        const product = await store.getProductById(itemInput.productId);
        if (!product || !product.isActive) {
          res.status(400).json({
            success: false,
            error: {
              code: 'PRODUCT_UNAVAILABLE',
              message: `One or more products in your cart are currently out of stock or unavailable.`,
            },
          });
          return;
        }

        let unitPrice = product.basePricePkr;
        let variantSnapshot: { id: string; name: string } | null = null;
        let supplierCost = 0;

        // Check if primary supplier offer exists
        if (product.supplierOffers && product.supplierOffers.length > 0) {
          const availableOffer = product.supplierOffers.find((o) => o.isAvailable) || product.supplierOffers[0];
          supplierCost = availableOffer.supplierCostPkr;
        }

        if (itemInput.variantId && product.variants?.length > 0) {
          const variant = product.variants.find((v) => v.id === itemInput.variantId);
          if (variant && variant.isAvailable) {
            unitPrice += variant.priceDeltaPkr || 0;
            if (variant.supplierCostDeltaPkr) supplierCost += variant.supplierCostDeltaPkr;
            variantSnapshot = { id: variant.id, name: variant.name };
          }
        }

        const totalPrice = unitPrice * itemInput.quantity;
        calculatedSubtotal += totalPrice;
        calculatedSupplierCost += supplierCost * itemInput.quantity;

        const primaryImg = product.images.find((i) => i.isPrimary)?.url || product.images[0]?.url;

        orderItems.push({
          id: `item-${crypto.randomUUID()}`,
          orderId: '', // set below
          productId: product.id,
          productSlug: product.slug,
          productNameSnapshot: product.name,
          variantSnapshot,
          imageSnapshot: primaryImg,
          quantity: itemInput.quantity,
          unitPricePkr: unitPrice,
          supplierCostPkr: supplierCost,
          totalPricePkr: totalPrice,
        });
      }

      // 3. Server-side delivery charge computation
      let deliveryCharge = settings.defaultDeliveryChargePkr;
      if (settings.freeDeliveryThresholdPkr > 0 && calculatedSubtotal >= settings.freeDeliveryThresholdPkr) {
        deliveryCharge = 0;
      }

      const totalPayable = calculatedSubtotal + deliveryCharge;
      const estimatedProfit = totalPayable - calculatedSupplierCost - (deliveryCharge > 0 ? deliveryCharge : settings.defaultDeliveryChargePkr);

      // 4. Generate unique, non-guessable identifiers
      const orderReference = generateOrderReference();
      const trackingToken = `trk_${crypto.randomBytes(8).toString('hex')}`;

      // 5. Create Order
      const newOrder: Omit<Order, 'id' | 'createdAt' | 'updatedAt'> = {
        orderReference,
        trackingToken,
        customerId: customer.id,
        customer,
        sourceChannel: input.sourceChannel || 'website',
        orderStatus: 'pending_confirmation',
        paymentMethod: 'cod',
        paymentStatus: 'unpaid',
        subtotalPkr: calculatedSubtotal,
        deliveryChargePkr: deliveryCharge,
        discountPkr: 0,
        totalPayablePkr: totalPayable,
        estimatedProfitPkr: Math.max(0, estimatedProfit),
        actualProfitPkr: 0,
        internalNotes: `Web COD submission. Contact customer at ${customer.phone} to confirm dispatch.`,
        items: orderItems,
        fulfilments: [],
        statusHistory: [
          {
            id: `hist-${Date.now()}`,
            orderId: '',
            previousStatus: null,
            newStatus: 'pending_confirmation',
            actorName: 'Website Customer',
            notes: 'Order submitted via Cash on Delivery',
            createdAt: new Date().toISOString(),
          },
        ],
        transactions: [],
      };

      const createdOrder = await store.createOrder(newOrder);

      const responsePayload = {
        success: true,
        data: {
          orderReference: createdOrder.orderReference,
          trackingToken: createdOrder.trackingToken,
          totalPayablePkr: createdOrder.totalPayablePkr,
          deliveryChargePkr: createdOrder.deliveryChargePkr,
          subtotalPkr: createdOrder.subtotalPkr,
          customerName: customer.name,
          customerPhone: customer.phone,
          city: customer.city,
          deliveryAddress: customer.deliveryAddress,
          itemCount: orderItems.length,
          orderStatus: createdOrder.orderStatus,
          orderStatusLabel: ORDER_STATUS_LABELS[createdOrder.orderStatus],
          paymentStatusLabel: PAYMENT_STATUS_LABELS[createdOrder.paymentStatus],
          estimatedDeliveryDays: settings.estimatedDeliveryDays,
          whatsappSupportNumber: settings.whatsappNumber,
        },
        message: 'Your Cash on Delivery order has been placed successfully! Our team will call you shortly to confirm delivery.',
      };

      if (idempotencyKey) {
        idempotencyCache.set(idempotencyKey, { response: responsePayload, timestamp: Date.now() });
      }

      res.status(201).json(responsePayload);
    } catch (err) {
      next(err);
    }
  }

  static async trackOrder(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const reference = String(req.params.reference);
      const phoneQuery = (req.query.phone as string) || '';

      if (!phoneQuery) {
        res.status(400).json({
          success: false,
          error: {
            code: 'PHONE_VERIFICATION_REQUIRED',
            message: 'Please provide the Pakistani mobile number associated with this order for security verification.',
          },
        });
        return;
      }

      const store = getDataStore();
      const order = await store.getOrderByReference(reference);

      if (!order || !order.customer) {
        res.status(404).json({
          success: false,
          error: {
            code: 'ORDER_NOT_FOUND',
            message: 'No order found matching the provided order reference and phone number.',
          },
        });
        return;
      }

      // Normalize and verify phone number matches
      const reqPhoneNorm = normalizePakistanPhone(phoneQuery, 'local');
      const orderPhoneNorm = normalizePakistanPhone(order.customer.phone, 'local');

      if (reqPhoneNorm !== orderPhoneNorm) {
        res.status(403).json({
          success: false,
          error: {
            code: 'VERIFICATION_FAILED',
            message: 'The mobile number does not match the records for this order reference.',
          },
        });
        return;
      }

      // Format safe, redacted public tracking result
      const activeFulfilment = order.fulfilments?.[0];

      const trackingResult: PublicOrderTrackingResult = {
        orderReference: order.orderReference,
        orderStatus: order.orderStatus,
        orderStatusLabel: ORDER_STATUS_LABELS[order.orderStatus],
        paymentStatus: order.paymentStatus,
        paymentStatusLabel: PAYMENT_STATUS_LABELS[order.paymentStatus],
        createdAt: order.createdAt,
        city: order.customer.city,
        maskedPhone: maskPhoneNumber(order.customer.phone),
        maskedAddress: maskAddress(order.customer.deliveryAddress, order.customer.city),
        itemCount: order.items.reduce((sum, item) => sum + item.quantity, 0),
        totalPayablePkr: order.totalPayablePkr,
        courierName: activeFulfilment?.courierName,
        trackingNumber: activeFulfilment?.trackingNumber,
        estimatedDelivery: '2 to 4 business days',
        timeline: (order.statusHistory || []).map((h) => ({
          status: h.newStatus,
          label: ORDER_STATUS_LABELS[h.newStatus] || h.newStatus,
          timestamp: h.createdAt,
          note: h.notes,
        })),
      };

      res.json({
        success: true,
        data: trackingResult,
      });
    } catch (err) {
      next(err);
    }
  }
}
