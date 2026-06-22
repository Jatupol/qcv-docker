"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PurgeJanitor = void 0;
exports.getPurgeJanitor = getPurgeJanitor;
const node_cron_1 = __importDefault(require("node-cron"));
const dateTimeUtils_1 = require("../utils/dateTimeUtils");
const authEventLogger_1 = require("../utils/authEventLogger");
const targetRegistry_1 = require("./purge/targetRegistry");
const authEventsTarget_1 = require("./purge/targets/authEventsTarget");
const logInterfaceTarget_1 = require("./purge/targets/logInterfaceTarget");
const allowedTables_1 = require("./purge/allowedTables");
const TIMEZONE = 'Asia/Bangkok';
const CRON_EXPR = '15 3 * * *';
class PurgeJanitor {
    static getInstance(pool) {
        if (!PurgeJanitor.instance) {
            if (!pool)
                throw new Error('PurgeJanitor requires a pool on first call');
            PurgeJanitor.instance = new PurgeJanitor(pool);
        }
        return PurgeJanitor.instance;
    }
    constructor(pool) {
        this.task = null;
        this.startedAt = null;
        this.lastRunAt = null;
        this.lastRunResults = [];
        this.pool = pool;
    }
    async start() {
        if (this.task) {
            console.log('[PurgeJanitor] already started');
            return;
        }
        this.registerBuiltInTargets();
        await this.ensureTable();
        await this.seedMissingPolicies();
        this.task = node_cron_1.default.schedule(CRON_EXPR, () => {
            this.runAll('scheduled').catch(err => {
                console.error('[PurgeJanitor] scheduled run error:', err);
            });
        }, { timezone: TIMEZONE });
        this.startedAt = new Date();
        console.log('\n' + '='.repeat(60));
        console.log('[PurgeJanitor] started');
        console.log(`   Schedule:    ${CRON_EXPR} (${TIMEZONE})`);
        console.log(`   Targets:     ${targetRegistry_1.purgeTargetRegistry.list().map(t => t.key).join(', ')}`);
        console.log('='.repeat(60) + '\n');
        try {
            await this.runAll('startup');
        }
        catch (err) {
            console.error('[PurgeJanitor] startup run error:', err);
        }
    }
    stop() {
        if (this.task) {
            try {
                this.task.stop();
            }
            catch { }
            this.task = null;
        }
        console.log('[PurgeJanitor] stopped');
    }
    registerBuiltInTargets() {
        if (!targetRegistry_1.purgeTargetRegistry.has(authEventsTarget_1.authEventsTarget.key)) {
            targetRegistry_1.purgeTargetRegistry.register(authEventsTarget_1.authEventsTarget);
        }
        const logInterface = (0, logInterfaceTarget_1.createLogInterfaceTarget)(this.pool);
        if (!targetRegistry_1.purgeTargetRegistry.has(logInterface.key)) {
            targetRegistry_1.purgeTargetRegistry.register(logInterface);
        }
    }
    async ensureTable() {
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
        await this.pool.query(`ALTER TABLE purge_policy ADD COLUMN IF NOT EXISTS db_table_name VARCHAR(100);`);
        await this.pool.query(`ALTER TABLE purge_policy ADD COLUMN IF NOT EXISTS db_timestamp_column VARCHAR(50);`);
    }
    async seedMissingPolicies() {
        for (const target of targetRegistry_1.purgeTargetRegistry.list()) {
            await this.pool.query(`INSERT INTO purge_policy
           (target_key, label, target_type, enabled, retention_days)
         VALUES ($1, $2, $3, TRUE, $4)
         ON CONFLICT (target_key) DO NOTHING`, [target.key, target.label, target.type, target.defaultRetentionDays]);
        }
    }
    async listPolicies() {
        const res = await this.pool.query(`SELECT id, target_key, label, target_type, enabled, retention_days,
              db_table_name, db_timestamp_column,
              last_run_at, last_removed_count, last_dry_run_at, last_dry_run_count, notes
         FROM purge_policy
         ORDER BY target_key ASC`);
        return res.rows.map((r) => ({
            id: r.id,
            target_key: r.target_key,
            label: r.label,
            target_type: r.target_type,
            enabled: r.enabled,
            retention_days: r.retention_days,
            db_table_name: r.db_table_name,
            db_timestamp_column: r.db_timestamp_column,
            last_run_at: r.last_run_at ? (0, dateTimeUtils_1.formatDateTimeLocal)(r.last_run_at) : null,
            last_removed_count: r.last_removed_count ?? 0,
            last_dry_run_at: r.last_dry_run_at ? (0, dateTimeUtils_1.formatDateTimeLocal)(r.last_dry_run_at) : null,
            last_dry_run_count: r.last_dry_run_count ?? 0,
            notes: r.notes,
            is_builtin: targetRegistry_1.purgeTargetRegistry.has(r.target_key),
        }));
    }
    async getPolicy(targetKey) {
        const all = await this.listPolicies();
        return all.find(p => p.target_key === targetKey) ?? null;
    }
    async updatePolicy(targetKey, patch, actor) {
        if (!targetRegistry_1.purgeTargetRegistry.has(targetKey)) {
            throw new Error(`Unknown target_key "${targetKey}"`);
        }
        if (patch.retention_days !== undefined && (!Number.isFinite(patch.retention_days) || patch.retention_days < 1)) {
            throw new Error('retention_days must be >= 1');
        }
        const sets = [];
        const values = [];
        let i = 1;
        if (patch.enabled !== undefined) {
            sets.push(`enabled = $${i++}`);
            values.push(patch.enabled);
        }
        if (patch.retention_days !== undefined) {
            sets.push(`retention_days = $${i++}`);
            values.push(patch.retention_days);
        }
        if (patch.notes !== undefined) {
            sets.push(`notes = $${i++}`);
            values.push(patch.notes);
        }
        if (sets.length === 0)
            return this.getPolicy(targetKey);
        sets.push(`updated_at = NOW()`);
        void actor;
        values.push(targetKey);
        await this.pool.query(`UPDATE purge_policy SET ${sets.join(', ')} WHERE target_key = $${i}`, values);
        return this.getPolicy(targetKey);
    }
    async listAllowedTables() {
        const policies = await this.listPolicies();
        const usedTables = new Set(policies.map(p => p.db_table_name).filter((x) => !!x));
        return allowedTables_1.ALLOWED_PURGE_TABLES.map(t => ({
            ...t,
            alreadyConfigured: usedTables.has(t.tableName),
        }));
    }
    async createPolicy(input, actor) {
        void actor;
        const key = String(input.target_key || '').trim();
        if (!/^[a-z][a-z0-9_]{0,49}$/.test(key)) {
            throw new Error('target_key must be lowercase letters/digits/underscore, starting with a letter, max 50 chars');
        }
        if (targetRegistry_1.purgeTargetRegistry.has(key)) {
            throw new Error(`target_key "${key}" is reserved by a built-in target`);
        }
        if (!Number.isInteger(input.retention_days) || input.retention_days < 1) {
            throw new Error('retention_days must be an integer >= 1');
        }
        if (!(0, allowedTables_1.isAllowedTableColumn)(input.db_table_name, input.db_timestamp_column)) {
            throw new Error(`(${input.db_table_name}, ${input.db_timestamp_column}) is not in the allowed-tables whitelist`);
        }
        const label = String(input.label || (0, allowedTables_1.findAllowedTable)(input.db_table_name)?.label || key).slice(0, 100);
        await this.pool.query(`INSERT INTO purge_policy
         (target_key, label, target_type, enabled, retention_days, db_table_name, db_timestamp_column, notes)
       VALUES ($1, $2, 'db_table', $3, $4, $5, $6, $7)`, [key, label, input.enabled ?? true, input.retention_days, input.db_table_name, input.db_timestamp_column, input.notes ?? null]);
        const created = await this.getPolicy(key);
        if (!created)
            throw new Error('Insert succeeded but row not found — concurrent delete?');
        return created;
    }
    async deletePolicy(targetKey, _actor) {
        void _actor;
        if (targetRegistry_1.purgeTargetRegistry.has(targetKey)) {
            throw new Error(`Cannot delete built-in target "${targetKey}"`);
        }
        const res = await this.pool.query(`DELETE FROM purge_policy WHERE target_key = $1`, [targetKey]);
        if ((res.rowCount ?? 0) === 0)
            throw new Error(`Policy "${targetKey}" not found`);
    }
    async dryRunOne(targetKey) {
        const policy = await this.getPolicy(targetKey);
        if (!policy)
            throw new Error(`No policy for target "${targetKey}"`);
        const target = this.resolveTarget(policy);
        if (!target)
            throw new Error(`No executor available for "${targetKey}". User-added DB targets require both db_table_name and db_timestamp_column to be set and whitelisted.`);
        const wouldRemove = await target.count(policy.retention_days);
        await this.pool.query(`UPDATE purge_policy
          SET last_dry_run_at = NOW(), last_dry_run_count = $1
        WHERE target_key = $2`, [wouldRemove, targetKey]);
        return { wouldRemove, retentionDays: policy.retention_days };
    }
    async runOne(targetKey, actor) {
        const policy = await this.getPolicy(targetKey);
        if (!policy)
            throw new Error(`No policy for target "${targetKey}"`);
        return this.executeTargetForPolicy(policy, actor);
    }
    async runAll(actor) {
        const policies = (await this.listPolicies()).filter(p => p.enabled);
        const results = [];
        for (const p of policies) {
            results.push(await this.executeTargetForPolicy(p, actor));
        }
        this.lastRunAt = new Date();
        this.lastRunResults = results;
        return results;
    }
    resolveTarget(policy) {
        const builtin = targetRegistry_1.purgeTargetRegistry.get(policy.target_key);
        if (builtin)
            return builtin;
        const table = policy.db_table_name;
        const col = policy.db_timestamp_column;
        if (!table || !col)
            return null;
        if (!(0, allowedTables_1.isAllowedTableColumn)(table, col)) {
            console.warn(`[PurgeJanitor] policy "${policy.target_key}" references non-whitelisted (${table}.${col}) — refusing to execute`);
            return null;
        }
        return this.createDynamicDbTarget(policy.target_key, policy.label, table, col);
    }
    createDynamicDbTarget(key, label, table, col) {
        const pool = this.pool;
        return {
            key, label, type: 'db_table', defaultRetentionDays: 90,
            async count(retentionDays) {
                if (!(0, allowedTables_1.isAllowedTableColumn)(table, col)) {
                    throw new Error(`Refusing to count: (${table}, ${col}) not whitelisted`);
                }
                const sql = `SELECT COUNT(*)::text AS count FROM "${table}" WHERE "${col}" < NOW() - ($1 || ' days')::interval`;
                const res = await pool.query(sql, [String(retentionDays)]);
                return parseInt(res.rows[0]?.count ?? '0', 10);
            },
            async purge(retentionDays) {
                if (!(0, allowedTables_1.isAllowedTableColumn)(table, col)) {
                    throw new Error(`Refusing to delete: (${table}, ${col}) not whitelisted`);
                }
                const sql = `DELETE FROM "${table}" WHERE "${col}" < NOW() - ($1 || ' days')::interval`;
                const res = await pool.query(sql, [String(retentionDays)]);
                return { removed: res.rowCount ?? 0 };
            },
        };
    }
    async executeTargetForPolicy(policy, actor) {
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
            await this.pool.query(`UPDATE purge_policy
            SET last_run_at = NOW(), last_removed_count = $1
          WHERE target_key = $2`, [removed, targetKey]);
            (0, authEventLogger_1.logAuthEvent)({
                type: 'force_logout',
                username: 'system',
                actor,
                reason: `PURGE:${targetKey} retention=${retentionDays}d removed=${removed}`,
            });
            const durationMs = Date.now() - t0;
            console.log(`[PurgeJanitor] ${targetKey}: removed ${removed} in ${durationMs}ms (actor=${actor})`);
            return { targetKey, ok: true, removed, durationMs };
        }
        catch (err) {
            const msg = err?.message || String(err);
            console.error(`[PurgeJanitor] ${targetKey} error:`, err);
            (0, authEventLogger_1.logAuthEvent)({
                type: 'force_logout',
                username: 'system',
                actor,
                reason: `PURGE_ERROR:${targetKey}: ${msg}`,
            });
            return { targetKey, ok: false, removed: 0, message: msg, durationMs: Date.now() - t0 };
        }
    }
    getStatus() {
        return {
            isEnabled: this.task !== null,
            cronExpression: CRON_EXPR,
            timezone: TIMEZONE,
            startedAt: this.startedAt ? (0, dateTimeUtils_1.formatDateTimeLocal)(this.startedAt) : null,
            lastRunAt: this.lastRunAt ? (0, dateTimeUtils_1.formatDateTimeLocal)(this.lastRunAt) : null,
            lastRunResults: this.lastRunResults,
            registeredTargets: targetRegistry_1.purgeTargetRegistry.list().map(t => ({
                key: t.key, label: t.label, type: t.type, defaultRetentionDays: t.defaultRetentionDays,
            })),
        };
    }
}
exports.PurgeJanitor = PurgeJanitor;
PurgeJanitor.instance = null;
function getPurgeJanitor(pool) {
    return PurgeJanitor.getInstance(pool);
}
