"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parts = void 0;
const pg_core_1 = require("drizzle-orm/pg-core");
exports.parts = (0, pg_core_1.pgTable)('parts', {
    partno: (0, pg_core_1.varchar)('partno', { length: 25 }).primaryKey(),
    partnoCustomer: (0, pg_core_1.varchar)('partno_customer', { length: 50 }),
    productFamilies: (0, pg_core_1.varchar)('product_families', { length: 10 }),
    versions: (0, pg_core_1.varchar)('versions', { length: 20 }),
    customersSite: (0, pg_core_1.varchar)('customers_site', { length: 10 }),
    tab: (0, pg_core_1.varchar)('tab', { length: 5 }),
    productType: (0, pg_core_1.varchar)('product_type', { length: 5 }),
    customerDriver: (0, pg_core_1.varchar)('customer_driver', { length: 200 }),
    larAchieveThreshold: (0, pg_core_1.decimal)('lar_achieve_threshold', { precision: 5, scale: 2 }).default('97.00'),
    larAcceptMinThreshold: (0, pg_core_1.decimal)('lar_accept_min_threshold', { precision: 5, scale: 2 }).default('88.00'),
    larAcceptMaxThreshold: (0, pg_core_1.decimal)('lar_accept_max_threshold', { precision: 5, scale: 2 }).default('97.00'),
    larAbnormalThreshold: (0, pg_core_1.decimal)('lar_abnormal_threshold', { precision: 5, scale: 2 }).default('88.00'),
    dppmAchieveThreshold: (0, pg_core_1.decimal)('dppm_achieve_threshold', { precision: 8, scale: 2 }).default('300.00'),
    dppmAcceptMinThreshold: (0, pg_core_1.decimal)('dppm_accept_min_threshold', { precision: 8, scale: 2 }).default('300.00'),
    dppmAcceptMaxThreshold: (0, pg_core_1.decimal)('dppm_accept_max_threshold', { precision: 8, scale: 2 }).default('1000.00'),
    dppmAbnormalThreshold: (0, pg_core_1.decimal)('dppm_abnormal_threshold', { precision: 8, scale: 2 }).default('1000.00'),
    underkillAchieveThreshold: (0, pg_core_1.decimal)('underkill_achieve_threshold', { precision: 5, scale: 2 }).default('0.02'),
    underkillAcceptMinThreshold: (0, pg_core_1.decimal)('underkill_accept_min_threshold', { precision: 5, scale: 2 }).default('0.02'),
    underkillAcceptMaxThreshold: (0, pg_core_1.decimal)('underkill_accept_max_threshold', { precision: 5, scale: 2 }).default('0.01'),
    underkillAbnormalThreshold: (0, pg_core_1.decimal)('underkill_abnormal_threshold', { precision: 5, scale: 2 }).default('0.01'),
    isActive: (0, pg_core_1.boolean)('is_active').default(true),
    createdBy: (0, pg_core_1.integer)('created_by').default(0),
    updatedBy: (0, pg_core_1.integer)('updated_by').default(0),
    createdAt: (0, pg_core_1.timestamp)('created_at', { withTimezone: false }).defaultNow(),
    updatedAt: (0, pg_core_1.timestamp)('updated_at', { withTimezone: false }).defaultNow(),
});
