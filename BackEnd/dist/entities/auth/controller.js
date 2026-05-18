"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const auth_1 = require("../../middleware/auth");
const authEventLogger_1 = require("../../utils/authEventLogger");
const database_1 = require("../../config/database");
const types_1 = require("./types");
class AuthController {
    constructor(authService) {
        this.authService = authService;
    }
    async login(req, res) {
        try {
            console.log('🔐 Login attempt received');
            if (!(0, types_1.validateLoginRequest)(req.body)) {
                res.status(400).json(auth_1.authMiddleware.formatError('Invalid login data. Username and password are required.', 'VALIDATION_ERROR', 400));
                return;
            }
            const loginData = req.body;
            const clientIP = this.getClientIP(req);
            const result = await this.authService.login(loginData);
            if (result.success && result.user) {
                this.authService.initializeSession(req.session, result.user);
                try {
                    await new Promise((resolve, reject) => {
                        req.session.save((err) => (err ? reject(err) : resolve()));
                    });
                    const sid = req.session.id;
                    const pool = (0, database_1.getDatabasePool)();
                    let persisted = false;
                    for (let attempt = 0; attempt < 3; attempt++) {
                        const check = await pool.query('SELECT 1 FROM session WHERE sid = $1 LIMIT 1', [sid]);
                        if ((check.rowCount ?? 0) > 0) {
                            persisted = true;
                            break;
                        }
                        await new Promise((r) => setTimeout(r, 25));
                    }
                    if (!persisted) {
                        console.error('❌ Session row not visible after save', { sid });
                        res.status(500).json(auth_1.authMiddleware.formatError('Session could not be persisted. Please try again.', 'SESSION_NOT_PERSISTED', 500));
                        return;
                    }
                }
                catch (saveErr) {
                    console.error('Session save error:', saveErr);
                    res.status(500).json(auth_1.authMiddleware.formatError('Failed to persist session. Please try again.', 'SESSION_SAVE_ERROR', 500));
                    return;
                }
                console.log('✅ Session initialized:', {
                    sessionID: req.session.id,
                    hasUser: !!req.session.user,
                    username: req.session.user?.username,
                    cookieDomain: req.session.cookie.domain,
                    cookieSecure: req.session.cookie.secure,
                    cookieSameSite: req.session.cookie.sameSite
                });
                this.logAuthAttempt(loginData.username, true, clientIP);
                (0, authEventLogger_1.logAuthEvent)({
                    type: 'login_success',
                    username: result.user.username,
                    userId: result.user.id,
                    ip: clientIP,
                    userAgent: req.get('user-agent') || undefined,
                    sessionId: req.session.id,
                });
                res.json(auth_1.authMiddleware.formatResponse(true, {
                    user: result.user,
                    sessionInfo: {
                        sessionId: req.session.id
                    }
                }, result.message || 'Login successful'));
            }
            else {
                this.logAuthAttempt(loginData.username, false, clientIP, result.error);
                (0, authEventLogger_1.logAuthEvent)({
                    type: 'login_failed',
                    username: loginData.username,
                    ip: clientIP,
                    userAgent: req.get('user-agent') || undefined,
                    reason: result.error || 'LOGIN_FAILED',
                });
                res.status(401).json(auth_1.authMiddleware.formatError(result.message || 'Login failed', result.error || 'LOGIN_FAILED', 401));
            }
        }
        catch (error) {
            console.error('Login controller error:', error);
            const attemptedUsername = this.extractUsernameForLogging(req.body);
            const clientIP = this.getClientIP(req);
            this.logAuthAttempt(attemptedUsername, false, clientIP, 'SYSTEM_ERROR');
            res.status(500).json(auth_1.authMiddleware.formatError('Login failed. Please try again.', 'INTERNAL_ERROR', 500));
        }
    }
    async status(req, res) {
        try {
            res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, private');
            res.setHeader('Pragma', 'no-cache');
            res.setHeader('Expires', '0');
            console.log('📊 Auth status check requested');
            const qcReq = req;
            console.log('🍪 Cookies received:', req.headers.cookie);
            console.log('🔑 Session ID:', req.session?.id);
            console.log('👤 Session user:', req.session?.user?.username);
            const authStatus = await this.authService.getAuthStatus(req.session);
            console.log('🔍 Session data:', {
                hasSession: !!req.session,
                sessionID: req.session?.id,
                hasSessionUser: !!req.session?.user,
                hasQcUser: !!qcReq.user,
                authStatus: authStatus.authenticated
            });
            if (authStatus.authenticated && req.session) {
                const needsRefresh = this.authService.needsSessionRefresh(req.session);
                authStatus.needsRefresh = needsRefresh;
            }
            const response = auth_1.authMiddleware.formatResponse(true, {
                ...authStatus,
                debug: {
                    hasSession: !!req.session,
                    hasSessionUser: !!req.session?.user,
                    hasQcUser: !!qcReq.user,
                    timestamp: new Date().toISOString()
                }
            }, authStatus.authenticated ? 'User is authenticated' : 'User is not authenticated');
            res.json(response);
        }
        catch (error) {
            console.error('Auth status error:', error);
            res.status(500).json(auth_1.authMiddleware.formatError('Unable to check authentication status', 'STATUS_ERROR', 500));
        }
    }
    async logout(req, res) {
        try {
            console.log('🚪 Logout requested');
            const qcReq = req;
            const username = qcReq.user?.username || 'unknown';
            const userId = qcReq.user?.id ?? null;
            const sessionId = req.session?.id;
            const clientIP = this.getClientIP(req);
            const isForce = req.headers['x-logout-reason'] === 'force' || req.query.reason === 'force';
            const destroyed = await this.authService.destroySession(req.session);
            (0, authEventLogger_1.logAuthEvent)({
                type: isForce ? 'force_logout' : 'logout',
                username,
                userId,
                ip: clientIP,
                sessionId,
                reason: isForce ? 'CLIENT_SCHEDULED' : undefined,
            });
            if (destroyed) {
                console.log(`✅ Logout successful for user: ${username}`);
                res.json(auth_1.authMiddleware.formatResponse(true, null, 'Logout successful'));
            }
            else {
                console.log(`⚠️ Logout had issues for user: ${username}`);
                res.json(auth_1.authMiddleware.formatResponse(true, null, 'Logout completed (with warnings)'));
            }
        }
        catch (error) {
            console.error('Logout error:', error);
            res.status(500).json(auth_1.authMiddleware.formatError('Logout failed', 'LOGOUT_ERROR', 500));
        }
    }
    async profile(req, res) {
        try {
            const qcReq = req;
            if (!qcReq.user) {
                res.status(401).json(auth_1.authMiddleware.formatError('Authentication required', 'NO_USER', 401));
                return;
            }
            res.json(auth_1.authMiddleware.formatResponse(true, qcReq.user, 'User profile retrieved'));
        }
        catch (error) {
            console.error('Profile error:', error);
            res.status(500).json(auth_1.authMiddleware.formatError('Unable to retrieve profile', 'PROFILE_ERROR', 500));
        }
    }
    async changePassword(req, res) {
        try {
            const qcReq = req;
            if (!qcReq.user) {
                res.status(401).json(auth_1.authMiddleware.formatError('Authentication required', 'NO_USER', 401));
                return;
            }
            if (!(0, types_1.validatePasswordChangeRequest)(req.body)) {
                res.status(400).json(auth_1.authMiddleware.formatError('Invalid password change data', 'VALIDATION_ERROR', 400));
                return;
            }
            const changeData = req.body;
            const result = await this.authService.changePassword(qcReq.user.id, changeData);
            if (result.success) {
                res.json(auth_1.authMiddleware.formatResponse(true, null, result.message || 'Password changed successfully'));
            }
            else {
                res.status(400).json(auth_1.authMiddleware.formatError(result.message || 'Password change failed', result.error || 'PASSWORD_CHANGE_FAILED', 400));
            }
        }
        catch (error) {
            console.error('Password change error:', error);
            res.status(500).json(auth_1.authMiddleware.formatError('Password change failed', 'PASSWORD_CHANGE_ERROR', 500));
        }
    }
    async health(req, res) {
        try {
            const authStats = await this.authService.getAuthStats();
            const qcReq = req;
            const healthData = {
                status: 'healthy',
                service: 'authentication',
                timestamp: new Date().toISOString(),
                uptime: process.uptime(),
                memory: process.memoryUsage(),
                authStats,
                session: {
                    hasSession: !!req.session,
                    isAuthenticated: !!qcReq.user,
                    user: qcReq.user?.username || null
                }
            };
            res.json(auth_1.authMiddleware.formatResponse(true, healthData, 'Authentication service is healthy'));
        }
        catch (error) {
            console.error('Health check error:', error);
            res.status(500).json(auth_1.authMiddleware.formatError('Health check failed', 'HEALTH_CHECK_ERROR', 500));
        }
    }
    getClientIP(req) {
        const forwarded = req.headers['x-forwarded-for'];
        const ip = forwarded ?
            (Array.isArray(forwarded) ? forwarded[0] : forwarded.split(',')[0]) :
            req.socket.remoteAddress;
        return ip || 'unknown';
    }
    logAuthAttempt(username, success, ip, error) {
        const timestamp = new Date().toISOString();
        const status = success ? '✅ SUCCESS' : '❌ FAILED';
        const errorInfo = error ? ` (${error})` : '';
        console.log(`🔐 AUTH ${status}: ${username} from ${ip}${errorInfo} - ${timestamp}`);
    }
    extractUsernameForLogging(requestBody) {
        if (!requestBody || typeof requestBody !== 'object') {
            return 'unknown';
        }
        if ('username' in requestBody && typeof requestBody.username === 'string') {
            return requestBody.username;
        }
        return 'unknown';
    }
}
exports.AuthController = AuthController;
