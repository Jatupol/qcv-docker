// server/src/routes/adminAuthRoutes.ts
// Admin-only API for session monitoring and auth audit log.
//
// Endpoints (all require authenticated admin):
//   GET    /api/admin/sessions              — list active sessions (parsed from `session` table)
//   DELETE /api/admin/sessions/:sid         — kick a single session (admin force logout)
//   POST   /api/admin/sessions/force-logout — run the force-logout scheduler immediately for ALL sessions
//   GET    /api/admin/auth-events           — paged read of auth-events log files
//   GET    /api/admin/force-logout/status   — scheduler status (configured times, last run)

import { Router, Request, Response } from 'express';
import { Pool } from 'pg';
import { requireAuthentication, requireAdmin } from '../middleware/auth';
import { logAuthEvent, queryAuthEvents, AuthEventType } from '../utils/authEventLogger';
import { getForceLogoutScheduler } from '../services/forceLogoutScheduler';
import { formatDateTimeLocal } from '../utils/dateTimeUtils';

interface SessionRow {
  sid: string;
  sess: any;
  expire: Date;
}

const toLocal = (v: Date | string | null | undefined): string | null =>
  v ? formatDateTimeLocal(v) : null;

export function createAdminAuthRoutes(db: Pool): Router {
  const router = Router();

  // All routes below require admin
  router.use(requireAuthentication, requireAdmin);

  /**
   * GET /api/admin/sessions
   * Returns all sessions that have not yet expired. Each row is enriched with
   * username/role/loginTime parsed from the JSON `sess` column.
   */
  router.get('/sessions', async (req: Request, res: Response) => {
    try {
      const result = await db.query<SessionRow>(
        `SELECT sid, sess, expire
           FROM "session"
          WHERE expire > NOW()
          ORDER BY expire DESC`
      );

      const sessions = result.rows.map(row => {
        const s = (row.sess || {}) as any;
        return {
          sid: row.sid,
          username: s.username || s.user?.username || null,
          userId: s.userId ?? s.user?.id ?? null,
          role: s.role || s.user?.role || null,
          loginTime: toLocal(s.loginTime),
          lastActivity: toLocal(s.lastActivity),
          expiresAt: toLocal(row.expire),
          ip: s.ip || null,
          userAgent: s.userAgent || null,
          // never expose raw cookie/secret data
        };
      });

      res.json({
        success: true,
        data: sessions,
        meta: { count: sessions.length, timestamp: new Date().toISOString() },
      });
    } catch (err: any) {
      console.error('[adminAuth] list sessions error:', err);
      res.status(500).json({ success: false, message: 'Failed to list sessions', error: err.message });
    }
  });

  /**
   * DELETE /api/admin/sessions/:sid
   * Kick a single session. Logs a session_kicked event.
   */
  router.delete('/sessions/:sid', async (req: Request, res: Response) => {
    const { sid } = req.params;
    const actor = (req.session as any)?.user?.username || 'admin';

    try {
      // Read first so we can audit who got kicked
      const found = await db.query<SessionRow>(
        `SELECT sid, sess FROM "session" WHERE sid = $1 LIMIT 1`,
        [sid]
      );

      if (found.rowCount === 0) {
        res.status(404).json({ success: false, message: 'Session not found' });
        return;
      }

      const targetSess = (found.rows[0].sess || {}) as any;
      const targetUsername = targetSess.username || targetSess.user?.username || 'unknown';
      const targetUserId = targetSess.userId ?? targetSess.user?.id ?? null;

      const del = await db.query(`DELETE FROM "session" WHERE sid = $1`, [sid]);

      logAuthEvent({
        type: 'session_kicked',
        username: targetUsername,
        userId: targetUserId,
        sessionId: sid,
        actor,
        reason: 'ADMIN_KICK',
      });

      res.json({
        success: true,
        message: `Session terminated`,
        data: { sid, username: targetUsername, deleted: del.rowCount ?? 0 },
      });
    } catch (err: any) {
      console.error('[adminAuth] kick session error:', err);
      res.status(500).json({ success: false, message: 'Failed to kick session', error: err.message });
    }
  });

  /**
   * POST /api/admin/sessions/force-logout
   * Manually trigger the force-logout job (kills ALL sessions).
   */
  router.post('/sessions/force-logout', async (req: Request, res: Response) => {
    const actor = (req.session as any)?.user?.username || 'admin';
    try {
      const scheduler = getForceLogoutScheduler();
      const killed = await scheduler.runNow(actor);
      res.json({
        success: true,
        message: `Force logout executed`,
        data: { killed },
      });
    } catch (err: any) {
      console.error('[adminAuth] manual force-logout error:', err);
      res.status(500).json({ success: false, message: 'Failed to run force logout', error: err.message });
    }
  });

  /**
   * GET /api/admin/force-logout/status
   * Returns configured logout times, last run time, and last killed count.
   */
  router.get('/force-logout/status', (req: Request, res: Response) => {
    try {
      const status = getForceLogoutScheduler().getStatus();
      res.json({ success: true, data: status });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  });

  /**
   * GET /api/admin/auth-events
   * Query NDJSON auth event log files.
   * Query params:
   *   from=ISO   (inclusive)
   *   to=ISO     (inclusive)
   *   username   (exact, case-insensitive)
   *   type       (login_success | login_failed | logout | force_logout | session_expired | session_kicked) — repeatable
   *   limit      (1..5000, default 500)
   *   offset     (default 0)
   */
  router.get('/auth-events', (req: Request, res: Response) => {
    try {
      const { from, to, username, limit, offset } = req.query as Record<string, string | undefined>;

      // type can be a single string, comma-separated, or repeated query param (?type=a&type=b)
      const rawType = req.query.type as string | string[] | undefined;
      let types: AuthEventType[] | undefined;
      if (rawType) {
        const arr = Array.isArray(rawType) ? rawType : String(rawType).split(',');
        types = arr.map(s => s.trim()).filter(Boolean) as AuthEventType[];
      }

      const parsedFrom = from ? new Date(from) : undefined;
      const parsedTo = to ? new Date(to) : undefined;
      if (parsedFrom && Number.isNaN(parsedFrom.getTime())) {
        res.status(400).json({ success: false, message: 'Invalid `from` date' });
        return;
      }
      if (parsedTo && Number.isNaN(parsedTo.getTime())) {
        res.status(400).json({ success: false, message: 'Invalid `to` date' });
        return;
      }

      const result = queryAuthEvents({
        from: parsedFrom,
        to: parsedTo,
        username: username || undefined,
        type: types,
        limit: limit ? parseInt(limit, 10) : undefined,
        offset: offset ? parseInt(offset, 10) : undefined,
      });

      res.json({
        success: true,
        data: result.events,
        meta: {
          total: result.total,
          scanned: result.scanned,
          truncated: result.truncated,
          limit: limit ? parseInt(limit, 10) : 500,
          offset: offset ? parseInt(offset, 10) : 0,
          timestamp: new Date().toISOString(),
        },
      });
    } catch (err: any) {
      console.error('[adminAuth] query auth-events error:', err);
      res.status(500).json({ success: false, message: 'Failed to query auth events', error: err.message });
    }
  });

  return router;
}

export default createAdminAuthRoutes;
