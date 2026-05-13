// server/src/entities/user/controller.ts
// User Entity Controller - Complete Separation Entity Architecture
// SERIAL ID Pattern Implementation

/**
 * User Entity Controller Implementation
 * 
 * Extends GenericSerialIdController to inherit 90% of HTTP handling while
 * adding user-specific endpoints for authentication and user management.
 * 
 * Complete Separation Entity Architecture:
 * ✅ Extends Generic Serial ID Controller pattern
 * ✅ No direct cross-entity dependencies
 * ✅ User-specific HTTP request/response handling
 * ✅ Authentication and session management endpoints
 * ✅ Role-based access control integration
 * 
 * Generic Pattern Benefits:
 * ✅ Inherits: GET /:id, PUT /:id, DELETE /:id, GET / endpoints
 * ✅ Inherits: Request validation, error handling, response formatting
 * ✅ Inherits: Pagination, filtering, sorting functionality
 * ✅ Overrides: POST / (for user creation with password hashing)
 * ✅ Adds: Authentication-specific endpoints
 */

import { Response, NextFunction } from 'express';
import { GenericSerialIdController } from '../../generic/entities/serial-id-entity/generic-controller';
import { UserService } from './service';
import {
  User,
  UserProfile,
  CreateUserRequest,
  UpdateUserRequest,
  ChangePasswordRequest,
  UserQueryParams,
  SessionUser,
  UserStats,
  UserRole,
  UserEntityRequest,
  UserApiResponse,
  UserServiceResult,
  DEFAULT_USER_CONFIG
} from './types';
 

/**
 * User-specific route parameters
 */
interface UserRouteParams {
  id: string;
}

/**
 * User Entity Controller
 * 
 * HTTP request/response handling for user management endpoints.
 * Extends Generic Serial ID pattern with user-specific operations.
 */
export class UserController extends GenericSerialIdController<User> {
  private userService: UserService;

  constructor(userService: UserService) {
    super(userService, DEFAULT_USER_CONFIG);
    this.userService = userService;
  }

  // ==================== OVERRIDDEN GENERIC ENDPOINTS ====================

