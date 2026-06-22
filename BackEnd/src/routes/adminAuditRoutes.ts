// server/src/routes/adminAuditRoutes.ts
// Admin-only API for the audit_log table (DELETE-event audit trail).
//
// Endpoints (all require authenticated admin):
//   GET /api/admin/audit-log           — paged + filtered list
//   GET /api/admin/audit-log/entities  — distinct entity values for filter dropdown

import { Router, Request, Response } from 'express';
import { Pool } from 'pg';
import { and, desc, eq, gte, lte, sql } from 'drizzle-orm';
import { requireAuthentication, requireAdmin } from '../middleware/auth';
import { getDrizzleDb } from '../db';
import { auditLog } from '../db/schema';

export function createAdminAuditRoutes(_db: Pool): Router {
  const router = Router();
  const drizzleDb = getDrizzleDb();

  router.use(requireAuthentication, requireAdmin);

  /**
   * GET /api/admin/audit-log
   * Paginated, filtered list of audit events.
   *
   * Query params (all optional):
   *   entity        — exact match
   *   action        — exact match (DELETE, CREATE, UPDATE)
   *   actorUserId   — exact match (number)
   *   recordId      — exact match (string)
   *   dateFrom      — ISO date/datetime, inclusive lower bound on created_at
   *   dateTo        — ISO date/datetime, inclusive upper bound on created_at
   *   page          — 1-indexed (default 1)
   *   pageSize      — default 50, max 200
   */
  router.get('/audit-log', async (req: Request, res: Response) => {
    try {
      const { entity, action, recordId, actorUserId, dateFrom, dateTo } = req.query;
      const page = Math.max(1, parseInt(String(req.query.page ?? '1'), 10));
      const pageSize = Math.min(200, Math.max(1, parseInt(String(req.query.pageSize ?? '50'), 10)));

      const conds: any[] = [];
      if (entity)      conds.push(eq(auditLog.entity, String(entity)));
      if (action)      conds.push(eq(auditLog.action, String(action)));
      if (recordId)    conds.push(eq(auditLog.recordId, String(recordId)));
      if (actorUserId) conds.push(eq(auditLog.actorUserId, parseInt(String(actorUserId), 10)));
      if (dateFrom) {
        const from = new Date(String(dateFrom));
        if (!isNaN(from.getTime())) conds.push(gte(auditLog.createdAt, from));
      }
      if (dateTo) {
        const to = new Date(String(dateTo));
        if (!isNaN(to.getTime())) conds.push(lte(auditLog.createdAt, to));
      }
      const where = conds.length ? and(...conds) : undefined;

      const totalRows = await drizzleDb
        .select({ count: sql<number>`count(*)::int` })
        .from(auditLog)
        .where(where as any);
      const total = totalRows[0]?.count ?? 0;

      const rows = await drizzleDb
        .select()
        .from(auditLog)
        .where(where as any)
        .orderBy(desc(auditLog.createdAt))
        .limit(pageSize)
        .offset((page - 1) * pageSize);

      res.json({
        success: true,
        data: rows,
        meta: { page, pageSize, total },
      });
    } catch (err: any) {
      console.error('[adminAudit] list audit_log error:', err);
      res.status(500).json({ success: false, message: 'Failed to list audit log', error: err.message });
    }
  });

  /**
   * GET /api/admin/audit-log/entities
   * Distinct entity names (for filter dropdown).
   */
  router.get('/audit-log/entities', async (_req: Request, res: Response) => {
    try {
      const rows = await drizzleDb
        .selectDistinct({ entity: auditLog.entity })
        .from(auditLog)
        .orderBy(auditLog.entity);
      res.json({
        success: true,
        data: rows.map(r => r.entity),
      });
    } catch (err: any) {
      console.error('[adminAudit] list entities error:', err);
      res.status(500).json({ success: false, message: 'Failed to list entities', error: err.message });
    }
  });

  return router;
}
