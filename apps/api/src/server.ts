import { createApp } from './app.js';
import { config } from './config/index.js';

const app = createApp();
const port = process.env.PORT || config.port || 5000;

const server = app.listen(port, () => {
  console.log(`=======================================================`);
  console.log(` Pakistan Dropshipping Backend API running on port ${port}`);
  console.log(` Environment: ${config.env}`);
  console.log(` Public API: /api`);
  console.log(` Admin API:  /api/admin`);
  console.log(`=======================================================`);
});

process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
  });
});

export default app;

