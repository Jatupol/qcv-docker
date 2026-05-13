"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createAdminAuditRoutes = createAdminAuditRoutes;
const express_1 = require("express");
const drizzle_orm_1 = require("drizzle-orm");
const auth_1 = require("../middleware/auth");
const db_1 = require("../db");
const schema_1 = require("../db/schema");
function createAdminAuditRoutes(_db) {
    const router = (0, express_1.Router)();
    const drizzleDb = (0, db_1.getDrizzleDb)();
    router.use(auth_1.requireAuthentication, auth_1.requireAdmin);
    router.get('/audit-log', async (req, res) => {
        try {
            const { entity, action, recordId, actorUserId, dateFrom, dateTo } = req.query;
            const page = Math.max(1, parseInt(String(req.query.page ?? '1'), 10));
            const pageSize = Math.min(200, Math.max(1, parseInt(String(req.query.pageSize ?? '50'), 10)));
            const conds = [];
            if (entity)
                conds.push((0, drizzle_orm_1.eq)(schema_1.auditLog.entity, String(entity)));
            if (action)
                conds.push((0, drizzle_orm_1.eq)(schema_1.auditLog.action, String(action)));
            if (recordId)
                conds.push((0, drizzle_orm_1.eq)(schema_1.auditLog.recordId, String(recordId)));
            if (actorUserId)
                conds.push((0, drizzle_orm_1.eq)(schema_1.auditLog.actorUserId, parseInt(String(actorUserId), 10)));
            if (dateFrom) {
                const from = new Date(String(dateFrom));
                if (!isNaN(from.getTime()))
                    conds.push((0, drizzle_orm_1.gte)(schema_1.auditLog.createdAt, from));
            }
            if (dateTo) {
                const to = new Date(String(dateTo));
                if (!isNaN(to.getTime()))
                    conds.push((0, drizzle_orm_1.lte)(schema_1.auditLog.createdAt, to));
            }
            const where = conds.length ? (0, drizzle_orm_1.and)(...conds) : undefined;
            const totalRows = await drizzleDb
                .select({ count: (0, drizzle_orm_1.sql) `count(*)::int` })
                .from(schema_1.auditLog)
                .where(where);
            const total = totalRows[0]?.count ?? 0;
            const rows = await drizzleDb
                .select()
                .from(schema_1.auditLog)
                .where(where)
                .orderBy((0, drizzle_orm_1.desc)(schema_1.auditLog.createdAt))
                .limit(pageSize)
                .offset((page - 1) * pageSize);
            res.json({
                success: true,
                data: rows,
                meta: { page, pageSize, total },
            });
        }
        catch (err) {
            console.error('[adminAudit] list audit_log error:', err);
            res.status(500).json({ success: false, message: 'Failed to list audit log', error: err.message });
        }
    });
    router.get('/audit-log/entities', async (_req, res) => {
        try {
            const rows = await drizzleDb
                .selectDistinct({ entity: schema_1.auditLog.entity })
                .from(schema_1.auditLog)
                .orderBy(schema_1.auditLog.entity);
            res.json({
                success: true,
                data: rows.map(r => r.entity),
            });
        }
        catch (err) {
            console.error('[adminAudit] list entities error:', err);
            res.status(500).json({ success: false, message: 'Failed to list entities', error: err.message });
        }
    });
    return router;
}
