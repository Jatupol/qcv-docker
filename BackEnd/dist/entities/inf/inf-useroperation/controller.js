"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InfUserOperationController = void 0;
class InfUserOperationController {
    constructor(service) {
        this.getAll = async (req, res, next) => {
            try {
                console.log(`📋 GET /api/inf-useroperation - Query params:`, req.query);
                const queryParams = {
                    page: req.query.page ? parseInt(req.query.page) : 1,
                    limit: req.query.limit ? parseInt(req.query.limit) : 50,
                    usernameSearch: req.query.usernameSearch,
                    operatorNameSearch: req.query.operatorNameSearch,
                    globalSearch: req.query.globalSearch,
                    roleCode: req.query.roleCode,
                    lineNoId: req.query.lineNoId,
                    workShiftId: req.query.workShiftId,
                    isActive: req.query.isActive !== undefined ? req.query.isActive === 'true' : undefined,
                    isSuperAdmin: req.query.isSuperAdmin !== undefined ? req.query.isSuperAdmin === 'true' : undefined,
                    isMrb: req.query.isMrb !== undefined ? req.query.isMrb === 'true' : undefined
                };
                Object.keys(queryParams).forEach(key => {
                    if (queryParams[key] === undefined) {
                        delete queryParams[key];
                    }
                });
                const result = await this.service.getAll(queryParams);
                if (result.success) {
                    console.log(`✅ GET /api/inf-useroperation - Success: ${result.data?.length || 0} records`);
                    res.status(200).json(result);
                }
                else {
                    console.log(`❌ GET /api/inf-useroperation - Error: ${result.message}`);
                    res.status(400).json(result);
                }
            }
            catch (error) {
                console.error('❌ Error in InfUserOperationController.getAll:', error);
                next(error);
            }
        };
        this.getByLineNoId = async (req, res, next) => {
            try {
                const { line_no_id } = req.params;
                console.log(`📋 GET /api/inf-useroperation/${line_no_id}`);
                const result = await this.service.getByLineNoId(line_no_id);
                if (result.success) {
                    console.log(`✅ GET /api/inf-useroperation/${line_no_id} - Success`);
                    res.status(200).json(result);
                }
                else {
                    console.log(`❌ GET /api/inf-useroperation/${line_no_id} - Error: ${result.message}`);
                    res.status(404).json(result);
                }
            }
            catch (error) {
                console.error('❌ Error in InfUserOperationController.getByLineNoId:', error);
                next(error);
            }
        };
        this.getStatistics = async (req, res, next) => {
            try {
                console.log(`📊 GET /api/inf-useroperation/statistics`);
                const result = await this.service.getStatistics();
                if (result.success) {
                    console.log(`✅ GET /api/inf-useroperation/statistics - Success`);
                    res.status(200).json(result);
                }
                else {
                    console.log(`❌ GET /api/inf-useroperation/statistics - Error: ${result.message}`);
                    res.status(400).json(result);
                }
            }
            catch (error) {
                console.error('❌ Error in InfUserOperationController.getStatistics:', error);
                next(error);
            }
        };
        this.getFilterOptions = async (req, res, next) => {
            try {
                console.log(`📋 GET /api/inf-useroperation/filter-options`);
                const result = await this.service.getFilterOptions();
                if (result.success) {
                    console.log(`✅ GET /api/inf-useroperation/filter-options - Success`);
                    res.status(200).json(result);
                }
                else {
                    console.log(`❌ GET /api/inf-useroperation/filter-options - Error: ${result.message}`);
                    res.status(400).json(result);
                }
            }
            catch (error) {
                console.error('❌ Error in InfUserOperationController.getFilterOptions:', error);
                next(error);
            }
        };
        this.healthCheck = async (req, res, next) => {
            try {
                console.log(`🏥 GET /api/inf-useroperation/health`);
                const result = await this.service.healthCheck();
                if (result.success) {
                    console.log(`✅ GET /api/inf-useroperation/health - Healthy`);
                    res.status(200).json(result);
                }
                else {
                    console.log(`❌ GET /api/inf-useroperation/health - Unhealthy: ${result.message}`);
                    res.status(503).json(result);
                }
            }
            catch (error) {
                console.error('❌ Error in InfUserOperationController.healthCheck:', error);
                res.status(503).json({
                    success: false,
                    message: 'Health check failed: ' + (error instanceof Error ? error.message : 'Unknown error'),
                    timestamp: new Date().toISOString(),
                    service: 'inf-useroperation'
                });
            }
        };
        this.sync = async (req, res, next) => {
            try {
                const { tableName, dateFrom, dateTo } = req.body;
                console.log(`🔄 POST /api/inf-useroperation/sync - Params:`, { tableName, dateFrom, dateTo });
                const result = await this.service.syncFromMssql({
                    tableName,
                    dateFrom,
                    dateTo
                });
                if (result.success) {
                    console.log(`✅ POST /api/inf-useroperation/sync - Success:`, result.data);
                    res.status(200).json(result);
                }
                else {
                    console.log(`❌ POST /api/inf-useroperation/sync - Error: ${result.message}`);
                    res.status(400).json(result);
                }
            }
            catch (error) {
                console.error('❌ Error in InfUserOperationController.sync:', error);
                next(error);
            }
        };
        this.service = service;
    }
}
exports.InfUserOperationController = InfUserOperationController;
exports.default = InfUserOperationController;
