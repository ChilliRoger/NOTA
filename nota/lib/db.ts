// server-side Postgres using `pg` for Neon
import { Pool } from 'pg';

const connectionString = process.env.DATABASE_URL as string;

if (!connectionString) throw new Error('DATABASE_URL not set');

const pool = new Pool({ connectionString });

export default pool;
