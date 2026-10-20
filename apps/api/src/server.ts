import { createApp } from './app.js';
import { config } from './config/index.js';

const app = createApp();

const port = process.env.PORT || config.port || 5000;

// Listen if PORT is specified (Vercel services / container / local dev)
if (process.env.PORT || (!process.env.VERCEL && process.env.NODE_ENV !== 'production')) {
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
}

// Export for serverless function execution
export default app;



