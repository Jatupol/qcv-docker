"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InspectionDataController = void 0;
exports.createInspectionDataController = createInspectionDataController;
const generic_controller_1 = require("../../generic/entities/special-entity/generic-controller");
const types_1 = require("./types");
class InspectionDataController extends generic_controller_1.GenericSpecialController {
    constructor(service) {
        super(service, types_1.INSPECTIONDATA_ENTITY_CONFIG);
        this.getByLotNumber = async (req, res, next) => {
            try {
                const { lotno } = req.params;
                if (!lotno) {
                    res.status(400).json({ success: false, message: 'Lot number is required' });
                    return;
                }
                const data = await this.inspectionDataService.getByLotNumber(lotno);
                res.json({ success: true, data });
            }
            catch (error) {
                console.error('Error in getByLotNumber:', error);
                next(error);
            }
        };
        this.getByInspectionNo = async (req, res, next) => {
            try {
                const { inspectionNo } = req.params;
                if (!inspectionNo) {
                    res.status(400).json({ success: false, message: 'Inspection number is required' });
                    return;
                }
                const data = await this.inspectionDataService.getByInspectionNo(inspectionNo);
                if (!data) {
                    res.status(404).json({ success: false, message: 'Inspection not found' });
                    return;
                }
                res.json({ success: true, data });
            }
            catch (error) {
                console.error('Error in getByInspectionNo:', error);
                next(error);
            }
        };
        this.getNextSamplingRound = async (req, res, next) => {
            try {
                const { station, lotno } = req.query;
                if (!station || !lotno) {
                    res.status(400).json({
                        success: false,
                        message: 'Station and lotno are required',
                        error: 'MISSING_PARAMETERS'
                    });
                    return;
                }
                console.log(`🔢 Getting next sampling round for station=${station}, lotno=${lotno}`);
                const currentRound = await this.inspectionDataService.getSamplingRoundCount(station, lotno);
                const nextRound = currentRound + 1;
                res.status(200).json({
                    success: true,
                    data: { nextRound, currentRound },
                    message: 'Sampling round retrieved successfully'
                });
            }
            catch (error) {
                console.error('❌ Error getting sampling round:', error);
                next(error);
            }
        };
        this.createSIVFromOQA = async (req, res, next) => {
            try {
                const userId = req.user.id;
                const { id } = req.params;
                console.log(`🔧 Creating SIV from inspection ID: ${id} [User: ${userId}]`);
                console.log('📋 Request params:', req.params);
                console.log('📋 Request URL:', req.url);
                if (!id) {
                    res.status(400).json({
                        success: false,
                        message: 'Inspection ID is required',
                        error: 'MISSING_ID'
                    });
                    return;
                }
                const inspectionId = parseInt(id, 10);
                if (isNaN(inspectionId)) {
                    res.status(400).json({
                        success: false,
                        message: `Invalid inspection ID: ${id}`,
                        error: 'INVALID_ID'
                    });
                    return;
                }
                console.log(`✅ Parsed inspection ID: ${inspectionId}`);
                const result = await this.inspectionDataService.createSIVFromOQA(inspectionId, userId);
                if (result.success && result.data) {
                    res.status(201).json({
                        success: true,
                        data: result.data,
                        message: 'SIV inspection created successfully from OQA'
                    });
                }
                else if (result.success && !result.data) {
                    res.status(200).json({
                        success: true,
                        data: null,
                        message: result.message || 'SIV creation skipped'
                    });
                }
                else {
                    res.status(400).json({
                        success: false,
                        message: result.message || 'Failed to create SIV inspection'
                    });
                }
            }
            catch (error) {
                console.error('❌ Error creating SIV from OQA:', error);
                next(error);
            }
        };
        this.getPartsSGT = async (_req, res, next) => {
            try {
                const parts = await this.inspectionDataService.getPartsSGT();
                res.status(200).json({ success: true, data: parts });
            }
            catch (error) {
                console.error('❌ Error fetching SGT parts:', error);
                next(error);
            }
        };
        this.generateInspectionNumber = async (req, res, next) => {
            try {
                const { station, date, ww } = req.query;
                if (!station || !date || !ww) {
                    res.status(400).json({
                        success: false,
                        message: 'Station, date, and ww are required',
                        error: 'MISSING_PARAMETERS'
                    });
                    return;
                }
                console.log(`🔢 Generating inspection number for station=${station}, date=${date}, ww=${ww}`);
                const inspectionDate = new Date(date);
                const inspectionNo = await this.inspectionDataService.generateInspectionNumber(station, inspectionDate, ww);
                res.status(200).json({
                    success: true,
                    data: { inspectionNo },
                    message: 'Inspection number generated successfully'
                });
            }
            catch (error) {
                console.error('❌ Error generating inspection number:', error);
                next(error);
            }
        };
        this.getAll = async (req, res, next) => {
            try {
                const userId = req.user.id;
                const searchTerm = req.query.search;
                const page = req.query.page ? parseInt(req.query.page, 10) : 1;
                const limit = req.query.limit ? parseInt(req.query.limit, 10) : 20;
                const station = req.query.station;
                const inspectionDateFrom = req.query.inspection_date_from;
                const inspectionDateTo = req.query.inspection_date_to;
                console.log(`📋 Getting all inspection data [User: ${userId}]`, searchTerm ? `with search: "${searchTerm}"` : '', `page=${page}, limit=${limit}`, station ? `station=${station}` : '', inspectionDateFrom || inspectionDateTo ? `dates: ${inspectionDateFrom} to ${inspectionDateTo}` : '');
                const result = await this.inspectionDataService.getAll(searchTerm, {
                    page,
                    limit,
                    station,
                    inspectionDateFrom,
                    inspectionDateTo
                });
                if (result.success && result.data) {
                    res.status(200).json({
                        success: true,
                        data: result.data,
                        pagination: result.pagination,
                        message: 'Inspection data retrieved successfully'
                    });
                }
                else {
                    res.status(400).json({
                        success: false,
                        message: result.message || 'Failed to get inspection data',
                        error: 'GET_ALL_FAILED'
                    });
                }
            }
            catch (error) {
                console.error('❌ Error getting all inspection data:', error);
                next(error);
            }
        };
        this.getAllCustomer = async (req, res, next) => {
            try {
                const userId = req.user.id;
                const searchTerm = req.query.search;
                const page = req.query.page ? parseInt(req.query.page, 10) : 1;
                const limit = req.query.limit ? parseInt(req.query.limit, 10) : 20;
                const station = req.query.station;
                const inspectionDateFrom = req.query.inspection_date_from;
                const inspectionDateTo = req.query.inspection_date_to;
                const result = await this.inspectionDataService.getAllCustomer(searchTerm, {
                    page,
                    limit,
                    station,
                    inspectionDateFrom,
                    inspectionDateTo
                });
                if (result.success && result.data) {
                    res.status(200).json({
                        success: true,
                        data: result.data,
                        pagination: result.pagination,
                        message: 'Inspection data retrieved successfully'
                    });
                }
                else {
                    res.status(400).json({
                        success: false,
                        message: result.message || 'Failed to get inspection data',
                        error: 'GET_ALL_FAILED'
                    });
                }
            }
            catch (error) {
                console.error('❌ Error getting all inspection data:', error);
                next(error);
            }
        };
        this.getCustomerJudgment = async (req, res, next) => {
            try {
                const { inspectionNo } = req.params;
                if (!inspectionNo) {
                    res.status(400).json({ success: false, message: 'inspection_no is required' });
                    return;
                }
                const result = await this.inspectionDataService.getCustomerJudgment(inspectionNo);
                if (result.success) {
                    res.status(200).json({ success: true, data: result.data });
                }
                else {
                    res.status(404).json({ success: false, message: result.message });
                }
            }
            catch (error) {
                next(error);
            }
        };
        this.updateCustomerJudgment = async (req, res, next) => {
            try {
                const userId = req.user.id;
                const { inspection_no, judgment } = req.body;
                if (!inspection_no || judgment === undefined) {
                    res.status(400).json({ success: false, message: 'inspection_no and judgment are required' });
                    return;
                }
                const result = await this.inspectionDataService.updateCustomerJudgment(inspection_no, Boolean(judgment), userId);
                if (result.success) {
                    res.status(200).json({ success: true, message: 'Customer judgment updated successfully' });
                }
                else {
                    res.status(404).json({ success: false, message: result.message || 'Failed to update customer judgment' });
                }
            }
            catch (error) {
                next(error);
            }
        };
        this.getByKey = async (req, res, next) => {
            try {
                const userId = req.user.id;
                const { id } = req.params;
                console.log(`📋 Getting inspection data by id: ${id} [User: ${userId}]`);
                const result = await this.inspectionDataService.getByKey({ id });
                if (result.success && result.data) {
                    res.status(200).json({
                        success: true,
                        data: result.data,
                        message: 'Inspection data retrieved successfully'
                    });
                }
                else {
                    res.status(404).json({
                        success: false,
                        message: result.message || 'Inspection data not found',
                        error: 'INSPECTION_DATA_NOT_FOUND'
                    });
                }
            }
            catch (error) {
                console.error('❌ Error getting inspection data by key:', error);
                next(error);
            }
        };
        this.create = async (req, res, next) => {
            try {
                const userId = req.user.id;
                const createData = req.body;
                console.log(`🔧 Creating inspection data:`, createData, `[User: ${userId}]`);
                const result = await this.inspectionDataService.create(createData, userId);
                if (result.success && result.data) {
                    res.status(201).json({
                        success: true,
                        data: result.data,
                        message: 'Inspection data created successfully'
                    });
                }
                else {
                    res.status(400).json({
                        success: false,
                        message: result.message || 'Failed to create inspection data',
                        error: 'CREATE_FAILED'
                    });
                }
            }
            catch (error) {
                console.error('❌ Error creating inspection data:', error);
                next(error);
            }
        };
        this.update = async (req, res, next) => {
            try {
                const userId = req.user.id;
                const { id } = req.params;
                const updateData = req.body;
                console.log(`🔧 Updating inspection data: ${id}`, updateData, `[User: ${userId}]`);
                console.log(`🎨 Color field in update request:`, {
                    color: updateData.color,
                    colorType: typeof updateData.color,
                    colorDefined: updateData.color !== undefined
                });
                const result = await this.inspectionDataService.update({ id }, updateData, userId);
                if (result.success && result.data) {
                    res.status(200).json({
                        success: true,
                        data: result.data,
                        message: 'Inspection data updated successfully'
                    });
                }
                else {
                    res.status(400).json({
                        success: false,
                        message: result.message || 'Failed to update inspection data',
                        error: 'UPDATE_FAILED'
                    });
                }
            }
            catch (error) {
                console.error('❌ Error updating inspection data:', error);
                next(error);
            }
        };
        this.delete = async (req, res, next) => {
            try {
                const userId = req.user.id;
                const { id } = req.params;
                console.log(`🗑️ Deleting inspection data: ${id} [User: ${userId}]`);
                const result = await this.inspectionDataService.delete({ id }, req.user ?? null, req);
                if (result.success) {
                    res.status(200).json({
                        success: true,
                        message: 'Inspection data deleted successfully'
                    });
                }
                else {
                    res.status(400).json({
                        success: false,
                        message: result.message || 'Failed to delete inspection data',
                        error: 'DELETE_FAILED'
                    });
                }
            }
            catch (error) {
                console.error('❌ Error deleting inspection data:', error);
                next(error);
            }
        };
        this.getHealth = async (req, res, next) => {
            try {
                res.status(200).json({
                    success: true,
                    message: 'InspectionData service is healthy',
                    timestamp: new Date().toISOString(),
                    service: 'inspectiondata'
                });
            }
            catch (error) {
                console.error('❌ Error in inspectiondata health check:', error);
                next(error);
            }
        };
        this.getStatistics = async (req, res, next) => {
            try {
                const userId = req.user.id;
                console.log(`📊 Getting inspectiondata statistics [User: ${userId}]`);
                const result = await this.inspectionDataService.getAll();
                if (result.success && result.data) {
                    const inspectionData = result.data;
                    const statistics = {
                        total: inspectionData.length,
                        active: inspectionData.filter(i => i.is_active).length,
                        inactive: inspectionData.filter(i => !i.is_active).length,
                        byStation: this.groupByField(inspectionData, 'station'),
                        byShift: this.groupByField(inspectionData, 'shift'),
                        byModel: this.groupByField(inspectionData, 'model')
                    };
                    res.status(200).json({
                        success: true,
                        data: statistics,
                        message: 'InspectionData statistics retrieved successfully'
                    });
                }
                else {
                    res.status(400).json({
                        success: false,
                        message: result.message || 'Failed to get inspectiondata statistics',
                        error: 'STATISTICS_FAILED'
                    });
                }
            }
            catch (error) {
                console.error('❌ Error getting inspectiondata statistics:', error);
                next(error);
            }
        };
        this.getStationStats = async (req, res, next) => {
            try {
                const { station } = req.params;
                console.log(`📊 Getting station stats for: ${station}`);
                const stats = await this.inspectionDataService.getStationStatistics(station);
                res.status(200).json({
                    success: true,
                    data: stats,
                    message: `Statistics for ${station} retrieved successfully`
                });
            }
            catch (error) {
                console.error(`❌ Error getting station stats for ${req.params.station}:`, error);
                next(error);
            }
        };
        this.getWeeklyTrend = async (req, res, next) => {
            try {
                const { station } = req.params;
                const { fyww } = req.query;
                console.log(`📈 Getting weekly trend for: ${station}, fyww: ${fyww}`);
                const trendData = await this.inspectionDataService.getWeeklyTrend(station, fyww);
                res.status(200).json({
                    success: true,
                    data: trendData,
                    message: `Weekly trend for ${station} retrieved successfully`
                });
            }
            catch (error) {
                console.error(`❌ Error getting weekly trend for ${req.params.station}:`, error);
                next(error);
            }
        };
        this.inspectionDataService = service;
    }
    groupByField(inspectionData, field) {
        const groups = inspectionData.reduce((acc, item) => {
            const key = String(item[field]);
            acc[key] = (acc[key] || 0) + 1;
            return acc;
        }, {});
        return Object.entries(groups)
            .map(([key, count]) => ({ key, count }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 10);
    }
    async getSIVFormat(req, res, next) {
        try {
            const { inspection_date_from, inspection_date_to, search, judgment, model, lotno, fvilineno, partsite } = req.query;
            const data = await this.inspectionDataService.getSIVFormat({
                inspection_date_from: inspection_date_from,
                inspection_date_to: inspection_date_to,
                searchTerm: search,
                judgment: judgment,
                model: model,
                lotno: lotno,
                fvilineno: fvilineno,
                partsite: partsite,
            });
            res.json({
                success: true,
                data
            });
        }
        catch (error) {
            next(error);
        }
    }
}
exports.InspectionDataController = InspectionDataController;
function createInspectionDataController(service) {
    return new InspectionDataController(service);
}
exports.default = InspectionDataController;
