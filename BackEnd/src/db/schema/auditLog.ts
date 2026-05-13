// server/src/db/schema/auditLog.ts
// Audit Log Table Schema — records DELETE operations across business entities

import { pgTable, serial, varchar, integer, timestamp, jsonb, index } from 'drizzle-orm/pg-core';
import { users } from './users';

export const auditLog = pgTable('audit_log', {
  id: serial('id').primaryKey(),
  action: varchar('action', { length: 16 }).notNull(),
  entity: varchar('entity', { length: 64 }).notNull(),
  recordId: varchar('record_id', { length: 128 }).notNull(),
  oldValues: jsonb('old_values'),
  newValues: jsonb('new_values'),
  actorUserId: integer('actor_user_id').references(() => users.id, { onDelete: 'set null' }),
  actorUsername: varchar('actor_username', { length: 50 }),
  actorRole: varchar('actor_role', { length: 20 }),
  ipAddress: varchar('ip_address', { length: 64 }),
  userAgent: varchar('user_agent', { length: 512 }),
  reason: varchar('reason', { length: 255 }),
  createdAt: timestamp('created_at', { withTimezone: false }).defaultNow().notNull(),
}, (t) => ({
  idxEntityRecord: index('idx_audit_entity_record').on(t.entity, t.recordId),
  idxActor: index('idx_audit_actor').on(t.actorUserId),
  idxCreatedAt: index('idx_audit_created_at').on(t.createdAt),
}));

export type AuditLog = typeof auditLog.$inferSelect;
export type NewAuditLog = typeof auditLog.$inferInsert;
