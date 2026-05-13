"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.infLotinput = void 0;
const pg_core_1 = require("drizzle-orm/pg-core");
exports.infLotinput = (0, pg_core_1.pgTable)('inf_lotinput', {
    id: (0, pg_core_1.varchar)('id', { length: 255 }).primaryKey(),
    lotno: (0, pg_core_1.varchar)('lotno', { length: 100 }),
    partsite: (0, pg_core_1.varchar)('partsite', { length: 100 }),
    lineno: (0, pg_core_1.varchar)('lineno', { length: 100 }),
    itemno: (0, pg_core_1.varchar)('itemno', { length: 100 }),
    model: (0, pg_core_1.varchar)('model', { length: 100 }),
    version: (0, pg_core_1.varchar)('version', { length: 100 }),
    inputdate: (0, pg_core_1.timestamp)('inputdate', { withTimezone: false }).defaultNow(),
    finishOn: (0, pg_core_1.timestamp)('finish_on', { withTimezone: false }).defaultNow(),
    importedAt: (0, pg_core_1.timestamp)('imported_at', { withTimezone: false }).defaultNow(),
});
