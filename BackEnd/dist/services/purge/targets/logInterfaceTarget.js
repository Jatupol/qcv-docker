"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createLogInterfaceTarget = createLogInterfaceTarget;
function createLogInterfaceTarget(pool) {
    return {
        key: 'log_interface',
        label: 'MSSQL Sync Audit Log (log_interface)',
        type: 'db_table',
        defaultRetentionDays: 90,
        async count(retentionDays) {
            const res = await pool.query(`SELECT COUNT(*)::text AS count
           FROM log_interface
          WHERE import_date < NOW() - ($1 || ' days')::interval`, [String(retentionDays)]);
            return parseInt(res.rows[0]?.count ?? '0', 10);
        },
        async purge(retentionDays) {
            const res = await pool.query(`DELETE FROM log_interface
           WHERE import_date < NOW() - ($1 || ' days')::interval`, [String(retentionDays)]);
            return { removed: res.rowCount ?? 0 };
        },
    };
}
