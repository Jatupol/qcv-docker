// server/src/db/schema/systemInfo.ts
// System Information Table Schema

import { pgTable, integer, varchar, timestamp } from 'drizzle-orm/pg-core';

export const systemInfo = pgTable('system_info', {
  id: integer('id').primaryKey(),
  version: varchar('version', { length: 50 }),
  deployedAt: timestamp('deployed_at', { withTimezone: false }),
  environment: varchar('environment', { length: 20 }),
});

// Type inference
export type SystemInfo = typeof systemInfo.$inferSelect;
export type NewSystemInfo = typeof systemInfo.$inferInsert;
