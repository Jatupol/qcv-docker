// server/src/services/syncScheduler.ts
// ===== AUTOMATED SYNC SCHEDULER SERVICE =====
// Automatically syncs data from MSSQL to PostgreSQL at configured intervals
// Uses node-cron for scheduling

import cron, { ScheduledTask } from 'node-cron';
import { Pool as PgPool } from 'pg';

// Import Drizzle database instance
import { getDrizzleDb } from '../db';

// Import service classes
import { InfCheckinService } from '../entities/inf/inf-checkin/service';
import { InfCheckinModel } from '../entities/inf/inf-checkin/model';
import { InfLotInputService } from '../entities/inf/inf-lotinput/service';
import { InfLotInputModel } from '../entities/inf/inf-lotinput/model';
import { InfUserOperationService } from '../entities/inf/inf-useroperation/service';
import { InfUserOperationModel } from '../entities/inf/inf-useroperation/model';

/**
 * Sync job status (internal - uses Date objects)
 */
interface SyncJobStatusInternal {
  name: string;
  lastRun: Date | null;
  lastResult: 'success' | 'error' | 'skipped' | null;
  lastMessage: string;
  nextRun: Date | null;
  imported: number;
  updated: number;
  skipped: number;
  isRunning: boolean;
}

/**
 * Sync job status (API response - uses formatted local datetime strings)
 */
export interface SyncJobStatus {
  name: string;
  lastRun: string | null;
  lastResult: 'success' | 'error' | 'skipped' | null;
  lastMessage: string;
  nextRun: string | null;
  imported: number;
  updated: number;
  skipped: number;
  isRunning: boolean;
}

/**
 * Scheduler status (API response)
 */
export interface SchedulerStatus {
  isEnabled: boolean;
  intervalMinutes: number;
  cronExpression: string;
  startedAt: string | null;
  jobs: {
    checkin: SyncJobStatus;
    lotinput: SyncJobStatus;
    useroperation: SyncJobStatus;
  };
}

/**
 * Format Date to local datetime string (YYYY-MM-DD HH:mm:ss)
 * Preserves local timezone for display
 */
