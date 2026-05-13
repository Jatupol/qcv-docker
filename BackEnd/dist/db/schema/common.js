"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.bytea = exports.activeColumn = exports.auditColumns = void 0;
const pg_core_1 = require("drizzle-orm/pg-core");
exports.auditColumns = {
    createdBy: (0, pg_core_1.integer)('created_by').default(0),
    updatedBy: (0, pg_core_1.integer)('updated_by').default(0),
    createdAt: (0, pg_core_1.timestamp)('created_at', { withTimezone: false }).defaultNow(),
    updatedAt: (0, pg_core_1.timestamp)('updated_at', { withTimezone: false }).defaultNow(),
};
exports.activeColumn = {
    isActive: (0, pg_core_1.boolean)('is_active').default(true),
};
exports.bytea = (0, pg_core_1.customType)({
    dataType() {
        return 'bytea';
    },
    toDriver(value) {
        return '\\x' + value.toString('hex');
    },
    fromDriver(value) {
        if (Buffer.isBuffer(value))
            return value;
        if (typeof value === 'string') {
            if (value.startsWith('\\x')) {
                return Buffer.from(value.slice(2), 'hex');
            }
            return Buffer.from(value, 'hex');
        }
        throw new Error('Invalid bytea value');
    },
});
