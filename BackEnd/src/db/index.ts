// server/src/db/index.ts
// Drizzle ORM Database Instance
// Manufacturing Quality Control System

import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from './schema';

let db: ReturnType<typeof drizzle<typeof schema>> | null = null;

/**
 * Create Drizzle database instance
 * Reuses existing pg Pool connection
 */
export function createDrizzleDb(pool: Pool) {
  if (db) return db;
  db = drizzle(pool, { schema });
  console.log('✅ Drizzle ORM initialized');
  return db;
}

/**
 * Get existing Drizzle database instance
 */
export function getDrizzleDb() {
  if (!db) throw new Error('Drizzle not initialized. Call createDrizzleDb first.');
  return db;
}

export type DrizzleDb = ReturnType<typeof createDrizzleDb>;
export { schema };
