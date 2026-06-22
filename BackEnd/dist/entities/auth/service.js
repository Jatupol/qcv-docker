"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const types_1 = require("./types");
class AuthService {
    constructor(authModel) {
        this.authModel = authModel;
    }
    async login(loginData) {
        try {
            if (!(0, types_1.validateLoginRequest)(loginData)) {
                return {
                    success: false,
                    message: 'Invalid login data. Username and password are required.',
                    error: 'VALIDATION_ERROR'
                };
            }
            const { username, password } = loginData;
            let user = await this.authModel.findUserByUsername(username);
            if (!user && username.includes('@')) {
                user = await this.authModel.findUserByEmail(username);
            }
            if (!user) {
                return {
                    success: false,
                    message: 'Invalid username or password',
                    error: 'INVALID_CREDENTIALS'
                };
            }
            if (!user.is_active) {
                return {
                    success: false,
                    message: 'Account is inactive. Contact administrator.',
                    error: 'INACTIVE_ACCOUNT'
                };
            }
            const isPasswordValid = await this.authModel.verifyPassword(password, user.password_hash);
            if (!isPasswordValid) {
                return {
                    success: false,
                    message: 'Invalid username or password',
                    error: 'INVALID_CREDENTIALS'
                };
            }
            this.authModel.updateLastLogin(user.id).catch(error => {
                console.error('Failed to update last login:', error);
            });
            this.updateUserShiftData(user.id, user.username).catch(error => {
                console.error('Failed to update shift data:', error);
            });
            const sessionUser = (0, types_1.createSessionUser)(user);
            return {
                success: true,
                message: 'Login successful',
                user: sessionUser
            };
        }
        catch (error) {
            console.error('Login service error:', error);
            return {
                success: false,
                message: 'Login failed. Please try again.',
                error: 'INTERNAL_ERROR'
            };
        }
    }
    initializeSession(session, user) {
        try {
            session.user = user;
            session.userId = user.id;
            session.username = user.username;
            session.role = user.role;
            session.loginTime = new Date();
            session.lastActivity = new Date();
            session.cookie.maxAge = 6 * 60 * 60 * 1000;
            session.expiresAt = new Date(Date.now() + session.cookie.maxAge);
            console.log(`Session initialized for user ${user.username} (ID: ${user.id})`);
        }
        catch (error) {
            console.error('Session initialization error:', error);
            throw new Error('Failed to initialize session');
        }
    }
    destroySession(session) {
        return new Promise((resolve) => {
            try {
                if (!session) {
                    resolve(true);
                    return;
                }
                const username = session.username || 'unknown';
                session.destroy((error) => {
                    if (error) {
                        console.error('Session destruction error:', error);
                        resolve(false);
                    }
                    else {
                        console.log(`Session destroyed for user ${username}`);
                        resolve(true);
                    }
                });
            }
            catch (error) {
                console.error('Session destruction error:', error);
                resolve(false);
            }
        });
    }
    async getAuthStatus(session) {
        try {
            if (!session || !session.user) {
                return {
                    authenticated: false
                };
            }
            const sessionUser = session.user;
            if (!sessionUser.id || !sessionUser.username) {
                return {
                    authenticated: false
                };
            }
            const currentUser = await this.authModel.findUserById(sessionUser.id);
            if (!currentUser || !currentUser.is_active) {
                return {
                    authenticated: false
                };
            }
            return {
                authenticated: true,
                user: sessionUser,
                sessionExpiry: session.expiresAt ? new Date(session.expiresAt) : undefined,
                permissions: this.getUserPermissions(sessionUser.role)
            };
        }
        catch (error) {
            console.error('Get auth status error:', error);
            return {
                authenticated: false
            };
        }
    }
    async changePassword(userId, passwordData) {
        try {
            if (!(0, types_1.validatePasswordChangeRequest)(passwordData)) {
                return {
                    success: false,
                    message: 'Invalid password data. New password is required.',
                    error: 'VALIDATION_ERROR'
                };
            }
            const { currentPassword, newPassword } = passwordData;
            const user = await this.authModel.findUserById(userId);
            if (!user) {
                return {
                    success: false,
                    message: 'User not found',
                    error: 'USER_NOT_FOUND'
                };
            }
            if (currentPassword) {
                const isCurrentPasswordValid = await this.authModel.verifyPassword(currentPassword, user.password_hash);
                if (!isCurrentPasswordValid) {
                    return {
                        success: false,
                        message: 'Current password is incorrect',
                        error: 'INVALID_CURRENT_PASSWORD'
                    };
                }
            }
            const isSamePassword = await this.authModel.verifyPassword(newPassword, user.password_hash);
            if (isSamePassword) {
                return {
                    success: false,
                    message: 'New password must be different from current password',
                    error: 'SAME_PASSWORD'
                };
            }
            const passwordUpdated = await this.authModel.updatePassword(userId, newPassword);
            if (!passwordUpdated) {
                return {
                    success: false,
                    message: 'Failed to update password',
                    error: 'UPDATE_FAILED'
                };
            }
            return {
                success: true,
                message: 'Password changed successfully'
            };
        }
        catch (error) {
            console.error('Change password service error:', error);
            return {
                success: false,
                message: 'Failed to change password. Please try again.',
                error: 'INTERNAL_ERROR'
            };
        }
    }
    getUserPermissions(role) {
        const permissions = {
            admin: ['read', 'write', 'delete', 'manage_users', 'system_admin'],
            manager: ['read', 'write', 'delete', 'manage_team'],
            user: ['read', 'write']
        };
        return permissions[role] || permissions.user;
    }
    validateSessionData(session) {
        return !!(session &&
            session.user &&
            session.user.id &&
            session.user.username &&
            session.user.role);
    }
    needsSessionRefresh(session) {
        if (!session || !session.expiresAt) {
            return true;
        }
        const now = new Date();
        const expiresAt = new Date(session.expiresAt);
        const timeUntilExpiry = expiresAt.getTime() - now.getTime();
        return timeUntilExpiry < (60 * 60 * 1000);
    }
    async getAuthStats() {
        try {
            return await this.authModel.getAuthStats();
        }
        catch (error) {
            console.error('Get auth stats error:', error);
            return { totalUsers: 0, activeUsers: 0 };
        }
    }
    async updateUserShiftData(userId, username) {
        try {
            console.log(`🔄 Updating shift data for user: ${username} (ID: ${userId})`);
            const shiftData = await this.authModel.getCurrentShiftData(username);
            if (shiftData) {
                await this.authModel.updateUserShiftData(userId, shiftData);
                console.log(`✅ Shift data updated for user: ${username}`);
                console.log(`   Work Shift: ${shiftData.work_shift_id || 'N/A'}`);
                console.log(`   Team: ${shiftData.team || 'N/A'}`);
                console.log(`   Line VI: ${shiftData.line_no_id || 'N/A'}`);
                console.log(`   Check-in: ${shiftData.checkin || 'N/A'}`);
                console.log(`   Work Hours: ${shiftData.time_start_work || 'N/A'} - ${shiftData.time_off_work || 'N/A'}`);
            }
            else {
                console.log(`ℹ️  No active shift data found for user: ${username}`);
                await this.authModel.updateUserShiftData(userId, {
                    work_shift_id: null,
                    checkin: null,
                    time_start_work: null,
                    time_off_work: null,
                    team: null,
                    line_no_id: null
                });
            }
        }
        catch (error) {
            console.error('Update user shift data error:', error);
        }
    }
}
exports.AuthService = AuthService;
