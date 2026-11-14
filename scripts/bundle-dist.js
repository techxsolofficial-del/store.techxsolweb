import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const adminDist = path.join(rootDir, 'apps', 'admin', 'dist');
const targetAdminDistDir = path.join(rootDir, 'apps', 'storefront', 'dist', 'admin');
const targetAdminPublicDir = path.join(rootDir, 'apps', 'storefront', 'public', 'admin');

const adminRoutes = [
  'login',
  'orders',
  'orders/new-whatsapp',
  'products',
  'categories',
  'suppliers',
  'returns',
  'reports',
  'settings',
];

if (fs.existsSync(adminDist)) {
  console.log('[bundle-dist] Bundling admin dist into storefront dist/admin and public/admin...');
  
  // Clean and recreate directories
  fs.rmSync(targetAdminDistDir, { recursive: true, force: true });
  fs.mkdirSync(targetAdminDistDir, { recursive: true });
  fs.cpSync(adminDist, targetAdminDistDir, { recursive: true });

  fs.rmSync(targetAdminPublicDir, { recursive: true, force: true });
  fs.mkdirSync(targetAdminPublicDir, { recursive: true });
  fs.cpSync(adminDist, targetAdminPublicDir, { recursive: true });

  // Pre-generate route directories with index.html for static hosting without rewrites
  for (const targetDir of [targetAdminDistDir, targetAdminPublicDir]) {
    const indexHtmlPath = path.join(targetDir, 'index.html');
    if (fs.existsSync(indexHtmlPath)) {
      const htmlContent = fs.readFileSync(indexHtmlPath, 'utf8');
      for (const route of adminRoutes) {
        const routeDir = path.join(targetDir, route);
        fs.mkdirSync(routeDir, { recursive: true });
        fs.writeFileSync(path.join(routeDir, 'index.html'), htmlContent, 'utf8');
      }
    }
  }

  console.log(`[bundle-dist] Successfully pre-generated ${adminRoutes.length} admin route entrypoints!`);
  console.log('[bundle-dist] Successfully bundled admin portal into storefront!');
} else {
  console.warn('[bundle-dist] Warning: apps/admin/dist not found. Run admin build first.');
}
