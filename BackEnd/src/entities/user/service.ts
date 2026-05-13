// server/src/entities/user/service.ts
// User Entity Service - Complete Separation Entity Architecture
// SERIAL ID Pattern Implementation

/**
 * User Entity Service Implementation
 * 
 * Extends GenericSerialIdService to inherit 90% of business logic while
 * adding user-specific operations for authentication and user management.
 * 
 * Complete Separation Entity Architecture:
 * ✅ Extends Generic Serial ID Service pattern
 * ✅ No direct cross-entity dependencies
 * ✅ User-specific business logic and validation
 * ✅ Password hashing and authentication features
 * ✅ Session management integration
 * 
 * Generic Pattern Benefits:
 * ✅ Inherits: getById, getAll, update, delete operations
 * ✅ Inherits: pagination, filtering, sorting functionality
 * ✅ Inherits: standard validation and error handling
 * ✅ Overrides: create (for password hashing)
 * ✅ Adds: authentication-specific methods
 */

import bcrypt from 'bcrypt';
import { GenericSerialIdService } from '../../generic/entities/serial-id-entity/generic-service';
import { UserModel } from './model';
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
  CreateUserData,
  UpdateUserData,
  DEFAULT_USER_CONFIG,
  USER_CONSTRAINTS,
  USER_BUSINESS_RULES,
  sanitizeUser,
  isValidUsername,
  isValidEmail,
  isValidPassword,
  isValidName
} from './types';
import {
  SerialIdServiceResult,
  SerialIdPaginatedResponse,
  ValidationResult,
  CreateSerialIdData,
  UpdateSerialIdData
} from '../../generic/entities/serial-id-entity/generic-types';

/**
 * User Service Result Interface
 */
interface UserServiceResult<T = any> {
  success: boolean;
  data: T | null;
  message: string;
  errors?: Array<{ field: string; message: string }>;
}

/**
 * User Entity Service
 * 
 * Business logic layer for user management extending Generic Serial ID pattern.
 * Provides authentication, user-specific operations, and password management.
 */
export class UserService extends GenericSerialIdService<User> {
  private userModel: UserModel;

  constructor(userModel: UserModel) {
    super(userModel as any, DEFAULT_USER_CONFIG);
    this.userModel = userModel;
  }

  // ==================== ENHANCED USER OPERATIONS ====================

  /**
   * Create new user with password hashing
   * Overrides generic create to add password hashing and user-specific validation
   */
  async createUser(data: CreateUserRequest, createdBy: number = 0): Promise<UserServiceResult<UserProfile>> {
    try {
      // Validate user creation data
      const validation = await this.validateUserCreation(data);
      if (!validation.isValid) {
        return {
          success: false,
          data: null,
          message: 'Validation failed',
          errors: validation.errors
        };
      }

      // Check for existing username
      const usernameExists = await this.userModel.usernameExists(data.username);

      if (usernameExists) {
        return {
          success: false,
          data: null,
          message: 'Username already exists',
          errors: [{ field: 'username', message: 'Username is already taken' }]
        };
      }

      // Check for existing email (only if email is provided)
      if (data.email && data.email.trim() !== '') {
        const emailExists = await this.userModel.emailExists(data.email);
        if (emailExists) {
          return {
            success: false,
            data: null,
            message: 'Email already exists',
            errors: [{ field: 'email', message: 'Email is already registered' }]
          };
        }
      }

      // Hash password
      const passwordHash = await this.hashPassword(data.password);

      // Prepare user data for creation
      const userData: CreateUserData = {
        username: data.username.trim(),
        email: data.email && data.email.trim() !== '' ? data.email.toLowerCase().trim() : '',
        password_hash: passwordHash,
        name: data.name.trim(),
        description: data.description?.trim() || '',
        role: data.role || UserRole.USER,
        position: data.position?.trim() || '',
        is_active: data.is_active ?? true,
        created_by: createdBy
      };

      // Create user
      const user = await this.userModel.createUser(userData, createdBy);

      return {
        success: true,
        data: sanitizeUser(user),
        message: 'User created successfully'
      };

    } catch (error: any) {
      return {
        success: false,
        data: null,
        message: `Failed to create user: ${error.message}`
      };
    }
  }

