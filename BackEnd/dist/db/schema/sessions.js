"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sessions = void 0;
const pg_core_1 = require("drizzle-orm/pg-core");
exports.sessions = (0, pg_core_1.pgTable)('session', {
    sid: (0, pg_core_1.varchar)('sid', { length: 255 }).primaryKey(),
    sess: (0, pg_core_1.json)('sess').notNull(),
    expire: (0, pg_core_1.timestamp)('expire', { withTimezone: true }).notNull(),
});
