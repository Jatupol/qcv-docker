"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserService = void 0;
exports.createUserService = createUserService;
const bcrypt_1 = __importDefault(require("bcrypt"));
const generic_service_1 = require("../../generic/entities/serial-id-entity/generic-service");
const types_1 = require("./types");
class UserService extends generic_service_1.GenericSerialIdService {
    constructor(userModel) {
        super(userModel, types_1.DEFAULT_USER_CONFIG);
        this.userModel = userModel;
    }
    async createUser(data, createdBy = 0) {
        try {
            const validation = await this.validateUserCreation(data);
            if (!validation.isValid) {
                return {
                    success: false,
                    data: null,
                    message: 'Validation failed',
                    errors: validation.errors
                };
            }
            const usernameExists = await this.userModel.usernameExists(data.username);
            if (usernameExists) {
                return {
                    success: false,
                    data: null,
                    message: 'Username already exists',
                    errors: [{ field: 'username', message: 'Username is already taken' }]
                };
            }
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
            const passwordHash = await this.hashPassword(data.password);
            const userData = {
                username: data.username.trim(),
                email: data.email && data.email.trim() !== '' ? data.email.toLowerCase().trim() : '',
                password_hash: passwordHash,
                name: data.name.trim(),
                description: data.description?.trim() || '',
                role: data.role || types_1.UserRole.USER,
                position: data.position?.trim() || '',
                is_active: data.is_active ?? true,
                created_by: createdBy
            };
            const user = await this.userModel.createUser(userData, createdBy);
            return {
                success: true,
                data: (0, types_1.sanitizeUser)(user),
                message: 'User created successfully'
            };
        }
        catch (error) {
            return {
                success: false,
                data: null,
                message: `Failed to create user: ${error.message}`
            };
        }
    }
    async updateUser(id, data, updatedBy) {
        try {
            console.log('🔍 UpdateUser called with:', { id, data, updatedBy });
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
            const updateData = {
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
            if (data.password && data.password.trim()) {
                const passwordHash = await this.hashPassword(data.password);
                updateData.password_hash = passwordHash;
            }
            console.log('🚀 Updating user with data:', updateData);
            const updatedUser = await this.userModel.updateUser(id, updateData, updatedBy);
            console.log('✅ User updated successfully:', updatedUser);
            return {
                success: true,
                data: (0, types_1.sanitizeUser)(updatedUser),
                message: 'User updated successfully'
            };
        }
        catch (error) {
            console.error('💥 Error updating user:', error);
            return {
                success: false,
                data: null,
                message: `Failed to update user: ${error.message}`
            };
        }
    }
    async authenticate(username, password) {
        try {
            if (!username || !password) {
                return {
                    success: false,
                    data: null,
                    message: 'Username and password are required'
                };
            }
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
            const isPasswordValid = await this.verifyPassword(password, user.password_hash);
            if (!isPasswordValid) {
                return {
                    success: false,
                    data: null,
                    message: 'Invalid credentials'
                };
            }
            const sessionData = {
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
        }
        catch (error) {
            return {
                success: false,
                data: null,
                message: `Authentication failed: ${error.message}`
            };
        }
    }
    async changePassword(userId, data, updatedBy) {
        try {
            if (data.new_password !== data.confirm_password) {
                return {
                    success: false,
                    data: null,
                    message: 'Password confirmation does not match',
                    errors: [{ field: 'confirm_password', message: 'Passwords do not match' }]
                };
            }
            const user = await this.userModel.findById(userId);
            if (!user) {
                return {
                    success: false,
                    data: null,
                    message: 'User not found'
                };
            }
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
            const newPasswordHash = await this.hashPassword(data.new_password);
            const updateData = {
                password_hash: newPasswordHash,
                updated_by: updatedBy
            };
            await this.userModel.updateUser(userId, updateData, updatedBy);
            return {
                success: true,
                data: true,
                message: 'Password changed successfully'
            };
        }
        catch (error) {
            return {
                success: false,
                data: null,
                message: `Failed to change password: ${error.message}`
            };
        }
    }
    async getAllUsers(options = {}, userId) {
        try {
            const result = await this.userModel.findAllUsers(options);
            return {
                success: true,
                data: result,
                message: 'Users retrieved successfully'
            };
        }
        catch (error) {
            return {
                success: false,
                data: null,
                message: `Failed to get users: ${error.message}`
            };
        }
    }
    async getUserProfile(id) {
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
                data: (0, types_1.sanitizeUser)(user),
                message: 'User profile retrieved successfully'
            };
        }
        catch (error) {
            return {
                success: false,
                data: null,
                message: `Failed to get user profile: ${error.message}`
            };
        }
    }
    async getUsersByRole(role) {
        try {
            const users = await this.userModel.getUsersByRole?.(role) || [];
            return {
                success: true,
                data: users,
                message: `${role} users retrieved successfully`
            };
        }
        catch (error) {
            return {
                success: false,
                data: null,
                message: `Failed to get users by role: ${error.message}`
            };
        }
    }
    async getUserStatistics() {
        try {
            const stats = await this.userModel.getUserStats();
            return {
                success: true,
                data: stats,
                message: 'User statistics retrieved successfully'
            };
        }
        catch (error) {
            return {
                success: false,
                data: null,
                message: `Failed to get user statistics: ${error.message}`
            };
        }
    }
    async validateUserCreation(data) {
        const errors = [];
        if (!data.username) {
            errors.push({ field: 'username', message: 'Username is required' });
        }
        else if (!(0, types_1.isValidUsername)(data.username)) {
            errors.push({ field: 'username', message: 'Username must be 3-50 characters, alphanumeric with underscores/hyphens only' });
        }
        if (data.email && data.email.trim() !== '') {
            if (!(0, types_1.isValidEmail)(data.email)) {
                errors.push({ field: 'email', message: 'Please enter a valid email address' });
            }
        }
        if (!data.password) {
            errors.push({ field: 'password', message: 'Password is required' });
        }
        else if (!(0, types_1.isValidPassword)(data.password)) {
            errors.push({ field: 'password', message: 'Password must be 8+' });
        }
        if (!data.name) {
            errors.push({ field: 'name', message: 'Name is required' });
        }
        if (data.role && !Object.values(types_1.UserRole).includes(data.role)) {
            errors.push({ field: 'role', message: 'Invalid user role' });
        }
        if (data.position && data.position.length > types_1.USER_CONSTRAINTS.POSITION.MAX_LENGTH) {
            errors.push({ field: 'position', message: `Position must be ${types_1.USER_CONSTRAINTS.POSITION.MAX_LENGTH} characters or less` });
        }
        return {
            isValid: errors.length === 0,
            errors
        };
    }
    async validateUserUpdate(data, userId) {
        const errors = [];
        if (data.username !== undefined) {
            if (!data.username) {
                errors.push({ field: 'username', message: 'Username cannot be empty' });
            }
            else if (!(0, types_1.isValidUsername)(data.username)) {
                errors.push({ field: 'username', message: 'Username must be 3-50 characters, alphanumeric with underscores/hyphens only' });
            }
        }
        if (data.email && data.email.trim() !== '') {
            if (!(0, types_1.isValidEmail)(data.email)) {
                errors.push({ field: 'email', message: 'Please enter a valid email address' });
            }
        }
        if (data.name !== undefined && data.name !== null) {
            if (!data.name) {
                errors.push({ field: 'name', message: 'Name cannot be empty' });
            }
        }
        if (data.role !== undefined && data.role !== null && !Object.values(types_1.UserRole).includes(data.role)) {
            errors.push({ field: 'role', message: 'Invalid user role' });
        }
        if (data.position && data.position.length > types_1.USER_CONSTRAINTS.POSITION.MAX_LENGTH) {
            errors.push({ field: 'position', message: `Position must be ${types_1.USER_CONSTRAINTS.POSITION.MAX_LENGTH} characters or less` });
        }
        return {
            isValid: errors.length === 0,
            errors
        };
    }
    async hashPassword(password) {
        try {
            return await bcrypt_1.default.hash(password, types_1.USER_BUSINESS_RULES.BCRYPT_ROUNDS);
        }
        catch (error) {
            throw new Error('Failed to hash password');
        }
    }
    async verifyPassword(password, hash) {
        try {
            return await bcrypt_1.default.compare(password, hash);
        }
        catch (error) {
            return false;
        }
    }
    async getSessionData(userId) {
        try {
            const sessionData = await this.userModel.getSessionData?.(userId);
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
        }
        catch (error) {
            return {
                success: false,
                data: null,
                message: `Failed to get session data: ${error.message}`
            };
        }
    }
    async userHasRole(userId, role) {
        try {
            const user = await this.userModel.findById(userId);
            return user ? user.role === role : false;
        }
        catch (error) {
            return false;
        }
    }
    async isAdmin(userId) {
        return this.userHasRole(userId, types_1.UserRole.ADMIN);
    }
    async isManagerOrAdmin(userId) {
        try {
            const user = await this.userModel.findById(userId);
            return user ? (user.role === types_1.UserRole.ADMIN || user.role === types_1.UserRole.MANAGER) : false;
        }
        catch (error) {
            return false;
        }
    }
    async checkin(username) {
        try {
            if (!username) {
                return {
                    success: false,
                    data: null,
                    message: 'Username is required'
                };
            }
            const result = await this.userModel.checkin?.(username);
            if (result) {
                return {
                    success: true,
                    data: true,
                    message: 'User checked in successfully'
                };
            }
            else {
                return {
                    success: false,
                    data: null,
                    message: 'No checkin data found for user'
                };
            }
        }
        catch (error) {
            return {
                success: false,
                data: null,
                message: `Failed to check in user: ${error.message}`
            };
        }
    }
    validate(data, operation) {
        const errors = [];
        if (operation === 'create') {
            if (!data.username)
                errors.push('Username is required');
            if (!data.password)
                errors.push('Password is required');
            if (!data.name)
                errors.push('Name is required');
        }
        return {
            isValid: errors.length === 0,
            errors
        };
    }
}
exports.UserService = UserService;
function createUserService(model) {
    return new UserService(model);
}
