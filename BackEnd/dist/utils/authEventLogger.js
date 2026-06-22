"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.logAuthEvent = logAuthEvent;
exports.queryAuthEvents = queryAuthEvents;
exports.purgeOldLogs = purgeOldLogs;
exports.countOldLogs = countOldLogs;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const dateTimeUtils_1 = require("./dateTimeUtils");
const LOG_DIR = path_1.default.resolve(process.cwd(), 'logs');
const FILE_PREFIX = 'auth-events-';
const FILE_SUFFIX = '.log';
function ensureDir() {
    if (!fs_1.default.existsSync(LOG_DIR)) {
        fs_1.default.mkdirSync(LOG_DIR, { recursive: true });
    }
}
function todayKey(d = new Date()) {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
}
function fileForDate(d = new Date()) {
    return path_1.default.join(LOG_DIR, `${FILE_PREFIX}${todayKey(d)}${FILE_SUFFIX}`);
}
function logAuthEvent(event) {
    try {
        ensureDir();
        const record = { ts: event.ts || (0, dateTimeUtils_1.formatDateTimeLocal)(new Date()), ...event };
        fs_1.default.appendFile(fileForDate(), JSON.stringify(record) + '\n', err => {
            if (err)
                console.error('[authEventLogger] append failed:', err.message);
        });
    }
    catch (err) {
        console.error('[authEventLogger] unexpected error:', err);
    }
}
const SCAN_CAP = 50000;
function listLogFilesInRange(from, to) {
    ensureDir();
    let names;
    try {
        names = fs_1.default.readdirSync(LOG_DIR).filter(n => n.startsWith(FILE_PREFIX) && n.endsWith(FILE_SUFFIX));
    }
    catch {
        return [];
    }
    const fromKey = from ? todayKey(from) : '';
    const toKey = to ? todayKey(to) : '\uffff';
    const inRange = names.filter(n => {
        const key = n.slice(FILE_PREFIX.length, -FILE_SUFFIX.length);
        return key >= fromKey && key <= toKey;
    });
    inRange.sort().reverse();
    return inRange.map(n => path_1.default.join(LOG_DIR, n));
}
function queryAuthEvents(q = {}) {
    const limit = Math.min(Math.max(q.limit ?? 500, 1), 5000);
    const offset = Math.max(q.offset ?? 0, 0);
    const types = q.type ? (Array.isArray(q.type) ? q.type : [q.type]) : null;
    const usernameLower = q.username ? q.username.toLowerCase() : null;
    const fromMs = q.from?.getTime();
    const toMs = q.to?.getTime();
    const matched = [];
    let scanned = 0;
    let truncated = false;
    const files = listLogFilesInRange(q.from, q.to);
    outer: for (const file of files) {
        let raw;
        try {
            raw = fs_1.default.readFileSync(file, 'utf8');
        }
        catch {
            continue;
        }
        const lines = raw.split('\n');
        for (let i = lines.length - 1; i >= 0; i--) {
            const line = lines[i];
            if (!line)
                continue;
            scanned++;
            if (scanned > SCAN_CAP) {
                truncated = true;
                break outer;
            }
            let evt;
            try {
                evt = JSON.parse(line);
            }
            catch {
                continue;
            }
            if (types && !types.includes(evt.type))
                continue;
            if (usernameLower && (evt.username || '').toLowerCase() !== usernameLower)
                continue;
            if (fromMs || toMs) {
                const tsMs = Date.parse(evt.ts);
                if (Number.isNaN(tsMs))
                    continue;
                if (fromMs !== undefined && tsMs < fromMs)
                    continue;
                if (toMs !== undefined && tsMs > toMs)
                    continue;
            }
            matched.push(evt);
        }
    }
    const total = matched.length;
    const events = matched.slice(offset, offset + limit);
    return { events, total, scanned, truncated };
}
function purgeOldLogs(retentionDays = 90) {
    ensureDir();
    if (!Number.isFinite(retentionDays) || retentionDays < 1) {
        console.warn(`[authEventLogger] invalid retentionDays=${retentionDays}, skipping purge`);
        return [];
    }
    const cutoff = new Date();
    cutoff.setHours(0, 0, 0, 0);
    cutoff.setDate(cutoff.getDate() - retentionDays);
    const cutoffKey = todayKey(cutoff);
    let names;
    try {
        names = fs_1.default.readdirSync(LOG_DIR).filter(n => n.startsWith(FILE_PREFIX) && n.endsWith(FILE_SUFFIX));
    }
    catch (err) {
        console.error('[authEventLogger] purge readdir failed:', err);
        return [];
    }
    const removed = [];
    for (const name of names) {
        const key = name.slice(FILE_PREFIX.length, -FILE_SUFFIX.length);
        if (!/^\d{4}-\d{2}-\d{2}$/.test(key))
            continue;
        if (key >= cutoffKey)
            continue;
        try {
            fs_1.default.unlinkSync(path_1.default.join(LOG_DIR, name));
            removed.push(name);
        }
        catch (err) {
            console.error(`[authEventLogger] failed to delete ${name}:`, err);
        }
    }
    return removed;
}
function countOldLogs(retentionDays = 90) {
    ensureDir();
    if (!Number.isFinite(retentionDays) || retentionDays < 1)
        return 0;
    const cutoff = new Date();
    cutoff.setHours(0, 0, 0, 0);
    cutoff.setDate(cutoff.getDate() - retentionDays);
    const cutoffKey = todayKey(cutoff);
    let names;
    try {
        names = fs_1.default.readdirSync(LOG_DIR).filter(n => n.startsWith(FILE_PREFIX) && n.endsWith(FILE_SUFFIX));
    }
    catch {
        return 0;
    }
    let n = 0;
    for (const name of names) {
        const key = name.slice(FILE_PREFIX.length, -FILE_SUFFIX.length);
        if (!/^\d{4}-\d{2}-\d{2}$/.test(key))
            continue;
        if (key >= cutoffKey)
            continue;
        n++;
    }
    return n;
}
exports.default = { logAuthEvent, queryAuthEvents, purgeOldLogs, countOldLogs };