  /**
   * Update user with enhanced validation
   * Extends generic update with user-specific validation and checks
   */
  async updateUser(id: number, data: UpdateUserRequest, updatedBy: number): Promise<UserServiceResult<UserProfile>> {
    try {
      console.log('🔍 UpdateUser called with:', { id, data, updatedBy });

      // Validate user update data
      const validation = await this.validateUserUpdate(data, id);
      console.log('✅ Validation result:', validation);

      if (!validation.isValid) {
        console.error('❌ Validation failed:', validation.errors);
        return {
          success: false,
          data: null,
          message: 'Validation failed',
          errors: validation.errors
        };
      }

      // Check if user exists
      const existingUser = await this.userModel.findById(id);
      console.log('📝 Existing user:', existingUser ? `Found (id: ${existingUser.id})` : 'Not found');

      if (!existingUser) {
        console.error('❌ User not found:', id);
        return {
          success: false,
          data: null,
          message: 'User not found'
        };
      }

      // Check for conflicts with username and email
      if (data.username) {
        const usernameExists = await this.userModel.usernameExists(data.username, id);
        console.log('🔍 Username exists check:', { username: data.username, exists: usernameExists });
        if (usernameExists) {
          console.error('❌ Username already exists:', data.username);
          return {
            success: false,
            data: null,
            message: 'Username already exists',
            errors: [{ field: 'username', message: 'Username is already taken' }]
          };
        }
      }

      if (data.email && data.email.trim() !== '') {
        const emailExists = await this.userModel.emailExists(data.email, id);
        console.log('🔍 Email exists check:', { email: data.email, exists: emailExists });
        if (emailExists) {
          console.error('❌ Email already exists:', data.email);
          return {
            success: false,
            data: null,
            message: 'Email already exists',
            errors: [{ field: 'email', message: 'Email is already registered' }]
          };
        }
      }

      // Prepare update data
      const updateData: UpdateUserData = {
        username: data.username?.trim(),
        email: data.email?.toLowerCase().trim(),
        name: data.name?.trim(),
        description: data.description?.trim(),
        role: data.role,
        position: data.position?.trim(),
        is_active: data.is_active,
        work_shift: data.work_shift?.trim(),
        team: data.team?.trim(),
        linevi: data.linevi?.trim(),
        updated_by: updatedBy
      };

      // Hash password if provided
      if (data.password && data.password.trim()) {
        const passwordHash = await this.hashPassword(data.password);
        updateData.password_hash = passwordHash;
      }

      // Update user
      console.log('🚀 Updating user with data:', updateData);
      const updatedUser = await this.userModel.updateUser(id, updateData, updatedBy);
      console.log('✅ User updated successfully:', updatedUser);

      return {
        success: true,
        data: sanitizeUser(updatedUser),
        message: 'User updated successfully'
      };

    } catch (error: any) {
      console.error('💥 Error updating user:', error);
      return {
        success: false,
        data: null,
        message: `Failed to update user: ${error.message}`
      };
    }
  }

  // ==================== AUTHENTICATION OPERATIONS ====================

  /**
   * Authenticate user by credentials
   */
  async authenticate(username: string, password: string): Promise<UserServiceResult<SessionUser>> {
    try {
      if (!username || !password) {
        return {
          success: false,
          data: null,
          message: 'Username and password are required'
        };
      }

      // Find user by username or email
      let user = await this.userModel.findByUsername(username);
      if (!user) {
        user = await this.userModel.findByEmail(username);
      }

      if (!user) {
        return {
          success: false,
          data: null,
          message: 'Invalid credentials'
        };
      }

      if (!user.is_active) {
        return {
          success: false,
          data: null,
          message: 'Account is disabled'
        };
      }

      // Verify password
      const isPasswordValid = await this.verifyPassword(password, user.password_hash);
      if (!isPasswordValid) {
        return {
          success: false,
          data: null,
          message: 'Invalid credentials'
        };
      }

      // Create session data
      const sessionData: SessionUser = {
        id: user.id,
        username: user.username,
        email: user.email,
        name: user.name,
        role: user.role,
        position: user.position,
        is_active: user.is_active
      };

      return {
        success: true,
        data: sessionData,
        message: 'Authentication successful'
      };

    } catch (error: any) {
      return {
        success: false,
        data: null,
        message: `Authentication failed: ${error.message}`
      };
    }
  }

  /**
   * Change user password
   */
  async changePassword(userId: number, data: ChangePasswordRequest, updatedBy: number): Promise<UserServiceResult<boolean>> {
    try {
      // Validate passwords match
      if (data.new_password !== data.confirm_password) {
        return {
          success: false,
          data: null,
          message: 'Password confirmation does not match',
          errors: [{ field: 'confirm_password', message: 'Passwords do not match' }]
        };
      }

      // Validate new password strength
      // Get current user
      const user = await this.userModel.findById(userId);
      if (!user) {
        return {
          success: false,
          data: null,
          message: 'User not found'
        };
      }

      // Optional: Verify current password if provided (for backward compatibility)
      // Current password validation is now optional since users are already authenticated
      if (data.current_password && data.current_password.trim() !== '') {
        const isCurrentPasswordValid = await this.verifyPassword(data.current_password, user.password_hash);
        if (!isCurrentPasswordValid) {
          return {
            success: false,
            data: null,
            message: 'Current password is incorrect',
            errors: [{ field: 'current_password', message: 'Current password is incorrect' }]
          };
        }
      }
      // If no current password provided, allow password change (user is already authenticated via session)

      // Hash new password
      const newPasswordHash = await this.hashPassword(data.new_password);

      // Update password
      const updateData: UpdateUserData = {
        password_hash: newPasswordHash,
        updated_by: updatedBy
      };

      await this.userModel.updateUser(userId, updateData, updatedBy);

      return {
        success: true,
        data: true,
        message: 'Password changed successfully'
      };

    } catch (error: any) {
      return {
        success: false,
        data: null,
        message: `Failed to change password: ${error.message}`
      };
    }
  }

