// ─── Validation Helper
const requireEnv = (key) => {
  const value = process.env[key];
  if (!value && process.env.NODE_ENV === 'production') {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
};

// ─── Server
export const PORT     = process.env.PORT     || 5000;
export const NODE_ENV = process.env.NODE_ENV || 'development';

// ─── Database
export const DATABASE_URL = requireEnv('DATABASE_URL');

// ─── Auth
export const JWT_SECRET     = requireEnv('JWT_SECRET');
export const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

// ─── CORS
const corsOrigin = process.env.CORS_ORIGIN || 'http://localhost:3000';
export const CORS_ORIGIN = corsOrigin.includes(',') 
  ? corsOrigin.split(',').map(origin => origin.trim())
  : corsOrigin;

// ─── Gemini AI
export const GEMINI_API_KEY    = process.env.GEMINI_API_KEY;
export const GEMINI_FREE_LIMIT = Number(process.env.GEMINI_FREE_LIMIT) || 10;

// ─── Encryption
export const ENCRYPT_SECRET = requireEnv('ENCRYPT_SECRET');

// ─── Cloudinary
export const CLOUDINARY_CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME;
export const CLOUDINARY_API_KEY    = process.env.CLOUDINARY_API_KEY;
export const CLOUDINARY_API_SECRET = process.env.CLOUDINARY_API_SECRET;