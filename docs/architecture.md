# System Architecture & Technical Specifications
## Pakistan Dropshipping Ecommerce Platform

---

## 1. Architectural Topology

The platform is designed as a modular TypeScript monorepo partitioned into three core tiers:

```
                    ┌────────────────────────────────────────┐
                    │      Public Storefront (Port 3000)      │
                    │      React + Vite + Tailwind CSS        │
                    └───────────────────┬────────────────────┘
                                        │ REST API (JSON)
                                        ▼
┌───────────────────────┐   ┌────────────────────────────────────────┐
│ Admin Dashboard (3001)│──▶│      Backend API (Port 5000)           │
│ React + Vite + Auth   │   │   Express + TypeScript + Zod Validation│
└───────────────────────┘   └───────────────────┬────────────────────┘
                                                │ SQL / REST
                                                ▼
                            ┌────────────────────────────────────────┐
                            │    Supabase PostgreSQL Data Store      │
                            │   13 Normalized Tables + RLS Policies  │
                            └────────────────────────────────────────┘
```

---

## 2. Monorepo Organization

```
dropshipping-platform/
├── apps/
│   ├── storefront/             # Customer-facing React Vite application
│   │   ├── src/components/     # Accessible header, footer, product cards
│   │   ├── src/context/        # Cart state with local storage persistence
│   │   ├── src/pages/          # Home, Shop, Product Details, Cart, Checkout, Tracking, Policies
│   │   └── src/services/       # Public API client
│   ├── admin/                  # Protected management dashboard
│   │   ├── src/components/     # Admin layout and KPI cards
│   │   ├── src/context/        # Auth state & token session management
│   │   ├── src/pages/          # Pipeline Dashboard, Orders, Products, Categories, Suppliers, Returns, Reports, Settings
│   │   └── src/services/       # Protected API client
│   └── api/                    # Node.js Express REST API
│       ├── src/config/         # Environment variable configuration
│       ├── src/controllers/    # Public and Admin route controllers
│       ├── src/middleware/     # Auth, Zod validation, rate limiter, error handling
│       ├── src/repositories/   # InMemory store + PostgreSQL/Supabase store
│       ├── src/routes/         # Express routers
│       └── src/server.ts       # Application bootstrap
├── packages/
│   └── shared/                 # Shared types, Zod schemas, constants, utils
│       ├── src/constants/      # Pakistani cities, order & payment statuses, regex
│       ├── src/schemas/        # Zod input validation schemas
│       ├── src/types/          # Domain TypeScript interfaces
│       └── src/utils/          # PKR currency formatting, phone normalization, WhatsApp builders
├── database/
│   ├── migrations/             # 001_initial_schema.sql, 002_row_level_security.sql
│   └── seed/                   # Realistic Pakistan dropshipping catalog & demo orders
└── docs/                       # Architecture, DB Schema, API Reference, Deployment, Security
```

---

## 3. Order Processing & Anti-Fraud Architecture

1. **Zero Client Trust Pricing:** The customer browser submits only `productId`, optional `variantId`, and `quantity`. The backend retrieves the product from the database, calculates the exact unit price and delivery fees, and calculates total payable.
2. **Idempotency Protection:** Requests include an `x-idempotency-key` header to prevent duplicate orders caused by repeated button taps on mobile networks.
3. **Sensitive Data Redaction:** Public order tracking requires phone verification to prevent unauthorized order data scraping. Addresses and mobile numbers are redacted in responses.
4. **Rate Limiting:** Public checkout endpoints are rate-limited per IP to prevent spam bot submissions.

