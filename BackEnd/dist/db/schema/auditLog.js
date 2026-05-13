"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.auditLog = void 0;
const pg_core_1 = require("drizzle-orm/pg-core");
const users_1 = require("./users");
exports.auditLog = (0, pg_core_1.pgTable)('audit_log', {
    id: (0, pg_core_1.serial)('id').primaryKey(),
    action: (0, pg_core_1.varchar)('action', { length: 16 }).notNull(),
    entity: (0, pg_core_1.varchar)('entity', { length: 64 }).notNull(),
    recordId: (0, pg_core_1.varchar)('record_id', { length: 128 }).notNull(),
    oldValues: (0, pg_core_1.jsonb)('old_values'),
    newValues: (0, pg_core_1.jsonb)('new_values'),
    actorUserId: (0, pg_core_1.integer)('actor_user_id').references(() => users_1.users.id, { onDelete: 'set null' }),
    actorUsername: (0, pg_core_1.varchar)('actor_username', { length: 50 }),
    actorRole: (0, pg_core_1.varchar)('actor_role', { length: 20 }),
    ipAddress: (0, pg_core_1.varchar)('ip_address', { length: 64 }),
    userAgent: (0, pg_core_1.varchar)('user_agent', { length: 512 }),
    reason: (0, pg_core_1.varchar)('reason', { length: 255 }),
    createdAt: (0, pg_core_1.timestamp)('created_at', { withTimezone: false }).defaultNow().notNull(),
}, (t) => ({
    idxEntityRecord: (0, pg_core_1.index)('idx_audit_entity_record').on(t.entity, t.recordId),
    idxActor: (0, pg_core_1.index)('idx_audit_actor').on(t.actorUserId),
    idxCreatedAt: (0, pg_core_1.index)('idx_audit_created_at').on(t.createdAt),
}));
