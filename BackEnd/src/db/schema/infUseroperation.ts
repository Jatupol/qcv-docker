// server/src/db/schema/infUseroperation.ts
// Interface User Operation Table Schema (synced from MSSQL)

import { pgTable, varchar, boolean, timestamp } from 'drizzle-orm/pg-core';

export const infUseroperation = pgTable('inf_useroperation', {
  username: varchar('username', { length: 20 }).primaryKey(),
  isActive: boolean('is_active').default(true),
  isDelete: boolean('is_delete').default(false),
  isSuperAdmin: boolean('is_super_admin').default(false),
  roleCode: varchar('role_code', { length: 255 }),
  operatorName: varchar('operator_name', { length: 255 }),
  isMrb: boolean('is_mrb').default(false),
  lineNoId: varchar('line_no_id', { length: 255 }),
  workShiftId: varchar('work_shift_id', { length: 255 }),
  importedAt: timestamp('imported_at', { withTimezone: false }).defaultNow(),
});

// Type inference
export type InfUseroperation = typeof infUseroperation.$inferSelect;
export type NewInfUseroperation = typeof infUseroperation.$inferInsert;
