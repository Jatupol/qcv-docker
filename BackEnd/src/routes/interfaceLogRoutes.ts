// server/src/routes/interfaceLogRoutes.ts
// API routes for interface logging

import express from 'express';
import interfaceLogService from '../services/interfaceLogService';
import { requireAuthentication } from '../middleware/auth';

const router = express.Router();

/**
 * GET /api/interface-logs
 * Get recent log entries
 * Query params:
 *   - tablename: 'LIN' | 'CHK' (optional)
 *   - limit: number (optional, default 100)
 */
router.get('/', requireAuthentication, async (req, res): Promise<void> => {
  try {
    const tablename = req.query.tablename as 'LIN' | 'CHK' | undefined;
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 100;

    // Validate tablename if provided
    if (tablename && !['LIN', 'CHK'].includes(tablename)) {
      res.status(400).json({
        success: false,
        message: 'Invalid tablename. Must be LIN or CHK'
      });
      return;
    }

    const logs = await interfaceLogService.getRecentLogs(tablename, limit);

    res.json({
      success: true,
      data: logs,
      message: `Retrieved ${logs.length} log entries`
    });
  } catch (error) {
    console.error('Error getting interface logs:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve interface logs',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * GET /api/interface-logs/stats/:tablename
 * Get log statistics for a specific interface
 * Params:
 *   - tablename: 'LIN' | 'CHK'
 * Query params:
 *   - days: number (optional, default 7)
 */
router.get('/stats/:tablename', requireAuthentication, async (req, res): Promise<void> => {
  try {
    const tablename = req.params.tablename as 'LIN' | 'CHK';
    const days = req.query.days ? parseInt(req.query.days as string) : 7;

    // Validate tablename
    if (!['LIN', 'CHK'].includes(tablename)) {
      res.status(400).json({
        success: false,
        message: 'Invalid tablename. Must be LIN or CHK'
      });
      return;
    }

    const stats = await interfaceLogService.getLogStats(tablename, days);

    res.json({
      success: true,
      data: stats,
      message: `Retrieved statistics for ${tablename} (last ${days} days)`
    });
  } catch (error) {
    console.error('Error getting interface log stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve interface log statistics',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * POST /api/interface-logs/cleanup
 * Cleanup old log entries
 * Body:
 *   - tablename: 'LIN' | 'CHK' (optional, if not provided cleans all)
 *   - daysToKeep: number (optional, default 90)
 */
router.post('/cleanup', requireAuthentication, async (req, res): Promise<void> => {
  try {
    const { tablename, daysToKeep = 90 } = req.body;

    // Validate tablename if provided
    if (tablename && !['LIN', 'CHK'].includes(tablename)) {
      res.status(400).json({
        success: false,
        message: 'Invalid tablename. Must be LIN or CHK'
      });
      return;
    }

    const deletedCount = await interfaceLogService.cleanupOldLogs(
      tablename,
      daysToKeep
    );

    res.json({
      success: true,
      data: { deletedCount },
      message: `Cleaned up ${deletedCount} old log entries`
    });
  } catch (error) {
    console.error('Error cleaning up interface logs:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to cleanup interface logs',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;
