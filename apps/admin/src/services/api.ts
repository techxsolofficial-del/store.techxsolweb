import {
  Category,
  Product,
  Supplier,
  Order,
  StoreSettings,
  DashboardMetrics,
  OrderStatus,
  PaymentStatus,
  ProductCreateInput,
  CategoryCreateInput,
  SupplierCreateInput,
  UpdateOrderStatusInput,
  CreateFulfilmentInput,
  UpdateFulfilmentInput,
  CreateFinancialTransactionInput,
  UpdateSettingsInput,
  ApiResponse,
  PaginatedResponse,
} from '@dropship/shared';

const API_BASE = import.meta.env.VITE_API_URL || '/api/admin';

function getAuthHeader(): Record<string, string> {
  const token = localStorage.getItem('bazaarpk_admin_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function handleResponse<T>(res: Response): Promise<T> {
  const data = await res.json();
  if (!res.ok || !data.success) {
    if (res.status === 401) {
      localStorage.removeItem('bazaarpk_admin_token');
      window.location.href = '/login';
    }
    throw new Error(data.error?.message || 'API request failed');
  }
  return data.data;
}

// Authentication
export async function loginAdmin(email: string, password: string): Promise<{ token: string; user: any }> {
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  return handleResponse(res);
}

export async function verifyAdminSession(): Promise<any> {
  const res = await fetch(`${API_BASE}/auth/verify`, {
    headers: getAuthHeader(),
  });
  return handleResponse(res);
}

// Dashboard
export async function fetchDashboardMetrics(): Promise<DashboardMetrics> {
  const res = await fetch(`${API_BASE}/dashboard`, {
    headers: getAuthHeader(),
  });
  return handleResponse(res);
}

// Orders
export async function fetchOrders(params?: {
  status?: string;
  paymentStatus?: string;
  channel?: string;
  search?: string;
  city?: string;
  page?: number;
  limit?: number;
}): Promise<PaginatedResponse<Order>> {
  const query = new URLSearchParams();
  if (params?.status) query.set('status', params.status);
  if (params?.paymentStatus) query.set('paymentStatus', params.paymentStatus);
  if (params?.channel) query.set('channel', params.channel);
  if (params?.search) query.set('search', params.search);
  if (params?.city) query.set('city', params.city);
  if (params?.page) query.set('page', String(params.page));
  if (params?.limit) query.set('limit', String(params.limit));

  const res = await fetch(`${API_BASE}/orders?${query.toString()}`, {
    headers: getAuthHeader(),
  });
  const data = await res.json();
  if (!res.ok || !data.success) {
    throw new Error(data.error?.message || 'Failed to fetch orders');
  }
  return data;
}

export async function fetchOrderById(id: string): Promise<Order> {
  const res = await fetch(`${API_BASE}/orders/${id}`, {
    headers: getAuthHeader(),
  });
  return handleResponse(res);
}

export async function updateOrderStatus(id: string, input: UpdateOrderStatusInput): Promise<Order> {
  const res = await fetch(`${API_BASE}/orders/${id}/status`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
    body: JSON.stringify(input),
  });
  return handleResponse(res);
}

export async function addOrderNote(id: string, note: string): Promise<Order> {
  const res = await fetch(`${API_BASE}/orders/${id}/notes`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
    body: JSON.stringify({ note }),
  });
  return handleResponse(res);
}

export async function addOrderFulfilment(id: string, input: CreateFulfilmentInput): Promise<Order> {
  const res = await fetch(`${API_BASE}/orders/${id}/fulfilments`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
    body: JSON.stringify(input),
  });
  return handleResponse(res);
}

export async function updateOrderFulfilment(id: string, fulfilmentId: string, input: UpdateFulfilmentInput): Promise<Order> {
  const res = await fetch(`${API_BASE}/orders/${id}/fulfilments/${fulfilmentId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
    body: JSON.stringify(input),
  });
  return handleResponse(res);
}

export async function addFinancialTransaction(id: string, input: CreateFinancialTransactionInput): Promise<Order> {
  const res = await fetch(`${API_BASE}/orders/${id}/transactions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
    body: JSON.stringify(input),
  });
  return handleResponse(res);
}

// Products
export async function fetchAdminProducts(params?: { search?: string; category?: string }): Promise<PaginatedResponse<Product>> {
  const query = new URLSearchParams();
  if (params?.search) query.set('search', params.search);
  if (params?.category) query.set('category', params.category);

  const res = await fetch(`${API_BASE}/products?${query.toString()}`, {
    headers: getAuthHeader(),
  });
  const data = await res.json();
  if (!res.ok || !data.success) {
    throw new Error(data.error?.message || 'Failed to fetch products');
  }
  return data;
}

export async function createProduct(input: ProductCreateInput): Promise<Product> {
  const res = await fetch(`${API_BASE}/products`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
    body: JSON.stringify(input),
  });
  return handleResponse(res);
}

export async function updateProduct(id: string, updates: Partial<Product>): Promise<Product> {
  const res = await fetch(`${API_BASE}/products/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
    body: JSON.stringify(updates),
  });
  return handleResponse(res);
}

export async function deleteProduct(id: string): Promise<boolean> {
  const res = await fetch(`${API_BASE}/products/${id}`, {
    method: 'DELETE',
    headers: getAuthHeader(),
  });
  const data = await res.json();
  return data.success;
}

// Categories
export async function fetchAdminCategories(): Promise<Category[]> {
  const res = await fetch(`${API_BASE}/categories`, {
    headers: getAuthHeader(),
  });
  return handleResponse(res);
}

export async function createCategory(input: CategoryCreateInput): Promise<Category> {
  const res = await fetch(`${API_BASE}/categories`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
    body: JSON.stringify(input),
  });
  return handleResponse(res);
}

export async function updateCategory(id: string, updates: Partial<Category>): Promise<Category> {
  const res = await fetch(`${API_BASE}/categories/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
    body: JSON.stringify(updates),
  });
  return handleResponse(res);
}

// Suppliers
export async function fetchAdminSuppliers(): Promise<Supplier[]> {
  const res = await fetch(`${API_BASE}/suppliers`, {
    headers: getAuthHeader(),
  });
  return handleResponse(res);
}

export async function createSupplier(input: SupplierCreateInput): Promise<Supplier> {
  const res = await fetch(`${API_BASE}/suppliers`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
    body: JSON.stringify(input),
  });
  return handleResponse(res);
}

export async function updateSupplier(id: string, updates: Partial<Supplier>): Promise<Supplier> {
  const res = await fetch(`${API_BASE}/suppliers/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
    body: JSON.stringify(updates),
  });
  return handleResponse(res);
}

// Reports & Settings
export async function fetchReports(): Promise<any> {
  const res = await fetch(`${API_BASE}/reports`, {
    headers: getAuthHeader(),
  });
  return handleResponse(res);
}

export async function fetchSettings(): Promise<StoreSettings> {
  const res = await fetch(`${API_BASE}/settings`, {
    headers: getAuthHeader(),
  });
  return handleResponse(res);
}

export async function updateSettings(input: UpdateSettingsInput): Promise<StoreSettings> {
  const res = await fetch(`${API_BASE}/settings`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
    body: JSON.stringify(input),
  });
  return handleResponse(res);
}

