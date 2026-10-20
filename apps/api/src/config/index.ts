import dotenv from 'dotenv';
import path from 'path';

// Load environment variables from .env
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

export const config = {
  env: process.env.NODE_ENV || 'development',
  isProd: process.env.NODE_ENV === 'production',
  port: parseInt(process.env.PORT || '5000', 10),
  jwtSecret: process.env.JWT_SECRET || 'dev_dropship_jwt_secret_key_change_in_production_2026',
  corsOrigins: (process.env.CORS_ORIGIN || 'http://localhost:3000,http://localhost:3001,http://127.0.0.1:3000,http://127.0.0.1:3001')
    .split(',')
    .map((s) => s.trim()),
  supabase: {
    url: process.env.SUPABASE_URL || '',
    serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY || '',
    anonKey: process.env.SUPABASE_ANON_KEY || '',
  },
  databaseUrl: process.env.DATABASE_URL || '',
  adminDefault: {
    email: process.env.ADMIN_EMAIL || 'admin@bazaarpk.com',
    password: process.env.ADMIN_PASSWORD || 'AdminBazaar2026!',
    displayName: process.env.ADMIN_NAME || 'Store Owner',
  },
};

