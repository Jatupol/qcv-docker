"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GenericSpecialController = void 0;
exports.createSpecialController = createSpecialController;
const generic_types_1 = require("./generic-types");
class GenericSpecialController {
    constructor(service, config) {
        this.getHealth = async (req, res, next) => {
            try {
                const userId = req.user?.id || 0;
                console.log(`🔍 Health check requested for ${this.config.entityName} by user ${req.user?.username} (${req.user?.role})`);
                const result = await this.service.checkHealth(userId);
                if (!result.success) {
                    res.status(generic_types_1.HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
                        success: false,
                        error: result.error,
                        timestamp: new Date().toISOString(),
                        path: req.path
                    });
                    return;
                }
                const healthData = result.data;
                const statusEmoji = {
                    'healthy': '✅',
                    'warning': '⚠️',
                    'critical': '❌'
                }[healthData.status];
                console.log(`${statusEmoji} Health endpoint served for ${this.config.entityName}: ${healthData.status.toUpperCase()} [User: ${req.user?.username}]`);
            }
            catch (error) {
                console.error(`❌ Error getting health for ${this.config.entityName}:`, error);
                next(error);
            }
        };
        this.getStatistics = async (req, res, next) => {
            try {
                const userId = req.user?.id || 0;
                console.log(`📊 Statistics requested for ${this.config.entityName} by user ${req.user?.username} (${req.user?.role})`);
                const result = await this.service.getStatistics(userId);
                if (!result.success) {
                    res.status(generic_types_1.HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
                        success: false,
                        error: result.error,
                        timestamp: new Date().toISOString(),
                        path: req.path
                    });
                    return;
                }
                const statisticsData = result.data;
                res.status(generic_types_1.HTTP_STATUS.OK).json({
                    success: true,
                    data: {
                        ...statisticsData,
                        metadata: {
                            endpoint: req.path,
                            requestedBy: {
                                userId: userId,
                                username: req.user?.username,
                                role: req.user?.role
                            },
                            entityConfig: {
                                entityName: this.config.entityName,
                                tableName: this.config.tableName,
                                primaryKeyType: this.config.primaryKey,
                                defaultLimit: this.config.defaultLimit,
                                maxLimit: this.config.maxLimit
                            },
                        }
                    },
                    timestamp: new Date().toISOString()
                });
            }
            catch (error) {
                console.error(`❌ Error getting statistics for ${this.config.entityName}:`, error);
                next(error);
            }
        };
        this.service = service;
        this.config = config;
    }
    extractFilters(query) {
        const filters = {};
        const knownParams = ['page', 'limit', 'sortBy', 'sortOrder', 'search', 'isActive'];
        Object.keys(query).forEach(key => {
            if (!knownParams.includes(key) && query[key] !== undefined) {
                filters[key] = query[key];
            }
        });
        return filters;
    }
    validateMonitoringRequest(req) {
        if (!req.user) {
            return { valid: false, error: generic_types_1.SPECIAL_ERROR_MESSAGES.UNAUTHORIZED };
        }
        return { valid: true };
    }
    logApiActivity(endpoint, user, method = 'GET', additionalInfo = {}) {
        const timestamp = new Date().toISOString();
        console.log(`[${timestamp}] API Activity - ${this.config.entityName}:`, {
            endpoint,
            method,
            userId: user?.id,
            username: user?.username,
            role: user?.role,
            ...additionalInfo
        });
    }
    createErrorResponse(error, statusCode = generic_types_1.HTTP_STATUS.INTERNAL_SERVER_ERROR, additionalData = {}) {
        return {
            success: false,
            error,
            statusCode,
            timestamp: new Date().toISOString(),
            entityName: this.config.entityName,
            ...additionalData
        };
    }
    createSuccessResponse(data, additionalData = {}) {
        return {
            success: true,
            data,
            timestamp: new Date().toISOString(),
            entityName: this.config.entityName,
            ...additionalData
        };
    }
    setCacheHeaders(res, endpoint) {
        if (endpoint.includes('/health')) {
            res.set('Cache-Control', 'no-cache, no-store, must-revalidate');
        }
        else if (endpoint.includes('/statistics')) {
            res.set('Cache-Control', 'public, max-age=300');
        }
    }
}
exports.GenericSpecialController = GenericSpecialController;
function createSpecialController(service, config) {
    console.log(`🎮 Creating SPECIAL controller for ${config.entityName} with health & statistics endpoints`);
    return new GenericSpecialController(service, config);
}
exports.default = GenericSpecialController;
