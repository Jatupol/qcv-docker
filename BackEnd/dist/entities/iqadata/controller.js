"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.IQADataController = void 0;
exports.createIQADataController = createIQADataController;
const generic_controller_1 = require("../../generic/entities/special-entity/generic-controller");
const types_1 = require("./types");
class IQADataController extends generic_controller_1.GenericSpecialController {
    constructor(service) {
        super(service, types_1.DEFAULT_IQADATA_CONFIG);
        this.getAll = async (req, res, next) => {
            try {
                const userId = req.user?.id || 0;
                const searchTerm = req.query.search;
                console.log(`📋 Getting all IQA data [User: ${userId}]`, searchTerm ? `with search: "${searchTerm}"` : '');
                const result = await this.iqaDataService.getAll(searchTerm);
                if (result.success && result.data) {
                    res.status(200).json({
                        success: true,
                        data: result.data,
                        message: 'IQA data retrieved successfully'
                    });
                }
                else {
                    res.status(400).json({
                        success: false,
                        message: result.error || 'Failed to get IQA data',
                        error: 'GET_ALL_FAILED'
                    });
                }
            }
            catch (error) {
                console.error('❌ Error getting all IQA data:', error);
                next(error);
            }
        };
        this.getByKey = async (req, res, next) => {
            try {
                const userId = req.user?.id || 0;
                const { id } = req.params;
                console.log(`📋 Getting IQA data by id: ${id} [User: ${userId}]`);
                const result = await this.iqaDataService.getByKey({ id });
                if (result.success && result.data) {
                    res.status(200).json({
                        success: true,
                        data: result.data,
                        message: 'IQA data retrieved successfully'
                    });
                }
                else {
                    res.status(404).json({
                        success: false,
                        message: result.error || 'IQA data not found',
                        error: 'IQA_DATA_NOT_FOUND'
                    });
                }
            }
            catch (error) {
                console.error('❌ Error getting IQA data by key:', error);
                next(error);
            }
        };
        this.create = async (req, res, next) => {
            try {
                const userId = req.user?.id || 0;
                const createData = req.body;
                console.log(`🔧 Creating IQA data [User: ${userId}]`);
                const result = await this.iqaDataService.create(createData, userId);
                if (result.success && result.data) {
                    res.status(201).json({
                        success: true,
                        data: result.data,
                        message: 'IQA data created successfully'
                    });
                }
                else {
                    res.status(400).json({
                        success: false,
                        message: result.error || 'Failed to create IQA data',
                        error: 'CREATE_FAILED'
                    });
                }
            }
            catch (error) {
                console.error('❌ Error creating IQA data:', error);
                next(error);
            }
        };
        this.update = async (req, res, next) => {
            try {
                const userId = req.user?.id || 0;
                const { id } = req.params;
                const updateData = req.body;
                console.log(`🔧 Updating IQA data: ${id} [User: ${userId}]`);
                const result = await this.iqaDataService.update({ id }, updateData, userId);
                if (result.success && result.data) {
                    res.status(200).json({
                        success: true,
                        data: result.data,
                        message: 'IQA data updated successfully'
                    });
                }
                else {
                    res.status(400).json({
                        success: false,
                        message: result.error || 'Failed to update IQA data',
                        error: 'UPDATE_FAILED'
                    });
                }
            }
            catch (error) {
                console.error('❌ Error updating IQA data:', error);
                next(error);
            }
        };
        this.delete = async (req, res, next) => {
            try {
                const userId = req.user?.id || 0;
                const { id } = req.params;
                console.log(`🗑️ Deleting IQA data: ${id} [User: ${userId}]`);
                const result = await this.iqaDataService.delete({ id }, req.user ?? null, req);
                if (result.success) {
                    res.status(200).json({
                        success: true,
                        data: null,
                        message: 'IQA data deleted successfully'
                    });
                }
                else {
                    res.status(400).json({
                        success: false,
                        message: result.error || 'Failed to delete IQA data',
                        error: 'DELETE_FAILED'
                    });
                }
            }
            catch (error) {
                console.error('❌ Error deleting IQA data:', error);
                next(error);
            }
        };
        this.bulkImport = async (req, res, next) => {
            try {
                const userId = req.user?.id || 0;
                const request = req.body;
                console.log('🔧 IQADataController.bulkImport called:', {
                    userId,
                    recordCount: request?.data?.length || 0
                });
                if (!request.data || !Array.isArray(request.data)) {
                    res.status(400).json({
                        success: false,
                        message: 'Request body must contain a "data" array',
                        error: 'INVALID_REQUEST'
                    });
                    return;
                }
                if (request.data.length === 0) {
                    res.status(400).json({
                        success: false,
                        message: 'Data array cannot be empty',
                        error: 'EMPTY_DATA'
                    });
                    return;
                }
                const result = await this.iqaDataService.bulkImport(request, userId);
                if (result.success) {
                    res.status(201).json({
                        success: true,
                        data: result.data,
                        message: 'Bulk import completed successfully'
                    });
                }
                else {
                    res.status(400).json({
                        success: false,
                        message: result.error || 'Bulk import failed',
                        error: result.error
                    });
                }
            }
            catch (error) {
                console.error('❌ Error in bulkImport:', error);
                next(error);
            }
        };
        this.upsert = async (req, res, next) => {
            try {
                const userId = req.user?.id || 0;
                const request = req.body;
                console.log('🔧 IQADataController.upsert called:', {
                    userId,
                    recordCount: request?.data?.length || 0
                });
                if (request?.data?.length > 0) {
                    const firstRecord = request.data[0];
                    console.log('🔍 DEBUG - First record from client:', {
                        lotno: firstRecord.lotno,
                        qty: firstRecord.qty,
                        age: firstRecord.age,
                        model: firstRecord.model,
                        location: firstRecord.location,
                        expense: firstRecord.expense,
                        date_iqa: firstRecord.date_iqa
                    });
                }
                if (!request.data || !Array.isArray(request.data)) {
                    res.status(400).json({
                        success: false,
                        message: 'Request body must contain a "data" array',
                        error: 'INVALID_REQUEST'
                    });
                    return;
                }
                if (request.data.length === 0) {
                    res.status(400).json({
                        success: false,
                        message: 'Data array cannot be empty',
                        error: 'EMPTY_DATA'
                    });
                    return;
                }
                const result = await this.iqaDataService.upsert(request, userId);
                if (result.success) {
                    res.status(201).json({
                        success: true,
                        data: result.data,
                        message: 'Upsert completed successfully'
                    });
                }
                else {
                    res.status(400).json({
                        success: false,
                        message: result.error || 'Upsert failed',
                        error: result.error
                    });
                }
            }
            catch (error) {
                console.error('❌ Error in upsert:', error);
                next(error);
            }
        };
        this.deleteAll = async (req, res, next) => {
            try {
                const userId = req.user?.id || 0;
                console.log('🔧 IQADataController.deleteAll called:', { userId });
                const result = await this.iqaDataService.deleteAll(userId, req.user ?? null, req);
                if (result.success) {
                    res.status(200).json({
                        success: true,
                        data: { deletedCount: result.data },
                        message: 'All IQA data deleted successfully'
                    });
                }
                else {
                    res.status(400).json({
                        success: false,
                        message: result.error || 'Failed to delete all IQA data',
                        error: result.error
                    });
                }
            }
            catch (error) {
                console.error('❌ Error in deleteAll:', error);
                next(error);
            }
        };
        this.bulkDelete = async (req, res, next) => {
            try {
                const userId = req.user?.id || 0;
                const { ids } = req.body;
                console.log('🔧 IQADataController.bulkDelete called:', { userId, idCount: ids?.length || 0 });
                if (!ids || !Array.isArray(ids) || ids.length === 0) {
                    res.status(400).json({
                        success: false,
                        message: 'Request body must contain a non-empty "ids" array',
                        error: 'INVALID_REQUEST'
                    });
                    return;
                }
                const result = await this.iqaDataService.bulkDelete(ids, userId);
                if (result.success && result.data) {
                    res.status(200).json({
                        success: true,
                        data: result.data,
                        message: `Successfully deleted ${result.data.deletedCount} record(s)`
                    });
                }
                else {
                    res.status(400).json({
                        success: false,
                        message: result.error || 'Failed to bulk delete IQA data',
                        error: result.error
                    });
                }
            }
            catch (error) {
                console.error('❌ Error in bulkDelete:', error);
                next(error);
            }
        };
        this.getDistinctFY = async (req, res, next) => {
            try {
                console.log('🔧 IQADataController.getDistinctFY called');
                const result = await this.iqaDataService.getDistinctFY();
                if (result.success) {
                    res.status(200).json({
                        success: true,
                        data: result.data,
                        message: 'Distinct FY values retrieved successfully'
                    });
                }
                else {
                    res.status(400).json({
                        success: false,
                        message: result.error || 'Failed to retrieve distinct FY values',
                        error: result.error
                    });
                }
            }
            catch (error) {
                console.error('❌ Error in getDistinctFY:', error);
                next(error);
            }
        };
        this.getDistinctWW = async (req, res, next) => {
            try {
                const fy = req.query.fy;
                console.log('🔧 IQADataController.getDistinctWW called', fy ? `with FY filter: ${fy}` : '');
                const result = await this.iqaDataService.getDistinctWW(fy);
                if (result.success) {
                    res.status(200).json({
                        success: true,
                        data: result.data,
                        message: 'Distinct WW values retrieved successfully'
                    });
                }
                else {
                    res.status(400).json({
                        success: false,
                        message: result.error || 'Failed to retrieve distinct WW values',
                        error: result.error
                    });
                }
            }
            catch (error) {
                console.error('❌ Error in getDistinctWW:', error);
                next(error);
            }
        };
        this.iqaDataService = service;
    }
}
exports.IQADataController = IQADataController;
function createIQADataController(iqaDataService) {
    return new IQADataController(iqaDataService);
}
exports.default = IQADataController;
