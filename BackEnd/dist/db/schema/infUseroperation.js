"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.infUseroperation = void 0;
const pg_core_1 = require("drizzle-orm/pg-core");
exports.infUseroperation = (0, pg_core_1.pgTable)('inf_useroperation', {
    username: (0, pg_core_1.varchar)('username', { length: 20 }).primaryKey(),
    isActive: (0, pg_core_1.boolean)('is_active').default(true),
    isDelete: (0, pg_core_1.boolean)('is_delete').default(false),
    isSuperAdmin: (0, pg_core_1.boolean)('is_super_admin').default(false),
    roleCode: (0, pg_core_1.varchar)('role_code', { length: 255 }),
    operatorName: (0, pg_core_1.varchar)('operator_name', { length: 255 }),
    isMrb: (0, pg_core_1.boolean)('is_mrb').default(false),
    lineNoId: (0, pg_core_1.varchar)('line_no_id', { length: 255 }),
    workShiftId: (0, pg_core_1.varchar)('work_shift_id', { length: 255 }),
    importedAt: (0, pg_core_1.timestamp)('imported_at', { withTimezone: false }).defaultNow(),
});
