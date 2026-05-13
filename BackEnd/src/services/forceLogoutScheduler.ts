// server/src/services/forceLogoutScheduler.ts
// Server-side enforcement of "force auto-logout" at fixed times of day.
//
// At each configured time, deletes ALL rows from the `session` table
// (the connect-pg-simple store) so every active session is invalidated.
// This is the authoritative kill — it survives closed browsers, sleep, late logins.
//
// Configuration:
//   FORCE_LOGOUT_TIMES env var, comma-separated "HH:MM" in 24h Asia/Bangkok time.
//   Default: "07:35,19:20" (matches the legacy client-side schedule).

import cron, { ScheduledTask } from 'node-cron';
import { Pool } from 'pg';
import { logAuthEvent } from '../utils/authEventLogger';
import { formatDateTimeLocal } from '../utils/dateTimeUtils';

const TIMEZONE = 'Asia/Bangkok';

interface SessionRow {
  sid: string;
  sess: any;
}

function parseTimes(raw: string | undefined): Array<{ hour: number; minute: number }> {
  const fallback = [{ hour: 7, minute: 35 }, { hour: 19, minute: 20 }];
  if (!raw) return fallback;
  const out: Array<{ hour: number; minute: number }> = [];
  for (const part of raw.split(',').map(s => s.trim()).filter(Boolean)) {
    const m = /^(\d{1,2}):(\d{2})$/.exec(part);
    if (!m) {
      console.warn(`[ForceLogoutScheduler] ignoring invalid time "${part}" (expected HH:MM)`);
      continue;
    }
    const hour = parseInt(m[1], 10);
    const minute = parseInt(m[2], 10);
    if (hour < 0 || hour > 23 || minute < 0 || minute > 59) {
      console.warn(`[ForceLogoutScheduler] out-of-range time "${part}" ignored`);
      continue;
    }
    out.push({ hour, minute });
  }
  return out.length > 0 ? out : fallback;
}

export class ForceLogoutScheduler {
  private static instance: ForceLogoutScheduler | null = null;
  private pool: Pool;
  private tasks: ScheduledTask[] = [];
  private times: Array<{ hour: number; minute: number }> = [];
  private startedAt: Date | null = null;
  private lastRunAt: Date | null = null;
  private lastKilledCount: number = 0;

  static getInstance(pool?: Pool): ForceLogoutScheduler {
    if (!ForceLogoutScheduler.instance) {
      if (!pool) throw new Error('ForceLogoutScheduler requires a pool on first call');
      ForceLogoutScheduler.instance = new ForceLogoutScheduler(pool);
    }
    return ForceLogoutScheduler.instance;
  }

  private constructor(pool: Pool) {
    this.pool = pool;
  }

  start(): void {
    if (this.tasks.length > 0) {
      console.log('[ForceLogoutScheduler] already started');
      return;
    }

    this.times = parseTimes(process.env.FORCE_LOGOUT_TIMES);

    for (const t of this.times) {
      const expr = `${t.minute} ${t.hour} * * *`;
      const task = cron.schedule(expr, () => {
        this.runForceLogout(`${pad2(t.hour)}:${pad2(t.minute)}`).catch(err => {
          console.error('[ForceLogoutScheduler] run error:', err);
        });
      }, { timezone: TIMEZONE });
      this.tasks.push(task);
    }

    this.startedAt = new Date();
    console.log('\n' + '='.repeat(60));
    console.log('[ForceLogoutScheduler] started');
    console.log(`   Timezone:    ${TIMEZONE}`);
    console.log(`   Times:       ${this.times.map(t => `${pad2(t.hour)}:${pad2(t.minute)}`).join(', ')}`);
    console.log(`   Source:      ${process.env.FORCE_LOGOUT_TIMES ? 'env FORCE_LOGOUT_TIMES' : 'default'}`);
    console.log('='.repeat(60) + '\n');
  }

  stop(): void {
    for (const t of this.tasks) {
      try { t.stop(); } catch { /* noop */ }
    }
    this.tasks = [];
    console.log('[ForceLogoutScheduler] stopped');
  }

  getStatus() {
    return {
      isEnabled: this.tasks.length > 0,
      times: this.times.map(t => `${pad2(t.hour)}:${pad2(t.minute)}`),
      timezone: TIMEZONE,
      startedAt: this.startedAt ? formatDateTimeLocal(this.startedAt) : null,
      lastRunAt: this.lastRunAt ? formatDateTimeLocal(this.lastRunAt) : null,
      lastKilledCount: this.lastKilledCount,
    };
  }

  /** Manually trigger force logout — used by admin "Run Now" or tests. */
  async runNow(actor: string = 'manual'): Promise<number> {
    return this.runForceLogout('manual', actor);
  }

  private async runForceLogout(label: string, actor: string = 'system'): Promise<number> {
    const startedAt = Date.now();
    console.log(`[ForceLogoutScheduler] firing for window "${label}" — terminating all sessions`);

    let killed = 0;
    let sessionsSnapshot: SessionRow[] = [];
    try {
      // Snapshot active sessions BEFORE deletion so we can log per-user events
      const select = await this.pool.query<SessionRow>(
        `SELECT sid, sess FROM "session" WHERE expire > NOW()`
      );
      sessionsSnapshot = select.rows;

      const del = await this.pool.query(`DELETE FROM "session"`);
      killed = del.rowCount ?? 0;
    } catch (err) {
      console.error('[ForceLogoutScheduler] DB error:', err);
      logAuthEvent({
        type: 'force_logout',
        username: 'system',
        actor,
        reason: `DB_ERROR: ${(err as Error).message}`,
      });
      return 0;
    }

    // Log one event per session that was actually killed
    for (const row of sessionsSnapshot) {
      const sess = (row.sess || {}) as any;
      const username = sess.username || sess.user?.username || 'unknown';
      const userId = sess.userId ?? sess.user?.id ?? null;
      logAuthEvent({
        type: 'force_logout',
        username,
        userId,
        sessionId: row.sid,
        reason: `SCHEDULED:${label}`,
        actor,
      });
    }

    // Always log a system-level summary so the audit trail is non-empty even if no sessions existed
    logAuthEvent({
      type: 'force_logout',
      username: 'system',
      actor,
      reason: `SCHEDULED:${label}:summary killed=${killed}`,
    });

    this.lastRunAt = new Date();
    this.lastKilledCount = killed;
    console.log(`[ForceLogoutScheduler] window "${label}" done — killed ${killed} session(s) in ${Date.now() - startedAt}ms`);
    return killed;
  }
}

function pad2(n: number): string { return String(n).padStart(2, '0'); }

export function getForceLogoutScheduler(pool?: Pool): ForceLogoutScheduler {
  return ForceLogoutScheduler.getInstance(pool);
}
