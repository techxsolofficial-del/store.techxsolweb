import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const adminDist = path.join(rootDir, 'apps', 'admin', 'dist');
const targetAdminDistDir = path.join(rootDir, 'apps', 'storefront', 'dist', 'admin');
const targetAdminPublicDir = path.join(rootDir, 'apps', 'storefront', 'public', 'admin');

if (fs.existsSync(adminDist)) {
  console.log('[bundle-dist] Bundling admin dist into storefront dist/admin and public/admin...');
  fs.rmSync(targetAdminDistDir, { recursive: true, force: true });
  fs.mkdirSync(targetAdminDistDir, { recursive: true });
  fs.cpSync(adminDist, targetAdminDistDir, { recursive: true });

  fs.rmSync(targetAdminPublicDir, { recursive: true, force: true });
  fs.mkdirSync(targetAdminPublicDir, { recursive: true });
  fs.cpSync(adminDist, targetAdminPublicDir, { recursive: true });
  console.log('[bundle-dist] Successfully bundled admin portal into storefront!');
} else {
  console.warn('[bundle-dist] Warning: apps/admin/dist not found. Run admin build first.');
}

