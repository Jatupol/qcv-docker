"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PartsController = void 0;
exports.createPartsController = createPartsController;
const generic_controller_1 = require("../../generic/entities/special-entity/generic-controller");
const types_1 = require("./types");
class PartsController extends generic_controller_1.GenericSpecialController {
    constructor(service) {
        super(service, types_1.PARTS_ENTITY_CONFIG);
        this.getAll = async (req, res, next) => {
            try {
                const userId = req.user.id;
                const searchTerm = req.query.search;
                const page = req.query.page ? parseInt(req.query.page, 10) : 1;
                const limit = req.query.limit ? parseInt(req.query.limit, 10) : 25;
                console.log(`📋 Getting all parts [User: ${userId}]`, {
                    search: searchTerm || 'none',
                    page,
                    limit
                });
                const result = await this.partsService.getAll(searchTerm, page, limit);
                if (result.success && result.data) {
                    res.status(200).json({
                        success: true,
                        data: result,
                        message: 'Parts retrieved successfully'
                    });
                }
                else {
                    res.status(400).json({
                        success: false,
                        message: result.message || 'Failed to get parts',
                        error: 'GET_ALL_FAILED'
                    });
                }
            }
            catch (error) {
                console.error('❌ Error getting all parts:', error);
                next(error);
            }
        };
        this.getByKey = async (req, res, next) => {
            try {
                const userId = req.user.id;
                const { partno } = req.params;
                console.log(`📋 Getting part by partno: ${partno} [User: ${userId}]`);
                const result = await this.partsService.getByKey({ partno });
                if (result.success && result.data) {
                    res.status(200).json({
                        success: true,
                        data: result.data,
                        message: 'Part retrieved successfully'
                    });
                }
                else {
                    res.status(404).json({
                        success: false,
                        message: result.message || 'Part not found',
                        error: 'PART_NOT_FOUND'
                    });
                }
            }
            catch (error) {
                console.error('❌ Error getting part by key:', error);
                next(error);
            }
        };
        this.import = async (req, res, next) => {
            try {
                const userId = req.user.id;
                const createData = req.body;
                console.log(`🔧 Creating part:`, createData, `[User: ${userId}]`);
                const result = await this.partsService.import(createData, userId);
                if (result.success && result.data) {
                    res.status(201).json({
                        success: true,
                        data: result.data,
                        message: 'Part created successfully'
                    });
                }
                else {
                    res.status(400).json({
                        success: false,
                        message: result.message || 'Failed to create part',
                        error: 'CREATE_FAILED'
                    });
                }
            }
            catch (error) {
                console.error('❌ Error creating part:', error);
                next(error);
            }
        };
        this.create = async (req, res, next) => {
            try {
                const userId = req.user.id;
                const createData = req.body;
                console.log(`🔧 Creating part:`, createData, `[User: ${userId}]`);
                const result = await this.partsService.create(createData, userId);
                if (result.success && result.data) {
                    res.status(201).json({
                        success: true,
                        data: result.data,
                        message: 'Part created successfully'
                    });
                }
                else {
                    res.status(400).json({
                        success: false,
                        message: result.message || 'Failed to create part',
                        error: 'CREATE_FAILED'
                    });
                }
            }
            catch (error) {
                console.error('❌ Error creating part:', error);
                next(error);
            }
        };
        this.update = async (req, res, next) => {
            try {
                const userId = req.user.id;
                const { partno } = req.params;
                const updateData = req.body;
                console.log(`🔧 Updating part: ${partno}`, updateData, `[User: ${userId}]`);
                const result = await this.partsService.update({ partno }, updateData, userId);
                if (result.success && result.data) {
                    res.status(200).json({
                        success: true,
                        data: result.data,
                        message: 'Part updated successfully'
                    });
                }
                else {
                    res.status(400).json({
                        success: false,
                        message: result.message || 'Failed to update part',
                        error: 'UPDATE_FAILED'
                    });
                }
            }
            catch (error) {
                console.error('❌ Error updating part:', error);
                next(error);
            }
        };
        this.delete = async (req, res, next) => {
            try {
                const userId = req.user.id;
                const { partno } = req.params;
                console.log(`🗑️ Deleting part: ${partno} [User: ${userId}]`);
                const result = await this.partsService.delete({ partno }, req.user ?? null, req);
                if (result.success) {
                    res.status(200).json({
                        success: true,
                        message: 'Part deleted successfully'
                    });
                }
                else {
                    res.status(400).json({
                        success: false,
                        message: result.message || 'Failed to delete part',
                        error: 'DELETE_FAILED'
                    });
                }
            }
            catch (error) {
                console.error('❌ Error deleting part:', error);
                next(error);
            }
        };
        this.sync = async (res, next) => {
            try {
                console.log(`🗑️ Synchronize data part`);
                const result = await this.partsService.synceData();
                if (result.success) {
                    res.status(200).json({
                        success: true,
                        message: 'Part Synchronize data successfully'
                    });
                }
                else {
                    res.status(400).json({
                        success: false,
                        message: result.message || 'Failed to Synchronize data part',
                        error: 'SYSNC_FAILED'
                    });
                }
            }
            catch (error) {
                console.error('❌ Error Synchronize data part:', error);
                next(error);
            }
        };
        this.getCustomerSites = async (req, res, next) => {
            try {
                const result = await this.partsService.getCustomerSites();
                res.status(200).json({
                    success: true,
                    data: result?.rows || [],
                    message: 'Customer-sites retrieved successfully'
                });
            }
            catch (error) {
                console.error('❌ Error getting customer-sites:', error);
                next(error);
            }
        };
        this.getHealth = async (req, res, next) => {
            try {
                res.status(200).json({
                    success: true,
                    message: 'Parts service is healthy',
                    timestamp: new Date().toISOString(),
                    service: 'parts'
                });
            }
            catch (error) {
                console.error('❌ Error in parts health check:', error);
                next(error);
            }
        };
        this.getStatistics = async (req, res, next) => {
            try {
                const userId = req.user.id;
                console.log(`📊 Getting parts statistics [User: ${userId}]`);
                const result = await this.partsService.getAll();
                if (result.success && result.data) {
                    const parts = result.data;
                    const statistics = {
                        total: parts.length,
                        active: parts.filter(p => p.is_active).length,
                        inactive: parts.filter(p => !p.is_active).length,
                        byCustomer: this.groupByField(parts, 'customer'),
                        byProductionSite: this.groupByField(parts, 'production_site'),
                        byProductType: this.groupByField(parts, 'product_type')
                    };
                    res.status(200).json({
                        success: true,
                        data: statistics,
                        message: 'Parts statistics retrieved successfully'
                    });
                }
                else {
                    res.status(400).json({
                        success: false,
                        message: result.message || 'Failed to get parts statistics',
                        error: 'STATISTICS_FAILED'
                    });
                }
            }
            catch (error) {
                console.error('❌ Error getting parts statistics:', error);
                next(error);
            }
        };
        this.partsService = service;
    }
    groupByField(parts, field) {
        const groups = parts.reduce((acc, part) => {
            const key = String(part[field]);
            acc[key] = (acc[key] || 0) + 1;
            return acc;
        }, {});
        return Object.entries(groups)
            .map(([key, count]) => ({ key, count }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 10);
    }
}
exports.PartsController = PartsController;
function createPartsController(service) {
    return new PartsController(service);
}
exports.default = PartsController;
