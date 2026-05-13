// server/src/middleware/requestLogger.ts
// Middleware to log all API requests to /app/logs

import { Request, Response, NextFunction } from 'express';
import logger from '../utils/logger';

/**
 * Request logging middleware
 * Logs all API requests with timing, status, and user information
 */
export function requestLogger(req: Request, res: Response, next: NextFunction): void {
  const startTime = Date.now();

  // Store original end function
  const originalEnd = res.end;
  const originalJson = res.json;

  // Get request information
  const method = req.method;
  const path = req.originalUrl || req.url;
  const ip = req.ip || req.socket.remoteAddress || 'unknown';
  const userAgent = req.get('user-agent') || 'unknown';

  // Get username from session or JWT token
  let username: string | undefined;
  try {
    // Try to get username from session
    if (req.session && (req.session as any).userId) {
      username = (req.session as any).username || `user_${(req.session as any).userId}`;
    }
    // Try to get username from request user object (if set by auth middleware)
    else if ((req as any).user) {
      username = (req as any).user.username || (req as any).user.email || 'authenticated';
    }
  } catch (error) {
    // Ignore errors getting username
  }

  // Override res.end to capture when response is sent
  res.end = function(chunk?: any, encoding?: any, callback?: any): Response {
    res.end = originalEnd;
    res.json = originalJson;

    const duration = Date.now() - startTime;
    const statusCode = res.statusCode;

    // Log the API call
    logger.http(method, path, statusCode);
    if (logger.isEnabled()) {
      logger.log(`  Duration: ${duration}ms | User: ${username || 'anonymous'} | IP: ${ip}`);
    }

    // Call original end function
    return originalEnd.call(this, chunk, encoding, callback);
  };

  // Override res.json to capture when JSON response is sent
  res.json = function(body?: any): Response {
    res.end = originalEnd;
    res.json = originalJson;

    const duration = Date.now() - startTime;
    const statusCode = res.statusCode;

    // Log the API call
    logger.http(method, path, statusCode);
    if (logger.isEnabled()) {
      logger.log(`  Duration: ${duration}ms | User: ${username || 'anonymous'} | IP: ${ip}`);
    }

    // Call original json function
    return originalJson.call(this, body);
  };

  next();
}

export default requestLogger;
