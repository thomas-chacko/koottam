import 'dotenv/config';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import db from './src/config/db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const MIGRATIONS_DIR = path.join(__dirname, 'database', 'migrations');

async function runMigrations() {
  const client = await db.connect();
  
  try {
    // 1. Create migrations tracking table
    await client.query(`
      CREATE TABLE IF NOT EXISTS migrations (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) UNIQUE NOT NULL,
        executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 2. Check for migrations directory
    if (!fs.existsSync(MIGRATIONS_DIR)) {
      console.log('No migrations directory found.');
      return;
    }

    // 3. Read and sort migration files (e.g., 001_..., 002_...)
    const files = fs.readdirSync(MIGRATIONS_DIR)
      .filter(f => f.endsWith('.sql'))
      .sort();

    // 4. Get already executed migrations
    const { rows } = await client.query('SELECT name FROM migrations');
    const executed = new Set(rows.map(r => r.name));

    // 5. Run pending migrations
    let ranAny = false;
    for (const file of files) {
      if (!executed.has(file)) {
        ranAny = true;
        console.log(`▶️ Running migration: ${file}`);
        const sql = fs.readFileSync(path.join(MIGRATIONS_DIR, file), 'utf-8');
        
        await client.query('BEGIN');
        try {
          await client.query(sql);
          await client.query('INSERT INTO migrations (name) VALUES ($1)', [file]);
          await client.query('COMMIT');
          console.log(`✅ Successfully executed: ${file}`);
        } catch (err) {
          await client.query('ROLLBACK');
          console.error(`❌ Failed at migration: ${file}`);
          throw err;
        }
      }
    }
    
    if (!ranAny) {
      console.log('✨ Database is already up to date!');
    } else {
      console.log('🎉 All migrations completed successfully!');
    }
  } catch (error) {
    console.error('❌ Migration Error:', error);
  } finally {
    client.release();
    process.exit(0);
  }
}

runMigrations();
