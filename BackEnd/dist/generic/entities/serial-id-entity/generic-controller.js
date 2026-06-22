"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GenericSerialIdController = void 0;
exports.createSerialIdController = createSerialIdController;
class GenericSerialIdController {
    constructor(service, config) {
        this.service = service;
        this.config = config;
    }
    async create(req, res, next) {
        try {
            const userId = this.extractUserId(req);
            const result = await this.service.create(req.body, userId);
            if (!result.success) {
                res.status(400).json({
                    success: false,
                    message: 'Failed to create entity',
                    error: result.error
                });
                return;
            }
            res.status(201).json({
                success: true,
                message: `${this.config.entityName} created successfully`,
                data: result.data
            });
        }
        catch (error) {
            next(error);
        }
    }
    async getById(req, res, next) {
        try {
            const { id, isValid, error } = this.parseIdParameter(req);
            if (!isValid) {
                res.status(400).json({
                    success: false,
                    message: error || 'Invalid ID parameter'
                });
                return;
            }
            const result = await this.service.getById(id);
            if (!result.success) {
                const statusCode = result.error?.includes('not found') ? 404 : 400;
                res.status(statusCode).json({
                    success: false,
                    message: result.error || 'Failed to get entity'
                });
                return;
            }
            res.json({
                success: true,
                data: result.data
            });
        }
        catch (error) {
            next(error);
        }
    }
    async update(req, res, next) {
        try {
            const { id, isValid, error } = this.parseIdParameter(req);
            if (!isValid) {
                res.status(400).json({
                    success: false,
                    message: error || 'Invalid ID parameter'
                });
                return;
            }
            const userId = this.extractUserId(req);
            const result = await this.service.update(id, req.body, userId);
            if (!result.success) {
                const statusCode = result.error?.includes('not found') ? 404 : 400;
                res.status(statusCode).json({
                    success: false,
                    message: 'Failed to update entity',
                    error: result.error
                });
                return;
            }
            res.json({
                success: true,
                message: `${this.config.entityName} updated successfully`,
                data: result.data
            });
        }
        catch (error) {
            next(error);
        }
    }
    async delete(req, res, next) {
        try {
            const { id, isValid, error } = this.parseIdParameter(req);
            if (!isValid) {
                res.status(400).json({
                    success: false,
                    message: error || 'Invalid ID parameter'
                });
                return;
            }
            const result = await this.service.delete(id, req.user ?? null, req);
            if (!result.success) {
                res.status(400).json({
                    success: false,
                    message: 'Failed to delete entity',
                    error: result.error
                });
                return;
            }
            res.json({
                success: true,
                message: `${this.config.entityName} deleted successfully`
            });
        }
        catch (error) {
            next(error);
        }
    }
    async changeStatus(req, res, next) {
        try {
            const { id, isValid, error } = this.parseIdParameter(req);
            if (!isValid) {
                res.status(400).json({
                    success: false,
                    message: error || 'Invalid ID parameter'
                });
                return;
            }
            const userId = this.extractUserId(req);
            const result = await this.service.changeStatus(id, userId);
            if (!result.success) {
                res.status(400).json({
                    success: false,
                    message: 'Failed to change status',
                    error: result.error
                });
                return;
            }
            res.json({
                success: true,
                message: `${this.config.entityName} status changed successfully`
            });
        }
        catch (error) {
            next(error);
        }
    }
    async getAll(req, res, next) {
        try {
            const options = this.buildQueryOptions(req);
            const result = await this.service.getAll(options);
            if (!result.success) {
                res.status(400).json({
                    success: false,
                    message: 'Failed to get entities',
                    error: result.error
                });
                return;
            }
            res.json({
                success: true,
                data: result.data?.data,
                pagination: result.data?.pagination
            });
        }
        catch (error) {
            next(error);
        }
    }
    async health(req, res, next) {
        try {
            const result = await this.service.health();
            if (!result.success) {
                res.status(503).json({
                    success: false,
                    message: 'Health check failed',
                    error: result.error
                });
                return;
            }
            const statusCode = result.data?.status === 'healthy' ? 200 :
                result.data?.status === 'warning' ? 200 : 503;
            res.status(statusCode).json({
                success: true,
                data: result.data
            });
        }
        catch (error) {
            next(error);
        }
    }
    async statistics(req, res, next) {
        try {
            const result = await this.service.statistics();
            if (!result.success) {
                res.status(400).json({
                    success: false,
                    message: 'Failed to get statistics',
                    error: result.error
                });
                return;
            }
            res.json({
                success: true,
                data: result.data
            });
        }
        catch (error) {
            next(error);
        }
    }
    async getByName(req, res, next) {
        try {
            const { value: name, isValid, error } = this.validateRequiredParam(req, 'name', 'string');
            if (!isValid || !name) {
                res.status(400).json({
                    success: false,
                    message: error || 'Name parameter is required for search'
                });
                return;
            }
            const options = this.buildQueryOptions(req);
            const result = await this.service.getByName(name, options);
            if (!result.success) {
                res.status(400).json({
                    success: false,
                    message: 'Failed to search by name',
                    error: result.error
                });
                return;
            }
            res.json({
                success: true,
                data: result.data?.data,
                pagination: result.data?.pagination,
                searchInfo: result.data?.searchInfo
            });
        }
        catch (error) {
            next(error);
        }
    }
    async filterStatus(req, res, next) {
        try {
            const { value: status, isValid, error } = this.validateRequiredParam(req, 'status', 'boolean');
            if (!isValid || status === null || status === undefined) {
                res.status(400).json({
                    success: false,
                    message: error || 'Status parameter is required for filtering (true/false)'
                });
                return;
            }
            const options = this.buildQueryOptions(req);
            const result = await this.service.filterStatus(status, options);
            if (!result.success) {
                res.status(400).json({
                    success: false,
                    message: 'Failed to filter by status',
                    error: result.error
                });
                return;
            }
            res.json({
                success: true,
                data: result.data?.data,
                pagination: result.data?.pagination,
                searchInfo: result.data?.searchInfo
            });
        }
        catch (error) {
            next(error);
        }
    }
    async search(req, res, next) {
        try {
            const { value: pattern, isValid, error } = this.validateRequiredParam(req, 'pattern', 'string');
            if (!isValid || !pattern) {
                res.status(400).json({
                    success: false,
                    message: error || 'Pattern parameter is required for search'
                });
                return;
            }
            const options = this.buildQueryOptions(req);
            const result = await this.service.search(pattern, options);
            if (!result.success) {
                res.status(400).json({
                    success: false,
                    message: 'Failed to search by pattern',
                    error: result.error
                });
                return;
            }
            res.json({
                success: true,
                data: result.data?.data,
                pagination: result.data?.pagination,
                searchInfo: result.data?.searchInfo
            });
        }
        catch (error) {
            next(error);
        }
    }
    extractUserId(req) {
        return req.user?.id ?? 0;
    }
    parsePaginationOptions(req) {
        const pageParam = req.query.page;
        const limitParam = req.query.limit;
        const page = Math.max(1, parseInt(String(pageParam || '1'), 10) || 1);
        const limit = Math.min(Math.max(1, parseInt(String(limitParam || this.config.defaultLimit), 10) || this.config.defaultLimit), this.config.maxLimit);
        return { page, limit };
    }
    parseSortOptions(req) {
        const sortBy = String(req.query.sortBy || 'name');
        const sortOrderParam = String(req.query.sortOrder || 'ASC').toUpperCase();
        const sortOrder = sortOrderParam === 'DESC' ? 'DESC' : 'ASC';
        return { sortBy, sortOrder };
    }
    parseBoolean(value, defaultValue = true) {
        if (value === undefined || value === null) {
            return defaultValue;
        }
        return String(value).toLowerCase() === 'true';
    }
    sendError(res, statusCode, message, error) {
        res.status(statusCode).json({
            success: false,
            message,
            error
        });
    }
    sendSuccess(res, data, message, statusCode = 200) {
        const response = {
            success: true,
            data
        };
        if (message) {
            response.message = message;
        }
        res.status(statusCode).json(response);
    }
    parseIdParameter(req) {
        const idParam = req.params.id;
        if (!idParam || idParam.trim() === '') {
            return { id: 0, isValid: false, error: 'ID parameter is required' };
        }
        const id = parseInt(idParam, 10);
        if (isNaN(id) || id <= 0) {
            return { id: 0, isValid: false, error: 'Invalid ID parameter. Must be a positive integer' };
        }
        return { id, isValid: true };
    }
    validateRequiredParam(req, paramName, paramType = 'string') {
        const value = req.query[paramName];
        if (value === undefined || value === null || value === '') {
            return {
                value: null,
                isValid: false,
                error: `${paramName} parameter is required`
            };
        }
        if (paramType === 'string') {
            const stringValue = String(value);
            if (!stringValue.trim()) {
                return {
                    value: null,
                    isValid: false,
                    error: `${paramName} must be a non-empty string`
                };
            }
            return { value: stringValue.trim(), isValid: true };
        }
        if (paramType === 'boolean') {
            const boolValue = String(value).toLowerCase();
            if (boolValue !== 'true' && boolValue !== 'false') {
                return {
                    value: null,
                    isValid: false,
                    error: `${paramName} must be true or false`
                };
            }
            return { value: boolValue === 'true', isValid: true };
        }
        if (paramType === 'number') {
            const numValue = parseInt(String(value), 10);
            if (isNaN(numValue)) {
                return {
                    value: null,
                    isValid: false,
                    error: `${paramName} must be a valid number`
                };
            }
            return { value: numValue, isValid: true };
        }
        return { value, isValid: true };
    }
    buildQueryOptions(req) {
        const { page, limit } = this.parsePaginationOptions(req);
        const { sortBy, sortOrder } = this.parseSortOptions(req);
        return {
            page,
            limit,
            search: req.query.search ? String(req.query.search).trim() : undefined,
            sortBy,
            sortOrder,
            isActive: this.parseBoolean(req.query.isActive, true)
        };
    }
    logRequest(req, endpoint) {
        if (process.env.NODE_ENV === 'development') {
            const userId = req.user?.id;
            console.log(`[${this.config.entityName.toUpperCase()}] ${req.method} ${endpoint}`, {
                user: userId !== undefined ? userId.toString() : 'anonymous',
                query: req.query,
                body: req.method === 'POST' || req.method === 'PUT' ? req.body : undefined
            });
        }
    }
}
exports.GenericSerialIdController = GenericSerialIdController;
function createSerialIdController(service, config) {
    return new GenericSerialIdController(service, config);
}
exports.default = GenericSerialIdController;
