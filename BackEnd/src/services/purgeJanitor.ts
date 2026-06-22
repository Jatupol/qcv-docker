// server/src/services/purgeJanitor.ts
// Generic, configurable purge janitor.
//
// - Owns the `purge_policy` table (CREATE-IF-NOT-EXISTS at boot).
// - Registers known PurgeTarget implementations.
// - Seeds a policy row for every registered target whose key isn't yet in the table.
// - Schedules a daily run at 03:15 Asia/Bangkok and runs once on startup.
// - Exposes runAll / runOne / dryRunOne / getStatus for the admin API.
//
// Replaces the older AuthLogJanitor (now folded into the auth_events target).

import cron, { ScheduledTask } from 'node-cron';
import { Pool } from 'pg';
import { formatDateTimeLocal } from '../utils/dateTimeUtils';
import { logAuthEvent } from '../utils/authEventLogger';
import { purgeTargetRegistry } from './purge/targetRegistry';
import { authEventsTarget } from './purge/targets/authEventsTarget';
import { createLogInterfaceTarget } from './purge/targets/logInterfaceTarget';
import { ALLOWED_PURGE_TABLES, findAllowedTable, isAllowedTableColumn } from './purge/allowedTables';
import type { PurgeTarget } from './purge/types';

const TIMEZONE = 'Asia/Bangkok';
const CRON_EXPR = '15 3 * * *'; // 03:15 daily

export interface PurgePolicyRow {
  id: number;
  target_key: string;
  label: string;
  target_type: 'file' | 'db_table';
  enabled: boolean;
  retention_days: number;
  /** Set for user-added DB targets (NULL for built-in targets that own their own logic). */
  db_table_name: string | null;
  db_timestamp_column: string | null;
  last_run_at: string | null;
  last_removed_count: number;
  last_dry_run_at: string | null;
  last_dry_run_count: number;
  notes: string | null;
  /** True if a registered code target owns this key. Built-ins cannot be deleted. */
  is_builtin: boolean;
}

export interface PurgeRunResult {
  targetKey: string;
  ok: boolean;
  removed: number;
  message?: string;
  durationMs: number;
}

export class PurgeJanitor {
  private static instance: PurgeJanitor | null = null;
  private pool: Pool;
  private task: ScheduledTask | null = null;
  private startedAt: Date | null = null;
  private lastRunAt: Date | null = null;
  private lastRunResults: PurgeRunResult[] = [];

  static getInstance(pool?: Pool): PurgeJanitor {
    if (!PurgeJanitor.instance) {
      if (!pool) throw new Error('PurgeJanitor requires a pool on first call');
      PurgeJanitor.instance = new PurgeJanitor(pool);
    }
    return PurgeJanitor.instance;
  }

  private constructor(pool: Pool) {
    this.pool = pool;
  }

  // ============================================================
  // Lifecycle
  // ============================================================

  async start(): Promise<void> {
    if (this.task) {
      console.log('[PurgeJanitor] already started');
      return;
    }

    // 1. Register all known targets in the in-process registry.
    this.registerBuiltInTargets();

    // 2. Ensure schema + seed missing policy rows.
    await this.ensureTable();
    await this.seedMissingPolicies();

    // 3. Schedule daily cron.
    this.task = cron.schedule(CRON_EXPR, () => {
      this.runAll('scheduled').catch(err => {
        console.error('[PurgeJanitor] scheduled run error:', err);
      });
    }, { timezone: TIMEZONE });

    this.startedAt = new Date();

    console.log('\n' + '='.repeat(60));
    console.log('[PurgeJanitor] started');
    console.log(`   Schedule:    ${CRON_EXPR} (${TIMEZONE})`);
    console.log(`   Targets:     ${purgeTargetRegistry.list().map(t => t.key).join(', ')}`);
    console.log('='.repeat(60) + '\n');

    // 4. Catch up immediately on boot.
    try {
      await this.runAll('startup');
    } catch (err) {
      console.error('[PurgeJanitor] startup run error:', err);
    }
  }

  stop(): void {
    if (this.task) {
      try { this.task.stop(); } catch { /* noop */ }
      this.task = null;
    }
    console.log('[PurgeJanitor] stopped');
  }

  private registerBuiltInTargets(): void {
    if (!purgeTargetRegistry.has(authEventsTarget.key)) {
      purgeTargetRegistry.register(authEventsTarget);
    }
    const logInterface = createLogInterfaceTarget(this.pool);
    if (!purgeTargetRegistry.has(logInterface.key)) {
      purgeTargetRegistry.register(logInterface);
    }
  }

  // ============================================================
  // Schema + seed
  // ============================================================

