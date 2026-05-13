"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReportService = void 0;
exports.createReportService = createReportService;
class ReportService {
    constructor(model) {
        this.model = model;
    }
    async getLARChart(queryParams = { isCustomerReport: false }) {
        try {
            console.log('🔧 LARReportService.getLARChart called with params:', queryParams);
            const validationError = this.validateQueryParams(queryParams);
            if (validationError) {
                return {
                    success: false,
                    message: validationError,
                    errors: [validationError]
                };
            }
            const data = await this.model.getLARChart(queryParams);
            console.log(`✅ LARReportService.getLARChart: Retrieved ${data.length} records`);
            return {
                success: true,
                data,
                message: 'LAR chart data retrieved successfully'
            };
        }
        catch (error) {
            console.error('❌ Error in LARReportService.getLARChart:', error);
            return {
                success: false,
                message: error instanceof Error ? error.message : 'Failed to retrieve LAR chart data',
                errors: [error instanceof Error ? error.message : 'Unknown error']
            };
        }
    }
    async getLARDefect(queryParams = { isCustomerReport: false }) {
        try {
            console.log('🔧 LARReportService.getLARDefect called with params:', queryParams);
            const validationError = this.validateQueryParams(queryParams);
            if (validationError) {
                return {
                    success: false,
                    message: validationError,
                    errors: [validationError]
                };
            }
            const data = await this.model.getLARDefect(queryParams);
            console.log(`✅ LARReportService.getLARDefect: Retrieved ${data.length} defect records`);
            return {
                success: true,
                data,
                message: 'LAR defect data retrieved successfully'
            };
        }
        catch (error) {
            console.error('❌ Error in LARReportService.getLARDefect:', error);
            return {
                success: false,
                message: error instanceof Error ? error.message : 'Failed to retrieve LAR defect data',
                errors: [error instanceof Error ? error.message : 'Unknown error']
            };
        }
    }
    async getLARDashboard(queryParams = {}) {
        try {
            console.log('🔧 LARReportService.getLARDashboard called with params:', queryParams);
            const data = await this.model.getLARDashboard(queryParams);
            console.log(`✅ LARReportService.getLARDashboard: Retrieved ${data.length} dashboard records`);
            return {
                success: true,
                data,
                message: 'LAR dashboard data retrieved successfully'
            };
        }
        catch (error) {
            console.error('❌ Error in LARReportService.getLARDashboard:', error);
            return {
                success: false,
                message: error instanceof Error ? error.message : 'Failed to retrieve LAR dashboard data',
                errors: [error instanceof Error ? error.message : 'Unknown error']
            };
        }
    }
    async getDPPMDashboard(queryParams = {}) {
        try {
            console.log('🔧 DPPMReportService.getDPPMDashboard called with params:', queryParams);
            const data = await this.model.getDPPMDashboard(queryParams);
            console.log(`✅ DPPMReportService.getDPPMDashboard: Retrieved ${data.length} dashboard records`);
            return {
                success: true,
                data,
                message: 'DPPM dashboard data retrieved successfully'
            };
        }
        catch (error) {
            console.error('❌ Error in DPPMReportService.getDPPMDashboard:', error);
            return {
                success: false,
                message: error instanceof Error ? error.message : 'Failed to retrieve DPPM dashboard data',
                errors: [error instanceof Error ? error.message : 'Unknown error']
            };
        }
    }
    async getUnderkillDashboard(queryParams = {}) {
        try {
            console.log('🔧 UnderkillReportService.getUnderkillDashboard called with params:', queryParams);
            const data = await this.model.getUnderkillDashboard(queryParams);
            console.log(`✅ UnderkillReportService.getUnderkillDashboard: Retrieved ${data.length} dashboard records`);
            return {
                success: true,
                data,
                message: 'Underkill dashboard data retrieved successfully'
            };
        }
        catch (error) {
            console.error('❌ Error in UnderkillReportService.getUnderkillDashboard:', error);
            return {
                success: false,
                message: error instanceof Error ? error.message : 'Failed to retrieve Underkill dashboard data',
                errors: [error instanceof Error ? error.message : 'Unknown error']
            };
        }
    }
    async getTopDefect(queryParams = {}) {
        try {
            console.log('🔧 ReportService.getTopDefect called with params:', queryParams);
            const data = await this.model.getTopDefect(queryParams);
            console.log(`✅ ReportService.getTopDefect: Retrieved ${data.length} top defect records`);
            return {
                success: true,
                data,
                message: 'Top defect data retrieved successfully'
            };
        }
        catch (error) {
            console.error('❌ Error in ReportService.getTopDefect:', error);
            return {
                success: false,
                message: error instanceof Error ? error.message : 'Failed to retrieve top defect data',
                errors: [error instanceof Error ? error.message : 'Unknown error']
            };
        }
    }
    async getProductionLineHeatmap(queryParams = {}) {
        try {
            console.log('🔧 ReportService.getProductionLineHeatmap called with params:', queryParams);
            const data = await this.model.getProductionLineHeatmap(queryParams);
            console.log(`✅ ReportService.getProductionLineHeatmap: Retrieved ${data.length} records`);
            return {
                success: true,
                data,
                message: 'Production line heatmap data retrieved successfully'
            };
        }
        catch (error) {
            console.error('❌ Error in ReportService.getProductionLineHeatmap:', error);
            return {
                success: false,
                message: error instanceof Error ? error.message : 'Failed to retrieve production line heatmap data',
                errors: [error instanceof Error ? error.message : 'Unknown error']
            };
        }
    }
    async getProductQualityScorecard(queryParams = {}) {
        try {
            console.log('🔧 ReportService.getProductQualityScorecard called with params:', queryParams);
            const data = await this.model.getProductQualityScorecard(queryParams);
            console.log(`✅ ReportService.getProductQualityScorecard: Retrieved ${data.length} records`);
            return {
                success: true,
                data,
                message: 'Product quality scorecard data retrieved successfully'
            };
        }
        catch (error) {
            console.error('❌ Error in ReportService.getProductQualityScorecard:', error);
            return {
                success: false,
                message: error instanceof Error ? error.message : 'Failed to retrieve product quality scorecard data',
                errors: [error instanceof Error ? error.message : 'Unknown error']
            };
        }
    }
    async getDefectRootCause(queryParams = {}) {
        try {
            console.log('🔧 ReportService.getDefectRootCause called with params:', queryParams);
            const data = await this.model.getDefectRootCause(queryParams);
            console.log(`✅ ReportService.getDefectRootCause: Retrieved ${data.length} records`);
            return {
                success: true,
                data,
                message: 'Defect root cause analysis data retrieved successfully'
            };
        }
        catch (error) {
            console.error('❌ Error in ReportService.getDefectRootCause:', error);
            return {
                success: false,
                message: error instanceof Error ? error.message : 'Failed to retrieve defect root cause analysis data',
                errors: [error instanceof Error ? error.message : 'Unknown error']
            };
        }
    }
    async getMonthlyQualityTrend(queryParams = {}) {
        try {
            console.log('🔧 ReportService.getMonthlyQualityTrend called with params:', queryParams);
            const data = await this.model.getMonthlyQualityTrend(queryParams);
            console.log(`✅ ReportService.getMonthlyQualityTrend: Retrieved ${data.length} records`);
            return {
                success: true,
                data,
                message: 'Monthly quality trend data retrieved successfully'
            };
        }
        catch (error) {
            console.error('❌ Error in ReportService.getMonthlyQualityTrend:', error);
            return {
                success: false,
                message: error instanceof Error ? error.message : 'Failed to retrieve monthly quality trend data',
                errors: [error instanceof Error ? error.message : 'Unknown error']
            };
        }
    }
    async getHistoryTracking(lotNumbers) {
        try {
            console.log('🔧 ReportService.getHistoryTracking called with lotNumbers:', lotNumbers);
            if (!lotNumbers || lotNumbers.length === 0) {
                return {
                    success: false,
                    message: 'At least one lot number is required',
                    errors: ['No lot numbers provided']
                };
            }
            if (lotNumbers.length > 10) {
                return {
                    success: false,
                    message: 'Maximum 10 lot numbers allowed',
                    errors: ['Too many lot numbers (max 10)']
                };
            }
            const cleanedLotNumbers = lotNumbers
                .map(lot => lot.trim())
                .filter(lot => lot.length > 0);
            if (cleanedLotNumbers.length === 0) {
                return {
                    success: false,
                    message: 'At least one valid lot number is required',
                    errors: ['All lot numbers were empty after trimming']
                };
            }
            const data = await this.model.getHistoryTracking(cleanedLotNumbers);
            console.log(`✅ ReportService.getHistoryTracking: Retrieved ${data.length} records`);
            return {
                success: true,
                data,
                message: 'History tracking data retrieved successfully'
            };
        }
        catch (error) {
            console.error('❌ Error in ReportService.getHistoryTracking:', error);
            return {
                success: false,
                message: error instanceof Error ? error.message : 'Failed to retrieve history tracking data',
                errors: [error instanceof Error ? error.message : 'Unknown error']
            };
        }
    }
    async getDefectImageSummary(params) {
        try {
            console.log('🔧 ReportService.getDefectImageSummary called with params:', params);
            if (!params.dateFrom || !params.dateTo) {
                return {
                    success: false,
                    message: 'dateFrom and dateTo are required',
                    errors: ['Missing required date range parameters']
                };
            }
            const data = await this.model.getDefectImageSummary(params);
            console.log(`✅ ReportService.getDefectImageSummary: Retrieved ${data.length} records`);
            return {
                success: true,
                data,
                message: 'Defect image summary data retrieved successfully'
            };
        }
        catch (error) {
            console.error('❌ Error in ReportService.getDefectImageSummary:', error);
            return {
                success: false,
                message: error instanceof Error ? error.message : 'Failed to retrieve defect image summary data',
                errors: [error instanceof Error ? error.message : 'Unknown error']
            };
        }
    }
    async getPartsFilterOptions(params) {
        try {
            if (!params.customerSites || params.customerSites.length === 0) {
                return { success: false, message: 'customerSites is required' };
            }
            const data = await this.model.getPartsFilterOptions(params);
            return { success: true, data, message: 'Parts filter options retrieved successfully' };
        }
        catch (error) {
            console.error('❌ Error in ReportService.getPartsFilterOptions:', error);
            return {
                success: false,
                message: error instanceof Error ? error.message : 'Failed to get parts filter options'
            };
        }
    }
    validateQueryParams(params) {
        if (params.wwFrom && !this.isValidWorkWeek(params.wwFrom)) {
            return `Invalid work week format for wwFrom: ${params.wwFrom}. Expected format: xx (e.g., 01, 52)`;
        }
        if (params.wwTo && !this.isValidWorkWeek(params.wwTo)) {
            return `Invalid work week format for wwTo: ${params.wwTo}. Expected format: xx (e.g., 01, 52)`;
        }
        return null;
    }
    isValidWorkWeek(ww) {
        const wwPattern = /^\d{2}$/i;
        return wwPattern.test(ww);
    }
    isValidDate(dateString) {
        const date = new Date(dateString);
        return date instanceof Date && !isNaN(date.getTime());
    }
    async getAvailableModels() {
        try {
            console.log('🔧 LARReportService.getAvailableModels called');
            const models = await this.model.getAvailableModels();
            console.log(`✅ LARReportService.getAvailableModels: Retrieved ${models.length} models`);
            return {
                success: true,
                data: models,
                message: 'Available models retrieved successfully'
            };
        }
        catch (error) {
            console.error('❌ Error in LARReportService.getAvailableModels:', error);
            return {
                success: false,
                message: error instanceof Error ? error.message : 'Failed to get available models',
                errors: [error instanceof Error ? error.message : 'Unknown error']
            };
        }
    }
    async getModelsSGAIQA(fyww) {
        try {
            console.log('🔧 LARReportService.getSGAIQA called with fyww:', fyww);
            const models = await this.model.getSGAIQAModels(fyww);
            console.log(`✅ LARReportService.getSGAIQA: Retrieved ${models.length} models`);
            return {
                success: true,
                data: models,
                message: 'Available SGAIQA models retrieved successfully'
            };
        }
        catch (error) {
            console.error('❌ Error in LARReportService.getSGAIQA:', error);
            return {
                success: false,
                message: error instanceof Error ? error.message : 'Failed to get available models',
                errors: [error instanceof Error ? error.message : 'Unknown error']
            };
        }
    }
    async getProductFamiliesSGAIQA(fyww) {
        try {
            console.log('🔧 LARReportService.getProductFamiliesSGAIQA called with fyww:', fyww);
            const productFamilies = await this.model.getSGAIQAProductFamilies(fyww);
            console.log(`✅ LARReportService.getProductFamiliesSGAIQA: Retrieved ${productFamilies.length} product families`);
            return {
                success: true,
                data: productFamilies,
                message: 'Available SGAIQA product families retrieved successfully'
            };
        }
        catch (error) {
            console.error('❌ Error in LARReportService.getProductFamiliesSGAIQA:', error);
            return {
                success: false,
                message: error instanceof Error ? error.message : 'Failed to get available product families',
                errors: [error instanceof Error ? error.message : 'Unknown error']
            };
        }
    }
    async getModelsLAR(params = {}) {
        try {
            console.log('🔧 LARReportService.getModelsLAR called with params:', params);
            const models = await this.model.getModelsLAR(params);
            console.log(`✅ LARReportService.getModelsLAR: Retrieved ${models.length} models`);
            return {
                success: true,
                data: models,
                message: 'Available LAR models retrieved successfully'
            };
        }
        catch (error) {
            console.error('❌ Error in LARReportService.getModelsLAR:', error);
            return {
                success: false,
                message: error instanceof Error ? error.message : 'Failed to get available models',
                errors: [error instanceof Error ? error.message : 'Unknown error']
            };
        }
    }
    async getModelsDashboard(params = {}) {
        try {
            const models = await this.model.getModelsDashboard(params);
            return {
                success: true,
                data: models,
                message: 'Available dashboard models retrieved successfully'
            };
        }
        catch (error) {
            console.error('❌ Error in ReportService.getModelsDashboard:', error);
            return {
                success: false,
                message: error instanceof Error ? error.message : 'Failed to get dashboard models',
                errors: [error instanceof Error ? error.message : 'Unknown error']
            };
        }
    }
    async getFiscalYears(report) {
        try {
            console.log('🔧 LARReportService.getFiscalYears called');
            const fiscalYears = await this.model.getFiscalYears(report);
            console.log(`✅ LARReportService.getFiscalYears: Retrieved ${fiscalYears.length} fiscal years`);
            return {
                success: true,
                data: fiscalYears,
                message: 'Fiscal years retrieved successfully'
            };
        }
        catch (error) {
            console.error('❌ Error in LARReportService.getFiscalYears:', error);
            return {
                success: false,
                message: error instanceof Error ? error.message : 'Failed to get fiscal years',
                errors: [error instanceof Error ? error.message : 'Unknown error']
            };
        }
    }
    async getWorkWeeks(report, fiscalYear) {
        try {
            console.log('🔧 LARReportService.getWorkWeeks called with fiscalYear:', fiscalYear);
            const workWeeks = await this.model.getWorkWeeks(report, fiscalYear);
            console.log(`✅ LARReportService.getWorkWeeks: Retrieved ${workWeeks.length} work weeks`);
            return {
                success: true,
                data: workWeeks,
                message: 'Work weeks retrieved successfully'
            };
        }
        catch (error) {
            console.error('❌ Error in LARReportService.getWorkWeeks:', error);
            return {
                success: false,
                message: error instanceof Error ? error.message : 'Failed to get work weeks',
                errors: [error instanceof Error ? error.message : 'Unknown error']
            };
        }
    }
    async getSeagateIQAResult(params) {
        try {
            console.log('🔧 ReportService.getSeagateIQAResult called with params:', params);
            if (!params.yearFrom || !params.wwFrom) {
                return {
                    success: false,
                    message: 'Year and WW parameters are required',
                    errors: ['Missing required parameters: year and ww']
                };
            }
            const data = await this.model.getSeagateIQAResult(params);
            console.log(`✅ ReportService.getSeagateIQAResult: Retrieved ${data.length} records`);
            return {
                success: true,
                data,
                message: 'Seagate IQA Result data retrieved successfully'
            };
        }
        catch (error) {
            console.error('❌ Error in ReportService.getSeagateIQAResult:', error);
            return {
                success: false,
                message: error instanceof Error ? error.message : 'Failed to retrieve Seagate IQA Result data',
                errors: [error instanceof Error ? error.message : 'Unknown error']
            };
        }
    }
    async getIQAOQADppmOverallChart(queryParams = {}) {
        try {
            console.log('🔧 ReportService.getIQAOQADppmOverallChart called with params:', queryParams);
            const data = await this.model.getIQAOQADppmOverallChart(queryParams);
            console.log(`✅ ReportService.getIQAOQADppmOverallChart: Retrieved ${data.length} records`);
            return {
                success: true,
                data,
                message: 'SGT IQA Trend chart data retrieved successfully'
            };
        }
        catch (error) {
            console.error('❌ Error in ReportService.getIQAOQADppmOverallChart:', error);
            return {
                success: false,
                message: error instanceof Error ? error.message : 'Failed to retrieve SGT IQA Trend chart data',
                errors: [error instanceof Error ? error.message : 'Unknown error']
            };
        }
    }
    async getOQADppmOverallChart(queryParams = {}) {
        try {
            console.log('🔧 ReportService.getOQADppmOverallChart called with params:', queryParams);
            const data = await this.model.getOQADppmOverallChart(queryParams);
            console.log(`✅ ReportService.getOQADppmOverallChart: Retrieved ${data.length} records`);
            return {
                success: true,
                data,
                message: 'SGT IQA Trend chart data retrieved successfully'
            };
        }
        catch (error) {
            console.error('❌ Error in ReportService.getOQADppmOverallChart:', error);
            return {
                success: false,
                message: error instanceof Error ? error.message : 'Failed to retrieve SGT IQA Trend chart data',
                errors: [error instanceof Error ? error.message : 'Unknown error']
            };
        }
    }
    async getOQADppmOverallDefect(queryParams = {}) {
        try {
            console.log('🔧 ReportService.getOQADppmOverallDefect called with params:', queryParams);
            const data = await this.model.getOQADppmOverallDefect(queryParams);
            console.log(`✅ ReportService.getOQADppmOverallDefect: Retrieved ${data.length} defect records`);
            return {
                success: true,
                data,
                message: 'SGT IQA Trend defect data retrieved successfully'
            };
        }
        catch (error) {
            console.error('❌ Error in ReportService.getOQADppmOverallDefect:', error);
            return {
                success: false,
                message: error instanceof Error ? error.message : 'Failed to retrieve SGT IQA Trend defect data',
                errors: [error instanceof Error ? error.message : 'Unknown error']
            };
        }
    }
    async getSGTIQATrendChart(queryParams = {}) {
        try {
            console.log('🔧 ReportService.getSGTIQATrendChart called with params:', queryParams);
            const data = await this.model.getSGTIQATrendChart(queryParams);
            console.log(`✅ ReportService.getSGTIQATrendChart: Retrieved ${data.length} records`);
            return {
                success: true,
                data,
                message: 'SGT IQA Trend chart data retrieved successfully'
            };
        }
        catch (error) {
            console.error('❌ Error in ReportService.getSGTIQATrendChart:', error);
            return {
                success: false,
                message: error instanceof Error ? error.message : 'Failed to retrieve SGT IQA Trend chart data',
                errors: [error instanceof Error ? error.message : 'Unknown error']
            };
        }
    }
    async getSGTIQATrendDefect(queryParams = {}) {
        try {
            console.log('🔧 ReportService.getSGTIQATrendDefect called with params:', queryParams);
            const data = await this.model.getSGTIQATrendDefect(queryParams);
            console.log(`✅ ReportService.getSGTIQATrendDefect: Retrieved ${data.length} defect records`);
            return {
                success: true,
                data,
                message: 'SGT IQA Trend defect data retrieved successfully'
            };
        }
        catch (error) {
            console.error('❌ Error in ReportService.getSGTIQATrendDefect:', error);
            return {
                success: false,
                message: error instanceof Error ? error.message : 'Failed to retrieve SGT IQA Trend defect data',
                errors: [error instanceof Error ? error.message : 'Unknown error']
            };
        }
    }
    async getOQAVisualInspection(queryParams = { isCustomerReport: false }) {
        try {
            console.log('🔧 ReportService.getOQAVisualInspection called with params:', queryParams);
            if (!queryParams.dateFrom || !queryParams.dateTo) {
                return {
                    success: false,
                    message: 'dateFrom and dateTo are required',
                    errors: ['Missing required date range parameters']
                };
            }
            const data = await this.model.getOQAVisualInspection(queryParams);
            console.log(`✅ ReportService.getOQAVisualInspection: Retrieved ${data.length} records`);
            return {
                success: true,
                data,
                message: 'OQA Visual Inspection data retrieved successfully'
            };
        }
        catch (error) {
            console.error('❌ Error in ReportService.getOQAVisualInspection:', error);
            return {
                success: false,
                message: error instanceof Error ? error.message : 'Failed to retrieve OQA Visual Inspection data',
                errors: [error instanceof Error ? error.message : 'Unknown error']
            };
        }
    }
    async getDefectTypeAnalysis(dateFrom, dateTo, models, shifts) {
        try {
            console.log('🔧 ReportService.getDefectTypeAnalysis called with dateFrom:', dateFrom, 'dateTo:', dateTo, 'models:', models, 'shifts:', shifts);
            if (!dateFrom || !dateTo) {
                return {
                    success: false,
                    message: 'dateFrom and dateTo are required',
                    errors: ['Missing required date range parameters']
                };
            }
            const data = await this.model.getDefectTypeAnalysis(dateFrom, dateTo, models, shifts);
            console.log(`✅ ReportService.getDefectTypeAnalysis: Retrieved ${data.length} records`);
            return {
                success: true,
                data,
                message: 'Defect type analysis data retrieved successfully'
            };
        }
        catch (error) {
            console.error('❌ Error in ReportService.getDefectTypeAnalysis:', error);
            return {
                success: false,
                message: error instanceof Error ? error.message : 'Failed to retrieve defect type analysis data',
                errors: [error instanceof Error ? error.message : 'Unknown error']
            };
        }
    }
    async getOverviewOQA(queryParams) {
        try {
            console.log('🔧 ReportService.getOverviewOQA called with params:', queryParams);
            if (!queryParams.yearFrom || !queryParams.wwFrom) {
                return {
                    success: false,
                    message: 'yearFrom and wwFrom are required',
                    errors: ['Missing required parameters: yearFrom and wwFrom']
                };
            }
            const data = await this.model.getOverviewOQA(queryParams);
            console.log(`✅ ReportService.getOverviewOQA: Retrieved ${data.length} records`);
            return {
                success: true,
                data,
                message: 'Overview OQA data retrieved successfully'
            };
        }
        catch (error) {
            console.error('❌ Error in ReportService.getOverviewOQA:', error);
            return {
                success: false,
                message: error instanceof Error ? error.message : 'Failed to retrieve Overview OQA data',
                errors: [error instanceof Error ? error.message : 'Unknown error']
            };
        }
    }
    async getOverviewOQALotDetail(fy, ww, partno_customer, defect_group) {
        try {
            if (!fy || !ww || !partno_customer || !defect_group) {
                return {
                    success: false,
                    message: 'fy, ww, partno_customer and defect_group are required',
                    errors: ['Missing required parameters']
                };
            }
            const data = await this.model.getOverviewOQALotDetail(fy, ww, partno_customer, defect_group);
            return {
                success: true,
                data,
                message: 'Overview OQA lot detail retrieved successfully'
            };
        }
        catch (error) {
            console.error('❌ Error in ReportService.getOverviewOQALotDetail:', error);
            return {
                success: false,
                message: error instanceof Error ? error.message : 'Failed to retrieve lot detail',
                errors: [error instanceof Error ? error.message : 'Unknown error']
            };
        }
    }
    async getSOQMDaily(queryParams) {
        try {
            console.log('🔧 ReportService.getSOQMDaily called with params:', queryParams);
            const data = await this.model.getSOQMDaily(queryParams);
            console.log(`✅ ReportService.getSOQMDaily: Retrieved ${data.length} records`);
            return {
                success: true,
                data,
                message: 'SOQM Daily data retrieved successfully'
            };
        }
        catch (error) {
            console.error('❌ Error in ReportService.getSOQMDaily:', error);
            return {
                success: false,
                message: error instanceof Error ? error.message : 'Failed to retrieve SOQM Daily data',
                errors: [error instanceof Error ? error.message : 'Unknown error']
            };
        }
    }
    async getSOQMWeekly(queryParams) {
        try {
            console.log('🔧 ReportService.getSOQMWeekly called with params:', queryParams);
            const data = await this.model.getSOQMWeekly(queryParams);
            console.log(`✅ ReportService.getSOQMWeekly: Retrieved ${data.summary.length} models`);
            return {
                success: true,
                data,
                message: 'SOQM Weekly data retrieved successfully'
            };
        }
        catch (error) {
            console.error('❌ Error in ReportService.getSOQMWeekly:', error);
            return {
                success: false,
                message: error instanceof Error ? error.message : 'Failed to retrieve SOQM Weekly data',
                errors: [error instanceof Error ? error.message : 'Unknown error']
            };
        }
    }
    async getFVIInspection(params) {
        try {
            console.log('🔧 ReportService.getFVIInspection called with params:', params);
            const data = await this.model.getFVIInspection(params);
            console.log(`✅ ReportService.getFVIInspection: Retrieved ${data.length} records`);
            return {
                success: true,
                data,
                message: 'FVI Inspection data retrieved successfully'
            };
        }
        catch (error) {
            console.error('❌ Error in ReportService.getFVIInspection:', error);
            return {
                success: false,
                message: error instanceof Error ? error.message : 'Failed to retrieve FVI Inspection data',
                errors: [error instanceof Error ? error.message : 'Unknown error']
            };
        }
    }
    async deleteFVILotInput(lotno) {
        try {
            console.log('🔧 ReportService.deleteFVILotInput called for lotno:', lotno);
            const result = await this.model.deleteFVILotInput(lotno);
            return {
                success: true,
                deletedCount: result.deletedCount,
                message: `Deleted ${result.deletedCount} records for lot ${lotno}`
            };
        }
        catch (error) {
            console.error('❌ Error in ReportService.deleteFVILotInput:', error);
            return {
                success: false,
                message: error instanceof Error ? error.message : 'Failed to delete lot input records'
            };
        }
    }
}
exports.ReportService = ReportService;
function createReportService(model) {
    return new ReportService(model);
}
exports.default = ReportService;
