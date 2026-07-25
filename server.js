require('dotenv').config();

const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const morgan = require('morgan');

const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorHandler');

const authRoutes = require('./routes/authRoutes');
const jobRoutes = require('./routes/jobRoutes');
const applicationRoutes = require('./routes/applicationRoutes');
const aiRoutes = require('./routes/aiRoutes');

const app = express();

// ==============================
// SECURITY MIDDLEWARE
// ==============================
app.use(helmet());

app.use(
  cors({
    origin: process.env.CLIENT_URL || '*',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// Global rate limiter
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many requests. Please try again later.' },
});
app.use('/api/', globalLimiter);

// Stricter limiter for auth routes
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { success: false, message: 'Too many auth attempts. Please try again in 15 minutes.' },
});
app.use('/api/auth/', authLimiter);

// ==============================
// BODY PARSING
// ==============================
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ==============================
// LOGGING
// ==============================
if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// ==============================
// HEALTH CHECK
// ==============================
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    status: 'Server is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
  });
});

// ==============================
// API ROUTES
// ==============================
app.use('/api/auth', authRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/ai', aiRoutes);

// ==============================
// 404 HANDLER
// ==============================
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found.`,
  });
});

// ==============================
// GLOBAL ERROR HANDLER (must be last)
// ==============================
app.use(errorHandler);

// ==============================
// START SERVER
// ==============================
const PORT = parseInt(process.env.PORT) || 5000;

const startServer = async () => {
  try {
    await connectDB();

    const server = app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT} [${process.env.NODE_ENV || 'development'}]`);
      console.log(`📍 Health check: http://localhost:${PORT}/health`);
    });

    // Graceful shutdown
    const shutdown = (signal) => {
      console.log(`\n${signal} received. Shutting down gracefully...`);
      server.close(() => {
        console.log('✅ HTTP server closed.');
        process.exit(0);
      });

      // Force close after 10s if stuck
      setTimeout(() => {
        console.error('⚠️  Forced shutdown after timeout.');
        process.exit(1);
      }, 10000);
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));

    // Handle unhandled promise rejections
    process.on('unhandledRejection', (err) => {
      console.error('❌ Unhandled Rejection:', err.message);
      server.close(() => process.exit(1));
    });

  } catch (error) {
    console.error('❌ Failed to start server:', error.message);
    process.exit(1);
  }
};

startServer();

module.exports = app;