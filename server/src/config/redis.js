import Redis from 'ioredis';
import { NODE_ENV } from './env.js';

// Extract the URL from .env (Handling potentially complex Upstash strings)
// E.g., REDIS_URL = "redis-cli --tls -u rediss://default:XYZ@host:6379"
let redisUrl = process.env.REDIS_URL;

// Clean up Upstash CLI copy-paste if needed
if (redisUrl && redisUrl.includes('-u ')) {
  redisUrl = redisUrl.split('-u ')[1].trim();
}

const redis = new Redis(redisUrl, {
  tls: redisUrl && redisUrl.startsWith('rediss://') ? { rejectUnauthorized: false } : undefined,
  maxRetriesPerRequest: 3,
});

redis.on('connect', () => {
  console.log('✅ Redis connected successfully');
});

redis.on('error', (err) => {
  console.error('❌ Redis connection error:', err);
  if (NODE_ENV === 'production') {
    process.exit(1);
  }
});

export default redis;
