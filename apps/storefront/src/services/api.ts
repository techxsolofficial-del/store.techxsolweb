import {
  Category,
  Product,
  StoreSettings,
  CreateOrderInput,
  PublicOrderTrackingResult,
  ApiResponse,
  PaginatedResponse,
} from '@dropship/shared';

const API_BASE = import.meta.env.VITE_API_URL || '/api';

export async function fetchPublicSettings(): Promise<StoreSettings> {
  const res = await fetch(`${API_BASE}/settings/public`);
  const data: ApiResponse<StoreSettings> = await res.json();
  if (!res.ok || !data.success) {
    throw new Error('Failed to load store settings');
  }
  return data.data;
}

export async function fetchCategories(): Promise<Category[]> {
  const res = await fetch(`${API_BASE}/categories`);
  const data: ApiResponse<Category[]> = await res.json();
  if (!res.ok || !data.success) {
    throw new Error('Failed to load categories');
  }
  return data.data;
}

export async function fetchProducts(params?: {
  category?: string;
  search?: string;
  featured?: boolean;
  sort?: string;
  page?: number;
  limit?: number;
}): Promise<PaginatedResponse<Product>> {
  const query = new URLSearchParams();
  if (params?.category) query.set('category', params.category);
  if (params?.search) query.set('search', params.search);
  if (params?.featured) query.set('featured', 'true');
  if (params?.sort) query.set('sort', params.sort);
  if (params?.page) query.set('page', String(params.page));
  if (params?.limit) query.set('limit', String(params.limit));

  const res = await fetch(`${API_BASE}/products?${query.toString()}`);
  const data = await res.json();
  if (!res.ok || !data.success) {
    throw new Error('Failed to load products');
  }
  return data;
}

export async function fetchProductBySlug(slug: string): Promise<Product> {
  const res = await fetch(`${API_BASE}/products/${slug}`);
  const data: ApiResponse<Product> = await res.json();
  if (!res.ok || !data.success) {
    throw new Error('Product not found or unavailable');
  }
  return data.data;
}

export async function submitOrder(
  orderData: CreateOrderInput,
  idempotencyKey?: string
): Promise<any> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (idempotencyKey) {
    headers['x-idempotency-key'] = idempotencyKey;
  }

  const res = await fetch(`${API_BASE}/orders`, {
    method: 'POST',
    headers,
    body: JSON.stringify(orderData),
  });

  const data = await res.json();
  if (!res.ok || !data.success) {
    throw new Error(data.error?.message || 'Failed to submit order');
  }
  return data;
}

export async function trackOrder(
  reference: string,
  phone: string
): Promise<PublicOrderTrackingResult> {
  const query = new URLSearchParams({ phone });
  const res = await fetch(`${API_BASE}/orders/track/${encodeURIComponent(reference)}?${query.toString()}`);
  const data = await res.json();
  if (!res.ok || !data.success) {
    throw new Error(data.error?.message || 'Could not find order. Please verify order reference and phone number.');
  }
  return data.data;
}

