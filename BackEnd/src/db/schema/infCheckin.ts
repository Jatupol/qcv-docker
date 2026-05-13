// server/src/db/schema/infCheckin.ts
// Interface Check-in Table Schema (synced from MSSQL)

import { pgTable, varchar, timestamp } from 'drizzle-orm/pg-core';

export const infCheckin = pgTable('inf_checkin', {
  id: varchar('id', { length: 255 }).primaryKey(),
  lineNoId: varchar('line_no_id', { length: 100 }),
  workShiftId: varchar('work_shift_id', { length: 255 }),
  grCode: varchar('gr_code', { length: 10 }),
  username: varchar('username', { length: 20 }),
  oprname: varchar('oprname', { length: 200 }),
  createdOn: timestamp('created_on', { withTimezone: false }).defaultNow(),
  checkedOut: timestamp('checked_out', { withTimezone: false }).defaultNow(),
  timeOffWork: varchar('time_off_work', { length: 5 }),
  groupCode: varchar('group_code', { length: 5 }),
  team: varchar('team', { length: 1 }),
  timeStartWork: varchar('time_start_work', { length: 10 }),
  dateTimeStartWork: timestamp('date_time_start_work', { withTimezone: false }).defaultNow(),
  dateTimeOffWork: timestamp('date_time_off_work', { withTimezone: false }).defaultNow(),
  importedAt: timestamp('imported_at', { withTimezone: false }).defaultNow(),
});

// Type inference
export type InfCheckin = typeof infCheckin.$inferSelect;
export type NewInfCheckin = typeof infCheckin.$inferInsert;
