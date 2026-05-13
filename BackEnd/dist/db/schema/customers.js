"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.customers = void 0;
const pg_core_1 = require("drizzle-orm/pg-core");
const common_1 = require("./common");
exports.customers = (0, pg_core_1.pgTable)('customers', {
    code: (0, pg_core_1.varchar)('code', { length: 5 }).primaryKey(),
    name: (0, pg_core_1.varchar)('name', { length: 100 }).unique().notNull(),
    ...common_1.activeColumn,
    ...common_1.auditColumns,
});