  private async ensureTable(): Promise<void> {
    await this.pool.query(`
      CREATE TABLE IF NOT EXISTS purge_policy (
        id SERIAL PRIMARY KEY,
        target_key VARCHAR(50) UNIQUE NOT NULL,
        label VARCHAR(100) NOT NULL,
        target_type VARCHAR(20) NOT NULL,
        enabled BOOLEAN NOT NULL DEFAULT TRUE,
        retention_days INTEGER NOT NULL,
        db_table_name VARCHAR(100),
        db_timestamp_column VARCHAR(50),
        last_run_at TIMESTAMP NULL,
        last_removed_count INTEGER DEFAULT 0,
        last_dry_run_at TIMESTAMP NULL,
        last_dry_run_count INTEGER DEFAULT 0,
        notes TEXT NULL,
        created_by INTEGER DEFAULT 0,
        updated_by INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `);
    // For deployments where the table existed before these columns were added
    await this.pool.query(`ALTER TABLE purge_policy ADD COLUMN IF NOT EXISTS db_table_name VARCHAR(100);`);
    await this.pool.query(`ALTER TABLE purge_policy ADD COLUMN IF NOT EXISTS db_timestamp_column VARCHAR(50);`);
  }

  private async seedMissingPolicies(): Promise<void> {
    for (const target of purgeTargetRegistry.list()) {
      await this.pool.query(
        `INSERT INTO purge_policy
           (target_key, label, target_type, enabled, retention_days)
         VALUES ($1, $2, $3, TRUE, $4)
         ON CONFLICT (target_key) DO NOTHING`,
        [target.key, target.label, target.type, target.defaultRetentionDays],
      );
    }
  }

  // ============================================================
  // Reads
  // ============================================================

  async listPolicies(): Promise<PurgePolicyRow[]> {
    const res = await this.pool.query<any>(
      `SELECT id, target_key, label, target_type, enabled, retention_days,
              db_table_name, db_timestamp_column,
              last_run_at, last_removed_count, last_dry_run_at, last_dry_run_count, notes
         FROM purge_policy
         ORDER BY target_key ASC`,
    );
    return res.rows.map((r: any) => ({
      id: r.id,
      target_key: r.target_key,
      label: r.label,
      target_type: r.target_type,
      enabled: r.enabled,
      retention_days: r.retention_days,
      db_table_name: r.db_table_name,
      db_timestamp_column: r.db_timestamp_column,
      last_run_at: r.last_run_at ? formatDateTimeLocal(r.last_run_at) : null,
      last_removed_count: r.last_removed_count ?? 0,
      last_dry_run_at: r.last_dry_run_at ? formatDateTimeLocal(r.last_dry_run_at) : null,
      last_dry_run_count: r.last_dry_run_count ?? 0,
      notes: r.notes,
      is_builtin: purgeTargetRegistry.has(r.target_key),
    }));
  }

  async getPolicy(targetKey: string): Promise<PurgePolicyRow | null> {
    const all = await this.listPolicies();
    return all.find(p => p.target_key === targetKey) ?? null;
  }

  // ============================================================
  // Mutations (admin)
  // ============================================================

  async updatePolicy(
    targetKey: string,
    patch: { enabled?: boolean; retention_days?: number; notes?: string | null },
    actor: string,
  ): Promise<PurgePolicyRow | null> {
    if (!purgeTargetRegistry.has(targetKey)) {
      throw new Error(`Unknown target_key "${targetKey}"`);
    }
    if (patch.retention_days !== undefined && (!Number.isFinite(patch.retention_days) || patch.retention_days < 1)) {
      throw new Error('retention_days must be >= 1');
    }

    const sets: string[] = [];
    const values: any[] = [];
    let i = 1;

    if (patch.enabled !== undefined) { sets.push(`enabled = $${i++}`); values.push(patch.enabled); }
    if (patch.retention_days !== undefined) { sets.push(`retention_days = $${i++}`); values.push(patch.retention_days); }
    if (patch.notes !== undefined) { sets.push(`notes = $${i++}`); values.push(patch.notes); }
    if (sets.length === 0) return this.getPolicy(targetKey);

    sets.push(`updated_at = NOW()`);
    void actor; // reserved for future audit (updated_by lookup)

    values.push(targetKey);
    await this.pool.query(
      `UPDATE purge_policy SET ${sets.join(', ')} WHERE target_key = $${i}`,
      values,
    );
    return this.getPolicy(targetKey);
  }

  // ============================================================
  // Create / delete policies (admin)
  // ============================================================

