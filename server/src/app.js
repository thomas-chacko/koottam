import express from 'express'
import cors from 'cors'

import helmet from "helmet";
import { CORS_ORIGIN } from './config/env.js';
import rateLimiter from './middleware/rateLimiter.js';
import router from './routes/index.js';
import errorHandler from './middleware/errorHandler.js';

const app = express()

// ─── Security & Middleware
app.use(helmet());
app.use(cors({ origin: CORS_ORIGIN, credentials: true }));
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// ─── Security Headers
app.disable('x-powered-by');

// ─── Root Endpoint
app.get("/", (_req, res) => {
  res.json({ success: true, message: "Welcome to Koottam API", version: "1.0.0" });
});

// ─── Rate Limiting
app.use('/api',rateLimiter)

// ─── Routes
app.use('/api/v1', router);

// ─── 404 Handler
app.use((_req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found"
  });
});

// ─── Error Handling
app.use(errorHandler);

export default app;