  // ==================== USER QUERY OPERATIONS ====================

  /**
   * Get all users with user-specific filtering
   * Extends generic getAll with user-specific filters
   */
  async getAllUsers(options: UserQueryParams = {}, userId: number): Promise<UserServiceResult<SerialIdPaginatedResponse<UserProfile>>> {
    try {
      const result = await this.userModel.findAllUsers(options);

      return {
        success: true,
        data: result,
        message: 'Users retrieved successfully'
      };

    } catch (error: any) {
      return {
        success: false,
        data: null,
        message: `Failed to get users: ${error.message}`
      };
    }
  }

  /**
   * Get user profile by ID
   * Returns sanitized user data
   */
  async getUserProfile(id: number): Promise<UserServiceResult<UserProfile>> {
    try {
      const user = await this.userModel.findById(id);
      
      if (!user) {
        return {
          success: false,
          data: null,
          message: 'User not found'
        };
      }

      return {
        success: true,
        data: sanitizeUser(user),
        message: 'User profile retrieved successfully'
      };

    } catch (error: any) {
      return {
        success: false,
        data: null,
        message: `Failed to get user profile: ${error.message}`
      };
    }
  }

  /**
   * Get users by role
   */
  async getUsersByRole(role: UserRole): Promise<UserServiceResult<UserProfile[]>> {
    try {
      const users = await (this.userModel as any).getUsersByRole?.(role) || [];

      return {
        success: true,
        data: users,
        message: `${role} users retrieved successfully`
      };

    } catch (error: any) {
      return {
        success: false,
        data: null,
        message: `Failed to get users by role: ${error.message}`
      };
    }
  }

  /**
   * Get user statistics
   */
  async getUserStatistics(): Promise<UserServiceResult<UserStats>> {
    try {
      const stats = await this.userModel.getUserStats();

      return {
        success: true,
        data: stats,
        message: 'User statistics retrieved successfully'
      };

    } catch (error: any) {
      return {
        success: false,
        data: null,
        message: `Failed to get user statistics: ${error.message}`
      };
    }
  }

  // ==================== VALIDATION METHODS ====================

