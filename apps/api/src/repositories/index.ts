import { IDataStore } from './types.js';
import { InMemoryStore } from './memoryStore.js';
import { PostgresStore } from './postgresStore.js';
import { SupabaseStore } from './supabaseStore.js';
import { config } from '../config/index.js';

let storeInstance: IDataStore | null = null;

export function getDataStore(): IDataStore {
  if (!storeInstance) {
    if (config.databaseUrl) {
      console.log('[DataStore] Connecting to PostgreSQL database (DATABASE_URL configured)...');
      storeInstance = new PostgresStore(config.databaseUrl);
    } else if (config.supabase.url && (config.supabase.serviceRoleKey || config.supabase.anonKey)) {
      console.log('[DataStore] Connecting to Supabase database (SUPABASE_URL configured)...');
      storeInstance = new SupabaseStore(
        config.supabase.url,
        config.supabase.serviceRoleKey || config.supabase.anonKey
      );
    } else {
      console.warn(
        '[DataStore] ⚠️ No DATABASE_URL or SUPABASE_URL configured! Falling back to local file storage. Note: In serverless environments like Vercel, set DATABASE_URL or SUPABASE_URL in your Vercel Project Settings for permanent persistence.'
      );
      storeInstance = new InMemoryStore();
    }
  }
  return storeInstance;
}

export * from './types.js';
export * from './memoryStore.js';
export * from './postgresStore.js';
export * from './supabaseStore.js';
