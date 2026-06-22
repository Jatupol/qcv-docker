// server/src/db/schema/inspectiondataCustomer.ts
// Inspection Data Customer Table Schema (synced via trigger)

import { pgTable, varchar, boolean, integer, timestamp } from 'drizzle-orm/pg-core';

export const inspectiondataCustomer = pgTable('inspectiondata_customer', {
  inspectionNo: varchar('inspection_no', { length: 20 }).primaryKey(),
  judgment: boolean('judgment'),
  updatedBy: integer('updated_by').default(0),
  updatedAt: timestamp('updated_at', { withTimezone: false }).defaultNow(),
});

// Type inference
export type InspectiondataCustomer = typeof inspectiondataCustomer.$inferSelect;
export type NewInspectiondataCustomer = typeof inspectiondataCustomer.$inferInsert;
