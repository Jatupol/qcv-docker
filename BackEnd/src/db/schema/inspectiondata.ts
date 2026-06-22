// server/src/db/schema/inspectiondata.ts
// Inspection Data Table Schema

import { pgTable, serial, varchar, integer, boolean, timestamp } from 'drizzle-orm/pg-core';

export const inspectiondata = pgTable('inspectiondata', {
  id: serial('id').primaryKey(),
  station: varchar('station', { length: 3 }),
  inspectionNo: varchar('inspection_no', { length: 20 }).unique(),
  inspectionNoRef: varchar('inspection_no_ref', { length: 20 }),
  // Use timestamp WITHOUT timezone to preserve local time exactly as entered
  // This prevents UTC conversion (e.g., 15:56 local stays as 15:56, not converted to 08:56 UTC)
  inspectionDate: timestamp('inspection_date', { withTimezone: false }).defaultNow(),
  ww: varchar('ww', { length: 2 }),
  fy: varchar('fy', { length: 4 }),
  monthYear: varchar('month_year', { length: 20 }),
  samplingReasonId: integer('sampling_reason_id').default(0),
  shift: varchar('shift', { length: 1 }),
  lotno: varchar('lotno', { length: 30 }),
  partsite: varchar('partsite', { length: 10 }),
  mclineno: varchar('mclineno', { length: 10 }),
  itemno: varchar('itemno', { length: 30 }),
  model: varchar('model', { length: 100 }),
  version: varchar('version', { length: 100 }),
  fvilineno: varchar('fvilineno', { length: 30 }),
  round: integer('round').default(0),
  qcId: integer('qc_id').default(0),
  fviLotQty: integer('fvi_lot_qty').default(0),
  generalSamplingQty: integer('general_sampling_qty').default(0),
  crackSamplingQty: integer('crack_sampling_qty').default(0),
  color: varchar('color', { length: 20 }),
  judgment: boolean('judgment'),
  createdBy: integer('created_by').default(0),
  updatedBy: integer('updated_by').default(0),
  createdAt: timestamp('created_at', { withTimezone: false }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: false }).defaultNow(),
});

// Type inference
export type Inspectiondata = typeof inspectiondata.$inferSelect;
export type NewInspectiondata = typeof inspectiondata.$inferInsert;
