"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.requestLogger = requestLogger;
const logger_1 = __importDefault(require("../utils/logger"));
function requestLogger(req, res, next) {
    const startTime = Date.now();
    const originalEnd = res.end;
    const originalJson = res.json;
    const method = req.method;
    const path = req.originalUrl || req.url;
    const ip = req.ip || req.socket.remoteAddress || 'unknown';
    const userAgent = req.get('user-agent') || 'unknown';
    let username;
    try {
        if (req.session && req.session.userId) {
            username = req.session.username || `user_${req.session.userId}`;
        }
        else if (req.user) {
            username = req.user.username || req.user.email || 'authenticated';
        }
    }
    catch (error) {
    }
    res.end = function (chunk, encoding, callback) {
        res.end = originalEnd;
        res.json = originalJson;
        const duration = Date.now() - startTime;
        const statusCode = res.statusCode;
        logger_1.default.http(method, path, statusCode);
        if (logger_1.default.isEnabled()) {
            logger_1.default.log(`  Duration: ${duration}ms | User: ${username || 'anonymous'} | IP: ${ip}`);
        }
        return originalEnd.call(this, chunk, encoding, callback);
    };
    res.json = function (body) {
        res.end = originalEnd;
        res.json = originalJson;
        const duration = Date.now() - startTime;
        const statusCode = res.statusCode;
        logger_1.default.http(method, path, statusCode);
        if (logger_1.default.isEnabled()) {
            logger_1.default.log(`  Duration: ${duration}ms | User: ${username || 'anonymous'} | IP: ${ip}`);
        }
        return originalJson.call(this, body);
    };
    next();
}
exports.default = requestLogger;
