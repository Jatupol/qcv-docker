// server/src/middleware/auth.ts
/**
 * Authentication & Authorization Middleware
 * Manufacturing Quality Control System
 * 
 * Complete Separation Entity Architecture:
 * ✅ Session-based authentication with PostgreSQL storage
 * ✅ Role-based access control with proper hierarchy
 * ✅ Parameter validation for all entity patterns
 * ✅ Request tracking and performance monitoring
 * ✅ Express Router compatible middleware functions
 */

import { Request, Response, NextFunction } from 'express';
import { Pool } from 'pg';
import crypto from 'crypto';

// ==================== TYPES & INTERFACES ====================

// Import existing types from user entity to avoid conflicts
import { UserRole, SessionUser } from '../entities/user/types';

/**
 * Enhanced QC Request Interface - FIXED TYPE COMPATIBILITY
 * 
 * Use intersection type instead of extending Request to avoid conflicts
 * with existing Express Request.user property definition
 */
export interface CompatibleQCRequest extends Request {
  user?: SessionUser;  
  requestId?: string;
  startTime?: number;
}

/**
 * Standard API Response Interface
 */
export interface APIResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  code?: string;
  meta: {
    timestamp: string;
    [key: string]: any;
  };
}

// ==================== UTILITY FUNCTIONS ====================

/**
 * Generate unique request ID for tracking
 */
