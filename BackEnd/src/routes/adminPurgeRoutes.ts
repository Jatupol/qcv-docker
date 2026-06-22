// server/src/routes/adminPurgeRoutes.ts
// Admin-only API for the configurable purge janitor.
//
// Mounted at /api/admin/purge in app.ts. Every route requires authenticated admin.

import { Router, Request, Response } from 'express';
import { Pool } from 'pg';
import { requireAuthentication, requireAdmin } from '../middleware/auth';
import { getPurgeJanitor } from '../services/purgeJanitor';

export function createAdminPurgeRoutes(_db: Pool): Router {
  const router = Router();
  router.use(requireAuthentication, requireAdmin);

  /** GET /api/admin/purge/policies — list all policies with metadata */
  router.get('/policies', async (_req: Request, res: Response) => {
    try {
      const data = await getPurgeJanitor().listPolicies();
      res.json({ success: true, data, meta: { count: data.length, timestamp: new Date().toISOString() } });
    } catch (err: any) {
      console.error('[adminPurge] list error:', err);
      res.status(500).json({ success: false, message: err.message || 'Failed to list policies' });
    }
  });

  /** GET /api/admin/purge/status — janitor scheduler status */
  router.get('/status', (_req: Request, res: Response) => {
    try {
      res.json({ success: true, data: getPurgeJanitor().getStatus() });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  });

  /** GET /api/admin/purge/allowed-tables — whitelist for the "Add Policy" UI */
  router.get('/allowed-tables', async (_req: Request, res: Response) => {
    try {
      const data = await getPurgeJanitor().listAllowedTables();
      res.json({ success: true, data });
    } catch (err: any) {
      console.error('[adminPurge] allowed-tables error:', err);
      res.status(500).json({ success: false, message: err.message });
    }
  });

  /** POST /api/admin/purge/policies — create a new user-added DB-table policy */
  router.post('/policies', async (req: Request, res: Response) => {
    const actor = (req.session as any)?.user?.username || 'admin';
    const body = req.body ?? {};
    try {
      const created = await getPurgeJanitor().createPolicy({
        target_key: String(body.target_key || ''),
        label: String(body.label || ''),
        db_table_name: String(body.db_table_name || ''),
        db_timestamp_column: String(body.db_timestamp_column || ''),
        retention_days: Number(body.retention_days),
        enabled: body.enabled !== undefined ? !!body.enabled : true,
        notes: body.notes ?? null,
      }, actor);
      res.status(201).json({ success: true, data: created, message: 'Policy created' });
    } catch (err: any) {
      console.error('[adminPurge] create error:', err);
      res.status(400).json({ success: false, message: err.message || 'Create failed' });
    }
  });

  /** DELETE /api/admin/purge/policies/:targetKey — delete user-added policy */
  router.delete('/policies/:targetKey', async (req: Request, res: Response) => {
    const { targetKey } = req.params;
    const actor = (req.session as any)?.user?.username || 'admin';
    try {
      await getPurgeJanitor().deletePolicy(targetKey, actor);
      res.json({ success: true, message: 'Policy deleted' });
    } catch (err: any) {
      console.error('[adminPurge] delete error:', err);
      const status = /built-in/.test(err?.message || '') ? 403 : /not found/.test(err?.message || '') ? 404 : 400;
      res.status(status).json({ success: false, message: err.message || 'Delete failed' });
    }
  });

  /** PUT /api/admin/purge/policies/:targetKey — update enabled / retention / notes */
  router.put('/policies/:targetKey', async (req: Request, res: Response) => {
    const { targetKey } = req.params;
    const actor = (req.session as any)?.user?.username || 'admin';
    const body = req.body ?? {};

    const patch: { enabled?: boolean; retention_days?: number; notes?: string | null } = {};
    if (body.enabled !== undefined) patch.enabled = !!body.enabled;
    if (body.retention_days !== undefined) {
      const n = Number(body.retention_days);
      if (!Number.isInteger(n) || n < 1) {
        res.status(400).json({ success: false, message: 'retention_days must be an integer >= 1' });
        return;
      }
      patch.retention_days = n;
    }
    if (body.notes !== undefined) patch.notes = body.notes === null ? null : String(body.notes);

    try {
      const updated = await getPurgeJanitor().updatePolicy(targetKey, patch, actor);
      if (!updated) {
        res.status(404).json({ success: false, message: 'Policy not found' });
        return;
      }
      res.json({ success: true, data: updated, message: 'Policy updated' });
    } catch (err: any) {
      console.error('[adminPurge] update error:', err);
      res.status(400).json({ success: false, message: err.message || 'Failed to update policy' });
    }
  });

  /** POST /api/admin/purge/policies/:targetKey/dry-run */
  router.post('/policies/:targetKey/dry-run', async (req: Request, res: Response) => {
    const { targetKey } = req.params;
    try {
      const data = await getPurgeJanitor().dryRunOne(targetKey);
      res.json({ success: true, data });
    } catch (err: any) {
      console.error('[adminPurge] dry-run error:', err);
      res.status(400).json({ success: false, message: err.message || 'Dry run failed' });
    }
  });

  /** POST /api/admin/purge/policies/:targetKey/run-now */
  router.post('/policies/:targetKey/run-now', async (req: Request, res: Response) => {
    const { targetKey } = req.params;
    const actor = (req.session as any)?.user?.username || 'admin';
    try {
      const result = await getPurgeJanitor().runOne(targetKey, actor);
      res.json({ success: result.ok, data: result, message: result.message });
    } catch (err: any) {
      console.error('[adminPurge] run-one error:', err);
      res.status(400).json({ success: false, message: err.message || 'Run failed' });
    }
  });

  /** POST /api/admin/purge/run-all — runs every enabled policy sequentially */
  router.post('/run-all', async (req: Request, res: Response) => {
    const actor = (req.session as any)?.user?.username || 'admin';
    try {
      const results = await getPurgeJanitor().runAll(actor);
      const totalRemoved = results.reduce((sum, r) => sum + r.removed, 0);
      res.json({ success: true, data: { results, totalRemoved }, message: `${results.length} target(s) executed` });
    } catch (err: any) {
      console.error('[adminPurge] run-all error:', err);
      res.status(500).json({ success: false, message: err.message || 'Run-all failed' });
    }
  });

  return router;
}

export default createAdminPurgeRoutes;
