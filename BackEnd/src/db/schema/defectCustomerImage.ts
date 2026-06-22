// server/src/db/schema/defectCustomerImage.ts
// Defect Customer Image Table Schema

import { pgTable, serial, integer, varchar } from 'drizzle-orm/pg-core';
import { bytea } from './common';

export const defectCustomerImage = pgTable('defect_customer_image', {
  id: serial('id').primaryKey(),
  defectId: integer('defect_id'),
  imgeData: bytea('imge_data'),
  trayno: varchar('trayno', { length: 20 }),
  trayRow: varchar('tray_row', { length: 20 }),
  trayPosition: varchar('tray_position', { length: 20 }),
  photoMagnification: varchar('photo_magnification', { length: 20 }),
  stamp: varchar('stamp', { length: 30 }),
});

// Type inference
export type DefectCustomerImage = typeof defectCustomerImage.$inferSelect;
export type NewDefectCustomerImage = typeof defectCustomerImage.$inferInsert;
