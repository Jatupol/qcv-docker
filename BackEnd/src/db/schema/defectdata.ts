// server/src/db/schema/defectdata.ts
// Defect Data Table Schema

import { pgTable, serial, varchar, integer, timestamp } from 'drizzle-orm/pg-core';

export const defectdata = pgTable('defectdata', {
  id: serial('id').primaryKey(),
  inspectionNo: varchar('inspection_no', { length: 20 }),
  defectDate: timestamp('defect_date', { withTimezone: false }).defaultNow(),
  qcName: varchar('qc_name', { length: 30 }),
  qcleadName: varchar('qclead_name', { length: 30 }),
  mbrName: varchar('mbr_name', { length: 30 }),
  linevi: varchar('linevi', { length: 100 }),
  groupvi: varchar('groupvi', { length: 5 }),
  station: varchar('station', { length: 5 }),
  inspector: varchar('inspector', { length: 20 }),
  defectId: integer('defect_id'),
  defectDetail: varchar('defect_detail', { length: 200 }),
  ngQty: integer('ng_qty').default(0),
  trayno: varchar('trayno', { length: 5 }),
  trayPosition: varchar('tray_position', { length: 5 }),
  color: varchar('color', { length: 20 }),
  defectType: varchar('defect_type', { length: 200 }),
  createdBy: integer('created_by').default(0),
  updatedBy: integer('updated_by').default(0),
  createdAt: timestamp('created_at', { withTimezone: false }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: false }).defaultNow(),
});

// Type inference
export type Defectdata = typeof defectdata.$inferSelect;
export type NewDefectdata = typeof defectdata.$inferInsert;
