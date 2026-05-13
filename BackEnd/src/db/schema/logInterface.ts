// server/src/db/schema/logInterface.ts
// Interface Log Table Schema

import { pgTable, serial, varchar, text, integer, timestamp } from 'drizzle-orm/pg-core';

export const logInterface = pgTable('log_interface', {
  id: serial('id').primaryKey(),
  tablename: varchar('tablename', { length: 3 }).notNull(), // 'LIN' = Lot Input, 'CHK' = Check In, 'UOP' = User Operation
  importDate: timestamp('import_date', { withTimezone: false }).defaultNow(),
  errorMessage: text('error_message'),
  createdBy: integer('created_by').default(0),
  recordsImported: integer('records_imported').default(0),
  recordsUpdated: integer('records_updated').default(0),
  recordsSkipped: integer('records_skipped').default(0),
  recordsFailed: integer('records_failed').default(0),
  durationMs: integer('duration_ms'),
  createdAt: timestamp('created_at', { withTimezone: false }).defaultNow(),
});

// Type inference
export type LogInterface = typeof logInterface.$inferSelect;
export type NewLogInterface = typeof logInterface.$inferInsert;
