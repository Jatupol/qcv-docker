// server/src/routes/version.ts
/**
 * Version and Health Check Routes
 * Helps verify which version of code is running in production
 */

import { Router, Request, Response } from 'express';
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

const router = Router();

/**
 * Get git commit information
 */
function getGitInfo(): { commit: string; shortCommit: string; date: string; message: string; branch: string } | null {
  try {
    const commit = execSync('git rev-parse HEAD').toString().trim();
    const shortCommit = execSync('git rev-parse --short HEAD').toString().trim();
    const date = execSync('git log -1 --format=%ai').toString().trim();
    const message = execSync('git log -1 --format=%s').toString().trim();
    const branch = execSync('git rev-parse --abbrev-ref HEAD').toString().trim();

    return { commit, shortCommit, date, message, branch };
  } catch (error) {
    return null;
  }
}

/**
 * Get build timestamp from package.json or dist folder
 */
function getBuildTimestamp(): string | null {
  try {
    // Check if dist folder exists
    const distPath = path.join(__dirname, '..', '..');
    if (fs.existsSync(distPath)) {
      const stats = fs.statSync(distPath);
      return stats.mtime.toISOString();
    }
    return null;
  } catch (error) {
    return null;
  }
}

/**
 * Check if SMTP validation requires authentication
 * This helps verify which version of the code is running
 */
function checkSmtpValidationVersion(): string {
  try {
    // Read the compiled service file
    const servicePath = path.join(__dirname, '..', 'entities', 'sysconfig', 'service.js');

    if (fs.existsSync(servicePath)) {
      const content = fs.readFileSync(servicePath, 'utf-8');

      // Check for old validation (requires all 3 fields)
      if (content.includes('!activeConfig.smtp_server || !activeConfig.smtp_username || !activeConfig.smtp_password')) {
        return 'OLD - Requires server, username, and password';
      }

      // Check for new validation (only requires server)
      if (content.includes('if (!activeConfig.smtp_server)') && !content.includes('!activeConfig.smtp_username')) {
        return 'NEW - Only requires server (authentication optional)';
      }

      return 'UNKNOWN - Cannot determine validation logic';
    }

    return 'FILE_NOT_FOUND - service.js not found';
  } catch (error) {
    return `ERROR - ${error instanceof Error ? error.message : 'Unknown error'}`;
  }
}

/**
 * GET /api/version
 * Get server version information
 * No authentication required - useful for monitoring
 */
router.get('/', (req: Request, res: Response) => {
  const gitInfo = getGitInfo();
  const buildTimestamp = getBuildTimestamp();
  const smtpValidation = checkSmtpValidationVersion();

  const versionInfo = {
    success: true,
    environment: process.env.NODE_ENV || 'development',
    server: {
      version: '1.0.0',
      nodeVersion: process.version,
      platform: process.platform,
      uptime: process.uptime(),
      memoryUsage: process.memoryUsage()
    },
    build: {
      timestamp: buildTimestamp,
      buildDate: buildTimestamp ? new Date(buildTimestamp).toLocaleString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: false }) : 'Unknown'
    },
    git: gitInfo ? {
      commit: gitInfo.commit,
      shortCommit: gitInfo.shortCommit,
      branch: gitInfo.branch,
      message: gitInfo.message,
      date: gitInfo.date
    } : {
      error: 'Git information not available (not a git repository or git not installed)'
    },
    features: {
      smtpValidation: smtpValidation
    },
    timestamp: new Date().toISOString()
  };

  res.json(versionInfo);
});

/**
 * GET /api/version/health
 * Quick health check
 */
router.get('/health', (req: Request, res: Response) => {
  res.json({
    success: true,
    status: 'healthy',
    uptime: process.uptime(),
    timestamp: new Date().toISOString()
  });
});

/**
 * GET /api/version/smtp-check
 * Check SMTP validation version specifically
 */
router.get('/smtp-check', (req: Request, res: Response) => {
  const smtpValidation = checkSmtpValidationVersion();
  const gitInfo = getGitInfo();

  res.json({
    success: true,
    smtpValidationVersion: smtpValidation,
    isNewVersion: smtpValidation.includes('NEW'),
    isOldVersion: smtpValidation.includes('OLD'),
    currentCommit: gitInfo?.shortCommit || 'Unknown',
    expectedCommit: '1492f49f',
    message: smtpValidation.includes('NEW')
      ? '✅ Server is running the NEW code (authentication optional)'
      : smtpValidation.includes('OLD')
      ? '❌ Server is running the OLD code (requires username/password)'
      : '⚠️ Cannot determine SMTP validation version',
    timestamp: new Date().toISOString()
  });
});

export default router;
