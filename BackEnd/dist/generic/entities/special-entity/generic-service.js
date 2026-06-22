"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GenericSpecialService = void 0;
exports.createSpecialService = createSpecialService;
const generic_types_1 = require("./generic-types");
class GenericSpecialService {
    constructor(model, config) {
        this.model = model;
        this.config = config;
    }
    async checkHealth(userId) {
        try {
            console.log(`🔍 Performing health check for ${this.config.entityName}...`);
            const healthResult = await this.model.health();
            const statusEmoji = {
                'healthy': '✅',
                'warning': '⚠️',
                'critical': '❌'
            }[healthResult.status];
            console.log(`${statusEmoji} Health check completed for ${this.config.entityName}: ${healthResult.status.toUpperCase()}`);
            if (healthResult.issues.length > 0) {
                console.log(`   Issues found: ${healthResult.issues.join(', ')}`);
            }
            console.log(`   Statistics: ${healthResult.statistics.total} total, ${healthResult.statistics.active} active`);
            console.log(`   Response time: ${healthResult.responseTime}ms`);
            return (0, generic_types_1.createSuccessResult)(healthResult);
        }
        catch (error) {
            console.error(`❌ Health check failed for ${this.config.entityName}:`, error);
            const criticalHealth = {
                entityName: this.config.entityName,
                tableName: this.config.tableName,
                status: 'critical',
                checks: {
                    tableExists: false,
                    hasData: false,
                    hasActiveRecords: false,
                    recentActivity: false,
                    indexHealth: false
                },
                statistics: {
                    total: 0,
                    active: 0,
                    inactive: 0
                },
                issues: [`Health check failed: ${error instanceof Error ? error.message : 'Unknown error'}`],
                lastChecked: new Date(),
                responseTime: 0
            };
            return (0, generic_types_1.createSuccessResult)(criticalHealth);
        }
    }
    async getStatistics(userId) {
        try {
            console.log(`📊 Calculating statistics for ${this.config.entityName}...`);
            const startTime = Date.now();
            const statisticsResult = await this.model.statistics();
            const calculationTime = Date.now() - startTime;
            console.log(`✅ Statistics calculated for ${this.config.entityName} in ${calculationTime}ms`);
            return (0, generic_types_1.createSuccessResult)(statisticsResult);
        }
        catch (error) {
            console.error(`❌ Statistics calculation failed for ${this.config.entityName}:`, error);
            return (0, generic_types_1.createErrorResult)(`Failed to calculate statistics for ${this.config.entityName}: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    validateData(data, operation) {
        const baseValidation = (0, generic_types_1.validateEntityData)(data, this.config, operation);
        const customValidation = this.validateEntitySpecific(data, operation);
        const errors = [...baseValidation.errors, ...customValidation];
        return {
            isValid: errors.length === 0,
            errors
        };
    }
    validateEntitySpecific(data, operation) {
        return [];
    }
    applyDefaultOptions(options) {
        return {
            page: options.page || 1,
            limit: Math.min(options.limit || this.config.defaultLimit, this.config.maxLimit),
            sortBy: options.sortBy || 'created_at',
            sortOrder: options.sortOrder || 'DESC',
            search: options.search,
            isActive: options.isActive !== undefined ? options.isActive : true,
            filters: options.filters || {}
        };
    }
    sanitizeSearchString(search) {
        return search.trim().replace(/[%_]/g, '\\$&');
    }
    validateFilters(filters) {
        const errors = [];
        Object.keys(filters).forEach(key => {
            if (filters[key] === null || filters[key] === undefined) {
                delete filters[key];
            }
            if (typeof filters[key] === 'string' && filters[key].length > 100) {
                errors.push(`Filter value for '${key}' is too long`);
            }
        });
        return {
            valid: errors.length === 0,
            errors
        };
    }
    logActivity(action, details = {}) {
        const timestamp = new Date().toISOString();
        console.log(`[${timestamp}] ${this.config.entityName} Service: ${action}`, details);
    }
    createAuditEntry(action, userId, details = {}) {
        this.logActivity(`AUDIT: ${action}`, { userId, ...details });
    }
    async withPerformanceMonitoring(operation, fn) {
        const startTime = Date.now();
        try {
            const result = await fn();
            const duration = Date.now() - startTime;
            if (duration > 1000) {
                console.warn(`⚠️ Slow operation detected: ${operation} took ${duration}ms for ${this.config.entityName}`);
            }
            return result;
        }
        catch (error) {
            const duration = Date.now() - startTime;
            console.error(`❌ Operation failed: ${operation} failed after ${duration}ms for ${this.config.entityName}`, error);
            throw error;
        }
    }
}
exports.GenericSpecialService = GenericSpecialService;
function createSpecialService(model, config) {
    console.log(`🏭 Creating SPECIAL service for ${config.entityName} with health monitoring`);
    return new GenericSpecialService(model, config);
}
exports.default = GenericSpecialService;
