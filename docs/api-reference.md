# REST API Reference
## Pakistan Dropshipping Platform API

All requests and responses use JSON format with standard HTTP status codes.

---

## 1. Public Endpoints

### `GET /api/health`
Check server health status and timestamp.

### `GET /api/settings/public`
Returns public store configuration (name, WhatsApp number, support email/phone, delivery terms).

### `GET /api/categories`
Returns list of active product categories.

### `GET /api/products`
Query parameters:
- `category` (string, optional): Category slug
- `search` (string, optional): Search keyword
- `sort` (string, optional): `price_asc` | `price_desc` | `newest`
- `page` (number, default 1)
- `limit` (number, default 20)

### `GET /api/products/:slug`
Returns full product detail with variants and active availability.

### `POST /api/orders`
Header:
- `x-idempotency-key` (string, optional): Unique client request key
Request Body:
```json
{
  "customer": {
    "name": "Hamza Khan",
    "phone": "0300 1234567",
    "alternatePhone": "0321 9876543",
    "city": "Lahore",
    "deliveryAddress": "House 42, Block B, Gulberg III",
    "deliveryInstructions": "Call before arriving"
  },
  "items": [
    {
      "productId": "p1111111-1111-1111-1111-111111111111",
      "variantId": "v-blk",
      "quantity": 1
    }
  ],
  "sourceChannel": "website"
}
```
Response: `201 Created` with `orderReference`, `totalPayablePkr`, `deliveryChargePkr`.

### `GET /api/orders/track/:reference?phone=03XXXXXXXXX`
Returns redacted order tracking timeline and courier tracking number if phone matches records.

---

## 2. Admin Endpoints (Require Bearer Token)

Headers:
- `Authorization: Bearer <token>`

### `POST /api/admin/auth/login`
Body: `{ "email": "admin@bazaarpk.com", "password": "..." }`
Returns JWT access token.

### `GET /api/admin/dashboard`
Returns total orders, status distribution, COD awaiting settlement, estimated profit, and actual net profit.

### `GET /api/admin/orders`
Query parameters: `status`, `channel`, `city`, `search`, `page`, `limit`.

### `GET /api/admin/orders/:id`
Returns full order with items, customer details, fulfilment history, and financial ledger.

### `PATCH /api/admin/orders/:id/status`
Body: `{ "status": "confirmed", "reason": "Verified via telephone call" }`

### `POST /api/admin/orders/:id/fulfilments`
Body:
```json
{
  "supplierId": "s1111111-1111-1111-1111-111111111111",
  "courierName": "Trax Logistics",
  "trackingNumber": "TRX998877PK",
  "courierChargePkr": 250
}
```

### `POST /api/admin/orders/:id/transactions`
Body:
```json
{
  "transactionType": "cod_collection",
  "amountPkr": 3249,
  "referenceNumber": "BANK-REMIT-001",
  "status": "completed"
}
```

### `GET /api/admin/reports`
Returns channel performance (Website vs WhatsApp) and profit margins.

### `GET/PUT /api/admin/settings`
View and update store settings and delivery fees.

