"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.purgePolicy = void 0;
const pg_core_1 = require("drizzle-orm/pg-core");
const common_1 = require("./common");
exports.purgePolicy = (0, pg_core_1.pgTable)('purge_policy', {
    id: (0, pg_core_1.serial)('id').primaryKey(),
    targetKey: (0, pg_core_1.varchar)('target_key', { length: 50 }).notNull().unique(),
    label: (0, pg_core_1.varchar)('label', { length: 100 }).notNull(),
    targetType: (0, pg_core_1.varchar)('target_type', { length: 20 }).notNull(),
    enabled: (0, pg_core_1.boolean)('enabled').default(true).notNull(),
    retentionDays: (0, pg_core_1.integer)('retention_days').notNull(),
    dbTableName: (0, pg_core_1.varchar)('db_table_name', { length: 100 }),
    dbTimestampColumn: (0, pg_core_1.varchar)('db_timestamp_column', { length: 50 }),
    lastRunAt: (0, pg_core_1.timestamp)('last_run_at', { withTimezone: false }),
    lastRemovedCount: (0, pg_core_1.integer)('last_removed_count').default(0),
    lastDryRunAt: (0, pg_core_1.timestamp)('last_dry_run_at', { withTimezone: false }),
    lastDryRunCount: (0, pg_core_1.integer)('last_dry_run_count').default(0),
    notes: (0, pg_core_1.text)('notes'),
    ...common_1.auditColumns,
});
