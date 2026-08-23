import mongoose from 'mongoose';
import { ENV } from './env';
import { logger } from '../utils/logger';

let isConnected = false;

export const connectDB = async (): Promise<void> => {
  if (isConnected) {
    logger.info('MongoDB is already connected.');
    return;
  }

  try {
    const conn = await mongoose.connect(ENV.MONGODB_URI, {
      autoIndex: true,
      serverSelectionTimeoutMS: 5000,
    });

    isConnected = conn.connection.readyState === 1;
    logger.info(`MongoDB Connected successfully: ${conn.connection.host}/${conn.connection.name}`);
  } catch (error: any) {
    logger.error(`MongoDB Connection Error: ${error.message}`);
    logger.warn('Running in resilient mode: If MongoDB server is offline, client will use fallback offline store.');
  }
};

mongoose.connection.on('disconnected', () => {
  isConnected = false;
  logger.warn('MongoDB disconnected.');
});

mongoose.connection.on('error', (err) => {
  logger.error(`MongoDB runtime error: ${err.message}`);
});
