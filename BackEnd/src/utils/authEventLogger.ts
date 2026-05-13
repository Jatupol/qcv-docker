// server/src/utils/authEventLogger.ts
// Append-only NDJSON logger for authentication events.
// Each line: a single JSON object terminated by \n.
// File rotates daily by name: logs/auth-events-YYYY-MM-DD.log

import fs from 'fs';
import path from 'path';
import { formatDateTimeLocal } from './dateTimeUtils';

export type AuthEventType =
  | 'login_success'
  | 'login_failed'
  | 'logout'
  | 'force_logout'
  | 'session_expired'
  | 'session_kicked';

export interface AuthEvent {
  ts: string;            // Local-naive datetime "YYYY-MM-DDTHH:mm:ss" (project convention)
  type: AuthEventType;
  username: string;
  userId?: number | null;
  ip?: string;
  userAgent?: string;
  sessionId?: string;
  reason?: string;       // error code or note (e.g. INVALID_CREDENTIALS, SCHEDULED, ADMIN_KICK)
  actor?: string;        // for force_logout/session_kicked: who triggered it (admin username or 'system')
}

const LOG_DIR = path.resolve(process.cwd(), 'logs');
const FILE_PREFIX = 'auth-events-';
const FILE_SUFFIX = '.log';

function ensureDir(): void {
  if (!fs.existsSync(LOG_DIR)) {
    fs.mkdirSync(LOG_DIR, { recursive: true });
  }
}