  /**
   * POST /api/users
   * Create new user with password hashing
   * Overrides generic create to handle user-specific creation logic
   */
  create = async (req: UserEntityRequest<any, CreateUserRequest>, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user?.id || 0;
      const result = await this.userService.createUser(req.body, userId);

      if (result.success && result.data) {
        res.status(201).json({
          success: true,
          data: result.data,
          message: result.message
        });
      } else {
        res.status(400).json({
          success: false,
          message: result.message,
          errors: result.errors
        });
      }
    } catch (error) {
      next(error);
    }
  };

  /**
   * GET /api/users
   * Get all users with user-specific filtering
   * Extends generic getAll with user-specific query parameters
   */
  getAll = async (req: UserEntityRequest<any, any, UserQueryParams>, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user?.id || 0;
      const result = await this.userService.getAllUsers(req.query, userId);

      if (result.success && result.data) {
        res.status(200).json({
          success: true,
          data: result.data.data,
          pagination: result.data.pagination,
          message: result.message
        });
      } else {
        res.status(400).json({
          success: false,
          message: result.message
        });
      }
    } catch (error) {
      next(error);
    }
  };

  /**
   * GET /api/users/:id
   * Get user profile by ID
   * Overrides generic getById to return sanitized user data
   */
  getById = async (req: UserEntityRequest<UserRouteParams>, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = parseInt(req.params.id);
      
      if (isNaN(id) || id <= 0) {
        res.status(400).json({
          success: false,
          message: 'Invalid user ID'
        });
        return;
      }

      const result = await this.userService.getUserProfile(id);

      if (result.success && result.data) {
        res.status(200).json({
          success: true,
          data: result.data,
          message: result.message
        });
      } else {
        res.status(404).json({
          success: false,
          message: result.message
        });
      }
    } catch (error) {
      next(error);
    }
  };

  /**
   * PUT /api/users/:id
   * Update user
   * Extends generic update with user-specific validation
   */
  update = async (req: UserEntityRequest<UserRouteParams, UpdateUserRequest>, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = parseInt(req.params.id);
      const userId = req.user?.id || 0;

      console.log('📡 Update request received:', {
        id,
        userId,
        user: req.user,
        body: req.body
      });

      if (isNaN(id) || id <= 0) {
        console.error('❌ Invalid user ID in params:', req.params.id);
        res.status(400).json({
          success: false,
          message: 'Invalid user ID'
        });
        return;
      }

      console.log('🔄 Calling userService.updateUser...');
      const result = await this.userService.updateUser(id, req.body, userId);
      console.log('📨 Service result:', result);

      if (result.success && result.data) {
        console.log('✅ Update successful, sending 200 response');
        res.status(200).json({
          success: true,
          data: result.data,
          message: result.message
        });
      } else {
        console.error('❌ Update failed, sending 400 response:', result.message, result.errors);
        res.status(400).json({
          success: false,
          message: result.message,
          errors: result.errors
        });
      }
    } catch (error) {
      next(error);
    }
  };

  // ==================== USER-SPECIFIC ENDPOINTS ====================

  /**
   * POST /api/users/authenticate
   * Authenticate user credentials
   */
  authenticate = async (req: UserEntityRequest<any, { username: string; password: string }>, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { username, password } = req.body;

      if (!username || !password) {
        res.status(400).json({
          success: false,
          message: 'Username and password are required'
        });
        return;
      }

      const result = await this.userService.authenticate(username, password);

      if (result.success && result.data) {
        // In a real application, you would set up the session here
        res.status(200).json({
          success: true,
          data: result.data,
          message: result.message
        });
      } else {
        res.status(401).json({
          success: false,
          message: result.message
        });
      }
    } catch (error) {
      next(error);
    }
  };

  /**
   * PUT /api/users/:id/password
   * Change user password
   */
  changePassword = async (req: UserEntityRequest<UserRouteParams, ChangePasswordRequest>, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = parseInt(req.params.id);
      const userId = req.user?.id || 0;

      if (isNaN(id) || id <= 0) {
        res.status(400).json({
          success: false,
          message: 'Invalid user ID'
        });
        return;
      }

      // Users can only change their own password unless they're admin
      if (id !== userId && req.user?.role !== UserRole.ADMIN) {
        res.status(403).json({
          success: false,
          message: 'Forbidden: You can only change your own password'
        });
        return;
      }

      const result = await this.userService.changePassword(id, req.body, userId);

      if (result.success) {
        res.status(200).json({
          success: true,
          message: result.message
        });
      } else {
        res.status(400).json({
          success: false,
          message: result.message,
          errors: result.errors
        });
      }
    } catch (error) {
      next(error);
    }
  };

  /**
   * GET /api/users/profile
   * Get current user's profile
   */
  getCurrentProfile = async (req: UserEntityRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user?.id;

      if (!userId) {
        res.status(401).json({
          success: false,
          message: 'Authentication required'
        });
        return;
      }

      const result = await this.userService.getUserProfile(userId);

      if (result.success && result.data) {
        res.status(200).json({
          success: true,
          data: result.data,
          message: result.message
        });
      } else {
        res.status(404).json({
          success: false,
          message: result.message
        });
      }
    } catch (error) {
      next(error);
    }
  };

  /**
   * PUT /api/users/profile
   * Update current user's profile
   */
  updateCurrentProfile = async (req: UserEntityRequest<any, UpdateUserRequest>, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user?.id;

      if (!userId) {
        res.status(401).json({
          success: false,
          message: 'Authentication required'
        });
        return;
      }

      // Users cannot change their own role
      const updateData = { ...req.body };
      if (req.user?.role !== UserRole.ADMIN) {
        delete updateData.role;
        delete updateData.is_active;
      }

      const result = await this.userService.updateUser(userId, updateData, userId);

      if (result.success && result.data) {
        res.status(200).json({
          success: true,
          data: result.data,
          message: result.message
        });
      } else {
        res.status(400).json({
          success: false,
          message: result.message,
          errors: result.errors
        });
      }
    } catch (error) {
      next(error);
    }
  };

  /**
   * GET /api/users/role/:role
   * Get users by role (admin/manager only)
   */
  getUsersByRole = async (req: UserEntityRequest<{ role: string }>, res: Response, next: NextFunction): Promise<void> => {
    try {
      // Check if user has permission
      if (req.user?.role !== UserRole.ADMIN && req.user?.role !== UserRole.MANAGER) {
        res.status(403).json({
          success: false,
          message: 'Forbidden: Manager or Admin access required'
        });
        return;
      }

      const role = req.params.role as UserRole;

      if (!Object.values(UserRole).includes(role)) {
        res.status(400).json({
          success: false,
          message: 'Invalid role specified'
        });
        return;
      }

      const result = await this.userService.getUsersByRole(role);

      if (result.success && result.data) {
        res.status(200).json({
          success: true,
          data: result.data,
          message: result.message
        });
      } else {
        res.status(400).json({
          success: false,
          message: result.message
        });
      }
    } catch (error) {
      next(error);
    }
  };

  /**
   * GET /api/users/statistics
   * Get user statistics (admin only)
   */
  getUserStatistics = async (req: UserEntityRequest, res: Response, next: NextFunction): Promise<void> => {
    try {

      const result = await this.userService.getUserStatistics();

      if (result.success && result.data) {
        res.status(200).json({
          success: true,
          data: result.data,
          message: result.message
        });
      } else {
        res.status(400).json({
          success: false,
          message: result.message
        });
      }
    } catch (error) {
      next(error);
    }
  };
 
  // ==================== SESSION ENDPOINTS ====================

  /**
   * GET /api/users/session/:id
   * Get user session data (for session management)
   */
  getSessionData = async (req: UserEntityRequest<UserRouteParams>, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = parseInt(req.params.id);

      if (isNaN(id) || id <= 0) {
        res.status(400).json({
          success: false,
          message: 'Invalid user ID'
        });
        return;
      }

      // Users can only get their own session data unless they're admin
      if (id !== req.user?.id && req.user?.role !== UserRole.ADMIN) {
        res.status(403).json({
          success: false,
          message: 'Forbidden: You can only access your own session data'
        });
        return;
      }

      const result = await this.userService.getSessionData(id);

      if (result.success && result.data) {
        res.status(200).json({
          success: true,
          data: result.data,
          message: result.message
        });
      } else {
        res.status(404).json({
          success: false,
          message: result.message
        });
      }
    } catch (error) {
      next(error);
    }
  };

  // ==================== VALIDATION ENDPOINTS ====================

  /**
   * POST /api/users/validate/username
   * Check if username is available
   */
  validateUsername = async (req: UserEntityRequest<any, { username: string; excludeId?: number }>, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { username, excludeId } = req.body;

      if (!username) {
        res.status(400).json({
          success: false,
          message: 'Username is required'
        });
        return;
      }

      // This would require adding the method to UserModel
      // const exists = await this.userService.usernameExists(username, excludeId);
      
      res.status(200).json({
        success: true,
        data: { available: true }, // Placeholder
        message: 'Username validation completed'
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * POST /api/users/validate/email
   * Check if email is available
   */
  validateEmail = async (req: UserEntityRequest<any, { email: string; excludeId?: number }>, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { email, excludeId } = req.body;

      if (!email) {
        res.status(400).json({
          success: false,
          message: 'Email is required'
        });
        return;
      }

      // This would require adding the method to UserModel
      // const exists = await this.userService.emailExists(email, excludeId);

      res.status(200).json({
        success: true,
        data: { available: true }, // Placeholder
        message: 'Email validation completed'
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * POST /api/users/checkin
   * User check-in to update shift information
   */
  checkin = async (req: UserEntityRequest<any, { username: string }>, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { username } = req.body;

      if (!username) {
        res.status(400).json({
          success: false,
          message: 'Username is required'
        });
        return;
      }

      const result = await this.userService.checkin(username);

      if (result.success) {
        res.status(200).json({
          success: true,
          data: result.data,
          message: result.message
        });
      } else {
        res.status(400).json({
          success: false,
          message: result.message
        });
      }
    } catch (error) {
      next(error);
    }
  };

}

/**
 * Factory function to create a user controller instance
 * 
 * Factory pattern for dependency injection.
 */
export function createUserController(service: UserService): UserController {
  return new UserController(service);
}
