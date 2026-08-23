import app from './app';
import { connectDB } from './config/db';
import { ENV } from './config/env';
import { logger } from './utils/logger';

const startServer = async () => {
  // Connect to Database
  await connectDB();

  // Start HTTP Listener
  const server = app.listen(ENV.PORT, () => {
    logger.info(`=======================================================`);
    logger.info(`🚀 Amazon Enterprise API Server running on port ${ENV.PORT}`);
    logger.info(`🔒 Security: Helmet, CORS, NoSQL Sanitizer, HPP, RateLimiters`);
    logger.info(`🛡️ DPDP Act 2023 Compliance & Consent Ledger Active`);
    logger.info(`🌐 Environment: ${ENV.NODE_ENV}`);
    logger.info(`=======================================================`);
  });

  // Graceful shutdown handling
  const handleShutdown = (signal: string) => {
    logger.info(`${signal} signal received. Closing HTTP server gracefully...`);
    server.close(() => {
      logger.info('HTTP server closed. Process terminated.');
      process.exit(0);
    });
  };

  process.on('SIGTERM', () => handleShutdown('SIGTERM'));
  process.on('SIGINT', () => handleShutdown('SIGINT'));
};

startServer();
