// server/src/db/schema/defects.ts
// Defects Table Schema

import { pgTable, serial, varchar, text } from 'drizzle-orm/pg-core';
import { auditColumns, activeColumn } from './common';

export const defects = pgTable('defects', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 100 }).unique().notNull(),
  description: text('description'),
  defectGroup: varchar('defect_group', { length: 100 }),
  ...activeColumn,
  ...auditColumns,
});

// Type inference
export type Defect = typeof defects.$inferSelect;
export type NewDefect = typeof defects.$inferInsert;
