# Pakistan Dropshipping & Custom Ecommerce Platform

> A production-oriented, custom-coded ecommerce and dropshipping platform designed specifically for the Pakistani market, supporting **Website Cash on Delivery (COD)** and **WhatsApp Click-to-Chat** ordering workflows.

---

## 🌟 Key Features

- **Pakistani Dual-Channel Ordering:**
  - **Website COD Checkout:** Full checkout form with 50+ Pakistani cities, mobile number validation (`03XXXXXXXXX`), and server-side zero-trust price verification.
  - **WhatsApp Click-to-Chat:** Direct single-product inquiries and complete cart checkout links with pre-formatted messages in Urdu/English greetings.
- **Supplier-Based Dropshipping Engine:**
  - Multi-supplier management (e.g. Shah Alam Market Lahore, Bolton Market Karachi).
  - Supplier wholesale cost tracking and historical order snapshots.
  - Courier assignment (Trax, Leopards, Call Courier, TCS) with tracking number (CN) logging.
- **Financial Status & Settlement Reconciliation:**
  - Real-time separation of Order Status from Payment Status.
  - Settlement ledger: Record courier COD remittances, supplier payouts, and reverse shipping fees.
  - Transparent Profit Formula:
    $$\text{Actual Net Profit} = \text{COD Collected} - \text{Supplier Wholesale Cost} - \text{Courier Shipping} - \text{Return Losses}$$
- **Customer Privacy Protection:**
  - Public order tracking requires phone number verification.
  - Delivery addresses and phone numbers are redacted in public tracking responses.
- **Zero-Crash Development Mode:**
  - Built-in in-memory catalog pre-seeded with Pakistani electronics, kitchenware, and grooming gadgets.
  - Runs out-of-the-box offline, and connects seamlessly to Supabase PostgreSQL when credentials are provided.

---

## 🏗️ Technology Stack

| Tier | Technologies |
| :--- | :--- |
| **Frontend Storefront** | React 18, Vite 6, TypeScript, Tailwind CSS, Lucide Icons, React Router 7 |
| **Admin Dashboard** | React 18, Vite 6, TypeScript, Tailwind CSS, Lucide Icons, React Router 7 |
| **Backend API** | Node.js (v25), Express, TypeScript, Zod Schema Validation, Helmet, Rate Limiter |
| **Database** | Supabase Managed PostgreSQL, Row Level Security (RLS), ACID Transactions |
| **Monorepo** | NPM Workspaces (`packages/shared`, `apps/api`, `apps/storefront`, `apps/admin`) |

---

## 📁 Repository Structure

```
.
├── apps/
│   ├── storefront/             # Customer web app (Port 3000)
│   ├── admin/                  # Protected admin portal (Port 3001)
│   └── api/                    # REST API server (Port 5000)
├── packages/
│   └── shared/                 # Shared TypeScript types, Zod schemas, constants, utils
├── database/
│   ├── migrations/             # 001_initial_schema.sql, 002_row_level_security.sql
│   └── seed/                   # seed_data.sql (Realistic products in PKR, suppliers, settings)
├── docs/                       # Architecture, DB Schema, API Reference, Deployment, Security
├── .env.example                # Environment variables template
├── package.json                # Monorepo workspaces definition
└── README.md
```

---

## 🚀 Quick Start Guide

### 1. Install Dependencies
```bash
npm install
```

### 2. Build Shared Package & Applications
```bash
npm run build
```

### 3. Run Automated Tests
```bash
node --test apps/api/dist/server.test.js
```

### 4. Start Development Servers
Run all three components simultaneously:
```bash
npm run dev:all
```
Or start each service individually:
- **Backend API:** `npm run dev:api` (Runs on `http://localhost:5000`)
- **Storefront:** `npm run dev:storefront` (Runs on `http://localhost:3000`)
- **Admin Dashboard:** `npm run dev:admin` (Runs on `http://localhost:3001`)

---

## 🔑 Default Admin Credentials

When running locally or with development defaults:
- **Login URL:** `http://localhost:3001/login`
- **Email:** `admin@bazaarpk.com`
- **Password:** `AdminBazaar2026!`

---

## 🗄️ Database Setup (Supabase PostgreSQL)

1. Create a database on [Supabase.com](https://supabase.com).
2. Execute the migrations located in `database/migrations/`:
   - `001_initial_schema.sql` (Creates 13 normalized tables, foreign keys, indexes, and constraints).
   - `002_row_level_security.sql` (Enables Row Level Security and access policies).
3. Execute `database/seed/seed_data.sql` to populate sample products, suppliers, and settings.
4. Copy your Supabase connection string into `.env`:
   ```env
   DATABASE_URL=postgresql://postgres:...@...supabase.co:5432/postgres
   SUPABASE_URL=https://your-project.supabase.co
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
   ```

---

## 🧪 Verification & Test Scenarios

The included automated test suite (`apps/api/src/server.test.ts`) verifies:
1. Currency formatting in Pakistani Rupees (`formatPkr(2500) -> "Rs. 2,500"`).
2. Pakistani phone normalization (`0300-1234567 -> 03001234567`).
3. WhatsApp click-to-chat order message URL builder.
4. Server-side price recalculation & zero-trust total calculation on checkout.
5. Rejection of invalid Pakistani phone numbers.
6. Rejection of unauthorized requests to admin endpoints.
7. Admin authentication and KPI metrics retrieval.
8. Status transition (`pending_confirmation` -> `confirmed`) and supplier courier assignment.

