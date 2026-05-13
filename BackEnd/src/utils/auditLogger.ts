// server/src/utils/auditLogger.ts
// Database-backed audit logger for DELETE operations across business entities.
// Inserts a row into the `audit_log` table; never throws (audit must not break the delete).

import type { Request } from 'express';
import { auditLog } from '../db/schema';

export interface SessionUserLite {
  id: number;
  username: string;
  role?: string;
}

export interface LogDeleteArgs {
  entity: string;
  recordId: string | number;
  oldValues: Record<string, unknown> | null;
  actor: SessionUserLite | null;
  req?: Request;
  reason?: string;
  excludeFields?: string[];
  tx?: any;
}

const DEFAULT_REDACT = ['passwordHash', 'password_hash'];

function sanitize(
  values: Record<string, unknown> | null,
  excludeFields: string[] = []
): Record<string, unknown> | null {
  if (!values) return null;
  const drop = new Set([...excludeFields, ...DEFAULT_REDACT]);
  return Object.fromEntries(Object.entries(values).filter(([k]) => !drop.has(k)));
}

export async function logDelete(db: any, args: LogDeleteArgs): Promise<void> {
  try {
    const handle = args.tx ?? db;
    const ua = (args.req?.headers['user-agent'] as string | undefined) ?? null;
    await handle.insert(auditLog).values({
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
  } catch (err) {
    console.error('[auditLogger] logDelete failed (non-fatal):', err);
  }
}

export default { logDelete };
