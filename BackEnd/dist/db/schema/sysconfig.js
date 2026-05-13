"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sysconfig = void 0;
const pg_core_1 = require("drizzle-orm/pg-core");
const common_1 = require("./common");
exports.sysconfig = (0, pg_core_1.pgTable)('sysconfig', {
    id: (0, pg_core_1.serial)('id').primaryKey(),
    systemName: (0, pg_core_1.varchar)('system_name', { length: 100 }),
    systemVersion: (0, pg_core_1.varchar)('system_version', { length: 20 }),
    systemUpdated: (0, pg_core_1.timestamp)('system_updated', { withTimezone: false }).defaultNow(),
    smtpServer: (0, pg_core_1.varchar)('smtp_server', { length: 100 }),
    smtpPort: (0, pg_core_1.integer)('smtp_port').default(587),
    smtpUsername: (0, pg_core_1.varchar)('smtp_username', { length: 100 }),
    smtpPassword: (0, pg_core_1.varchar)('smtp_password', { length: 100 }),
    mssqlServer: (0, pg_core_1.varchar)('mssql_server', { length: 100 }),
    mssqlPort: (0, pg_core_1.integer)('mssql_port').default(1433),
    mssqlDatabase: (0, pg_core_1.varchar)('mssql_database', { length: 100 }),
    mssqlUsername: (0, pg_core_1.varchar)('mssql_username', { length: 100 }),
    mssqlPassword: (0, pg_core_1.varchar)('mssql_password', { length: 100 }),
    mssqlSync: (0, pg_core_1.integer)('mssql_sync').default(60),
    mssqlEnabled: (0, pg_core_1.boolean)('mssql_enabled').default(true),
    mssqlExcludeKeywords: (0, pg_core_1.text)('mssql_exclude_keywords'),
    news: (0, pg_core_1.text)('news'),
    fviLotQty: (0, pg_core_1.varchar)('fvi_lot_qty', { length: 100 }),
    generalOqaQty: (0, pg_core_1.varchar)('general_oqa_qty', { length: 100 }),
    crackOqaQty: (0, pg_core_1.varchar)('crack_oqa_qty', { length: 100 }),
    generalSivQty: (0, pg_core_1.varchar)('general_siv_qty', { length: 100 }),
    crackSivQty: (0, pg_core_1.varchar)('crack_siv_qty', { length: 100 }),
    defectType: (0, pg_core_1.varchar)('defect_type', { length: 500 }),
    defectGroup: (0, pg_core_1.varchar)('defect_group', { length: 3000 }),
    defectColor: (0, pg_core_1.varchar)('defect_color', { length: 3000 }),
    shift: (0, pg_core_1.varchar)('shift', { length: 100 }),
    site: (0, pg_core_1.varchar)('site', { length: 100 }),
    tabs: (0, pg_core_1.varchar)('tabs', { length: 100 }),
    productType: (0, pg_core_1.varchar)('product_type', { length: 50 }),
    productFamilies: (0, pg_core_1.varchar)('product_families', { length: 3000 }),
    defectNotificationEmails: (0, pg_core_1.text)('defect_notification_emails'),
    ...common_1.auditColumns,
});
