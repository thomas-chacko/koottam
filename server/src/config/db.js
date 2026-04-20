import pkg from 'pg';
const { Pool } = pkg;
import { DATABASE_URL } from './env.js';

// Setup connection pool for Neon PostgreSQL
const pool = new Pool({
  connectionString: DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});

export const connectDB = async () => {
  try {
    const client = await pool.connect();
    console.log('✅ PostgreSQL (Neon Database) connected successfully');
    client.release();
  } catch (error) {
    console.error('❌ Database connection error:', error.message);
    process.exit(1);
  }
};

export const query = (text, params) => pool.query(text, params);
export default pool;
