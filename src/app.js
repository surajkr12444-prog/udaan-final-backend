import express from 'express';
import cors from 'cors';
import authRoutes from './routes/authRoutes.js';
import profileRoutes from './routes/profileRoutes.js';
import schemeRoutes from './routes/schemeRoutes.js';
import matchRoutes from './routes/matchRoutes.js';
import applicationRoutes from './routes/applicationRoutes.js';
import { errorHandler, notFound } from './middleware/error.js';

const app = express();

const allowedOrigins = (process.env.FRONTEND_URL || 'http://localhost:5173')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(cors({
  origin(origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
    return callback(new Error(`CORS blocked origin: ${origin}`));
  },
  credentials: true
}));
app.use(express.json({ limit: '1mb' }));

app.get('/', (_req, res) => {
  res.json({
    success: true,
    service: 'Udaan.AI Backend',
    message: 'API is running',
    endpoints: ['/api/health', '/api/auth', '/api/profile', '/api/schemes', '/api/match', '/api/applications']
  });
});

app.get('/api/health', (_req, res) => {
  res.json({ success: true, status: 'ok', timestamp: new Date().toISOString() });
});

app.use('/api/auth', authRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/schemes', schemeRoutes);
app.use('/api/match', matchRoutes);
app.use('/api/applications', applicationRoutes);

app.use(notFound);
app.use(errorHandler);

export default app;
