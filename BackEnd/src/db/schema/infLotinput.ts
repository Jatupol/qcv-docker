// server/src/db/schema/infLotinput.ts
// Interface Lot Input Table Schema (synced from MSSQL)

import { pgTable, varchar, timestamp } from 'drizzle-orm/pg-core';

export const infLotinput = pgTable('inf_lotinput', {
  id: varchar('id', { length: 255 }).primaryKey(),
  lotno: varchar('lotno', { length: 100 }),
  partsite: varchar('partsite', { length: 100 }),
  lineno: varchar('lineno', { length: 100 }),
  itemno: varchar('itemno', { length: 100 }),
  model: varchar('model', { length: 100 }),
  version: varchar('version', { length: 100 }),
  inputdate: timestamp('inputdate', { withTimezone: false }).defaultNow(),
  finishOn: timestamp('finish_on', { withTimezone: false }).defaultNow(),
  importedAt: timestamp('imported_at', { withTimezone: false }).defaultNow(),
});

// Type inference
export type InfLotinput = typeof infLotinput.$inferSelect;
export type NewInfLotinput = typeof infLotinput.$inferInsert;
