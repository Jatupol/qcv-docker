// server/src/services/purge/targets/logInterfaceTarget.ts
// DB purge target: rows in `log_interface` (MSSQL sync audit log).
// Cutoff is exclusive: rows with import_date strictly before (now - retentionDays) are removed.

import { Pool } from 'pg';
import type { PurgeTarget } from '../types';

export function createLogInterfaceTarget(pool: Pool): PurgeTarget {
  return {
    key: 'log_interface',
    label: 'MSSQL Sync Audit Log (log_interface)',
    type: 'db_table',
    defaultRetentionDays: 90,

    async count(retentionDays: number): Promise<number> {
      const res = await pool.query<{ count: string }>(
        `SELECT COUNT(*)::text AS count
           FROM log_interface
          WHERE import_date < NOW() - ($1 || ' days')::interval`,
        [String(retentionDays)],
      );
      return parseInt(res.rows[0]?.count ?? '0', 10);
    },

    async purge(retentionDays: number): Promise<{ removed: number }> {
      const res = await pool.query(
        `DELETE FROM log_interface
           WHERE import_date < NOW() - ($1 || ' days')::interval`,
        [String(retentionDays)],
      );
      return { removed: res.rowCount ?? 0 };
    },
  };
}
