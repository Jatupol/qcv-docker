"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.customersSite = void 0;
const pg_core_1 = require("drizzle-orm/pg-core");
const common_1 = require("./common");
exports.customersSite = (0, pg_core_1.pgTable)('customers_site', {
    code: (0, pg_core_1.varchar)('code', { length: 10 }).primaryKey(),
    customers: (0, pg_core_1.varchar)('customers', { length: 5 }),
    site: (0, pg_core_1.varchar)('site', { length: 5 }),
    ...common_1.activeColumn,
    ...common_1.auditColumns,
});
