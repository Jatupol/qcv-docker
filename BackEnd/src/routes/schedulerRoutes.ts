// server/src/routes/schedulerRoutes.ts
// ===== SCHEDULER API ROUTES =====
// API endpoints for monitoring and controlling the sync scheduler

import { Router, Request, Response } from 'express';
import { getSyncScheduler } from '../services/syncScheduler';

const router = Router();

/**
 * GET /api/scheduler/status
 * Get current scheduler status and job information
 */
router.get('/status', (req: Request, res: Response) => {
  try {
    const scheduler = getSyncScheduler();
    const status = scheduler.getStatus();

    res.json({
      success: true,
      data: status,
      message: status.isEnabled ? 'Scheduler is running' : 'Scheduler is stopped'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : 'Failed to get scheduler status',
      error: 'SCHEDULER_ERROR'
    });
  }
});

/**
 * POST /api/scheduler/start
 * Start the sync scheduler
 */
router.post('/start', async (req: Request, res: Response) => {
  try {
    const scheduler = getSyncScheduler();
    await scheduler.start();

    res.json({
      success: true,
      message: 'Scheduler started successfully',
      data: scheduler.getStatus()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : 'Failed to start scheduler',
      error: 'SCHEDULER_START_ERROR'
    });
  }
});

/**
 * POST /api/scheduler/stop
 * Stop the sync scheduler
 */
router.post('/stop', (req: Request, res: Response) => {
  try {
    const scheduler = getSyncScheduler();
    scheduler.stop();

    res.json({
      success: true,
      message: 'Scheduler stopped successfully',
      data: scheduler.getStatus()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : 'Failed to stop scheduler',
      error: 'SCHEDULER_STOP_ERROR'
    });
  }
});

/**
 * POST /api/scheduler/trigger
 * Manually trigger a sync cycle
 */
router.post('/trigger', async (req: Request, res: Response): Promise<void> => {
  try {
    const scheduler = getSyncScheduler();

    if (!scheduler.getStatus().isEnabled) {
      res.status(400).json({
        success: false,
        message: 'Scheduler is not running. Start the scheduler first or use individual sync endpoints.',
        error: 'SCHEDULER_NOT_RUNNING'
      });
      return;
    }

    await scheduler.triggerManualSync();

    res.json({
      success: true,
      message: 'Manual sync triggered successfully',
      data: scheduler.getStatus()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : 'Failed to trigger sync',
      error: 'SYNC_TRIGGER_ERROR'
    });
  }
});

/**
 * PUT /api/scheduler/interval
 * Update the sync interval
 */
router.put('/interval', async (req: Request, res: Response): Promise<void> => {
  try {
    const { minutes } = req.body;

    if (!minutes || typeof minutes !== 'number' || minutes < 1) {
      res.status(400).json({
        success: false,
        message: 'Invalid interval. Must be a number >= 1 minute.',
        error: 'INVALID_INTERVAL'
      });
      return;
    }

    const scheduler = getSyncScheduler();
    await scheduler.updateInterval(minutes);

    res.json({
      success: true,
      message: `Sync interval updated to ${minutes} minutes`,
      data: scheduler.getStatus()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : 'Failed to update interval',
      error: 'INTERVAL_UPDATE_ERROR'
    });
  }
});

export default router;
