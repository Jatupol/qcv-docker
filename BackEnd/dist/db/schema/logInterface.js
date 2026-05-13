"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.logInterface = void 0;
const pg_core_1 = require("drizzle-orm/pg-core");
exports.logInterface = (0, pg_core_1.pgTable)('log_interface', {
    id: (0, pg_core_1.serial)('id').primaryKey(),
    tablename: (0, pg_core_1.varchar)('tablename', { length: 3 }).notNull(),
    importDate: (0, pg_core_1.timestamp)('import_date', { withTimezone: false }).defaultNow(),
    errorMessage: (0, pg_core_1.text)('error_message'),
    createdBy: (0, pg_core_1.integer)('created_by').default(0),
    recordsImported: (0, pg_core_1.integer)('records_imported').default(0),
    recordsUpdated: (0, pg_core_1.integer)('records_updated').default(0),
    recordsSkipped: (0, pg_core_1.integer)('records_skipped').default(0),
    recordsFailed: (0, pg_core_1.integer)('records_failed').default(0),
    durationMs: (0, pg_core_1.integer)('duration_ms'),
    createdAt: (0, pg_core_1.timestamp)('created_at', { withTimezone: false }).defaultNow(),
});
