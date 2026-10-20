import {
  OrderStatus,
  PaymentStatus,
  OrderSourceChannel,
  PaymentMethod,
  FulfilmentStatus,
} from '../constants/index.js';

export type UserRole = 'admin' | 'staff';

export interface UserProfile {
  id: string;
  email: string;
  displayName: string;
  role: UserRole;
  createdAt: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  isActive: boolean;
  displayOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface Supplier {
  id: string;
  businessName: string;
  contactName: string;
  phone: string;
  email?: string;
  city: string;
  address?: string;
  fulfilmentTerms?: string;
  returnPolicy?: string;
  payoutTerms?: string;
  isActive: boolean;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ProductVariant {
  id: string;
  name: string; // e.g. "Color: Black", "Size: XL"
  sku?: string;
  priceDeltaPkr?: number; // optional price delta if variant costs more
  supplierCostDeltaPkr?: number;
  isAvailable: boolean;
}

export interface ProductImage {
  id: string;
  url: string;
  altText?: string;
  isPrimary: boolean;
}

export interface ProductSupplierOffer {
  id: string;
  productId: string;
  supplierId: string;
  supplierName?: string;
  supplierSku: string;
  supplierCostPkr: number;
  isAvailable: boolean;
  leadTimeDays: number;
  notes?: string;
  updatedAt: string;
}

export interface Product {
  id: string;
  categoryId: string;
  categoryName?: string;
  categorySlug?: string;
  name: string;
  slug: string;
  shortDescription: string;
  description: string;
  basePricePkr: number;
  compareAtPricePkr?: number; // for showing strikethrough original price
  sku: string;
  isActive: boolean;
  isFeatured: boolean;
  images: ProductImage[];
  variants: ProductVariant[];
  supplierOffers?: ProductSupplierOffer[];
  createdAt: string;
  updatedAt: string;
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  alternatePhone?: string;
  city: string;
  deliveryAddress: string;
  deliveryInstructions?: string;
  createdAt: string;
}

export interface OrderItem {
  id: string;
  orderId: string;
  productId: string;
  productSlug?: string;
  productNameSnapshot: string;
  variantSnapshot?: {
    id: string;
    name: string;
  } | null;
  imageSnapshot?: string;
  quantity: number;
  unitPricePkr: number;
  supplierCostPkr: number;
  totalPricePkr: number;
}

export interface Fulfilment {
  id: string;
  orderId: string;
  supplierId: string;
  supplierName?: string;
  supplierOrderRef?: string;
  courierName?: string; // TCS, Leopards, Trax, Call Courier, PostEx, etc.
  trackingNumber?: string;
  trackingUrl?: string;
  status: FulfilmentStatus;
  dispatchedAt?: string;
  deliveredAt?: string;
  failureReason?: string;
  courierChargePkr: number;
  returnChargePkr: number;
  createdAt: string;
  updatedAt: string;
}

export interface OrderStatusHistory {
  id: string;
  orderId: string;
  previousStatus: OrderStatus | null;
  newStatus: OrderStatus;
  actorId?: string;
  actorName?: string;
  notes?: string;
  createdAt: string;
}

export interface FinancialTransaction {
  id: string;
  orderId: string;
  transactionType: 'cod_collection' | 'supplier_payout' | 'courier_fee' | 'return_loss' | 'refund' | 'adjustment';
  amountPkr: number;
  referenceNumber?: string;
  status: 'pending' | 'completed' | 'cancelled';
  notes?: string;
  createdAt: string;
}

export interface Order {
  id: string;
  orderReference: string; // e.g. "ORD-20261019-7492"
  trackingToken: string;
  customerId: string;
  customer?: Customer;
  sourceChannel: OrderSourceChannel;
  orderStatus: OrderStatus;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  subtotalPkr: number;
  deliveryChargePkr: number;
  discountPkr: number;
  totalPayablePkr: number;
  estimatedProfitPkr: number;
  actualProfitPkr: number;
  internalNotes?: string;
  items: OrderItem[];
  fulfilments?: Fulfilment[];
  statusHistory?: OrderStatusHistory[];
  transactions?: FinancialTransaction[];
  createdAt: string;
  updatedAt: string;
}

export interface PublicOrderTrackingResult {
  orderReference: string;
  orderStatus: OrderStatus;
  orderStatusLabel: string;
  paymentStatus: PaymentStatus;
  paymentStatusLabel: string;
  createdAt: string;
  city: string;
  maskedPhone: string;
  maskedAddress: string;
  itemCount: number;
  totalPayablePkr: number;
  courierName?: string;
  trackingNumber?: string;
  estimatedDelivery?: string;
  timeline: {
    status: OrderStatus;
    label: string;
    timestamp: string;
    note?: string;
  }[];
}

export interface StoreSettings {
  storeName: string;
  tagline: string;
  whatsappNumber: string;
  supportEmail: string;
  supportPhone: string;
  currency: string;
  defaultDeliveryChargePkr: number;
  freeDeliveryThresholdPkr: number;
  estimatedDeliveryDays: string;
  codTerms: string;
  returnPolicySummary: string;
  aboutText: string;
}

export interface DashboardMetrics {
  totalOrders: number;
  pendingConfirmation: number;
  confirmedOrders: number;
  dispatchedOrders: number;
  deliveredOrders: number;
  returnedOrders: number;
  totalRevenuePkr: number;
  totalEstimatedProfitPkr: number;
  totalActualProfitPkr: number;
  unsettledCodPkr: number;
  recentOrders: Order[];
}

export interface ApiResponse<T> {
  success: true;
  data: T;
  message?: string;
}

export interface ApiErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
}

export interface PaginatedResponse<T> {
  success: true;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

