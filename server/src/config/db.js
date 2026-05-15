import pkg from 'pg';
const { Pool } = pkg;
import { DATABASE_URL, NODE_ENV } from './env.js';

// Configure pool based on environment
const poolConfig = {
  connectionString: DATABASE_URL,
};

// Neon DB (Production) requires SSL, but Local Docker does not
if (NODE_ENV === 'production') {
  poolConfig.ssl = {
    rejectUnauthorized: false,
  };
}

const pool = new Pool(poolConfig);

export const connectDB = async () => {
  try {
    const client = await pool.connect();
    const isLocal = NODE_ENV !== 'production';
    console.log(`✅ PostgreSQL (${isLocal ? 'Local Docker' : 'Neon Database'}) connected successfully`);
    client.release();
  } catch (error) {
    console.error('❌ Database connection error:', error.message);
    process.exit(1);
  }
};

export const query = (text, params) => pool.query(text, params);
export default pool;
