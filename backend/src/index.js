require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');

const { ensureDb, DATA_DIR } = require('./utils/db');
const { autoBackup } = require('./utils/backup');
const { adapter } = require('./utils/storage');
const { runMigrations, APP_VERSION } = require('./migrations');
const errorHandler = require('./middleware/errorHandler');

const settingsRouter = require('./routes/settings');
const tutorsRouter = require('./routes/tutors');
const animalsRouter = require('./routes/animals');
const bookingsRouter = require('./routes/bookings');
const contractsRouter = require('./routes/contracts');
const servicesRouter = require('./routes/services');
const datesRouter = require('./routes/dates');

// Rate limiter for public contract endpoints (signing page)
const publicLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 60,                   // 60 requests per window per IP
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: 'Too many requests, please try again later.', code: 'RATE_LIMITED' },
});

// Stricter limiter for the sign action itself
const signLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: 'Too many signing attempts, please try again later.', code: 'RATE_LIMITED' },
});

async function start() {
  if (adapter === 'local') ensureDb();
  await runMigrations();
  if (adapter === 'local') autoBackup();

  const app = express();
  const PORT = process.env.PORT || 3001;
  const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';
  const isDev = process.env.NODE_ENV !== 'production';

  // Security headers
  app.use(helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' }, // allow /uploads static files
  }));

  // CORS: explicit origin even in dev — never wildcard with credentials
  const allowedOrigins = isDev
    ? [FRONTEND_URL, 'http://localhost:5173', 'http://localhost:5174']
    : [FRONTEND_URL];

  app.use((req, res, next) => {
    const origin = req.headers.origin;
    if (origin && !allowedOrigins.includes(origin)) {
      return res.status(403).json({ success: false, error: 'CORS: origin not allowed', code: 'CORS_BLOCKED' });
    }
    next();
  });

  app.use(cors({
    origin: (origin, cb) => {
      if (!origin || allowedOrigins.includes(origin)) return cb(null, true);
      cb(null, false); // deny silently — pre-check above already responded
    },
    credentials: true,
  }));

  // Trust proxy only if explicitly configured — prevents X-Forwarded-For spoofing
  if (process.env.TRUST_PROXY) {
    app.set('trust proxy', parseInt(process.env.TRUST_PROXY, 10) || 1);
  }

  // Body limit: 1MB for JSON (signatures validated separately before write)
  app.use(express.json({ limit: '1mb' }));

  // Serve uploaded files (static, no auth needed for logo etc.)
  app.use('/uploads', express.static(path.join(DATA_DIR, 'uploads')));

  app.get('/api/health', (_req, res) => {
    res.json({ success: true, data: { status: 'ok', version: APP_VERSION } });
  });

  // Apply rate limiting to public contract endpoints
  app.use('/api/contracts/token', publicLimiter);
  app.use('/api/contracts/verify', publicLimiter);
  app.use('/api/contracts/sign', signLimiter);

  app.use('/api/settings', settingsRouter);
  app.use('/api/tutors', tutorsRouter);
  app.use('/api/animals', animalsRouter);
  app.use('/api/bookings', bookingsRouter);
  app.use('/api/contracts', contractsRouter);
  app.use('/api/services', servicesRouter);
  app.use('/api/dates', datesRouter);

  app.use(errorHandler);

  app.listen(PORT, () => {
    console.log(`PetStay Manager v${APP_VERSION} running on port ${PORT} ✓`);
  });
}

start().catch(err => {
  console.error('Failed to start:', err);
  process.exit(1);
});
