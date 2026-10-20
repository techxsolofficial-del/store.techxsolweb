# Security, Privacy & Compliance Architecture
## Pakistan Ecommerce & COD Security Checklist

---

## 1. Zero Trust Client Pricing

- The storefront client **never** transmits total amounts or unit prices to the backend API.
- The client only transmits product ID, variant ID, and quantity.
- The server retrieves the active catalog price and wholesale cost directly from the database, preventing price tampering via browser dev tools or proxies.

---

## 2. Customer Privacy & Public Tracking Safeguards

- Order references (e.g., `ORD-20261019-XXXX`) cannot be queried in public endpoints without providing the exact customer mobile number used during order placement.
- Public tracking responses **strictly redact** sensitive information:
  - Phone number is masked (e.g. `0300****567`).
  - Street address is masked (e.g. `***, Gulberg III, Lahore`).
  - Internal supplier costs and profit margins are completely omitted from all public serializers.

---

## 3. Database Row Level Security (RLS)

- Public anonymous keys can only read rows where `is_active = TRUE` in `products` and `categories`.
- Supplier records, wholesale product costs (`product_supplier_offers`), order details, customer addresses, and financial transactions are strictly restricted to authenticated administrators (`auth.jwt() -> role = 'admin'`).

---

## 4. Anti-Spam & DoS Protection

- **Rate Limiting:** Public checkout endpoint `/api/orders` is protected by `express-rate-limit` (20 attempts per 15 minutes per IP address).
- **Body Size Caps:** JSON request bodies are capped at 1MB to prevent memory exhaustion attacks.
- **Idempotency Keys:** Double-click protection via `x-idempotency-key` prevents accidental duplicate submissions.
- **Helmet Headers:** Content Security Policy, X-XSS-Protection, X-Frame-Options, and Strict-Transport-Security enabled.

