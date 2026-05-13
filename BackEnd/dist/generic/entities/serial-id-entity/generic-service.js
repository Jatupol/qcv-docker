"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GenericSerialIdService = void 0;
exports.createSerialIdService = createSerialIdService;
class GenericSerialIdService {
    constructor(model, config) {
        this.model = model;
        this.config = config;
    }
    async getById(id) {
        try {
            if (!this.isValidId(id)) {
                return {
                    success: false,
                    error: 'Invalid ID provided'
                };
            }
            const entity = await this.model.getById(id);
            if (!entity) {
                return {
                    success: false,
                    error: `${this.config.entityName} not found`
                };
            }
            return {
                success: true,
                data: entity
            };
        }
        catch (error) {
            return {
                success: false,
                error: `Failed to get ${this.config.entityName}: ${error instanceof Error ? error.message : 'Unknown error'}`
            };
        }
    }
    async getAll(options) {
        try {
            const queryOptions = this.applyDefaultOptions(options);
            const result = await this.model.getAll(queryOptions);
            return {
                success: true,
                data: result
            };
        }
        catch (error) {
            return {
                success: false,
                error: `Failed to get ${this.config.entityName} list: ${error instanceof Error ? error.message : 'Unknown error'}`
            };
        }
    }
    async create(data, userId) {
        try {
            const validation = this.validate(data, 'create');
            if (!validation.isValid) {
                return {
                    success: false,
                    error: `Validation failed: ${validation.errors.join(', ')}`
                };
            }
            const entity = await this.model.create(data, userId);
            return {
                success: true,
                data: entity
            };
        }
        catch (error) {
            return {
                success: false,
                error: `Failed to create ${this.config.entityName}: ${error instanceof Error ? error.message : 'Unknown error'}`
            };
        }
    }
    async update(id, data, userId) {
        try {
            if (!this.isValidId(id)) {
                return {
                    success: false,
                    error: 'Invalid ID provided'
                };
            }
            const validation = this.validate(data, 'update');
            if (!validation.isValid) {
                return {
                    success: false,
                    error: `Validation failed: ${validation.errors.join(', ')}`
                };
            }
            const entity = await this.model.update(id, data, userId);
            return {
                success: true,
                data: entity
            };
        }
        catch (error) {
            return {
                success: false,
                error: `Failed to update ${this.config.entityName}: ${error instanceof Error ? error.message : 'Unknown error'}`
            };
        }
    }
    async delete(id, actor, req) {
        try {
            if (!this.isValidId(id)) {
                return {
                    success: false,
                    error: 'Invalid ID provided'
                };
            }
            const result = await this.model.delete(id, actor ?? null, req);
            return {
                success: true,
                data: result
            };
        }
        catch (error) {
            return {
                success: false,
                error: `Failed to delete ${this.config.entityName}: ${error instanceof Error ? error.message : 'Unknown error'}`
            };
        }
    }
    async changeStatus(id, userId) {
        try {
            if (!this.isValidId(id)) {
                return {
                    success: false,
                    error: 'Invalid ID provided'
                };
            }
            const result = await this.model.changeStatus(id, userId);
            return {
                success: true,
                data: result
            };
        }
        catch (error) {
            return {
                success: false,
                error: `Failed to change ${this.config.entityName} status: ${error instanceof Error ? error.message : 'Unknown error'}`
            };
        }
    }
    validate(data, operation) {
        const errors = [];
        if (operation === 'create') {
            if (!data.name || typeof data.name !== 'string' || !data.name.trim()) {
                errors.push('Name is required');
            }
        }
        if (data.name && (typeof data.name !== 'string' || data.name.trim().length > 100)) {
            errors.push('Name must be a string with maximum 100 characters');
        }
        if (data.description && typeof data.description !== 'string') {
            errors.push('Description must be a string');
        }
        if (data.is_active !== undefined && typeof data.is_active !== 'boolean') {
            errors.push('is_active must be a boolean value');
        }
        return {
            isValid: errors.length === 0,
            errors
        };
    }
    async health() {
        try {
            const healthData = await this.model.health();
            return {
                success: true,
                data: healthData
            };
        }
        catch (error) {
            return {
                success: false,
                error: `Failed to get ${this.config.entityName} health: ${error instanceof Error ? error.message : 'Unknown error'}`
            };
        }
    }
    async statistics() {
        try {
            const statsData = await this.model.statistics();
            return {
                success: true,
                data: statsData
            };
        }
        catch (error) {
            return {
                success: false,
                error: `Failed to get ${this.config.entityName} statistics: ${error instanceof Error ? error.message : 'Unknown error'}`
            };
        }
    }
    async getByName(name, options) {
        try {
            if (!name || typeof name !== 'string' || !name.trim()) {
                return {
                    success: false,
                    error: 'Search name is required and must be a non-empty string'
                };
            }
            const queryOptions = this.applyDefaultOptions(options);
            const result = await this.model.getByName(name.trim(), queryOptions);
            return {
                success: true,
                data: result
            };
        }
        catch (error) {
            return {
                success: false,
                error: `Failed to search ${this.config.entityName} by name: ${error instanceof Error ? error.message : 'Unknown error'}`
            };
        }
    }
    async filterStatus(status, options) {
        try {
            if (typeof status !== 'boolean') {
                return {
                    success: false,
                    error: 'Status must be a boolean value (true for active, false for inactive)'
                };
            }
            const queryOptions = this.applyDefaultOptions(options);
            const result = await this.model.filterStatus(status, queryOptions);
            return {
                success: true,
                data: result
            };
        }
        catch (error) {
            return {
                success: false,
                error: `Failed to filter ${this.config.entityName} by status: ${error instanceof Error ? error.message : 'Unknown error'}`
            };
        }
    }
    async search(pattern, options) {
        try {
            if (!pattern || typeof pattern !== 'string' || !pattern.trim()) {
                return {
                    success: false,
                    error: 'Search pattern is required and must be a non-empty string'
                };
            }
            const queryOptions = this.applyDefaultOptions(options);
            const result = await this.model.search(pattern.trim(), queryOptions);
            return {
                success: true,
                data: result
            };
        }
        catch (error) {
            return {
                success: false,
                error: `Failed to search ${this.config.entityName} by pattern: ${error instanceof Error ? error.message : 'Unknown error'}`
            };
        }
    }
    isValidId(id) {
        return typeof id === 'number' && id > 0 && Number.isInteger(id);
    }
    applyDefaultOptions(options) {
        return {
            page: options.page || 1,
            limit: Math.min(options.limit || this.config.defaultLimit, this.config.maxLimit),
            search: options.search,
            sortBy: options.sortBy || 'name',
            sortOrder: options.sortOrder || 'ASC',
            isActive: options.isActive !== undefined ? options.isActive : true,
            name: options.name,
            pattern: options.pattern,
            status: options.status
        };
    }
    sanitizeString(input) {
        if (!input || typeof input !== 'string') {
            return '';
        }
        return input.trim().substring(0, 1000);
    }
    hasPermission(userId, operation) {
        return userId > 0;
    }
}
exports.GenericSerialIdService = GenericSerialIdService;
function createSerialIdService(model, config) {
    return new GenericSerialIdService(model, config);
}
exports.default = GenericSerialIdService;
