"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GenericVarcharCodeController = void 0;
exports.createGenericVarcharCodeController = createGenericVarcharCodeController;
class GenericVarcharCodeController {
    constructor(service, config) {
        this.create = async (req, res, next) => {
            try {
                const userId = req.user.id;
                const createData = req.body;
                const result = await this.service.create(createData, userId);
                if (result.success && result.data) {
                    const response = {
                        success: true,
                        data: result.data,
                        message: `${this.config.entityName} created successfully`
                    };
                    res.status(201).json(response);
                }
                else {
                    const response = {
                        success: false,
                        error: result.error || `Failed to create ${this.config.entityName}`
                    };
                    res.status(400).json(response);
                }
            }
            catch (error) {
                next(error);
            }
        };
        this.getByCode = async (req, res, next) => {
            try {
                const { code } = req.params;
                const result = await this.service.getByCode(code);
                if (result.success && result.data) {
                    const response = {
                        success: true,
                        data: result.data
                    };
                    res.status(200).json(response);
                }
                else {
                    const response = {
                        success: false,
                        error: result.error || `${this.config.entityName} not found`
                    };
                    res.status(404).json(response);
                }
            }
            catch (error) {
                next(error);
            }
        };
        this.getAll = async (req, res, next) => {
            try {
                const queryOptions = this.parseQueryOptions(req.query);
                const result = await this.service.getAll(queryOptions);
                if (result.success && result.data) {
                    const response = {
                        success: true,
                        data: result.data.data,
                        message: `Retrieved ${result.data.data.length} ${this.config.entityName} records`,
                        ...result.data.pagination && { pagination: result.data.pagination }
                    };
                    res.status(200).json(response);
                }
                else {
                    const response = {
                        success: false,
                        error: result.error || `Failed to retrieve ${this.config.entityName} list`
                    };
                    res.status(500).json(response);
                }
            }
            catch (error) {
                next(error);
            }
        };
        this.update = async (req, res, next) => {
            try {
                const { code } = req.params;
                const userId = req.user.id;
                const updateData = req.body;
                const result = await this.service.update(code, updateData, userId);
                if (result.success && result.data) {
                    const response = {
                        success: true,
                        data: result.data,
                        message: `${this.config.entityName} updated successfully`
                    };
                    res.status(200).json(response);
                }
                else {
                    const response = {
                        success: false,
                        error: result.error || `Failed to update ${this.config.entityName}`
                    };
                    res.status(400).json(response);
                }
            }
            catch (error) {
                next(error);
            }
        };
        this.delete = async (req, res, next) => {
            try {
                const { code } = req.params;
                const result = await this.service.delete(code);
                if (result.success) {
                    const response = {
                        success: true,
                        data: true,
                        message: `${this.config.entityName} deactivated successfully`
                    };
                    res.status(200).json(response);
                }
                else {
                    const response = {
                        success: false,
                        error: result.error || `Failed to deactivate ${this.config.entityName}`
                    };
                    res.status(400).json(response);
                }
            }
            catch (error) {
                next(error);
            }
        };
        this.changeStatus = async (req, res, next) => {
            try {
                const { code } = req.params;
                const userId = req.user.id;
                const result = await this.service.changeStatus(code, userId);
                if (result.success) {
                    const response = {
                        success: true,
                        data: true,
                        message: `${this.config.entityName} status changed successfully`
                    };
                    res.status(200).json(response);
                }
                else {
                    const response = {
                        success: false,
                        error: result.error || `Failed to change ${this.config.entityName} status`
                    };
                    res.status(400).json(response);
                }
            }
            catch (error) {
                next(error);
            }
        };
        this.getHealth = async (req, res, next) => {
            try {
                const result = await this.service.getHealth();
                if (result.success && result.data) {
                    const response = {
                        success: true,
                        data: result.data,
                        message: `${this.config.entityName} health status retrieved successfully`
                    };
                    const httpStatus = result.data.status === 'healthy' ? 200 :
                        result.data.status === 'degraded' ? 206 : 503;
                    res.status(httpStatus).json(response);
                }
                else {
                    const response = {
                        success: false,
                        error: result.error || `Failed to get ${this.config.entityName} health status`
                    };
                    res.status(500).json(response);
                }
            }
            catch (error) {
                next(error);
            }
        };
        this.getStatistics = async (req, res, next) => {
            try {
                const result = await this.service.getStatistics();
                if (result.success && result.data) {
                    const response = {
                        success: true,
                        data: result.data,
                        message: `${this.config.entityName} statistics retrieved successfully`
                    };
                    res.status(200).json(response);
                }
                else {
                    const response = {
                        success: false,
                        error: result.error || `Failed to get ${this.config.entityName} statistics`
                    };
                    res.status(500).json(response);
                }
            }
            catch (error) {
                next(error);
            }
        };
        this.getByName = async (req, res, next) => {
            try {
                const { name } = req.params;
                const queryOptions = this.parseQueryOptions(req.query);
                const result = await this.service.getByName(name, queryOptions);
                if (result.success && result.data) {
                    const response = {
                        success: true,
                        data: result.data.data,
                        message: `Found ${result.data.data.length} ${this.config.entityName} records matching name '${name}'`,
                        ...result.data.pagination && { pagination: result.data.pagination }
                    };
                    res.status(200).json(response);
                }
                else {
                    const response = {
                        success: false,
                        error: result.error || `Failed to search ${this.config.entityName} by name`
                    };
                    res.status(400).json(response);
                }
            }
            catch (error) {
                next(error);
            }
        };
        this.filterStatus = async (req, res, next) => {
            try {
                const { status } = req.params;
                const queryOptions = this.parseQueryOptions(req.query);
                let statusValue;
                if (status.toLowerCase() === 'true' || status === '1') {
                    statusValue = true;
                }
                else if (status.toLowerCase() === 'false' || status === '0') {
                    statusValue = false;
                }
                else {
                    const response = {
                        success: false,
                        error: 'Status parameter must be true, false, 1, or 0'
                    };
                    res.status(400).json(response);
                    return;
                }
                const result = await this.service.filterStatus(statusValue, queryOptions);
                if (result.success && result.data) {
                    const statusText = statusValue ? 'active' : 'inactive';
                    const response = {
                        success: true,
                        data: result.data.data,
                        message: `Found ${result.data.data.length} ${statusText} ${this.config.entityName} records`,
                        ...result.data.pagination && { pagination: result.data.pagination }
                    };
                    res.status(200).json(response);
                }
                else {
                    const response = {
                        success: false,
                        error: result.error || `Failed to filter ${this.config.entityName} by status`
                    };
                    res.status(400).json(response);
                }
            }
            catch (error) {
                next(error);
            }
        };
        this.search = async (req, res, next) => {
            try {
                const { pattern } = req.params;
                const queryOptions = this.parseQueryOptions(req.query);
                const result = await this.service.search(pattern, queryOptions);
                if (result.success && result.data) {
                    const response = {
                        success: true,
                        data: result.data.data,
                        message: `Found ${result.data.data.length} ${this.config.entityName} records matching pattern '${pattern}' in code or name`,
                        ...result.data.pagination && { pagination: result.data.pagination }
                    };
                    res.status(200).json(response);
                }
                else {
                    const response = {
                        success: false,
                        error: result.error || `Failed to search ${this.config.entityName} by pattern`
                    };
                    res.status(400).json(response);
                }
            }
            catch (error) {
                next(error);
            }
        };
        this.service = service;
        this.config = config;
    }
    parseQueryOptions(query) {
        return {
            page: query.page ? parseInt(query.page, 10) : undefined,
            limit: query.limit ? parseInt(query.limit, 10) : undefined,
            sortBy: query.sortBy || undefined,
            sortOrder: query.sortOrder === 'DESC' ? 'DESC' : 'ASC',
            search: query.search || undefined,
            isActive: query.isActive !== undefined ?
                (query.isActive === 'true' || query.isActive === '1') : undefined,
            createdAfter: query.createdAfter ? new Date(query.createdAfter) : undefined,
            createdBefore: query.createdBefore ? new Date(query.createdBefore) : undefined,
            updatedAfter: query.updatedAfter ? new Date(query.updatedAfter) : undefined,
            updatedBefore: query.updatedBefore ? new Date(query.updatedBefore) : undefined
        };
    }
}
exports.GenericVarcharCodeController = GenericVarcharCodeController;
function createGenericVarcharCodeController(service, config) {
    return new GenericVarcharCodeController(service, config);
}
exports.default = GenericVarcharCodeController;
