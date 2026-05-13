// server/src/db/schema/samplingReasons.ts
// Sampling Reasons Table Schema

import { pgTable, serial, varchar, text } from 'drizzle-orm/pg-core';
import { auditColumns, activeColumn } from './common';

export const samplingReasons = pgTable('sampling_reasons', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 100 }).unique().notNull(),
  description: text('description'),
  ...activeColumn,
  ...auditColumns,
});

// Type inference
export type SamplingReason = typeof samplingReasons.$inferSelect;
export type NewSamplingReason = typeof samplingReasons.$inferInsert;
