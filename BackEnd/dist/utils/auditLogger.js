"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.logDelete = logDelete;
const schema_1 = require("../db/schema");
const DEFAULT_REDACT = ['passwordHash', 'password_hash'];
function sanitize(values, excludeFields = []) {
    if (!values)
        return null;
    const drop = new Set([...excludeFields, ...DEFAULT_REDACT]);
    return Object.fromEntries(Object.entries(values).filter(([k]) => !drop.has(k)));
}
async function logDelete(db, args) {
    try {
        const handle = args.tx ?? db;
        const ua = args.req?.headers['user-agent'] ?? null;
        await handle.insert(schema_1.auditLog).values({
            action: 'DELETE',
            entity: args.entity,
            recordId: String(args.recordId),
            oldValues: sanitize(args.oldValues, args.excludeFields),
            actorUserId: args.actor?.id ?? null,
            actorUsername: args.actor?.username ?? null,
            actorRole: args.actor?.role ?? null,
            ipAddress: args.req?.ip ?? null,
            userAgent: ua ? ua.slice(0, 512) : null,
            reason: args.reason ?? null,
        });
    }
    catch (err) {
        console.error('[auditLogger] logDelete failed (non-fatal):', err);
    }
}
exports.default = { logDelete };