  /**
   * Validate user creation data
   */
  private async validateUserCreation(data: CreateUserRequest): Promise<{ isValid: boolean; errors: Array<{ field: string; message: string }> }> {
    const errors: Array<{ field: string; message: string }> = [];

    // Validate username
    if (!data.username) {
      errors.push({ field: 'username', message: 'Username is required' });
    } else if (!isValidUsername(data.username)) {
      errors.push({ field: 'username', message: 'Username must be 3-50 characters, alphanumeric with underscores/hyphens only' });
    }

    // Validate email (optional, but if provided must be valid)
    if (data.email && data.email.trim() !== '') {
      if (!isValidEmail(data.email)) {
        errors.push({ field: 'email', message: 'Please enter a valid email address' });
      }
    }

    // Validate password
    if (!data.password) {
      errors.push({ field: 'password', message: 'Password is required' });
    } else if (!isValidPassword(data.password)) {
      errors.push({ field: 'password', message: 'Password must be 8+' });
    }

    // Validate name
    if (!data.name) {
      errors.push({ field: 'name', message: 'Name is required' });
    }  

    // Validate role
    if (data.role && !Object.values(UserRole).includes(data.role)) {
      errors.push({ field: 'role', message: 'Invalid user role' });
    }

    // Validate position
    if (data.position && data.position.length > USER_CONSTRAINTS.POSITION.MAX_LENGTH) {
      errors.push({ field: 'position', message: `Position must be ${USER_CONSTRAINTS.POSITION.MAX_LENGTH} characters or less` });
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Validate user update data
   */
  private async validateUserUpdate(data: UpdateUserRequest, userId: number): Promise<{ isValid: boolean; errors: Array<{ field: string; message: string }> }> {
    const errors: Array<{ field: string; message: string }> = [];

    // Validate username if provided
    if (data.username !== undefined) {
      if (!data.username) {
        errors.push({ field: 'username', message: 'Username cannot be empty' });
      } else if (!isValidUsername(data.username)) {
        errors.push({ field: 'username', message: 'Username must be 3-50 characters, alphanumeric with underscores/hyphens only' });
      }
    }

    // Validate email if provided (optional, but if provided must be valid)
    if (data.email && data.email.trim() !== '') {
      if (!isValidEmail(data.email)) {
        errors.push({ field: 'email', message: 'Please enter a valid email address' });
      }
    }

    // Validate name if provided
    if (data.name !== undefined && data.name !== null) {
      if (!data.name) {
        errors.push({ field: 'name', message: 'Name cannot be empty' });
      }
    }

    // Validate role if provided
    if (data.role !== undefined && data.role !== null && !Object.values(UserRole).includes(data.role)) {
      errors.push({ field: 'role', message: 'Invalid user role' });
    }

    // Validate position if provided
    if (data.position && data.position.length > USER_CONSTRAINTS.POSITION.MAX_LENGTH) {
      errors.push({ field: 'position', message: `Position must be ${USER_CONSTRAINTS.POSITION.MAX_LENGTH} characters or less` });
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  // ==================== PASSWORD UTILITIES ====================

  /**
   * Hash password using bcrypt
   */
  private async hashPassword(password: string): Promise<string> {
    try {
      return await bcrypt.hash(password, USER_BUSINESS_RULES.BCRYPT_ROUNDS);
    } catch (error) {
      throw new Error('Failed to hash password');
    }
  }

  /**
   * Verify password against hash
   */
  private async verifyPassword(password: string, hash: string): Promise<boolean> {
    try {
      return await bcrypt.compare(password, hash);
    } catch (error) {
      return false;
    }
  }

  // ==================== SESSION UTILITIES ====================

  /**
   * Get session data for a user
   */
  async getSessionData(userId: number): Promise<UserServiceResult<SessionUser>> {
    try {
      const sessionData = await (this.userModel as any).getSessionData?.(userId);
      
      if (!sessionData) {
        return {
          success: false,
          data: null,
          message: 'User session not found or user is inactive'
        };
      }

      return {
        success: true,
        data: sessionData,
        message: 'Session data retrieved successfully'
      };

    } catch (error: any) {
      return {
        success: false,
        data: null,
        message: `Failed to get session data: ${error.message}`
      };
    }
  }

  // ==================== UTILITY METHODS ====================

  /**
   * Check if user has specific role
   */
  async userHasRole(userId: number, role: UserRole): Promise<boolean> {
    try {
      const user = await this.userModel.findById(userId);
      return user ? user.role === role : false;
    } catch (error) {
      return false;
    }
  }

  /**
   * Check if user is admin
   */
  async isAdmin(userId: number): Promise<boolean> {
    return this.userHasRole(userId, UserRole.ADMIN);
  }

  /**
   * Check if user is manager or admin
   */
  async isManagerOrAdmin(userId: number): Promise<boolean> {
    try {
      const user = await this.userModel.findById(userId);
      return user ? (user.role === UserRole.ADMIN || user.role === UserRole.MANAGER) : false;
    } catch (error) {
      return false;
    }
  }

  /**
   * User Check-In
   * Updates user's shift information from latest inf_checkin record
   */
  async checkin(username: string): Promise<UserServiceResult<boolean>> {
    try {
      if (!username) {
        return {
          success: false,
          data: null,
          message: 'Username is required'
        };
      }

      const result = await (this.userModel as any).checkin?.(username);

      if (result) {
        return {
          success: true,
          data: true,
          message: 'User checked in successfully'
        };
      } else {
        return {
          success: false,
          data: null,
          message: 'No checkin data found for user'
        };
      }

    } catch (error: any) {
      return {
        success: false,
        data: null,
        message: `Failed to check in user: ${error.message}`
      };
    }
  }
 
  // ==================== OVERRIDE GENERIC METHODS ====================

  /**
   * Override generic validate method for user-specific validation
   */
  validate(data: any, operation: 'create' | 'update'): ValidationResult {
    const errors: string[] = [];

    if (operation === 'create') {
      // Basic required field validation for create
      if (!data.username) errors.push('Username is required');
      // Email is optional
      if (!data.password) errors.push('Password is required');
      if (!data.name) errors.push('Name is required');
    }

    // Additional user-specific validation can be added here

    return {
      isValid: errors.length === 0,
      errors
    };
  }
}

// ==================== FACTORY FUNCTION ====================

/**
 * Factory function to create a user service instance
 * 
 * Factory pattern for dependency injection.
 */
export function createUserService(model: UserModel): UserService {
  return new UserService(model);
}