// server/src/db/schema/purgePolicy.ts
// Per-target purge retention policies.
//
// Each row maps a target_key (matched in code by the purge target registry)
// to a retention duration. The PurgeJanitor reads enabled rows daily and
// applies retention to the corresponding data source (file group or DB table).
//
// NOTE: The runtime CREATE TABLE IF NOT EXISTS lives in
// `server/src/services/purgeJanitor.ts`. This file exists for Drizzle type
// inference and tooling visibility — both must stay in sync.

import { pgTable, serial, varchar, integer, boolean, timestamp, text } from 'drizzle-orm/pg-core';
import { auditColumns } from './common';

export const purgePolicy = pgTable('purge_policy', {
  id: serial('id').primaryKey(),
  targetKey: varchar('target_key', { length: 50 }).notNull().unique(),
  label: varchar('label', { length: 100 }).notNull(),
  targetType: varchar('target_type', { length: 20 }).notNull(), // 'file' | 'db_table'
  enabled: boolean('enabled').default(true).notNull(),
  retentionDays: integer('retention_days').notNull(),
  // For user-added DB targets: the table + timestamp column to purge from.
  // Built-in targets (registered in code) leave these NULL.
  dbTableName: varchar('db_table_name', { length: 100 }),
  dbTimestampColumn: varchar('db_timestamp_column', { length: 50 }),
  lastRunAt: timestamp('last_run_at', { withTimezone: false }),
  lastRemovedCount: integer('last_removed_count').default(0),
  lastDryRunAt: timestamp('last_dry_run_at', { withTimezone: false }),
  lastDryRunCount: integer('last_dry_run_count').default(0),
  notes: text('notes'),
  ...auditColumns,
});

export type PurgePolicy = typeof purgePolicy.$inferSelect;
export type NewPurgePolicy = typeof purgePolicy.$inferInsert;
