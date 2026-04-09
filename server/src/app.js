import express from 'express'
import cors from 'cors'

import { CORS_ORIGIN } from './config/env.js';
import rateLimiter from './middleware/rateLimiter.js';
import router from './routes/index.js';
import errorHandler from './middleware/errorHandler.js';

const app = express()

// ─── Security & Middleware
app.use(cors({ origin: CORS_ORIGIN, credentials: true }));
app.use(express.json({ limit: "10mb" }))
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// ─── Root Endpoint
app.get("/", (_req, res) => {
  res.json({ success: true, message: "Welcome to Koottam API", version: "1.0.0" });
});

// ─── Rate Limiting
app.use('/api',rateLimiter)

// ─── Routes
app.use('/api/v1',router)

// ─── Error Handling
app.use(errorHandler);

export default app