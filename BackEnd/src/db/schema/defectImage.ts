// server/src/db/schema/defectImage.ts
// Defect Image Table Schema

import { pgTable, serial, integer, varchar } from 'drizzle-orm/pg-core';
import { bytea } from './common';

export const defectImage = pgTable('defect_image', {
  id: serial('id').primaryKey(),
  defectId: integer('defect_id'),
  imgeData: bytea('imge_data'),
  trayno: varchar('trayno', { length: 20 }),
  trayRow: varchar('tray_row', { length: 20 }),
  trayPosition: varchar('tray_position', { length: 20 }),
  photoMagnification: varchar('photo_magnification', { length: 50 }),
  stamp: varchar('stamp', { length: 30 }),
});

// Type inference
export type DefectImage = typeof defectImage.$inferSelect;
export type NewDefectImage = typeof defectImage.$inferInsert;
