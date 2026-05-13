// server/src/db/schema/fiscalCalendar.ts
// Fiscal Calendar Lookup Table Schema

import { date, pgTable, varchar } from 'drizzle-orm/pg-core';

export const fiscalCalendar = pgTable('fiscal_calendar', {
  calendarDate: date('calendar_date').primaryKey(),
  yearmonth: varchar('yearmonth', { length: 4 }).notNull(),
  fiscalYear: varchar('fiscal_year', { length: 4 }).notNull(),
  ww: varchar('ww', { length: 2 }).notNull(),
});

// Type inference
export type FiscalCalendar = typeof fiscalCalendar.$inferSelect;
export type NewFiscalCalendar = typeof fiscalCalendar.$inferInsert;
