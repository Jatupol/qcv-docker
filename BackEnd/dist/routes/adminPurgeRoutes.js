"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createAdminPurgeRoutes = createAdminPurgeRoutes;
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const purgeJanitor_1 = require("../services/purgeJanitor");
function createAdminPurgeRoutes(_db) {
    const router = (0, express_1.Router)();
    router.use(auth_1.requireAuthentication, auth_1.requireAdmin);
    router.get('/policies', async (_req, res) => {
        try {
            const data = await (0, purgeJanitor_1.getPurgeJanitor)().listPolicies();
            res.json({ success: true, data, meta: { count: data.length, timestamp: new Date().toISOString() } });
        }
        catch (err) {
            console.error('[adminPurge] list error:', err);
            res.status(500).json({ success: false, message: err.message || 'Failed to list policies' });
        }
    });
    router.get('/status', (_req, res) => {
        try {
            res.json({ success: true, data: (0, purgeJanitor_1.getPurgeJanitor)().getStatus() });
        }
        catch (err) {
            res.status(500).json({ success: false, message: err.message });
        }
    });
    router.get('/allowed-tables', async (_req, res) => {
        try {
            const data = await (0, purgeJanitor_1.getPurgeJanitor)().listAllowedTables();
            res.json({ success: true, data });
        }
        catch (err) {
            console.error('[adminPurge] allowed-tables error:', err);
            res.status(500).json({ success: false, message: err.message });
        }
    });
    router.post('/policies', async (req, res) => {
        const actor = req.session?.user?.username || 'admin';
        const body = req.body ?? {};
        try {
            const created = await (0, purgeJanitor_1.getPurgeJanitor)().createPolicy({
                target_key: String(body.target_key || ''),
                label: String(body.label || ''),
                db_table_name: String(body.db_table_name || ''),
                db_timestamp_column: String(body.db_timestamp_column || ''),
                retention_days: Number(body.retention_days),
                enabled: body.enabled !== undefined ? !!body.enabled : true,
                notes: body.notes ?? null,
            }, actor);
            res.status(201).json({ success: true, data: created, message: 'Policy created' });
        }
        catch (err) {
            console.error('[adminPurge] create error:', err);
            res.status(400).json({ success: false, message: err.message || 'Create failed' });
        }
    });
    router.delete('/policies/:targetKey', async (req, res) => {
        const { targetKey } = req.params;
        const actor = req.session?.user?.username || 'admin';
        try {
            await (0, purgeJanitor_1.getPurgeJanitor)().deletePolicy(targetKey, actor);
            res.json({ success: true, message: 'Policy deleted' });
        }
        catch (err) {
            console.error('[adminPurge] delete error:', err);
            const status = /built-in/.test(err?.message || '') ? 403 : /not found/.test(err?.message || '') ? 404 : 400;
            res.status(status).json({ success: false, message: err.message || 'Delete failed' });
        }
    });
    router.put('/policies/:targetKey', async (req, res) => {
        const { targetKey } = req.params;
        const actor = req.session?.user?.username || 'admin';
        const body = req.body ?? {};
        const patch = {};
        if (body.enabled !== undefined)
            patch.enabled = !!body.enabled;
        if (body.retention_days !== undefined) {
            const n = Number(body.retention_days);
            if (!Number.isInteger(n) || n < 1) {
                res.status(400).json({ success: false, message: 'retention_days must be an integer >= 1' });
                return;
            }
            patch.retention_days = n;
        }
        if (body.notes !== undefined)
            patch.notes = body.notes === null ? null : String(body.notes);
        try {
            const updated = await (0, purgeJanitor_1.getPurgeJanitor)().updatePolicy(targetKey, patch, actor);
            if (!updated) {
                res.status(404).json({ success: false, message: 'Policy not found' });
                return;
            }
            res.json({ success: true, data: updated, message: 'Policy updated' });
        }
        catch (err) {
            console.error('[adminPurge] update error:', err);
            res.status(400).json({ success: false, message: err.message || 'Failed to update policy' });
        }
    });
    router.post('/policies/:targetKey/dry-run', async (req, res) => {
        const { targetKey } = req.params;
        try {
            const data = await (0, purgeJanitor_1.getPurgeJanitor)().dryRunOne(targetKey);
            res.json({ success: true, data });
        }
        catch (err) {
            console.error('[adminPurge] dry-run error:', err);
            res.status(400).json({ success: false, message: err.message || 'Dry run failed' });
        }
    });
    router.post('/policies/:targetKey/run-now', async (req, res) => {
        const { targetKey } = req.params;
        const actor = req.session?.user?.username || 'admin';
        try {
            const result = await (0, purgeJanitor_1.getPurgeJanitor)().runOne(targetKey, actor);
            res.json({ success: result.ok, data: result, message: result.message });
        }
        catch (err) {
            console.error('[adminPurge] run-one error:', err);
            res.status(400).json({ success: false, message: err.message || 'Run failed' });
        }
    });
    router.post('/run-all', async (req, res) => {
        const actor = req.session?.user?.username || 'admin';
        try {
            const results = await (0, purgeJanitor_1.getPurgeJanitor)().runAll(actor);
            const totalRemoved = results.reduce((sum, r) => sum + r.removed, 0);
            res.json({ success: true, data: { results, totalRemoved }, message: `${results.length} target(s) executed` });
        }
        catch (err) {
            console.error('[adminPurge] run-all error:', err);
            res.status(500).json({ success: false, message: err.message || 'Run-all failed' });
        }
    });
    return router;
}
exports.default = createAdminPurgeRoutes;