function todayKey(d = new Date()): string {
  // Local date in YYYY-MM-DD (server runs Asia/Bangkok)
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function fileForDate(d = new Date()): string {
  return path.join(LOG_DIR, `${FILE_PREFIX}${todayKey(d)}${FILE_SUFFIX}`);
}

export function logAuthEvent(event: Omit<AuthEvent, 'ts'> & { ts?: string }): void {
  try {
    ensureDir();
    const record: AuthEvent = { ts: event.ts || formatDateTimeLocal(new Date()), ...event };
    fs.appendFile(fileForDate(), JSON.stringify(record) + '\n', err => {
      if (err) console.error('[authEventLogger] append failed:', err.message);
    });
  } catch (err) {
    console.error('[authEventLogger] unexpected error:', err);
  }
}

export interface AuthEventQuery {
  from?: Date;        // inclusive
  to?: Date;          // inclusive
  username?: string;  // exact match (case-insensitive)
  type?: AuthEventType | AuthEventType[];
  limit?: number;     // default 500, max 5000
  offset?: number;    // default 0
}

export interface AuthEventQueryResult {
  events: AuthEvent[];
  total: number;       // total matched (before limit/offset), capped at scanCap
  scanned: number;     // total lines read
  truncated: boolean;  // true if scan stopped at scanCap
}

const SCAN_CAP = 50_000; // safety cap per query

function listLogFilesInRange(from?: Date, to?: Date): string[] {
  ensureDir();
  let names: string[];
  try {
    names = fs.readdirSync(LOG_DIR).filter(n => n.startsWith(FILE_PREFIX) && n.endsWith(FILE_SUFFIX));
  } catch {
    return [];
  }

  const fromKey = from ? todayKey(from) : '';
  const toKey = to ? todayKey(to) : '\uffff';

  const inRange = names.filter(n => {
    const key = n.slice(FILE_PREFIX.length, -FILE_SUFFIX.length);
    return key >= fromKey && key <= toKey;
  });

  // Newest first so most recent events come back first
  inRange.sort().reverse();
  return inRange.map(n => path.join(LOG_DIR, n));
}

export function queryAuthEvents(q: AuthEventQuery = {}): AuthEventQueryResult {
  const limit = Math.min(Math.max(q.limit ?? 500, 1), 5000);
  const offset = Math.max(q.offset ?? 0, 0);
  const types = q.type ? (Array.isArray(q.type) ? q.type : [q.type]) : null;
  const usernameLower = q.username ? q.username.toLowerCase() : null;
  const fromMs = q.from?.getTime();
  const toMs = q.to?.getTime();

  const matched: AuthEvent[] = [];
  let scanned = 0;
  let truncated = false;

  const files = listLogFilesInRange(q.from, q.to);

  outer:
  for (const file of files) {
    let raw: string;
    try {
      raw = fs.readFileSync(file, 'utf8');
    } catch {
      continue;
    }
    // Iterate newest line first
    const lines = raw.split('\n');
    for (let i = lines.length - 1; i >= 0; i--) {
      const line = lines[i];
      if (!line) continue;
      scanned++;
      if (scanned > SCAN_CAP) { truncated = true; break outer; }
      let evt: AuthEvent;
      try { evt = JSON.parse(line); } catch { continue; }

      if (types && !types.includes(evt.type)) continue;
      if (usernameLower && (evt.username || '').toLowerCase() !== usernameLower) continue;
      if (fromMs || toMs) {
        const tsMs = Date.parse(evt.ts);
        if (Number.isNaN(tsMs)) continue;
        if (fromMs !== undefined && tsMs < fromMs) continue;
        if (toMs !== undefined && tsMs > toMs) continue;
      }
      matched.push(evt);
    }
  }

  const total = matched.length;
  const events = matched.slice(offset, offset + limit);
  return { events, total, scanned, truncated };
}

/**
 * Delete auth-event log files older than `retentionDays`.
 * Cutoff is based on the YYYY-MM-DD encoded in the filename, not mtime,
 * because mtime can drift across container rebuilds and file copies.
 *
 * Returns the list of file names that were removed.
 */
export function purgeOldLogs(retentionDays: number = 90): string[] {
  ensureDir();
  if (!Number.isFinite(retentionDays) || retentionDays < 1) {
    console.warn(`[authEventLogger] invalid retentionDays=${retentionDays}, skipping purge`);
    return [];
  }

  const cutoff = new Date();
  cutoff.setHours(0, 0, 0, 0);
  cutoff.setDate(cutoff.getDate() - retentionDays);
  const cutoffKey = todayKey(cutoff);

  let names: string[];
  try {
    names = fs.readdirSync(LOG_DIR).filter(n => n.startsWith(FILE_PREFIX) && n.endsWith(FILE_SUFFIX));
  } catch (err) {
    console.error('[authEventLogger] purge readdir failed:', err);
    return [];
  }

  const removed: string[] = [];
  for (const name of names) {
    const key = name.slice(FILE_PREFIX.length, -FILE_SUFFIX.length);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(key)) continue;
    if (key >= cutoffKey) continue;
    try {
      fs.unlinkSync(path.join(LOG_DIR, name));
      removed.push(name);
    } catch (err) {
      console.error(`[authEventLogger] failed to delete ${name}:`, err);
    }
  }
  return removed;
}

/**
 * Dry-run sibling of `purgeOldLogs` — counts files older than the cutoff
 * without deleting anything. Used by the purge target's `count()` method.
 */
export function countOldLogs(retentionDays: number = 90): number {
  ensureDir();
  if (!Number.isFinite(retentionDays) || retentionDays < 1) return 0;

  const cutoff = new Date();
  cutoff.setHours(0, 0, 0, 0);
  cutoff.setDate(cutoff.getDate() - retentionDays);
  const cutoffKey = todayKey(cutoff);

  let names: string[];
  try {
    names = fs.readdirSync(LOG_DIR).filter(n => n.startsWith(FILE_PREFIX) && n.endsWith(FILE_SUFFIX));
  } catch {
    return 0;
  }

  let n = 0;
  for (const name of names) {
    const key = name.slice(FILE_PREFIX.length, -FILE_SUFFIX.length);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(key)) continue;
    if (key >= cutoffKey) continue;
    n++;
  }
  return n;
}

export default { logAuthEvent, queryAuthEvents, purgeOldLogs, countOldLogs };
