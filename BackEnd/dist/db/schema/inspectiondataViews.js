"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.vInspectiondataCustomer = exports.vInspectiondata = void 0;
const pg_core_1 = require("drizzle-orm/pg-core");
const pg_core_2 = require("drizzle-orm/pg-core");
const viewColumns = {
    id: (0, pg_core_2.integer)('id'),
    station: (0, pg_core_2.varchar)('station', { length: 3 }),
    inspectionNo: (0, pg_core_2.varchar)('inspection_no', { length: 20 }),
    inspectionNoRef: (0, pg_core_2.varchar)('inspection_no_ref', { length: 20 }),
    inspectionDate: (0, pg_core_2.timestamp)('inspection_date', { withTimezone: false }),
    ww: (0, pg_core_2.varchar)('ww', { length: 2 }),
    fy: (0, pg_core_2.varchar)('fy', { length: 4 }),
    monthYear: (0, pg_core_2.varchar)('month_year', { length: 20 }),
    samplingReasonId: (0, pg_core_2.integer)('sampling_reason_id'),
    shift: (0, pg_core_2.varchar)('shift', { length: 1 }),
    lotno: (0, pg_core_2.varchar)('lotno', { length: 30 }),
    partsite: (0, pg_core_2.varchar)('partsite', { length: 10 }),
    mclineno: (0, pg_core_2.varchar)('mclineno', { length: 10 }),
    itemno: (0, pg_core_2.varchar)('itemno', { length: 30 }),
    model: (0, pg_core_2.varchar)('model', { length: 100 }),
    version: (0, pg_core_2.varchar)('version', { length: 100 }),
    fvilineno: (0, pg_core_2.varchar)('fvilineno', { length: 30 }),
    round: (0, pg_core_2.integer)('round'),
    qcId: (0, pg_core_2.integer)('qc_id'),
    fviLotQty: (0, pg_core_2.integer)('fvi_lot_qty'),
    generalSamplingQty: (0, pg_core_2.integer)('general_sampling_qty'),
    crackSamplingQty: (0, pg_core_2.integer)('crack_sampling_qty'),
    color: (0, pg_core_2.varchar)('color', { length: 20 }),
    judgment: (0, pg_core_2.boolean)('judgment'),
    createdBy: (0, pg_core_2.integer)('created_by'),
    updatedBy: (0, pg_core_2.integer)('updated_by'),
    createdAt: (0, pg_core_2.timestamp)('created_at', { withTimezone: false }),
    updatedAt: (0, pg_core_2.timestamp)('updated_at', { withTimezone: false }),
};
exports.vInspectiondata = (0, pg_core_1.pgView)('v_inspectiondata', viewColumns).existing();
exports.vInspectiondataCustomer = (0, pg_core_1.pgView)('v_inspectiondata_customer', viewColumns).existing();
