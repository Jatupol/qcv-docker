"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.defectdataCustomer = void 0;
const pg_core_1 = require("drizzle-orm/pg-core");
exports.defectdataCustomer = (0, pg_core_1.pgTable)('defectdata_customer', {
    id: (0, pg_core_1.serial)('id').primaryKey(),
    inspectionNo: (0, pg_core_1.varchar)('inspection_no', { length: 20 }),
    defectDate: (0, pg_core_1.timestamp)('defect_date', { withTimezone: false }).defaultNow(),
    qcName: (0, pg_core_1.varchar)('qc_name', { length: 30 }),
    qcleadName: (0, pg_core_1.varchar)('qclead_name', { length: 30 }),
    mbrName: (0, pg_core_1.varchar)('mbr_name', { length: 30 }),
    linevi: (0, pg_core_1.varchar)('linevi', { length: 100 }),
    groupvi: (0, pg_core_1.varchar)('groupvi', { length: 5 }),
    station: (0, pg_core_1.varchar)('station', { length: 5 }),
    inspector: (0, pg_core_1.varchar)('inspector', { length: 20 }),
    defectId: (0, pg_core_1.integer)('defect_id'),
    defectDetail: (0, pg_core_1.varchar)('defect_detail', { length: 200 }),
    ngQty: (0, pg_core_1.integer)('ng_qty').default(0),
    trayno: (0, pg_core_1.varchar)('trayno', { length: 5 }),
    trayPosition: (0, pg_core_1.varchar)('tray_position', { length: 5 }),
    color: (0, pg_core_1.varchar)('color', { length: 20 }),
    defectType: (0, pg_core_1.varchar)('defect_type', { length: 200 }),
    createdBy: (0, pg_core_1.integer)('created_by').default(0),
    updatedBy: (0, pg_core_1.integer)('updated_by').default(0),
    createdAt: (0, pg_core_1.timestamp)('created_at', { withTimezone: false }).defaultNow(),
    updatedAt: (0, pg_core_1.timestamp)('updated_at', { withTimezone: false }).defaultNow(),
});
