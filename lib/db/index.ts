import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from './schema';

export function getDb() {
  const sql = neon(process.env.DATABASE_URL!);
  return drizzle(sql, { schema });
}

export const db = {
  get select() { return getDb().select.bind(getDb()); },
  get insert() { return getDb().insert.bind(getDb()); },
  get update() { return getDb().update.bind(getDb()); },
  get delete() { return getDb().delete.bind(getDb()); },
  get query() { return getDb().query; },
};
