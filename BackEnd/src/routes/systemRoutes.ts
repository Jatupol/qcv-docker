// server/src/routes/systemRoutes.ts
// ===== SYSTEM MANAGEMENT API ROUTES =====
// Admin-only endpoints for server management (restart, status)

import { Router, Request, Response } from 'express';
import { requireAuthentication, requireAdmin } from '../middleware/auth';

const router = Router();

// Track server start time
const serverStartTime = new Date();

/**
 * GET /api/system/status
 * Get server status information (admin only)
 */
router.get('/status', requireAuthentication, requireAdmin, (req: Request, res: Response) => {
  const memoryUsage = process.memoryUsage();

  res.json({
    success: true,
    data: {
      uptime: process.uptime(),
      startTime: serverStartTime.toISOString(),
      nodeVersion: process.version,
      platform: process.platform,
      memory: {
        rss: Math.round(memoryUsage.rss / 1024 / 1024),
        heapUsed: Math.round(memoryUsage.heapUsed / 1024 / 1024),
        heapTotal: Math.round(memoryUsage.heapTotal / 1024 / 1024),
      },
      pid: process.pid,
      env: process.env.NODE_ENV || 'development',
    },
    message: 'Server is running'
  });
});

/**
 * POST /api/system/restart
 * Trigger a graceful server restart (admin only)
 * Docker's restart policy will automatically restart the container
 */
router.post('/restart', requireAuthentication, requireAdmin, (req: Request, res: Response) => {
  const user = (req.session as any)?.user;
  const username = user?.username || user?.email || 'unknown';

  console.log(`\n🔄 Server restart requested by: ${username}`);
  console.log(`   Time: ${new Date().toISOString()}`);
  console.log(`   IP: ${req.ip}`);

  // Send response before exiting
  res.json({
    success: true,
    message: 'Server restart initiated. The server will be back online shortly.',
    data: {
      requestedBy: username,
      requestedAt: new Date().toISOString(),
    }
  });

  // Exit after a short delay to ensure the response is sent
  setTimeout(() => {
    console.log('🔄 Exiting process for restart...');
    process.exit(0);
  }, 500);
});

export default router;
