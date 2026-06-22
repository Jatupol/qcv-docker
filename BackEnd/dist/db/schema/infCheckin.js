"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.infCheckin = void 0;
const pg_core_1 = require("drizzle-orm/pg-core");
exports.infCheckin = (0, pg_core_1.pgTable)('inf_checkin', {
    id: (0, pg_core_1.varchar)('id', { length: 255 }).primaryKey(),
    lineNoId: (0, pg_core_1.varchar)('line_no_id', { length: 100 }),
    workShiftId: (0, pg_core_1.varchar)('work_shift_id', { length: 255 }),
    grCode: (0, pg_core_1.varchar)('gr_code', { length: 10 }),
    username: (0, pg_core_1.varchar)('username', { length: 20 }),
    oprname: (0, pg_core_1.varchar)('oprname', { length: 200 }),
    createdOn: (0, pg_core_1.timestamp)('created_on', { withTimezone: false }).defaultNow(),
    checkedOut: (0, pg_core_1.timestamp)('checked_out', { withTimezone: false }).defaultNow(),
    timeOffWork: (0, pg_core_1.varchar)('time_off_work', { length: 5 }),
    groupCode: (0, pg_core_1.varchar)('group_code', { length: 5 }),
    team: (0, pg_core_1.varchar)('team', { length: 1 }),
    timeStartWork: (0, pg_core_1.varchar)('time_start_work', { length: 10 }),
    dateTimeStartWork: (0, pg_core_1.timestamp)('date_time_start_work', { withTimezone: false }).defaultNow(),
    dateTimeOffWork: (0, pg_core_1.timestamp)('date_time_off_work', { withTimezone: false }).defaultNow(),
    importedAt: (0, pg_core_1.timestamp)('imported_at', { withTimezone: false }).defaultNow(),
});
