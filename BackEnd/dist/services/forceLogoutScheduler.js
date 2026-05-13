"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ForceLogoutScheduler = void 0;
exports.getForceLogoutScheduler = getForceLogoutScheduler;
const node_cron_1 = __importDefault(require("node-cron"));
const authEventLogger_1 = require("../utils/authEventLogger");
const dateTimeUtils_1 = require("../utils/dateTimeUtils");
const TIMEZONE = 'Asia/Bangkok';
function parseTimes(raw) {
    const fallback = [{ hour: 7, minute: 35 }, { hour: 19, minute: 20 }];
    if (!raw)
        return fallback;
    const out = [];
    for (const part of raw.split(',').map(s => s.trim()).filter(Boolean)) {
        const m = /^(\d{1,2}):(\d{2})$/.exec(part);
        if (!m) {
            console.warn(`[ForceLogoutScheduler] ignoring invalid time "${part}" (expected HH:MM)`);
            continue;
        }
        const hour = parseInt(m[1], 10);
        const minute = parseInt(m[2], 10);
        if (hour < 0 || hour > 23 || minute < 0 || minute > 59) {
            console.warn(`[ForceLogoutScheduler] out-of-range time "${part}" ignored`);
            continue;
        }
        out.push({ hour, minute });
    }
    return out.length > 0 ? out : fallback;
}
class ForceLogoutScheduler {
    static getInstance(pool) {
        if (!ForceLogoutScheduler.instance) {
            if (!pool)
                throw new Error('ForceLogoutScheduler requires a pool on first call');
            ForceLogoutScheduler.instance = new ForceLogoutScheduler(pool);
        }
        return ForceLogoutScheduler.instance;
    }
    constructor(pool) {
        this.tasks = [];
        this.times = [];
        this.startedAt = null;
        this.lastRunAt = null;
        this.lastKilledCount = 0;
        this.pool = pool;
    }
    start() {
        if (this.tasks.length > 0) {
            console.log('[ForceLogoutScheduler] already started');
            return;
        }
        this.times = parseTimes(process.env.FORCE_LOGOUT_TIMES);
        for (const t of this.times) {
            const expr = `${t.minute} ${t.hour} * * *`;
            const task = node_cron_1.default.schedule(expr, () => {
                this.runForceLogout(`${pad2(t.hour)}:${pad2(t.minute)}`).catch(err => {
                    console.error('[ForceLogoutScheduler] run error:', err);
                });
            }, { timezone: TIMEZONE });
            this.tasks.push(task);
        }
        this.startedAt = new Date();
        console.log('\n' + '='.repeat(60));
        console.log('[ForceLogoutScheduler] started');
        console.log(`   Timezone:    ${TIMEZONE}`);
        console.log(`   Times:       ${this.times.map(t => `${pad2(t.hour)}:${pad2(t.minute)}`).join(', ')}`);
        console.log(`   Source:      ${process.env.FORCE_LOGOUT_TIMES ? 'env FORCE_LOGOUT_TIMES' : 'default'}`);
        console.log('='.repeat(60) + '\n');
    }
    stop() {
        for (const t of this.tasks) {
            try {
                t.stop();
            }
            catch { }
        }
        this.tasks = [];
        console.log('[ForceLogoutScheduler] stopped');
    }
    getStatus() {
        return {
            isEnabled: this.tasks.length > 0,
            times: this.times.map(t => `${pad2(t.hour)}:${pad2(t.minute)}`),
            timezone: TIMEZONE,
            startedAt: this.startedAt ? (0, dateTimeUtils_1.formatDateTimeLocal)(this.startedAt) : null,
            lastRunAt: this.lastRunAt ? (0, dateTimeUtils_1.formatDateTimeLocal)(this.lastRunAt) : null,
            lastKilledCount: this.lastKilledCount,
        };
    }
    async runNow(actor = 'manual') {
        return this.runForceLogout('manual', actor);
    }
    async runForceLogout(label, actor = 'system') {
        const startedAt = Date.now();
        console.log(`[ForceLogoutScheduler] firing for window "${label}" — terminating all sessions`);
        let killed = 0;
        let sessionsSnapshot = [];
        try {
            const select = await this.pool.query(`SELECT sid, sess FROM "session" WHERE expire > NOW()`);
            sessionsSnapshot = select.rows;
            const del = await this.pool.query(`DELETE FROM "session"`);
            killed = del.rowCount ?? 0;
        }
        catch (err) {
            console.error('[ForceLogoutScheduler] DB error:', err);
            (0, authEventLogger_1.logAuthEvent)({
                type: 'force_logout',
                username: 'system',
                actor,
                reason: `DB_ERROR: ${err.message}`,
            });
            return 0;
        }
        for (const row of sessionsSnapshot) {
            const sess = (row.sess || {});
            const username = sess.username || sess.user?.username || 'unknown';
            const userId = sess.userId ?? sess.user?.id ?? null;
            (0, authEventLogger_1.logAuthEvent)({
                type: 'force_logout',
                username,
                userId,
                sessionId: row.sid,
                reason: `SCHEDULED:${label}`,
                actor,
            });
        }
        (0, authEventLogger_1.logAuthEvent)({
            type: 'force_logout',
            username: 'system',
            actor,
            reason: `SCHEDULED:${label}:summary killed=${killed}`,
        });
        this.lastRunAt = new Date();
        this.lastKilledCount = killed;
        console.log(`[ForceLogoutScheduler] window "${label}" done — killed ${killed} session(s) in ${Date.now() - startedAt}ms`);
        return killed;
    }
}
exports.ForceLogoutScheduler = ForceLogoutScheduler;
ForceLogoutScheduler.instance = null;
function pad2(n) { return String(n).padStart(2, '0'); }
function getForceLogoutScheduler(pool) {
    return ForceLogoutScheduler.getInstance(pool);
}
