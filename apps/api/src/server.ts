import { createApp } from './app.js';
import { config } from './config/index.js';

const app = createApp();

const server = app.listen(config.port, () => {
  console.log(`=======================================================`);
  console.log(` Pakistan Dropshipping Backend API running on port ${config.port}`);
  console.log(` Environment: ${config.env}`);
  console.log(` Public API: http://localhost:${config.port}/api`);
  console.log(` Admin API:  http://localhost:${config.port}/api/admin`);
  console.log(` Default Admin Email: ${config.adminDefault.email}`);
  console.log(`=======================================================`);
});

process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
  });
});

