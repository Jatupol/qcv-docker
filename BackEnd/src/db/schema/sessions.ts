// server/src/db/schema/sessions.ts
// Sessions Table Schema
// NOTE: This table is managed by connect-pg-simple - DO NOT migrate to Drizzle ORM queries!

import { pgTable, varchar, json, timestamp } from 'drizzle-orm/pg-core';

/**
 * Session table for connect-pg-simple
 * IMPORTANT: Keep using raw pg Pool for session store!
 * This schema is only for type inference and introspection.
 */
export const sessions = pgTable('session', {
  sid: varchar('sid', { length: 255 }).primaryKey(),
  sess: json('sess').notNull(),
  expire: timestamp('expire', { withTimezone: true }).notNull(),
});

// Type inference
export type Session = typeof sessions.$inferSelect;
export type NewSession = typeof sessions.$inferInsert;
