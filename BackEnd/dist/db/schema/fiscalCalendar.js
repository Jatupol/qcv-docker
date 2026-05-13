"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.fiscalCalendar = void 0;
const pg_core_1 = require("drizzle-orm/pg-core");
exports.fiscalCalendar = (0, pg_core_1.pgTable)('fiscal_calendar', {
    calendarDate: (0, pg_core_1.date)('calendar_date').primaryKey(),
    yearmonth: (0, pg_core_1.varchar)('yearmonth', { length: 4 }).notNull(),
    fiscalYear: (0, pg_core_1.varchar)('fiscal_year', { length: 4 }).notNull(),
    ww: (0, pg_core_1.varchar)('ww', { length: 2 }).notNull(),
});
