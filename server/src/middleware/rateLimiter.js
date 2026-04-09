import rateLimit from "express-rate-limit";

const rateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { 
    success: false, 
    message: "Too many requests, please try again later." 
  },
  // Skip rate limiting for health checks
  skip: (req) => req.path === '/api/v1/health'
});

export default rateLimiter;