  /** Returns the whitelist of (table, column) pairs admins can target, plus
   *  whether each is already configured by an existing policy. */
  async listAllowedTables(): Promise<Array<{ tableName: string; timestampColumn: string; label: string; alreadyConfigured: boolean }>> {
    const policies = await this.listPolicies();
    const usedTables = new Set(policies.map(p => p.db_table_name).filter((x): x is string => !!x));
    return ALLOWED_PURGE_TABLES.map(t => ({
      ...t,
      alreadyConfigured: usedTables.has(t.tableName),
    }));
  }

  /**
   * Create a user-added DB-table policy. Validation:
   *   - target_key must not collide with a built-in (registry) key.
   *   - target_key must be a valid identifier (1..50 chars, [a-z0-9_]).
   *   - (table, column) must be in the allowed whitelist.
   *   - retention_days >= 1.
   */
  async createPolicy(input: {
    target_key: string;
    label: string;
    db_table_name: string;
    db_timestamp_column: string;
    retention_days: number;
    enabled?: boolean;
    notes?: string | null;
  }, actor: string): Promise<PurgePolicyRow> {
    void actor;
    const key = String(input.target_key || '').trim();
    if (!/^[a-z][a-z0-9_]{0,49}$/.test(key)) {
      throw new Error('target_key must be lowercase letters/digits/underscore, starting with a letter, max 50 chars');
    }
    if (purgeTargetRegistry.has(key)) {
      throw new Error(`target_key "${key}" is reserved by a built-in target`);
    }
    if (!Number.isInteger(input.retention_days) || input.retention_days < 1) {
      throw new Error('retention_days must be an integer >= 1');
    }
    if (!isAllowedTableColumn(input.db_table_name, input.db_timestamp_column)) {
      throw new Error(`(${input.db_table_name}, ${input.db_timestamp_column}) is not in the allowed-tables whitelist`);
    }
    const label = String(input.label || findAllowedTable(input.db_table_name)?.label || key).slice(0, 100);

    await this.pool.query(
      `INSERT INTO purge_policy
         (target_key, label, target_type, enabled, retention_days, db_table_name, db_timestamp_column, notes)
       VALUES ($1, $2, 'db_table', $3, $4, $5, $6, $7)`,
      [key, label, input.enabled ?? true, input.retention_days, input.db_table_name, input.db_timestamp_column, input.notes ?? null],
    );

    const created = await this.getPolicy(key);
    if (!created) throw new Error('Insert succeeded but row not found — concurrent delete?');
    return created;
  }

  /** Delete a policy. Built-in targets are protected and cannot be deleted. */
  async deletePolicy(targetKey: string, _actor: string): Promise<void> {
    void _actor;
    if (purgeTargetRegistry.has(targetKey)) {
      throw new Error(`Cannot delete built-in target "${targetKey}"`);
    }
    const res = await this.pool.query(`DELETE FROM purge_policy WHERE target_key = $1`, [targetKey]);
    if ((res.rowCount ?? 0) === 0) throw new Error(`Policy "${targetKey}" not found`);
  }

  // ============================================================
  // Run / dry-run
  // ============================================================

  async dryRunOne(targetKey: string): Promise<{ wouldRemove: number; retentionDays: number }> {
    const policy = await this.getPolicy(targetKey);
    if (!policy) throw new Error(`No policy for target "${targetKey}"`);
    const target = this.resolveTarget(policy);
    if (!target) throw new Error(`No executor available for "${targetKey}". User-added DB targets require both db_table_name and db_timestamp_column to be set and whitelisted.`);

    const wouldRemove = await target.count(policy.retention_days);

    await this.pool.query(
      `UPDATE purge_policy
          SET last_dry_run_at = NOW(), last_dry_run_count = $1
        WHERE target_key = $2`,
      [wouldRemove, targetKey],
    );

    return { wouldRemove, retentionDays: policy.retention_days };
  }

  async runOne(targetKey: string, actor: string): Promise<PurgeRunResult> {
    const policy = await this.getPolicy(targetKey);
    if (!policy) throw new Error(`No policy for target "${targetKey}"`);
    return this.executeTargetForPolicy(policy, actor);
  }

  async runAll(actor: string): Promise<PurgeRunResult[]> {
    const policies = (await this.listPolicies()).filter(p => p.enabled);
    const results: PurgeRunResult[] = [];
    for (const p of policies) {
      results.push(await this.executeTargetForPolicy(p, actor));
    }
    this.lastRunAt = new Date();
    this.lastRunResults = results;
    return results;
  }

