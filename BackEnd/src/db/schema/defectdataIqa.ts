// server/src/db/schema/defectdataIqa.ts
// Defect Data IQA Table Schema

import { pgTable, serial, integer, varchar } from 'drizzle-orm/pg-core';
import { bytea } from './common';

export const defectdataIqa = pgTable('defectdata_iqa', {
  id: serial('id').primaryKey(),
  iqaid: integer('iqaid'),
  defectId: integer('defect_id'),
  defectDescription: varchar('defect_description', { length: 200 }),
  imgeData: bytea('imge_data'),
});

// Type inference
export type DefectdataIqa = typeof defectdataIqa.$inferSelect;
export type NewDefectdataIqa = typeof defectdataIqa.$inferInsert;
