# Deployment & Production Configuration Guide
## Pakistan Dropshipping Ecommerce Platform

This guide outlines deployment onto modern, cost-effective hosting services suitable for a beginner entrepreneur operating in Pakistan.

---

## 1. Hosting Tier Architecture & Free Tiers

| Component | Recommended Host | Free / Low-Cost Tier Notes |
| :--- | :--- | :--- |
| **Storefront** | Cloudflare Pages / Vercel | Unlimited static hosting, global CDN, zero bandwidth fees |
| **Admin Dashboard** | Cloudflare Pages / Vercel | Static SPA hosting on private subdomain (e.g. `admin.bazaarpk.com`) |
| **Backend API** | Render / Railway / Fly.io | Node.js Express server with HTTPS and environment variables |
| **Database** | Supabase | 500MB free PostgreSQL database, automated backups, and Auth |

---

## 2. Supabase Database Setup

1. Create a free project on [Supabase.com](https://supabase.com).
2. Open the **SQL Editor** in your Supabase dashboard.
3. Run the schema migration: `database/migrations/001_initial_schema.sql`.
4. Run the Row Level Security migration: `database/migrations/002_row_level_security.sql`.
5. Run the sample seed data: `database/seed/seed_data.sql`.
6. Copy the **Project URL**, **Service Role Key**, and **PostgreSQL Connection String** from **Project Settings > API**.

---

## 3. Backend Deployment (Render / Railway)

1. Connect your GitHub repository to Render/Railway.
2. Set Root Directory to `apps/api` (or root with monorepo build script).
3. Set Build Command: `npm install && npm run build --workspace=packages/shared && npm run build --workspace=apps/api`
4. Set Start Command: `node apps/api/dist/server.js`
5. Configure Environment Variables:
   - `NODE_ENV=production`
   - `PORT=5000`
   - `JWT_SECRET=<generate_a_secure_random_64_character_string>`
   - `ADMIN_EMAIL=your_email@domain.com`
   - `ADMIN_PASSWORD=<strong_random_password>`
   - `DATABASE_URL=postgresql://postgres:...@...supabase.co:5432/postgres`
   - `CORS_ORIGIN=https://bazaarpk.com,https://admin.bazaarpk.com`

---

## 4. Frontend Deployment (Cloudflare Pages)

### Storefront Application
1. In Cloudflare Pages, select **Create a project > Connect to Git**.
2. Root directory: `apps/storefront`
3. Build command: `npm run build`
4. Build output directory: `dist`
5. Environment Variable:
   - `VITE_API_URL=https://your-api-domain.onrender.com/api`

### Admin Dashboard Application
1. In Cloudflare Pages, create a separate project.
2. Root directory: `apps/admin`
3. Build command: `npm run build`
4. Build output directory: `dist`
5. Environment Variable:
   - `VITE_API_URL=https://your-api-domain.onrender.com/api/admin`

