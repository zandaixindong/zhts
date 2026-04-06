import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';

// Import routes
import bookRoutes from './routes/books';
import seatRoutes from './routes/seats';
import chatRoutes from './routes/chat';
import recommendationRoutes from './routes/recommendations';
import notificationRoutes from './routes/notifications';
import adminRoutes from './routes/admin';
import authRoutes from './routes/auth';
import analyticsRoutes from './routes/analytics';
import myActivityRoutes from './routes/my-activity';
import qrCheckinRoutes from './routes/qr-checkin';

// Import middleware and utils
import { errorHandler, notFoundHandler } from './middleware/errorHandler';
import { logger } from './utils/logger';

dotenv.config();

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: true,
  credentials: true,
}));
app.use(cookieParser());
app.use(express.json());

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'AI Library Platform API is running' });
});

// Routes
app.use('/api/books', bookRoutes);
app.use('/api/seats', seatRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/recommendations', recommendationRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/my-activity', myActivityRoutes);
app.use('/api/qr-checkin', qrCheckinRoutes);

// 404 handler for unmatched routes
app.use('*', notFoundHandler);

// Global error handler
app.use(errorHandler);

// Uncaught exception handler
process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception', { error: error.message, stack: error.stack });
  process.exit(1);
});

// Unhandled rejection handler
process.on('unhandledRejection', (reason) => {
  logger.error('Unhandled Promise Rejection', { reason });
  process.exit(1);
});

// Start server
app.listen(PORT as number, '0.0.0.0', () => {
  logger.info('AI Library Platform API server started', {
    port: PORT,
    frontendUrl: process.env.FRONTEND_URL || 'http://localhost:5173',
  });
});

// Graceful shutdown
process.on('SIGINT', async () => {
  await prisma.$disconnect();
  logger.info('Server shut down gracefully');
  process.exit(0);
});

export default app;
