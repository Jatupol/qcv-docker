// server/src/entities/auth/routes.ts
/**
 * FIXED: Authentication Routes - Compatible with Updated Middleware
 * Manufacturing Quality Control System
 * 
 */

import { Router, Request, Response } from 'express';
import { Pool } from 'pg';

// Import the fixed auth components
import { AuthController } from './controller';
import { AuthService } from './service';
import { AuthModel } from './model';
import { authMiddleware } from '../../middleware/auth';

/**
 * Create Authentication Routes with Fixed Controller
 */
export default function createAuthRoutes(db: Pool): Router {
  const router = Router();

  try {
    console.log('🔧 Creating auth routes with fixed controller...');

    // Create auth components with dependency injection
    const authModel = new AuthModel(db);
    const authService = new AuthService(authModel);
    const authController = new AuthController(authService);

    console.log('✅ Auth components created successfully');

    // ==================== AUTHENTICATION ROUTES ====================

    /**
     * POST /api/auth/login
     * User authentication endpoint
     * No middleware required (public endpoint)
     */
    router.post('/login', 
      authMiddleware.requestTracking,  // Request logging
      async (req: Request, res: Response) => {
        try {
          await authController.login(req, res);
        } catch (error) {
          console.error('Login route error:', error);
          res.status(500).json(authMiddleware.formatError(
            'Login failed due to server error',
            'LOGIN_ROUTE_ERROR',
            500
          ));
        }
      }
    );

    /**
     * GET /api/auth/status
     * Check authentication status
     * Uses optionalAuth to allow both authenticated and unauthenticated access
     */
    router.get('/status',
      authMiddleware.requestTracking,   
      authMiddleware.optionalAuth,      
      async (req: Request, res: Response) => {
        try {
          await authController.status(req, res);
        } catch (error) {
          console.error('Status route error:', error);
          res.status(500).json(authMiddleware.formatError(
            'Status check failed',
            'STATUS_ROUTE_ERROR',
            500
          ));
        }
      }
    );

    /**
     * POST /api/auth/logout
     * User logout endpoint
     * Requires authentication
     */
    router.post('/logout',
      authMiddleware.requestTracking,  // Request logging
      authMiddleware.requireAuth,      // Require authentication
      async (req: Request, res: Response) => {
        try {
          await authController.logout(req, res);
        } catch (error) {
          console.error('Logout route error:', error);
          res.status(500).json(authMiddleware.formatError(
            'Logout failed',
            'LOGOUT_ROUTE_ERROR',
            500
          ));
        }
      }
    );

    /**
     * GET /api/auth/profile
     * Get current user profile
     * Requires authentication
     */
    router.get('/profile',
      authMiddleware.requestTracking,  // Request logging
      authMiddleware.requireAuth,      // Require authentication
      async (req: Request, res: Response) => {
        try {
          await authController.profile(req, res);
        } catch (error) {
          console.error('Profile route error:', error);
          res.status(500).json(authMiddleware.formatError(
            'Profile retrieval failed',
            'PROFILE_ROUTE_ERROR',
            500
          ));
        }
      }
    );

    /**
     * PUT /api/auth/password
     * Change user password
     * Requires authentication
     */
    router.put('/password',
      authMiddleware.requestTracking,  // Request logging
      authMiddleware.requireAuth,      // Require authentication
      async (req: Request, res: Response) => {
        try {
          await authController.changePassword(req, res);
        } catch (error) {
          console.error('Password change route error:', error);
          res.status(500).json(authMiddleware.formatError(
            'Password change failed',
            'PASSWORD_ROUTE_ERROR',
            500
          ));
        }
      }
    );

    /**
     * GET /api/auth/health
     * Health check endpoint
     * Optional authentication (shows more info if authenticated)
     */
    router.get('/health',
      authMiddleware.requestTracking,  // Request logging
      authMiddleware.optionalAuth,     // Optional authentication
      async (req: Request, res: Response) => {
        try {
          await authController.health(req, res);
        } catch (error) {
          console.error('Health route error:', error);
          res.status(500).json(authMiddleware.formatError(
            'Health check failed',
            'HEALTH_ROUTE_ERROR',
            500
          ));
        }
      }
    );

    // ==================== ROUTE LOGGING ====================

    console.log('✅ Auth routes registered successfully:');
    console.log('   POST /api/auth/login    - User authentication');
    console.log('   GET  /api/auth/status   - Authentication status (FIXED)');
    console.log('   POST /api/auth/logout   - User logout');
    console.log('   GET  /api/auth/profile  - User profile');
    console.log('   PUT  /api/auth/password - Change password');
    console.log('   GET  /api/auth/health   - Health check');

    return router;

  } catch (error) {
    console.error('❌ Error creating auth routes:', error);

    // Return a fallback router with error endpoints
    const fallbackRouter = Router();
    
    fallbackRouter.use('*', (req: Request, res: Response) => {
      console.error(`🔍 Fallback auth route hit: ${req.method} ${req.originalUrl}`);
      
      res.status(500).json({
        success: false,
        message: 'Authentication service unavailable',
        error: 'AUTH_SERVICE_ERROR',
        details: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      });
    });

    return fallbackRouter;
  }
}
 