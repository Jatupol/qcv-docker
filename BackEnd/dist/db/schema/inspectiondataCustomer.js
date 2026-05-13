"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.inspectiondataCustomer = void 0;
const pg_core_1 = require("drizzle-orm/pg-core");
exports.inspectiondataCustomer = (0, pg_core_1.pgTable)('inspectiondata_customer', {
    inspectionNo: (0, pg_core_1.varchar)('inspection_no', { length: 20 }).primaryKey(),
    judgment: (0, pg_core_1.boolean)('judgment'),
    updatedBy: (0, pg_core_1.integer)('updated_by').default(0),
    updatedAt: (0, pg_core_1.timestamp)('updated_at', { withTimezone: false }).defaultNow(),
});
