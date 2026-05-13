// server/src/services/purge/targets/authEventsTarget.ts
// File-based purge target: rotates auth-event NDJSON files at logs/auth-events-YYYY-MM-DD.log

import { countOldLogs, purgeOldLogs } from '../../../utils/authEventLogger';
import type { PurgeTarget } from '../types';

export const authEventsTarget: PurgeTarget = {
  key: 'auth_events',
  label: 'Auth Event Log Files',
  type: 'file',
  defaultRetentionDays: 90,

  async count(retentionDays: number): Promise<number> {
    return countOldLogs(retentionDays);
  },

  async purge(retentionDays: number): Promise<{ removed: number; details?: string[] }> {
    const removed = purgeOldLogs(retentionDays);
    return { removed: removed.length, details: removed };
  },
};
