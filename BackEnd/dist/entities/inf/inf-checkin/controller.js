"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InfCheckinController = void 0;
const dateTimeUtils_1 = require("../../../utils/dateTimeUtils");
class InfCheckinController {
    constructor(service) {
        this.getAll = async (req, res, next) => {
            try {
                console.log(`📋 GET /api/inf-checkin - Query params:`, req.query);
                const queryParams = {
                    page: req.query.page ? parseInt(req.query.page) : 1,
                    limit: req.query.limit ? parseInt(req.query.limit) : 50,
                    username: req.query.username,
                    usernameSearch: req.query.usernameSearch,
                    oprname: req.query.oprname,
                    lineNoSearch: req.query.lineNoSearch,
                    globalSearch: req.query.globalSearch,
                    line_no_id: req.query.line_no_id,
                    work_shift_id: req.query.work_shift_id,
                    group_code: req.query.group_code,
                    team: req.query.team,
                    status: req.query.status,
                    createdOnFrom: req.query.createdOnFrom,
                    createdOnTo: req.query.createdOnTo,
                    lineId: req.query.lineId,
                    shiftId: req.query.shiftId,
                    search: req.query.search
                };
                Object.keys(queryParams).forEach(key => {
                    if (queryParams[key] === undefined) {
                        delete queryParams[key];
                    }
                });
                const result = await this.service.getAll(queryParams);
                if (result.success) {
                    console.log(`✅ GET /api/inf-checkin - Success: ${result.data?.length || 0} records`);
                    res.status(200).json(result);
                }
                else {
                    console.log(`❌ GET /api/inf-checkin - Error: ${result.message}`);
                    res.status(400).json(result);
                }
            }
            catch (error) {
                console.error('❌ Error in InfCheckinController.getAll:', error);
                next(error);
            }
        };
        this.getByUsername = async (req, res, next) => {
            try {
                const { username } = req.params;
                console.log(`📋 GET /api/inf-checkin/user/${username}`);
                const result = await this.service.getByUsername(username);
                if (result.success) {
                    console.log(`✅ GET /api/inf-checkin/user/${username} - Success: ${result.data?.length || 0} records`);
                    res.status(200).json(result);
                }
                else {
                    console.log(`❌ GET /api/inf-checkin/user/${username} - Error: ${result.message}`);
                    res.status(404).json(result);
                }
            }
            catch (error) {
                console.error('❌ Error in InfCheckinController.getByUsername:', error);
                next(error);
            }
        };
        this.getByLineId = async (req, res, next) => {
            try {
                const { lineId } = req.params;
                console.log(`📋 GET /api/inf-checkin/line/${lineId}`);
                const result = await this.service.getByLineId(lineId);
                if (result.success) {
                    console.log(`✅ GET /api/inf-checkin/line/${lineId} - Success: ${result.data?.length || 0} records`);
                    res.status(200).json(result);
                }
                else {
                    console.log(`❌ GET /api/inf-checkin/line/${lineId} - Error: ${result.message}`);
                    res.status(404).json(result);
                }
            }
            catch (error) {
                console.error('❌ Error in InfCheckinController.getByLineId:', error);
                next(error);
            }
        };
        this.getActiveWorkers = async (req, res, next) => {
            try {
                console.log(`📋 GET /api/inf-checkin/active`);
                const result = await this.service.getActiveWorkers();
                if (result.success) {
                    console.log(`✅ GET /api/inf-checkin/active - Success: ${result.data?.length || 0} active workers`);
                    res.status(200).json(result);
                }
                else {
                    console.log(`❌ GET /api/inf-checkin/active - Error: ${result.message}`);
                    res.status(400).json(result);
                }
            }
            catch (error) {
                console.error('❌ Error in InfCheckinController.getActiveWorkers:', error);
                next(error);
            }
        };
        this.getStatistics = async (req, res, next) => {
            try {
                console.log(`📊 GET /api/inf-checkin/statistics`);
                const result = await this.service.getStatistics();
                if (result.success) {
                    console.log(`✅ GET /api/inf-checkin/statistics - Success`);
                    res.status(200).json(result);
                }
                else {
                    console.log(`❌ GET /api/inf-checkin/statistics - Error: ${result.message}`);
                    res.status(400).json(result);
                }
            }
            catch (error) {
                console.error('❌ Error in InfCheckinController.getStatistics:', error);
                next(error);
            }
        };
        this.getFilterOptions = async (req, res, next) => {
            try {
                console.log(`📋 GET /api/inf-checkin/filter-options`);
                const result = await this.service.getFilterOptions();
                if (result.success) {
                    console.log(`✅ GET /api/inf-checkin/filter-options - Success`);
                    res.status(200).json(result);
                }
                else {
                    console.log(`❌ GET /api/inf-checkin/filter-options - Error: ${result.message}`);
                    res.status(400).json(result);
                }
            }
            catch (error) {
                console.error('❌ Error in InfCheckinController.getFilterOptions:', error);
                next(error);
            }
        };
        this.searchRecords = async (req, res, next) => {
            try {
                console.log(`🔍 GET /api/inf-checkin/search - Query params:`, req.query);
                const searchParams = {
                    searchTerm: req.query.searchTerm,
                    username: req.query.username,
                    oprname: req.query.oprname,
                    lineId: req.query.lineId,
                    groupCode: req.query.groupCode,
                    team: req.query.team,
                    dateFrom: req.query.dateFrom,
                    dateTo: req.query.dateTo
                };
                Object.keys(searchParams).forEach(key => {
                    if (searchParams[key] === undefined) {
                        delete searchParams[key];
                    }
                });
                const result = await this.service.searchRecords(searchParams);
                if (result.success) {
                    console.log(`✅ GET /api/inf-checkin/search - Success: ${result.data?.length || 0} records`);
                    res.status(200).json(result);
                }
                else {
                    console.log(`❌ GET /api/inf-checkin/search - Error: ${result.message}`);
                    res.status(400).json(result);
                }
            }
            catch (error) {
                console.error('❌ Error in InfCheckinController.searchRecords:', error);
                next(error);
            }
        };
        this.getFVILineMapping = async (req, res, next) => {
            try {
                const { line, date, shift } = req.query;
                console.log(`📋 GET /api/inf-checkin/fvi-line-mapping - Params:`, { line, date, shift });
                if (!line || !date || !shift) {
                    res.status(400).json({
                        success: false,
                        message: 'Missing required parameters: line, date, and shift are required'
                    });
                    return;
                }
                const result = await this.service.getFVILineMapping({
                    line: line,
                    date: date,
                    shift: shift
                });
                if (result.success) {
                    console.log(`✅ GET /api/inf-checkin/fvi-line-mapping - Success: ${result.data?.length || 0} mappings`);
                    res.status(200).json(result);
                }
                else {
                    console.log(`❌ GET /api/inf-checkin/fvi-line-mapping - Error: ${result.message}`);
                    res.status(400).json(result);
                }
            }
            catch (error) {
                console.error('❌ Error in InfCheckinController.getFVILineMapping:', error);
                next(error);
            }
        };
        this.getFVILinesByDate = async (req, res, next) => {
            try {
                const { date } = req.query;
                console.log(`📋 GET /api/inf-checkin/fvi-lines-by-date - Date:`, date);
                if (!date) {
                    res.status(400).json({
                        success: false,
                        message: 'Missing required parameter: date is required'
                    });
                    return;
                }
                const result = await this.service.getFVILinesByDate(date);
                if (result.success) {
                    console.log(`✅ GET /api/inf-checkin/fvi-lines-by-date - Success: ${result.data?.length || 0} lines`);
                    res.status(200).json(result);
                }
                else {
                    console.log(`❌ GET /api/inf-checkin/fvi-lines-by-date - Error: ${result.message}`);
                    res.status(400).json(result);
                }
            }
            catch (error) {
                console.error('❌ Error in InfCheckinController.getFVILinesByDate:', error);
                next(error);
            }
        };
        this.getDistinctFVILines = async (req, res, next) => {
            try {
                console.log(`📋 GET /api/inf-checkin/distinct-lines`);
                const result = await this.service.getDistinctFVILines();
                if (result.success) {
                    console.log(`✅ GET /api/inf-checkin/distinct-lines - Success: ${result.data?.length || 0} lines`);
                    res.status(200).json(result);
                }
                else {
                    console.log(`❌ GET /api/inf-checkin/distinct-lines - Error: ${result.message}`);
                    res.status(400).json(result);
                }
            }
            catch (error) {
                console.error('❌ Error in InfCheckinController.getDistinctFVILines:', error);
                next(error);
            }
        };
        this.getOperators = async (req, res, next) => {
            try {
                const gr_code = req.query.gr_code;
                console.log(`📋 GET /api/inf-checkin/operators - gr_code: ${gr_code || 'all'}`);
                const result = await this.service.getOperators(gr_code);
                if (result.success) {
                    console.log(`✅ GET /api/inf-checkin/operators - Success: ${result.data?.length || 0} operators`);
                    res.status(200).json(result);
                }
                else {
                    console.log(`❌ GET /api/inf-checkin/operators - Error: ${result.message}`);
                    res.status(400).json(result);
                }
            }
            catch (error) {
                console.error('❌ Error in InfCheckinController.getOperators:', error);
                next(error);
            }
        };
        this.getFVILeaderOperators = async (req, res, next) => {
            try {
                console.log(`📋 GET /api/inf-checkin/fvi-leaders`);
                const result = await this.service.getFVILeaderOperators();
                if (result.success) {
                    console.log(`✅ GET /api/inf-checkin/fvi-leaders - Success: ${result.data?.length || 0} FVI leaders`);
                    res.status(200).json(result);
                }
                else {
                    console.log(`❌ GET /api/inf-checkin/fvi-leaders - Error: ${result.message}`);
                    res.status(400).json(result);
                }
            }
            catch (error) {
                console.error('❌ Error in InfCheckinController.getFVILeaderOperators:', error);
                next(error);
            }
        };
        this.healthCheck = async (req, res, next) => {
            try {
                console.log(`🏥 GET /api/inf-checkin/health`);
                const result = await this.service.healthCheck();
                if (result.success) {
                    console.log(`✅ GET /api/inf-checkin/health - Healthy`);
                    res.status(200).json(result);
                }
                else {
                    console.log(`❌ GET /api/inf-checkin/health - Unhealthy: ${result.message}`);
                    res.status(503).json(result);
                }
            }
            catch (error) {
                console.error('❌ Error in InfCheckinController.healthCheck:', error);
                res.status(503).json({
                    success: false,
                    message: 'Health check failed: ' + (error instanceof Error ? error.message : 'Unknown error'),
                    timestamp: new Date().toISOString(),
                    service: 'inf-checkin'
                });
            }
        };
        this.importFromMssql = async (req, res, next) => {
            try {
                const { tableName, dateFrom, dateTo } = req.body;
                console.log(`📥 POST /api/inf-checkin/import - Params:`, { tableName, dateFrom, dateTo });
                const result = await this.service.importFromMssql({
                    tableName,
                    dateFrom,
                    dateTo
                });
                if (result.success) {
                    console.log(`✅ POST /api/inf-checkin/import - Success: ${result.imported} records imported`);
                    res.status(200).json(result);
                }
                else {
                    console.log(`❌ POST /api/inf-checkin/import - Error: ${result.message}`);
                    res.status(400).json(result);
                }
            }
            catch (error) {
                console.error('❌ Error in InfCheckinController.importFromMssql:', error);
                next(error);
            }
        };
        this.importTodayData = async (req, res, next) => {
            try {
                const today = (0, dateTimeUtils_1.formatDateLocal)(new Date());
                console.log(`📥 POST /api/inf-checkin/import/today - Importing data for ${today}`);
                const result = await this.service.importFromMssql({
                    dateFrom: today,
                    dateTo: today
                });
                if (result.success) {
                    console.log(`✅ POST /api/inf-checkin/import/today - Success: ${result.imported} records imported`);
                    res.status(200).json(result);
                }
                else {
                    console.log(`❌ POST /api/inf-checkin/import/today - Error: ${result.message}`);
                    res.status(400).json(result);
                }
            }
            catch (error) {
                console.error('❌ Error in InfCheckinController.importTodayData:', error);
                next(error);
            }
        };
        this.importDateRange = async (req, res, next) => {
            try {
                const { dateFrom, dateTo } = req.body;
                console.log(`📥 POST /api/inf-checkin/import/range - Params:`, { dateFrom, dateTo });
                if (!dateFrom || !dateTo) {
                    res.status(400).json({
                        success: false,
                        message: 'Missing required parameters: dateFrom and dateTo are required'
                    });
                    return;
                }
                const result = await this.service.importFromMssql({
                    dateFrom,
                    dateTo
                });
                if (result.success) {
                    console.log(`✅ POST /api/inf-checkin/import/range - Success: ${result.imported} records imported`);
                    res.status(200).json(result);
                }
                else {
                    console.log(`❌ POST /api/inf-checkin/import/range - Error: ${result.message}`);
                    res.status(400).json(result);
                }
            }
            catch (error) {
                console.error('❌ Error in InfCheckinController.importDateRange:', error);
                next(error);
            }
        };
        this.checkSync = async (req, res, next) => {
            try {
                console.log(`🔍 GET /api/inf-checkin/sync - Checking sync status`);
                const result = await this.service.sync(false);
                console.log(`✅ GET /api/inf-checkin/sync - Success: shouldImport=${result.shouldImport}`);
                res.status(200).json(result);
            }
            catch (error) {
                console.error('❌ Error in InfCheckinController.checkSync:', error);
                next(error);
            }
        };
        this.runSync = async (req, res, next) => {
            try {
                console.log(`🔄 POST /api/inf-checkin/sync - Running sync with auto-import`);
                const params = { ...req.body, ...req.query };
                const { dateFrom, dateTo, forceSync } = params;
                console.log(`📋 Sync params:`, { dateFrom, dateTo, forceSync });
                const result = await this.service.sync(true, { dateFrom, dateTo, forceSync: forceSync === true || forceSync === 'true' });
                if (result.success) {
                    console.log(`✅ POST /api/inf-checkin/sync - Success: ${result.message}`);
                    res.status(200).json(result);
                }
                else {
                    console.log(`❌ POST /api/inf-checkin/sync - Error: ${result.message}`);
                    res.status(400).json(result);
                }
            }
            catch (error) {
                console.error('❌ Error in InfCheckinController.runSync:', error);
                next(error);
            }
        };
        this.importAuto = async (req, res, next) => {
            try {
                console.log(`📥 POST /api/inf-checkin/import/auto - Auto-importing new records`);
                const result = await this.service.importFromMssql();
                if (result.success) {
                    console.log(`✅ POST /api/inf-checkin/import/auto - Success: ${result.imported} records imported`);
                    res.status(200).json(result);
                }
                else {
                    console.log(`❌ POST /api/inf-checkin/import/auto - Error: ${result.message}`);
                    res.status(400).json(result);
                }
            }
            catch (error) {
                console.error('❌ Error in InfCheckinController.importAuto:', error);
                next(error);
            }
        };
        this.service = service;
    }
}
exports.InfCheckinController = InfCheckinController;
exports.default = InfCheckinController;
