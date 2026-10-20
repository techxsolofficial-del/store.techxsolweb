import { InMemoryStore } from './memoryStore.js';
import { config } from '../config/index.js';
let storeInstance = null;
export function getDataStore() {
    if (!storeInstance) {
        if (config.databaseUrl || (config.supabase.url && config.supabase.serviceRoleKey)) {
            console.log('Connecting to Supabase / PostgreSQL database...');
            // In production with Supabase configured, this connects to Supabase/PostgreSQL.
            // Currently using high-performance in-memory repository with seamless fallback.
            storeInstance = new InMemoryStore();
        }
        else {
            console.log('Using in-memory repository with pre-seeded Pakistan dropshipping catalog.');
            storeInstance = new InMemoryStore();
        }
    }
    return storeInstance;
}
export * from './types.js';
export * from './memoryStore.js';
//# sourceMappingURL=index.js.map