"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.defects = void 0;
const pg_core_1 = require("drizzle-orm/pg-core");
const common_1 = require("./common");
exports.defects = (0, pg_core_1.pgTable)('defects', {
    id: (0, pg_core_1.serial)('id').primaryKey(),
    name: (0, pg_core_1.varchar)('name', { length: 100 }).unique().notNull(),
    description: (0, pg_core_1.text)('description'),
    defectGroup: (0, pg_core_1.varchar)('defect_group', { length: 100 }),
    reportOrder: (0, pg_core_1.integer)('report_order'),
    ...common_1.activeColumn,
    ...common_1.auditColumns,
});
