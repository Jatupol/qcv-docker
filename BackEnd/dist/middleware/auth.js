"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserRole = exports.authMiddleware = exports.requireAdmin = exports.requireManager = exports.requireUser = void 0;
exports.requestTracking = requestTracking;
exports.initAuthentication = initAuthentication;
exports.requireAuthentication = requireAuthentication;
exports.optionalAuthentication = optionalAuthentication;
exports.requireRole = requireRole;
exports.validateSerialId = validateSerialId;
exports.validateVarcharCode = validateVarcharCode;
exports.composeMiddleware = composeMiddleware;
exports.formatResponse = formatResponse;
exports.formatError = formatError;
const crypto_1 = __importDefault(require("crypto"));
const types_1 = require("../entities/user/types");
Object.defineProperty(exports, "UserRole", { enumerable: true, get: function () { return types_1.UserRole; } });
function generateRequestId() {
    return `req_${Date.now()}_${crypto_1.default.randomBytes(4).toString('hex')}`;
}
function hasRequiredRole(userRole, requiredRoles) {
    const roles = Array.isArray(requiredRoles) ? requiredRoles : [requiredRoles];
    if (userRole === types_1.UserRole.ADMIN) {
        return true;
    }
    if (userRole === types_1.UserRole.MANAGER && roles.includes(types_1.UserRole.USER)) {
        return true;
    }
    return roles.includes(userRole);
}
function formatResponse(success, data, message, code) {
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
function formatError(message, code, status = 400) {
    return {
        success: false,
        message,
        code,
        meta: {
            timestamp: new Date().toISOString()
        }
    };
}
function requestTracking(req, res, next) {
    const qcReq = req;
    const requestId = generateRequestId();
    qcReq.requestId = requestId;
    qcReq.startTime = Date.now();
    res.setHeader('X-Request-ID', requestId);
    res.setHeader('X-API-Version', '1.0');
    const userInfo = req.user ? ` [${req.user.username}]` : '';
    console.log(`📥 ${req.method.padEnd(6)} ${req.originalUrl}${userInfo} - ${requestId}`);
    res.on('finish', () => {
        const duration = Date.now() - (qcReq.startTime || Date.now());
        const status = res.statusCode;
        const icon = status >= 400 ? '❌' : status >= 300 ? '↩️' : '✅';
        console.log(`📤 ${req.method.padEnd(6)} ${req.originalUrl} - ${status} - ${duration}ms ${icon}`);
        if (duration > 2000) {
            console.warn(`⚠️  SLOW REQUEST: ${req.method} ${req.originalUrl} took ${duration}ms`);
        }
    });
    next();
}
let dbPool;
function initAuthentication(db) {
    dbPool = db;
    console.log('✅ Authentication middleware initialized');
}
function requireAuthentication(req, res, next) {
    try {
        const qcReq = req;
        if (!req.session) {
            const errorResponse = formatError('Authentication required. Please log in.', 'NO_SESSION', 401);
            res.status(401);
            res.json(errorResponse);
            return;
        }
        if (!req.session.user) {
            const errorResponse = formatError('Invalid session. Please log in again.', 'INVALID_SESSION', 401);
            res.status(401);
            res.json(errorResponse);
            return;
        }
        const sessionUser = req.session.user;
        if (!sessionUser.id || !sessionUser.username || !sessionUser.role) {
            const errorResponse = formatError('Corrupted session data. Please log in again.', 'CORRUPTED_SESSION', 401);
            res.status(401);
            res.json(errorResponse);
            return;
        }
        req.user = sessionUser;
        req.session.lastActivity = new Date();
        console.log(`🔐 User authenticated: ${sessionUser.username} (${sessionUser.role})`);
        next();
    }
    catch (error) {
        console.error('Authentication middleware error:', error);
        const errorResponse = formatError('Authentication system error', 'AUTH_SYSTEM_ERROR', 500);
        res.status(500);
        res.json(errorResponse);
        return;
    }
}
function optionalAuthentication(req, res, next) {
    try {
        const qcReq = req;
        if (req.session?.user) {
            const sessionUser = req.session.user;
            if (sessionUser.id && sessionUser.username && sessionUser.role) {
                req.user = sessionUser;
                req.session.lastActivity = new Date();
            }
        }
        next();
    }
    catch (error) {
        console.error('Optional authentication error:', error);
        next();
    }
}
function requireRole(roles) {
    const requiredRoles = Array.isArray(roles) ? roles : [roles];
    return (req, res, next) => {
        try {
            const qcReq = req;
            if (!req.user) {
                const errorResponse = formatError('Authentication required for this operation.', 'NO_USER', 401);
                res.status(401);
                res.json(errorResponse);
                return;
            }
            if (!hasRequiredRole(req.user.role, requiredRoles)) {
                const errorResponse = {
                    success: false,
                    message: 'Insufficient permissions for this operation.',
                    code: 'INSUFFICIENT_ROLE',
                    meta: {
                        timestamp: new Date().toISOString(),
                        required: requiredRoles,
                        current: req.user.role
                    }
                };
                res.status(403);
                res.json(errorResponse);
                return;
            }
            console.log(`✅ Role authorization passed: ${req.user.username} (${req.user.role}) for ${requiredRoles.join('|')}`);
            next();
        }
        catch (error) {
            console.error('Role authorization error:', error);
            const errorResponse = formatError('Authorization system error', 'AUTH_SYSTEM_ERROR', 500);
            res.status(500);
            res.json(errorResponse);
            return;
        }
    };
}
exports.requireUser = requireRole(types_1.UserRole.USER);
exports.requireManager = requireRole([types_1.UserRole.MANAGER, types_1.UserRole.ADMIN]);
exports.requireAdmin = requireRole(types_1.UserRole.ADMIN);
function validateSerialId(req, res, next) {
    try {
        const id = parseInt(req.params.id);
        if (isNaN(id) || id <= 0) {
            const errorResponse = formatError('Invalid ID parameter. Must be a positive integer.', 'INVALID_ID', 400);
            res.status(400);
            res.json(errorResponse);
            return;
        }
        next();
    }
    catch (error) {
        console.error('Serial ID validation error:', error);
        const errorResponse = formatError('Parameter validation error', 'VALIDATION_ERROR', 400);
        res.status(400);
        res.json(errorResponse);
        return;
    }
}
function validateVarcharCode(req, res, next) {
    try {
        const code = req.params.code;
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
    }
    catch (error) {
        console.error('Code validation error:', error);
        const errorResponse = formatError('Parameter validation error', 'VALIDATION_ERROR', 400);
        res.status(400);
        res.json(errorResponse);
        return;
    }
}
function composeMiddleware(...middlewares) {
    return (req, res, next) => {
        let index = 0;
        function dispatch() {
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
exports.authMiddleware = {
    requireAuth: requireAuthentication,
    optionalAuth: optionalAuthentication,
    requireUser: exports.requireUser,
    requireManager: exports.requireManager,
    requireAdmin: exports.requireAdmin,
    requireRole,
    validateSerialId,
    validateVarcharCode,
    requestTracking,
    formatResponse,
    formatError,
    composeMiddleware,
    init: initAuthentication
};
