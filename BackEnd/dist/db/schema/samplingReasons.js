"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.samplingReasons = void 0;
const pg_core_1 = require("drizzle-orm/pg-core");
const common_1 = require("./common");
exports.samplingReasons = (0, pg_core_1.pgTable)('sampling_reasons', {
    id: (0, pg_core_1.serial)('id').primaryKey(),
    name: (0, pg_core_1.varchar)('name', { length: 100 }).unique().notNull(),
    description: (0, pg_core_1.text)('description'),
    ...common_1.activeColumn,
    ...common_1.auditColumns,
});
