"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GenericVarcharCodeService = void 0;
exports.createVarcharCodeService = createVarcharCodeService;
class GenericVarcharCodeService {
    constructor(model, config) {
        this.model = model;
        this.config = config;
    }
    async getByCode(code) {
        try {
            if (!this.isValidCode(code)) {
                return {
                    success: false,
                    error: 'Invalid code provided'
                };
            }
            const entity = await this.model.getByCode(code);
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
                    error: validation.errors.join(', ')
                };
            }
            const exists = await this.model.exists(data.code);
            if (exists) {
                return {
                    success: false,
                    error: `${this.config.entityName} with code '${data.code}' already exists`
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
    async update(code, data, userId) {
        try {
            if (!this.isValidCode(code)) {
                return {
                    success: false,
                    error: 'Invalid code provided'
                };
            }
            const validation = this.validate(data, 'update');
            if (!validation.isValid) {
                return {
                    success: false,
                    error: validation.errors.join(', ')
                };
            }
            const exists = await this.model.exists(code);
            if (!exists) {
                return {
                    success: false,
                    error: `${this.config.entityName} not found`
                };
            }
            const entity = await this.model.update(code, data, userId);
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
    async delete(code) {
        try {
            if (!this.isValidCode(code)) {
                return {
                    success: false,
                    error: 'Invalid code provided'
                };
            }
            const deleted = await this.model.delete(code);
            if (!deleted) {
                return {
                    success: false,
                    error: `${this.config.entityName} not found or already inactive`
                };
            }
            return {
                success: true,
                data: true
            };
        }
        catch (error) {
            return {
                success: false,
                error: `Failed to delete ${this.config.entityName}: ${error instanceof Error ? error.message : 'Unknown error'}`
            };
        }
    }
    async changeStatus(code, userId) {
        try {
            if (!this.isValidCode(code)) {
                return {
                    success: false,
                    error: 'Invalid code provided'
                };
            }
            const changed = await this.model.changeStatus(code, userId);
            if (!changed) {
                return {
                    success: false,
                    error: `${this.config.entityName} not found`
                };
            }
            return {
                success: true,
                data: true
            };
        }
        catch (error) {
            return {
                success: false,
                error: `Failed to change ${this.config.entityName} status: ${error instanceof Error ? error.message : 'Unknown error'}`
            };
        }
    }
    async getHealth() {
        try {
            const healthResult = await this.model.health();
            return {
                success: true,
                data: healthResult
            };
        }
        catch (error) {
            return {
                success: false,
                error: `Failed to get ${this.config.entityName} health status: ${error instanceof Error ? error.message : 'Unknown error'}`
            };
        }
    }
    async getStatistics() {
        try {
            const statisticsResult = await this.model.statistics();
            return {
                success: true,
                data: statisticsResult
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
            if (!name || name.trim().length === 0) {
                return {
                    success: false,
                    error: 'Name parameter is required'
                };
            }
            if (name.length > 255) {
                return {
                    success: false,
                    error: 'Name parameter is too long (max 255 characters)'
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
            if (!pattern || pattern.trim().length === 0) {
                return {
                    success: false,
                    error: 'Pattern parameter is required'
                };
            }
            if (pattern.length > 255) {
                return {
                    success: false,
                    error: 'Pattern parameter is too long (max 255 characters)'
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
    validate(data, operation) {
        const errors = [];
        if (operation === 'create') {
            if (!data.code || typeof data.code !== 'string') {
                errors.push('Code is required and must be a string');
            }
            else {
                if (data.code.length === 0 || data.code.length > this.config.codeLength) {
                    errors.push(`Code must be 1-${this.config.codeLength} characters long`);
                }
                if (!/^[A-Z0-9_-]+$/i.test(data.code)) {
                    errors.push('Code can only contain letters, numbers, underscores, and hyphens');
                }
            }
            if (!data.name || typeof data.name !== 'string') {
                errors.push('Name is required and must be a string');
            }
            else if (data.name.trim().length === 0 || data.name.length > 255) {
                errors.push('Name must be 1-255 characters long');
            }
            if (data.is_active !== undefined && typeof data.is_active !== 'boolean') {
                errors.push('is_active must be a boolean value');
            }
        }
        else {
            if (data.name !== undefined) {
                if (typeof data.name !== 'string') {
                    errors.push('Name must be a string');
                }
                else if (data.name.trim().length === 0 || data.name.length > 255) {
                    errors.push('Name must be 1-255 characters long');
                }
            }
            if (data.is_active !== undefined && typeof data.is_active !== 'boolean') {
                errors.push('is_active must be a boolean value');
            }
        }
        return {
            isValid: errors.length === 0,
            errors
        };
    }
    applyDefaultOptions(options) {
        return {
            page: options.page ?? 1,
            limit: Math.min(options.limit ?? this.config.defaultLimit, this.config.maxLimit),
            sortBy: options.sortBy ?? 'code',
            sortOrder: options.sortOrder ?? 'ASC',
            search: options.search?.trim(),
            isActive: options.isActive,
            createdAfter: options.createdAfter,
            createdBefore: options.createdBefore,
            updatedAfter: options.updatedAfter,
            updatedBefore: options.updatedBefore
        };
    }
    isValidCode(code) {
        if (!code || typeof code !== 'string') {
            return false;
        }
        if (code.length === 0 || code.length > this.config.codeLength) {
            return false;
        }
        return /^[A-Z0-9_-]+$/i.test(code);
    }
}
exports.GenericVarcharCodeService = GenericVarcharCodeService;
function createVarcharCodeService(model, config) {
    return new GenericVarcharCodeService(model, config);
}
exports.default = GenericVarcharCodeService;