function generateRequestId(): string {
  return `req_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;
}

/**
 * Check if user has required role(s) with proper hierarchy
 */
function hasRequiredRole(userRole: UserRole, requiredRoles: UserRole | UserRole[]): boolean {
  const roles = Array.isArray(requiredRoles) ? requiredRoles : [requiredRoles];
  
  // Admin has all permissions
  if (userRole === UserRole.ADMIN) {
    return true;
  }
  
  // Manager has manager and user permissions
  if (userRole === UserRole.MANAGER && roles.includes(UserRole.USER)) {
    return true;
  }
  
  // Direct role match
  return roles.includes(userRole);
}

/**
 * Format success response
 */
function formatResponse<T>(success: boolean, data?: T, message?: string, code?: string): APIResponse<T> {
  return {
    success,
    ...(data && { data }),
    ...(message && { message }),
    ...(code && { code }),
    meta: {
      timestamp: new Date().toISOString()
    }
  };
}

/**
 * Format error response
 */
function formatError(message: string, code: string, status: number = 400): APIResponse {
  return {
    success: false,
    message,
    code,
    meta: {
      timestamp: new Date().toISOString()
    }
  };
}

// ==================== 1. REQUEST TRACKING & LOGGING ====================

/**
 * Request tracking middleware with Express compatibility
 * 
 * ✅ Uses standard Express Request type for compatibility
 * ✅ Type assertion for QCRequest properties
 * ✅ Maintains all existing functionality
 */
export function requestTracking(req: Request, res: Response, next: NextFunction): void {
  // Type-safe property assignment
  const qcReq = req as CompatibleQCRequest;
  
  // Generate tracking ID
  const requestId = generateRequestId();
  qcReq.requestId = requestId;
  qcReq.startTime = Date.now();
  
  // Set response headers
  res.setHeader('X-Request-ID', requestId);
  res.setHeader('X-API-Version', '1.0');

  // Log request start
  const userInfo = (req as any).user ? ` [${(req as any).user.username}]` : '';
  console.log(`📥 ${req.method.padEnd(6)} ${req.originalUrl}${userInfo} - ${requestId}`);

  // Log response when finished
  res.on('finish', () => {
    const duration = Date.now() - (qcReq.startTime || Date.now());
    const status = res.statusCode;
    const icon = status >= 400 ? '❌' : status >= 300 ? '↩️' : '✅';
    
    console.log(`📤 ${req.method.padEnd(6)} ${req.originalUrl} - ${status} - ${duration}ms ${icon}`);
    
    // Log slow requests
    if (duration > 2000) {
      console.warn(`⚠️  SLOW REQUEST: ${req.method} ${req.originalUrl} took ${duration}ms`);
    }
  });

  next();
}

// ==================== 2. SESSION AUTHENTICATION ====================

let dbPool: Pool;

/**
 * Initialize authentication with database pool
 */
export function initAuthentication(db: Pool): void {
  dbPool = db;
  console.log('✅ Authentication middleware initialized');
}

/**
 * Core authentication middleware with Express compatibility
 * 
 * ✅ Uses standard Express Request type for Express Router compatibility
 * ✅ Type assertion for SessionUser assignment
 * ✅ Maintains all security features
 */
export function requireAuthentication(req: Request, res: Response, next: NextFunction): void {
  try {
    // Type-safe request handling
    const qcReq = req as CompatibleQCRequest;
    
    // Check if session exists
    if (!req.session) {
      const errorResponse = formatError(
        'Authentication required. Please log in.',
        'NO_SESSION',
        401
      );
      res.status(401);
      res.json(errorResponse);
      return;
    }

    // Check if session has user data
    if (!req.session.user) {
      const errorResponse = formatError(
        'Invalid session. Please log in again.',
        'INVALID_SESSION',
        401
      );
      res.status(401);
      res.json(errorResponse);
      return;
    }

    // Validate session user structure
    const sessionUser = req.session.user;
    if (!sessionUser.id || !sessionUser.username || !sessionUser.role) {
      const errorResponse = formatError(
        'Corrupted session data. Please log in again.',
        'CORRUPTED_SESSION',
        401
      );
      res.status(401);
      res.json(errorResponse);
      return;
    }

 
   (req as any).user  = sessionUser as SessionUser;

    // Update last activity
    req.session.lastActivity = new Date();

    console.log(`🔐 User authenticated: ${sessionUser.username} (${sessionUser.role})`);
    next();

  } catch (error) {
    console.error('Authentication middleware error:', error);
    const errorResponse = formatError(
      'Authentication system error',
      'AUTH_SYSTEM_ERROR',
      500
    );
    res.status(500);
    res.json(errorResponse);
    return;
  }
}

/**
 * Optional authentication middleware
 * Attaches user if session exists, but doesn't require authentication
 */
export function optionalAuthentication(req: Request, res: Response, next: NextFunction): void {
  try {
    const qcReq = req as CompatibleQCRequest;
    
   
    if (req.session?.user) {
      const sessionUser = req.session.user;
      if (sessionUser.id && sessionUser.username && sessionUser.role) {
        (req as any).user = sessionUser as SessionUser;
        req.session.lastActivity = new Date();
      }
    }

    next();
  } catch (error) {
    console.error('Optional authentication error:', error);
    // Don't fail on optional auth errors
    next();
  }
}

// ==================== 3. ROLE-BASED AUTHORIZATION ====================

/**
 * Generic role requirement middleware factory
 */
export function requireRole(roles: UserRole | UserRole[]): (req: Request, res: Response, next: NextFunction) => void {
  const requiredRoles = Array.isArray(roles) ? roles : [roles];

  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      const qcReq = req as CompatibleQCRequest;
      
      if (!(req as any).user) {
        const errorResponse = formatError(
          'Authentication required for this operation.',
          'NO_USER',
          401
        );
        res.status(401);
        res.json(errorResponse);
        return;
      }

      if (!hasRequiredRole((req as any).user.role, requiredRoles)) {
        const errorResponse = {
          success: false,
          message: 'Insufficient permissions for this operation.',
          code: 'INSUFFICIENT_ROLE',
          meta: {
            timestamp: new Date().toISOString(),
            required: requiredRoles,
            current: (req as any).user.role
          }
        };
        res.status(403);
        res.json(errorResponse);
        return;
      }
 
      console.log(`✅ Role authorization passed: ${(req as any).user.username} (${(req as any).user.role}) for ${requiredRoles.join('|')}`);
      next();
      
    } catch (error) {
      console.error('Role authorization error:', error);
      const errorResponse = formatError(
        'Authorization system error',
        'AUTH_SYSTEM_ERROR',
        500
      );
      res.status(500);
      res.json(errorResponse);
      return;
    }
  };
}

// ==================== ROLE-SPECIFIC MIDDLEWARE ====================

/**
 * Express-compatible role middleware functions
 * 
 * ✅ All use standard Express Request type
 * ✅ Compatible with Express Router
 * ✅ Type-safe implementation
 */
export const requireUser = requireRole(UserRole.USER);
export const requireManager = requireRole([UserRole.MANAGER, UserRole.ADMIN]);
export const requireAdmin = requireRole(UserRole.ADMIN);

// ==================== 4. PARAMETER VALIDATION ====================

/**
 * Serial ID validation with Express compatibility
 */
export function validateSerialId(req: Request, res: Response, next: NextFunction): void {
  try {
    const id = parseInt(req.params.id);
    
    if (isNaN(id) || id <= 0) {
      const errorResponse = formatError(
        'Invalid ID parameter. Must be a positive integer.',
        'INVALID_ID',
        400
      );
      res.status(400);
      res.json(errorResponse);
      return;
    }

    // ID is valid, continue
    next();
  } catch (error) {
    console.error('Serial ID validation error:', error);
    const errorResponse = formatError(
      'Parameter validation error',
      'VALIDATION_ERROR',
      400
    );
    res.status(400);
    res.json(errorResponse);
    return;
  }
}

/**
 * VARCHAR code validation with Express compatibility
 */
export function validateVarcharCode(req: Request, res: Response, next: NextFunction): void {
  try {
    const code = req.params.code;
    
    // Check if code exists and is a string
    if (!code || typeof code !== 'string' || code.trim().length === 0) {
      const errorResponse = {
        success: false,
        message: 'Invalid code parameter. Must be a non-empty string.',
        code: 'INVALID_CODE',
        meta: {
          timestamp: new Date().toISOString(),
          providedValue: code
        }
      };
      res.status(400);
      res.json(errorResponse);
      return;
    }

    // Basic code format validation (alphanumeric + basic chars)
    if (!/^[A-Za-z0-9_-]+$/.test(code)) {
      const errorResponse = {
        success: false,
        message: 'Invalid code format. Use only letters, numbers, underscores, and hyphens.',
        code: 'INVALID_CODE_FORMAT',
        meta: {
          timestamp: new Date().toISOString(),
          providedValue: code
        }
      };
      res.status(400);
      res.json(errorResponse);
      return;
    }

    next();
  } catch (error) {
    console.error('Code validation error:', error);
    const errorResponse = formatError(
      'Parameter validation error',
      'VALIDATION_ERROR',
      400
    );
    res.status(400);
    res.json(errorResponse);
    return;
  }
}

// ==================== MIDDLEWARE HELPERS ====================

/**
 * Create middleware composition helper
 */
export function composeMiddleware(...middlewares: Array<(req: Request, res: Response, next: NextFunction) => void>) {
  return (req: Request, res: Response, next: NextFunction) => {
    let index = 0;
    
    function dispatch(): void {
      if (index >= middlewares.length) {
        next();
        return;
      }
      
      const middleware = middlewares[index++];
      middleware(req, res, dispatch);
    }
    
    dispatch();
  };
}

// ==================== EXPORT HELPER OBJECT ====================

/**
 * Auth middleware helper object with Express-compatible functions
 * 
 * ✅ All functions use standard Express Request type
 * ✅ Perfect compatibility with Express Router
 * ✅ Maintains all existing functionality
 */
export const authMiddleware = {
  // Authentication
  requireAuth: requireAuthentication,
  optionalAuth: optionalAuthentication,
  
  // Authorization (roles)
  requireUser,
  requireManager,
  requireAdmin,
  requireRole,
  
  // Parameter validation
  validateSerialId,
  validateVarcharCode,
  
  // Utilities
  requestTracking,
  formatResponse,
  formatError,
  composeMiddleware,
  
  // Initialization
  init: initAuthentication
};

// ==================== EXPORT INDIVIDUAL FUNCTIONS ====================

export {
  formatResponse,
  formatError,
  UserRole,
  SessionUser,
 // CompatibleQCRequest,
  //APIResponse
};
 