  /**
   * Returns a PurgeTarget for the given policy. Resolution order:
   *   1. Code-registered target (built-in) by target_key.
   *   2. Dynamic DB-table target — only when the policy has both db_table_name
   *      and db_timestamp_column AND that pair is in the allowed whitelist.
   *   3. null — caller should treat as "no executor".
   */
  private resolveTarget(policy: PurgePolicyRow): PurgeTarget | null {
    const builtin = purgeTargetRegistry.get(policy.target_key);
    if (builtin) return builtin;

    const table = policy.db_table_name;
    const col = policy.db_timestamp_column;
    if (!table || !col) return null;
    if (!isAllowedTableColumn(table, col)) {
      console.warn(`[PurgeJanitor] policy "${policy.target_key}" references non-whitelisted (${table}.${col}) — refusing to execute`);
      return null;
    }
    return this.createDynamicDbTarget(policy.target_key, policy.label, table, col);
  }

  /**
   * Build a PurgeTarget that executes COUNT/DELETE against an admin-configured
   * (table, timestamp_column) pair. Identifiers are re-validated against the
   * whitelist immediately before SQL is constructed (defense-in-depth).
   */
  private createDynamicDbTarget(key: string, label: string, table: string, col: string): PurgeTarget {
    const pool = this.pool;
    return {
      key, label, type: 'db_table', defaultRetentionDays: 90,
      async count(retentionDays: number): Promise<number> {
        if (!isAllowedTableColumn(table, col)) {
          throw new Error(`Refusing to count: (${table}, ${col}) not whitelisted`);
        }
        const sql = `SELECT COUNT(*)::text AS count FROM "${table}" WHERE "${col}" < NOW() - ($1 || ' days')::interval`;
        const res = await pool.query<{ count: string }>(sql, [String(retentionDays)]);
        return parseInt(res.rows[0]?.count ?? '0', 10);
      },
      async purge(retentionDays: number): Promise<{ removed: number }> {
        if (!isAllowedTableColumn(table, col)) {
          throw new Error(`Refusing to delete: (${table}, ${col}) not whitelisted`);
        }
        const sql = `DELETE FROM "${table}" WHERE "${col}" < NOW() - ($1 || ' days')::interval`;
        const res = await pool.query(sql, [String(retentionDays)]);
        return { removed: res.rowCount ?? 0 };
      },
    };
  }

  /** Inner runner shared by runOne and runAll; updates the policy row + audit log. */
  private async executeTargetForPolicy(policy: PurgePolicyRow, actor: string): Promise<PurgeRunResult> {
    const t0 = Date.now();
    const target = this.resolveTarget(policy);

    if (!target) {
      const msg = `No executor available for "${policy.target_key}" — skipped`;
      console.warn(`[PurgeJanitor] ${msg}`);
      return { targetKey: policy.target_key, ok: false, removed: 0, message: msg, durationMs: Date.now() - t0 };
    }

    const { target_key: targetKey, retention_days: retentionDays } = policy;

    try {
      const { removed } = await target.purge(retentionDays);
      await this.pool.query(
        `UPDATE purge_policy
            SET last_run_at = NOW(), last_removed_count = $1
          WHERE target_key = $2`,
        [removed, targetKey],
      );

      logAuthEvent({
        type: 'force_logout',           // reuse existing audit channel; reason makes it specific
        username: 'system',
        actor,
        reason: `PURGE:${targetKey} retention=${retentionDays}d removed=${removed}`,
      });

      const durationMs = Date.now() - t0;
      console.log(`[PurgeJanitor] ${targetKey}: removed ${removed} in ${durationMs}ms (actor=${actor})`);
      return { targetKey, ok: true, removed, durationMs };
    } catch (err: any) {
      const msg = err?.message || String(err);
      console.error(`[PurgeJanitor] ${targetKey} error:`, err);
      logAuthEvent({
        type: 'force_logout',
        username: 'system',
        actor,
        reason: `PURGE_ERROR:${targetKey}: ${msg}`,
      });
      return { targetKey, ok: false, removed: 0, message: msg, durationMs: Date.now() - t0 };
    }
  }

  // ============================================================
  // Status
  // ============================================================

  getStatus() {
    return {
      isEnabled: this.task !== null,
      cronExpression: CRON_EXPR,
      timezone: TIMEZONE,
      startedAt: this.startedAt ? formatDateTimeLocal(this.startedAt) : null,
      lastRunAt: this.lastRunAt ? formatDateTimeLocal(this.lastRunAt) : null,
      lastRunResults: this.lastRunResults,
      registeredTargets: purgeTargetRegistry.list().map(t => ({
        key: t.key, label: t.label, type: t.type, defaultRetentionDays: t.defaultRetentionDays,
      })),
    };
  }
}

export function getPurgeJanitor(pool?: Pool): PurgeJanitor {
  return PurgeJanitor.getInstance(pool);
}
