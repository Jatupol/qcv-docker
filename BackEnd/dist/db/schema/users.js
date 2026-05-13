"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.users = void 0;
const pg_core_1 = require("drizzle-orm/pg-core");
exports.users = (0, pg_core_1.pgTable)('users', {
    id: (0, pg_core_1.serial)('id').primaryKey(),
    username: (0, pg_core_1.varchar)('username', { length: 50 }).unique().notNull(),
    email: (0, pg_core_1.varchar)('email', { length: 255 }).unique(),
    passwordHash: (0, pg_core_1.varchar)('password_hash', { length: 255 }).notNull(),
    name: (0, pg_core_1.varchar)('name', { length: 250 }).notNull(),
    role: (0, pg_core_1.varchar)('role', { length: 20 }).default('user'),
    position: (0, pg_core_1.varchar)('position', { length: 30 }).default(''),
    workShift: (0, pg_core_1.varchar)('work_shift', { length: 1 }),
    checkin: (0, pg_core_1.timestamp)('checkin', { withTimezone: false }),
    team: (0, pg_core_1.varchar)('team', { length: 5 }),
    linevi: (0, pg_core_1.varchar)('linevi', { length: 100 }),
    timeStartWork: (0, pg_core_1.time)('time_start_work', { withTimezone: false }),
    timeOffWork: (0, pg_core_1.time)('time_off_work', { withTimezone: false }),
    isActive: (0, pg_core_1.boolean)('is_active').default(true),
    createdBy: (0, pg_core_1.integer)('created_by').default(0),
    updatedBy: (0, pg_core_1.integer)('updated_by').default(0),
    createdAt: (0, pg_core_1.timestamp)('created_at', { withTimezone: false }).defaultNow(),
    updatedAt: (0, pg_core_1.timestamp)('updated_at', { withTimezone: false }).defaultNow(),
});
