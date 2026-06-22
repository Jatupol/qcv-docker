"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.systemInfo = void 0;
const pg_core_1 = require("drizzle-orm/pg-core");
exports.systemInfo = (0, pg_core_1.pgTable)('system_info', {
    id: (0, pg_core_1.integer)('id').primaryKey(),
    version: (0, pg_core_1.varchar)('version', { length: 50 }),
    deployedAt: (0, pg_core_1.timestamp)('deployed_at', { withTimezone: false }),
    environment: (0, pg_core_1.varchar)('environment', { length: 20 }),
});
