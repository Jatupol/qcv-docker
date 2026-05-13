// server/src/db/schema/tblDocument.ts
// Document Table Schema

import { pgTable, varchar } from 'drizzle-orm/pg-core';

export const tblDocument = pgTable('tblDocument', {
  oldDocNo: varchar('OldDocNo', { length: 20 }).primaryKey(),
  newDocNo: varchar('NewDocNo', { length: 20 }),
});

// Type inference
export type TblDocument = typeof tblDocument.$inferSelect;
export type NewTblDocument = typeof tblDocument.$inferInsert;