function formatLocalDateTime(date: Date | null): string | null {
  if (!date) return null;

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');

  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

/**
 * Sync Scheduler Service
 * Manages automated synchronization of interface data from MSSQL
 */
export class SyncScheduler {
  private static instance: SyncScheduler | null = null;

  private pgPool: PgPool;
  private task: ScheduledTask | null = null;
  private isEnabled: boolean = false;
  private intervalMinutes: number = 5;
  private startedAt: Date | null = null;

  // Services
  private checkinService: InfCheckinService | null = null;
  private lotInputService: InfLotInputService | null = null;
  private userOperationService: InfUserOperationService | null = null;

  // Job status tracking (internal - uses Date objects)
  private jobStatus: {
    checkin: SyncJobStatusInternal;
    lotinput: SyncJobStatusInternal;
    useroperation: SyncJobStatusInternal;
  };

  private constructor(pgPool: PgPool) {
    this.pgPool = pgPool;

    // Initialize job status
    this.jobStatus = {
      checkin: this.createEmptyJobStatus('CheckIn'),
      lotinput: this.createEmptyJobStatus('LotInput'),
      useroperation: this.createEmptyJobStatus('UserOperation'),
    };
  }

  /**
   * Get singleton instance
   */
  static getInstance(pgPool?: PgPool): SyncScheduler {
    if (!SyncScheduler.instance) {
      if (!pgPool) {
        throw new Error('PgPool is required for first initialization');
      }
      SyncScheduler.instance = new SyncScheduler(pgPool);
    }
    return SyncScheduler.instance;
  }

  /**
   * Initialize services
   */
  private initializeServices(): void {
    // Get Drizzle database instance (models use Drizzle ORM)
    const drizzleDb = getDrizzleDb();

    if (!this.checkinService) {
      const checkinModel = new InfCheckinModel(drizzleDb);
      this.checkinService = new InfCheckinService(checkinModel, this.pgPool);
    }

    if (!this.lotInputService) {
      const lotInputModel = new InfLotInputModel(drizzleDb);
      this.lotInputService = new InfLotInputService(lotInputModel, this.pgPool);
    }

    if (!this.userOperationService) {
      const userOperationModel = new InfUserOperationModel(drizzleDb);
      this.userOperationService = new InfUserOperationService(userOperationModel, this.pgPool);
    }
  }

  /**
   * Create empty job status
   */
  private createEmptyJobStatus(name: string): SyncJobStatusInternal {
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

  /**
   * Get sync interval from sysconfig
   */
  private async getSyncInterval(): Promise<number> {
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

      return 5; // Default 5 minutes
    } catch (error) {
      console.error('Failed to get sync interval from sysconfig, using default:', error);
      return 5;
    }
  }

  /**
   * Check if MSSQL sync is enabled in sysconfig
   */
  private async isMssqlEnabled(): Promise<boolean> {
    try {
      const result = await this.pgPool.query(`
        SELECT mssql_enabled
        FROM sysconfig
        WHERE id = 1
      `);

      if (result.rows.length > 0) {
        // Default to true if column doesn't exist or is null (backward compatibility)
        return result.rows[0].mssql_enabled !== false;
      }

      return true; // Default enabled
    } catch (error) {
      console.error('Failed to check mssql_enabled from sysconfig:', error);
      return true; // Default enabled on error
    }
  }

  /**
   * Convert minutes to cron expression
   */
  private minutesToCron(minutes: number): string {
    if (minutes <= 0) minutes = 5;
    if (minutes >= 60) {
      const hours = Math.floor(minutes / 60);
      return `0 */${hours} * * *`;
    }
    return `*/${minutes} * * * *`;
  }

  /**
   * Calculate next run time
   */
  private calculateNextRun(): Date {
    const now = new Date();
    const nextRun = new Date(now.getTime() + this.intervalMinutes * 60 * 1000);
    return nextRun;
  }

  /**
   * Refresh the mv_employee materialized view after check-in sync
   * This ensures employee name lookups in v_defectdata are fast
   */
  private async refreshEmployeeMaterializedView(): Promise<void> {
    try {
      console.log('[Scheduler] Refreshing mv_employee materialized view...');
      await this.pgPool.query('REFRESH MATERIALIZED VIEW CONCURRENTLY mv_employee');
      console.log('[Scheduler] mv_employee refresh completed');
    } catch (error) {
      // Log but don't fail - the view might not exist yet or CONCURRENT refresh might fail
      // if there's no unique index (first run before migration)
      console.warn('[Scheduler] mv_employee refresh failed (might not exist yet):',
        error instanceof Error ? error.message : 'Unknown error');
    }
  }

  /**
   * Run sync for CheckIn
   */
  private async syncCheckIn(): Promise<void> {
    if (this.jobStatus.checkin.isRunning) {
      console.log('[Scheduler] CheckIn sync already running, skipping');
      return;
    }

    this.jobStatus.checkin.isRunning = true;
    const startTime = new Date();

    try {
      console.log('[Scheduler] Starting CheckIn sync...');

      const result = await this.checkinService!.sync(true, { forceSync: false });

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

          // Refresh materialized view if new data was imported
          if (result.data.imported > 0 || result.data.updated > 0) {
            await this.refreshEmployeeMaterializedView();
          }
        } else {
          this.jobStatus.checkin.lastResult = 'skipped';
          this.jobStatus.checkin.lastMessage = result.message || 'Sync skipped (interval not reached)';
          console.log(`[Scheduler] CheckIn sync skipped: ${this.jobStatus.checkin.lastMessage}`);
        }
      } else {
        this.jobStatus.checkin.lastResult = 'error';
        this.jobStatus.checkin.lastMessage = result.message || 'Sync failed';
        console.error(`[Scheduler] CheckIn sync failed: ${this.jobStatus.checkin.lastMessage}`);
      }
    } catch (error) {
      this.jobStatus.checkin.lastRun = startTime;
      this.jobStatus.checkin.lastResult = 'error';
      this.jobStatus.checkin.lastMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('[Scheduler] CheckIn sync error:', error);
    } finally {
      this.jobStatus.checkin.isRunning = false;
    }
  }

  /**
   * Run sync for LotInput
   */
  private async syncLotInput(): Promise<void> {
    if (this.jobStatus.lotinput.isRunning) {
      console.log('[Scheduler] LotInput sync already running, skipping');
      return;
    }

    this.jobStatus.lotinput.isRunning = true;
    const startTime = new Date();

    try {
      console.log('[Scheduler] Starting LotInput sync...');

      const result = await this.lotInputService!.sync(true, { forceSync: false });

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
        } else {
          this.jobStatus.lotinput.lastResult = 'skipped';
          this.jobStatus.lotinput.lastMessage = result.message || 'Sync skipped (interval not reached)';
          console.log(`[Scheduler] LotInput sync skipped: ${this.jobStatus.lotinput.lastMessage}`);
        }
      } else {
        this.jobStatus.lotinput.lastResult = 'error';
        this.jobStatus.lotinput.lastMessage = result.message || 'Sync failed';
        console.error(`[Scheduler] LotInput sync failed: ${this.jobStatus.lotinput.lastMessage}`);
      }
    } catch (error) {
      this.jobStatus.lotinput.lastRun = startTime;
      this.jobStatus.lotinput.lastResult = 'error';
      this.jobStatus.lotinput.lastMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('[Scheduler] LotInput sync error:', error);
    } finally {
      this.jobStatus.lotinput.isRunning = false;
    }
  }

  /**
   * Run sync for UserOperation
   */
  private async syncUserOperation(): Promise<void> {
    if (this.jobStatus.useroperation.isRunning) {
      console.log('[Scheduler] UserOperation sync already running, skipping');
      return;
    }

    this.jobStatus.useroperation.isRunning = true;
    const startTime = new Date();

    try {
      console.log('[Scheduler] Starting UserOperation sync...');

      const result = await this.userOperationService!.syncFromMssql();

      this.jobStatus.useroperation.lastRun = startTime;
      this.jobStatus.useroperation.nextRun = this.calculateNextRun();

      if (result.success && result.data) {
        this.jobStatus.useroperation.lastResult = 'success';
        this.jobStatus.useroperation.imported = result.data.imported;
        this.jobStatus.useroperation.updated = result.data.updated;
        this.jobStatus.useroperation.skipped = result.data.skipped;
        this.jobStatus.useroperation.lastMessage = `Imported: ${result.data.imported}, Updated: ${result.data.updated}, Skipped: ${result.data.skipped}`;
        console.log(`[Scheduler] UserOperation sync completed: ${this.jobStatus.useroperation.lastMessage}`);
      } else {
        this.jobStatus.useroperation.lastResult = 'error';
        this.jobStatus.useroperation.lastMessage = result.message || 'Sync failed';
        console.error(`[Scheduler] UserOperation sync failed: ${this.jobStatus.useroperation.lastMessage}`);
      }
    } catch (error) {
      this.jobStatus.useroperation.lastRun = startTime;
      this.jobStatus.useroperation.lastResult = 'error';
      this.jobStatus.useroperation.lastMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('[Scheduler] UserOperation sync error:', error);
    } finally {
      this.jobStatus.useroperation.isRunning = false;
    }
  }

  /**
   * Run all sync jobs
   */
  private async runAllSyncs(): Promise<void> {
    // Check if MSSQL sync is still enabled before running
    const mssqlEnabled = await this.isMssqlEnabled();
    if (!mssqlEnabled) {
      console.log('[Scheduler] MSSQL sync is disabled, skipping sync cycle');
      return;
    }

    console.log('\n' + '='.repeat(60));
    console.log(`[Scheduler] Running scheduled sync at ${new Date().toISOString()}`);
    console.log('='.repeat(60));

    // Run syncs sequentially to avoid overwhelming MSSQL
    await this.syncCheckIn();
    await this.syncLotInput();
    await this.syncUserOperation();

    console.log('='.repeat(60));
    console.log('[Scheduler] Scheduled sync cycle completed');
    console.log('='.repeat(60) + '\n');
  }

  /**
   * Start the scheduler
   */
  async start(): Promise<void> {
    if (this.isEnabled) {
      console.log('[Scheduler] Already running');
      return;
    }

    try {
      // Check if MSSQL sync is enabled
      const mssqlEnabled = await this.isMssqlEnabled();
      if (!mssqlEnabled) {
        console.log('\n' + '='.repeat(60));
        console.log('[Scheduler] MSSQL sync is DISABLED in sysconfig');
        console.log('[Scheduler] Scheduler will not start. Set mssql_enabled = true to enable.');
        console.log('='.repeat(60) + '\n');
        return;
      }

      // Get sync interval from config
      this.intervalMinutes = await this.getSyncInterval();
      const cronExpression = this.minutesToCron(this.intervalMinutes);

      console.log('\n' + '='.repeat(60));
      console.log('[Scheduler] Starting Sync Scheduler Service');
      console.log('='.repeat(60));
      console.log(`   Sync Interval: ${this.intervalMinutes} minutes`);
      console.log(`   Cron Expression: ${cronExpression}`);
      console.log('   Jobs: CheckIn, LotInput, UserOperation');
      console.log('='.repeat(60) + '\n');

      // Initialize services
      this.initializeServices();

      // Create cron task
      this.task = cron.schedule(cronExpression, async () => {
        await this.runAllSyncs();
      }, {
        timezone: 'Asia/Bangkok'
      });

      this.isEnabled = true;
      this.startedAt = new Date();

      // Update next run times
      const nextRun = this.calculateNextRun();
      this.jobStatus.checkin.nextRun = nextRun;
      this.jobStatus.lotinput.nextRun = nextRun;
      this.jobStatus.useroperation.nextRun = nextRun;

      // Run initial sync immediately
      console.log('[Scheduler] Running initial sync...');
      await this.runAllSyncs();

      console.log('[Scheduler] Sync Scheduler started successfully');

    } catch (error) {
      console.error('[Scheduler] Failed to start:', error);
      throw error;
    }
  }

  /**
   * Stop the scheduler
   */
  stop(): void {
    if (this.task) {
      this.task.stop();
      this.task = null;
    }
    this.isEnabled = false;
    console.log('[Scheduler] Sync Scheduler stopped');
  }

  /**
   * Format internal job status to API response format (with local datetime strings)
   */
  private formatJobStatus(job: SyncJobStatusInternal): SyncJobStatus {
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

  /**
   * Get scheduler status (with local datetime strings for API response)
   */
  getStatus(): SchedulerStatus {
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

  /**
   * Trigger manual sync for all jobs
   */
  async triggerManualSync(): Promise<void> {
    if (!this.isEnabled) {
      throw new Error('Scheduler is not running. Start the scheduler first.');
    }

    console.log('[Scheduler] Manual sync triggered');
    await this.runAllSyncs();
  }

  /**
   * Update sync interval
   */
  async updateInterval(minutes: number): Promise<void> {
    if (minutes < 1) {
      throw new Error('Interval must be at least 1 minute');
    }

    // Update sysconfig
    await this.pgPool.query(`
      UPDATE sysconfig
      SET mssql_sync = $1
      WHERE id = 1
    `, [minutes]);

    // Restart scheduler with new interval
    if (this.isEnabled) {
      this.stop();
      await this.start();
    }

    console.log(`[Scheduler] Interval updated to ${minutes} minutes`);
  }
}

// Export singleton getter
export const getSyncScheduler = (pgPool?: PgPool): SyncScheduler => {
  return SyncScheduler.getInstance(pgPool);
};

export default SyncScheduler;
