"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createAdminAuthRoutes = createAdminAuthRoutes;
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const authEventLogger_1 = require("../utils/authEventLogger");
const forceLogoutScheduler_1 = require("../services/forceLogoutScheduler");
const dateTimeUtils_1 = require("../utils/dateTimeUtils");
const toLocal = (v) => v ? (0, dateTimeUtils_1.formatDateTimeLocal)(v) : null;
function createAdminAuthRoutes(db) {
    const router = (0, express_1.Router)();
    router.use(auth_1.requireAuthentication, auth_1.requireAdmin);
    router.get('/sessions', async (req, res) => {
        try {
            const result = await db.query(`SELECT sid, sess, expire
           FROM "session"
          WHERE expire > NOW()
          ORDER BY expire DESC`);
            const sessions = result.rows.map(row => {
                const s = (row.sess || {});
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
                };
            });
            res.json({
                success: true,
                data: sessions,
                meta: { count: sessions.length, timestamp: new Date().toISOString() },
            });
        }
        catch (err) {
            console.error('[adminAuth] list sessions error:', err);
            res.status(500).json({ success: false, message: 'Failed to list sessions', error: err.message });
        }
    });
    router.delete('/sessions/:sid', async (req, res) => {
        const { sid } = req.params;
        const actor = req.session?.user?.username || 'admin';
        try {
            const found = await db.query(`SELECT sid, sess FROM "session" WHERE sid = $1 LIMIT 1`, [sid]);
            if (found.rowCount === 0) {
                res.status(404).json({ success: false, message: 'Session not found' });
                return;
            }
            const targetSess = (found.rows[0].sess || {});
            const targetUsername = targetSess.username || targetSess.user?.username || 'unknown';
            const targetUserId = targetSess.userId ?? targetSess.user?.id ?? null;
            const del = await db.query(`DELETE FROM "session" WHERE sid = $1`, [sid]);
            (0, authEventLogger_1.logAuthEvent)({
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
        }
        catch (err) {
            console.error('[adminAuth] kick session error:', err);
            res.status(500).json({ success: false, message: 'Failed to kick session', error: err.message });
        }
    });
    router.post('/sessions/force-logout', async (req, res) => {
        const actor = req.session?.user?.username || 'admin';
        try {
            const scheduler = (0, forceLogoutScheduler_1.getForceLogoutScheduler)();
            const killed = await scheduler.runNow(actor);
            res.json({
                success: true,
                message: `Force logout executed`,
                data: { killed },
            });
        }
        catch (err) {
            console.error('[adminAuth] manual force-logout error:', err);
            res.status(500).json({ success: false, message: 'Failed to run force logout', error: err.message });
        }
    });
    router.get('/force-logout/status', (req, res) => {
        try {
            const status = (0, forceLogoutScheduler_1.getForceLogoutScheduler)().getStatus();
            res.json({ success: true, data: status });
        }
        catch (err) {
            res.status(500).json({ success: false, message: err.message });
        }
    });
    router.get('/auth-events', (req, res) => {
        try {
            const { from, to, username, limit, offset } = req.query;
            const rawType = req.query.type;
            let types;
            if (rawType) {
                const arr = Array.isArray(rawType) ? rawType : String(rawType).split(',');
                types = arr.map(s => s.trim()).filter(Boolean);
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
            const result = (0, authEventLogger_1.queryAuthEvents)({
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
        }
        catch (err) {
            console.error('[adminAuth] query auth-events error:', err);
            res.status(500).json({ success: false, message: 'Failed to query auth events', error: err.message });
        }
    });
    return router;
}
exports.default = createAdminAuthRoutes;
