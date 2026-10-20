import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const adminDist = path.join(rootDir, 'apps', 'admin', 'dist');
const targetAdminDir = path.join(rootDir, 'apps', 'storefront', 'dist', 'admin');

if (fs.existsSync(adminDist)) {
  console.log('[bundle-dist] Bundling admin dist into storefront dist/admin...');
  fs.mkdirSync(targetAdminDir, { recursive: true });
  fs.cpSync(adminDist, targetAdminDir, { recursive: true });
  console.log('[bundle-dist] Successfully bundled admin portal into storefront!');
} else {
  console.warn('[bundle-dist] Warning: apps/admin/dist not found. Run admin build first.');
}

