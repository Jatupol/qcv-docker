"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.inspectiondata = void 0;
const pg_core_1 = require("drizzle-orm/pg-core");
exports.inspectiondata = (0, pg_core_1.pgTable)('inspectiondata', {
    id: (0, pg_core_1.serial)('id').primaryKey(),
    station: (0, pg_core_1.varchar)('station', { length: 3 }),
    inspectionNo: (0, pg_core_1.varchar)('inspection_no', { length: 20 }).unique(),
    inspectionNoRef: (0, pg_core_1.varchar)('inspection_no_ref', { length: 20 }),
    inspectionDate: (0, pg_core_1.timestamp)('inspection_date', { withTimezone: false }).defaultNow(),
    ww: (0, pg_core_1.varchar)('ww', { length: 2 }),
    fy: (0, pg_core_1.varchar)('fy', { length: 4 }),
    monthYear: (0, pg_core_1.varchar)('month_year', { length: 20 }),
    samplingReasonId: (0, pg_core_1.integer)('sampling_reason_id').default(0),
    shift: (0, pg_core_1.varchar)('shift', { length: 1 }),
    lotno: (0, pg_core_1.varchar)('lotno', { length: 30 }),
    partsite: (0, pg_core_1.varchar)('partsite', { length: 10 }),
    mclineno: (0, pg_core_1.varchar)('mclineno', { length: 10 }),
    itemno: (0, pg_core_1.varchar)('itemno', { length: 30 }),
    model: (0, pg_core_1.varchar)('model', { length: 100 }),
    version: (0, pg_core_1.varchar)('version', { length: 100 }),
    fvilineno: (0, pg_core_1.varchar)('fvilineno', { length: 30 }),
    round: (0, pg_core_1.integer)('round').default(0),
    qcId: (0, pg_core_1.integer)('qc_id').default(0),
    fviLotQty: (0, pg_core_1.integer)('fvi_lot_qty').default(0),
    generalSamplingQty: (0, pg_core_1.integer)('general_sampling_qty').default(0),
    crackSamplingQty: (0, pg_core_1.integer)('crack_sampling_qty').default(0),
    color: (0, pg_core_1.varchar)('color', { length: 20 }),
    judgment: (0, pg_core_1.boolean)('judgment'),
    createdBy: (0, pg_core_1.integer)('created_by').default(0),
    updatedBy: (0, pg_core_1.integer)('updated_by').default(0),
    createdAt: (0, pg_core_1.timestamp)('created_at', { withTimezone: false }).defaultNow(),
    updatedAt: (0, pg_core_1.timestamp)('updated_at', { withTimezone: false }).defaultNow(),
});
