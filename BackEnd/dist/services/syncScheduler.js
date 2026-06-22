"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSyncScheduler = exports.SyncScheduler = void 0;
const node_cron_1 = __importDefault(require("node-cron"));
const db_1 = require("../db");
const service_1 = require("../entities/inf/inf-checkin/service");
const model_1 = require("../entities/inf/inf-checkin/model");
const service_2 = require("../entities/inf/inf-lotinput/service");
const model_2 = require("../entities/inf/inf-lotinput/model");
const service_3 = require("../entities/inf/inf-useroperation/service");
const model_3 = require("../entities/inf/inf-useroperation/model");
function formatLocalDateTime(date) {
    if (!date)
        return null;
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}
class SyncScheduler {
    constructor(pgPool) {
        this.task = null;
        this.isEnabled = false;
        this.intervalMinutes = 5;
        this.startedAt = null;
        this.checkinService = null;
        this.lotInputService = null;
        this.userOperationService = null;
        this.pgPool = pgPool;
        this.jobStatus = {
            checkin: this.createEmptyJobStatus('CheckIn'),
            lotinput: this.createEmptyJobStatus('LotInput'),
            useroperation: this.createEmptyJobStatus('UserOperation'),
        };
    }
    static getInstance(pgPool) {
        if (!SyncScheduler.instance) {
            if (!pgPool) {
                throw new Error('PgPool is required for first initialization');
            }
            SyncScheduler.instance = new SyncScheduler(pgPool);
        }
        return SyncScheduler.instance;
    }
    initializeServices() {
        const drizzleDb = (0, db_1.getDrizzleDb)();
        if (!this.checkinService) {
            const checkinModel = new model_1.InfCheckinModel(drizzleDb);
            this.checkinService = new service_1.InfCheckinService(checkinModel, this.pgPool);
        }
        if (!this.lotInputService) {
            const lotInputModel = new model_2.InfLotInputModel(drizzleDb);
            this.lotInputService = new service_2.InfLotInputService(lotInputModel, this.pgPool);
        }
        if (!this.userOperationService) {
            const userOperationModel = new model_3.InfUserOperationModel(drizzleDb);
            this.userOperationService = new service_3.InfUserOperationService(userOperationModel, this.pgPool);
        }
    }
    createEmptyJobStatus(name) {
        return {
            name,
            lastRun: null,
            lastResult: null,
            lastMessage: 'Not run yet',
            nextRun: null,
            imported: 0,
            updated: 0,
            skipped: 0,
            isRunning: false,
        };
    }
    async getSyncInterval() {
        try {
            const result = await this.pgPool.query(`
        SELECT mssql_sync
        FROM sysconfig
        WHERE id = 1
      `);
            if (result.rows.length > 0) {
                const minutes = parseInt(result.rows[0].mssql_sync, 10);
                if (!isNaN(minutes) && minutes > 0) {
                    return minutes;
                }
            }
            return 5;
        }
        catch (error) {
            console.error('Failed to get sync interval from sysconfig, using default:', error);
            return 5;
        }
    }
    async isMssqlEnabled() {
        try {
            const result = await this.pgPool.query(`
        SELECT mssql_enabled
        FROM sysconfig
        WHERE id = 1
      `);
            if (result.rows.length > 0) {
                return result.rows[0].mssql_enabled !== false;
            }
            return true;
        }
        catch (error) {
            console.error('Failed to check mssql_enabled from sysconfig:', error);
            return true;
        }
    }
    minutesToCron(minutes) {
        if (minutes <= 0)
            minutes = 5;
        if (minutes >= 60) {
            const hours = Math.floor(minutes / 60);
            return `0 */${hours} * * *`;
        }
        return `*/${minutes} * * * *`;
    }
    calculateNextRun() {
        const now = new Date();
        const nextRun = new Date(now.getTime() + this.intervalMinutes * 60 * 1000);
        return nextRun;
    }
    async refreshEmployeeMaterializedView() {
        try {
            console.log('[Scheduler] Refreshing mv_employee materialized view...');
            await this.pgPool.query('REFRESH MATERIALIZED VIEW CONCURRENTLY mv_employee');
            console.log('[Scheduler] mv_employee refresh completed');
        }
        catch (error) {
            console.warn('[Scheduler] mv_employee refresh failed (might not exist yet):', error instanceof Error ? error.message : 'Unknown error');
        }
    }
    async syncCheckIn() {
        if (this.jobStatus.checkin.isRunning) {
            console.log('[Scheduler] CheckIn sync already running, skipping');
            return;
        }
        this.jobStatus.checkin.isRunning = true;
        const startTime = new Date();
        try {
            console.log('[Scheduler] Starting CheckIn sync...');
            const result = await this.checkinService.sync(true, { forceSync: false });
            this.jobStatus.checkin.lastRun = startTime;
            this.jobStatus.checkin.nextRun = this.calculateNextRun();
            if (result.success) {
                if (result.data) {
                    this.jobStatus.checkin.lastResult = 'success';
                    this.jobStatus.checkin.imported = result.data.imported;
                    this.jobStatus.checkin.updated = result.data.updated;
                    this.jobStatus.checkin.skipped = result.data.skipped;
                    this.jobStatus.checkin.lastMessage = `Imported: ${result.data.imported}, Updated: ${result.data.updated}, Skipped: ${result.data.skipped}`;
                    console.log(`[Scheduler] CheckIn sync completed: ${this.jobStatus.checkin.lastMessage}`);
                    if (result.data.imported > 0 || result.data.updated > 0) {
                        await this.refreshEmployeeMaterializedView();
                    }
                }
                else {
                    this.jobStatus.checkin.lastResult = 'skipped';
                    this.jobStatus.checkin.lastMessage = result.message || 'Sync skipped (interval not reached)';
                    console.log(`[Scheduler] CheckIn sync skipped: ${this.jobStatus.checkin.lastMessage}`);
                }
            }
            else {
                this.jobStatus.checkin.lastResult = 'error';
                this.jobStatus.checkin.lastMessage = result.message || 'Sync failed';
                console.error(`[Scheduler] CheckIn sync failed: ${this.jobStatus.checkin.lastMessage}`);
            }
        }
        catch (error) {
            this.jobStatus.checkin.lastRun = startTime;
            this.jobStatus.checkin.lastResult = 'error';
            this.jobStatus.checkin.lastMessage = error instanceof Error ? error.message : 'Unknown error';
            console.error('[Scheduler] CheckIn sync error:', error);
        }
        finally {
            this.jobStatus.checkin.isRunning = false;
        }
    }
    async syncLotInput() {
        if (this.jobStatus.lotinput.isRunning) {
            console.log('[Scheduler] LotInput sync already running, skipping');
            return;
        }
        this.jobStatus.lotinput.isRunning = true;
        const startTime = new Date();
        try {
            console.log('[Scheduler] Starting LotInput sync...');
            const result = await this.lotInputService.sync(true, { forceSync: false });
            this.jobStatus.lotinput.lastRun = startTime;
            this.jobStatus.lotinput.nextRun = this.calculateNextRun();
            if (result.success) {
                if (result.data) {
                    this.jobStatus.lotinput.lastResult = 'success';
                    this.jobStatus.lotinput.imported = result.data.imported;
                    this.jobStatus.lotinput.updated = result.data.updated;
                    this.jobStatus.lotinput.skipped = result.data.skipped;
                    this.jobStatus.lotinput.lastMessage = `Imported: ${result.data.imported}, Updated: ${result.data.updated}, Skipped: ${result.data.skipped}`;
                    console.log(`[Scheduler] LotInput sync completed: ${this.jobStatus.lotinput.lastMessage}`);
                }
                else {
                    this.jobStatus.lotinput.lastResult = 'skipped';
                    this.jobStatus.lotinput.lastMessage = result.message || 'Sync skipped (interval not reached)';
                    console.log(`[Scheduler] LotInput sync skipped: ${this.jobStatus.lotinput.lastMessage}`);
                }
            }
            else {
                this.jobStatus.lotinput.lastResult = 'error';
                this.jobStatus.lotinput.lastMessage = result.message || 'Sync failed';
                console.error(`[Scheduler] LotInput sync failed: ${this.jobStatus.lotinput.lastMessage}`);
            }
        }
        catch (error) {
            this.jobStatus.lotinput.lastRun = startTime;
            this.jobStatus.lotinput.lastResult = 'error';
            this.jobStatus.lotinput.lastMessage = error instanceof Error ? error.message : 'Unknown error';
            console.error('[Scheduler] LotInput sync error:', error);
        }
        finally {
            this.jobStatus.lotinput.isRunning = false;
        }
    }
    async syncUserOperation() {
        if (this.jobStatus.useroperation.isRunning) {
            console.log('[Scheduler] UserOperation sync already running, skipping');
            return;
        }
        this.jobStatus.useroperation.isRunning = true;
        const startTime = new Date();
        try {
            console.log('[Scheduler] Starting UserOperation sync...');
            const result = await this.userOperationService.syncFromMssql();
            this.jobStatus.useroperation.lastRun = startTime;
            this.jobStatus.useroperation.nextRun = this.calculateNextRun();
            if (result.success && result.data) {
                this.jobStatus.useroperation.lastResult = 'success';
                this.jobStatus.useroperation.imported = result.data.imported;
                this.jobStatus.useroperation.updated = result.data.updated;
                this.jobStatus.useroperation.skipped = result.data.skipped;
                this.jobStatus.useroperation.lastMessage = `Imported: ${result.data.imported}, Updated: ${result.data.updated}, Skipped: ${result.data.skipped}`;
                console.log(`[Scheduler] UserOperation sync completed: ${this.jobStatus.useroperation.lastMessage}`);
            }
            else {
                this.jobStatus.useroperation.lastResult = 'error';
                this.jobStatus.useroperation.lastMessage = result.message || 'Sync failed';
                console.error(`[Scheduler] UserOperation sync failed: ${this.jobStatus.useroperation.lastMessage}`);
            }
        }
        catch (error) {
            this.jobStatus.useroperation.lastRun = startTime;
            this.jobStatus.useroperation.lastResult = 'error';
            this.jobStatus.useroperation.lastMessage = error instanceof Error ? error.message : 'Unknown error';
            console.error('[Scheduler] UserOperation sync error:', error);
        }
        finally {
            this.jobStatus.useroperation.isRunning = false;
        }
    }
    async runAllSyncs() {
        const mssqlEnabled = await this.isMssqlEnabled();
        if (!mssqlEnabled) {
            console.log('[Scheduler] MSSQL sync is disabled, skipping sync cycle');
            return;
        }
        console.log('\n' + '='.repeat(60));
        console.log(`[Scheduler] Running scheduled sync at ${new Date().toISOString()}`);
        console.log('='.repeat(60));
        await this.syncCheckIn();
        await this.syncLotInput();
        await this.syncUserOperation();
        console.log('='.repeat(60));
        console.log('[Scheduler] Scheduled sync cycle completed');
        console.log('='.repeat(60) + '\n');
    }
    async start() {
        if (this.isEnabled) {
            console.log('[Scheduler] Already running');
            return;
        }
        try {
            const mssqlEnabled = await this.isMssqlEnabled();
            if (!mssqlEnabled) {
                console.log('\n' + '='.repeat(60));
                console.log('[Scheduler] MSSQL sync is DISABLED in sysconfig');
                console.log('[Scheduler] Scheduler will not start. Set mssql_enabled = true to enable.');
                console.log('='.repeat(60) + '\n');
                return;
            }
            this.intervalMinutes = await this.getSyncInterval();
            const cronExpression = this.minutesToCron(this.intervalMinutes);
            console.log('\n' + '='.repeat(60));
            console.log('[Scheduler] Starting Sync Scheduler Service');
            console.log('='.repeat(60));
            console.log(`   Sync Interval: ${this.intervalMinutes} minutes`);
            console.log(`   Cron Expression: ${cronExpression}`);
            console.log('   Jobs: CheckIn, LotInput, UserOperation');
            console.log('='.repeat(60) + '\n');
            this.initializeServices();
            this.task = node_cron_1.default.schedule(cronExpression, async () => {
                await this.runAllSyncs();
            }, {
                timezone: 'Asia/Bangkok'
            });
            this.isEnabled = true;
            this.startedAt = new Date();
            const nextRun = this.calculateNextRun();
            this.jobStatus.checkin.nextRun = nextRun;
            this.jobStatus.lotinput.nextRun = nextRun;
            this.jobStatus.useroperation.nextRun = nextRun;
            console.log('[Scheduler] Running initial sync...');
            await this.runAllSyncs();
            console.log('[Scheduler] Sync Scheduler started successfully');
        }
        catch (error) {
            console.error('[Scheduler] Failed to start:', error);
            throw error;
        }
    }
    stop() {
        if (this.task) {
            this.task.stop();
            this.task = null;
        }
        this.isEnabled = false;
        console.log('[Scheduler] Sync Scheduler stopped');
    }
    formatJobStatus(job) {
        return {
            name: job.name,
            lastRun: formatLocalDateTime(job.lastRun),
            lastResult: job.lastResult,
            lastMessage: job.lastMessage,
            nextRun: formatLocalDateTime(job.nextRun),
            imported: job.imported,
            updated: job.updated,
            skipped: job.skipped,
            isRunning: job.isRunning,
        };
    }
    getStatus() {
        return {
            isEnabled: this.isEnabled,
            intervalMinutes: this.intervalMinutes,
            cronExpression: this.minutesToCron(this.intervalMinutes),
            startedAt: formatLocalDateTime(this.startedAt),
            jobs: {
                checkin: this.formatJobStatus(this.jobStatus.checkin),
                lotinput: this.formatJobStatus(this.jobStatus.lotinput),
                useroperation: this.formatJobStatus(this.jobStatus.useroperation),
            },
        };
    }
    async triggerManualSync() {
        if (!this.isEnabled) {
            throw new Error('Scheduler is not running. Start the scheduler first.');
        }
        console.log('[Scheduler] Manual sync triggered');
        await this.runAllSyncs();
    }
    async updateInterval(minutes) {
        if (minutes < 1) {
            throw new Error('Interval must be at least 1 minute');
        }
        await this.pgPool.query(`
      UPDATE sysconfig
      SET mssql_sync = $1
      WHERE id = 1
    `, [minutes]);
        if (this.isEnabled) {
            this.stop();
            await this.start();
        }
        console.log(`[Scheduler] Interval updated to ${minutes} minutes`);
    }
}
exports.SyncScheduler = SyncScheduler;
SyncScheduler.instance = null;
const getSyncScheduler = (pgPool) => {
    return SyncScheduler.getInstance(pgPool);
};
exports.getSyncScheduler = getSyncScheduler;
exports.default = SyncScheduler;
