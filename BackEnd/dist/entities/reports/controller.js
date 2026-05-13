"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReportController = void 0;
exports.createeportController = createeportController;
class ReportController {
    constructor(service) {
        this.getLARChart = async (req, res, next) => {
            try {
                console.log(`📊 GET /api/report-lar/chart - Query params:`, req.query);
                const queryParams = {
                    isCustomerReport: req.query.isCustomerReport === 'true',
                    yearFrom: req.query.yearFrom,
                    wwFrom: req.query.wwFrom,
                    yearTo: req.query.yearTo,
                    wwTo: req.query.wwTo,
                    model: req.query.model,
                    models: req.query.models ? (Array.isArray(req.query.models) ? req.query.models : [req.query.models]) : undefined
                };
                Object.keys(queryParams).forEach(key => {
                    if (queryParams[key] === undefined) {
                        delete queryParams[key];
                    }
                });
                const result = await this.service.getLARChart(queryParams);
                if (result.success) {
                    console.log(`✅ GET /api/report-lar/chart - Success: ${result.data?.length || 0} records`);
                    res.status(200).json(result);
                }
                else {
                    console.log(`❌ GET /api/report-lar/chart - Error: ${result.message}`);
                    res.status(400).json(result);
                }
            }
            catch (error) {
                console.error('❌ Error in LARReportController.getLARChart:', error);
                next(error);
            }
        };
        this.getLARDefect = async (req, res, next) => {
            try {
                console.log(`📊 GET /api/report-lar/defect - Query params:`, req.query);
                const queryParams = {
                    isCustomerReport: req.query.isCustomerReport === 'true',
                    yearFrom: req.query.yearFrom,
                    wwFrom: req.query.wwFrom,
                    yearTo: req.query.yearTo,
                    wwTo: req.query.wwTo,
                    model: req.query.model,
                    models: req.query.models ? (Array.isArray(req.query.models) ? req.query.models : [req.query.models]) : undefined
                };
                Object.keys(queryParams).forEach(key => {
                    if (queryParams[key] === undefined) {
                        delete queryParams[key];
                    }
                });
                const result = await this.service.getLARDefect(queryParams);
                if (result.success) {
                    console.log(`✅ GET /api/report-lar/defect - Success: ${result.data?.length || 0} defect records`);
                    res.status(200).json(result);
                }
                else {
                    console.log(`❌ GET /api/report-lar/defect - Error: ${result.message}`);
                    res.status(400).json(result);
                }
            }
            catch (error) {
                console.error('❌ Error in LARReportController.getLARDefect:', error);
                next(error);
            }
        };
        this.getAvailableModels = async (req, res, next) => {
            try {
                console.log(`📋 GET /api/report-lar/models`);
                const result = await this.service.getAvailableModels();
                if (result.success) {
                    console.log(`✅ GET /api/report-lar/models - Success: ${result.data?.length || 0} models`);
                    res.status(200).json(result);
                }
                else {
                    console.log(`❌ GET /api/report-lar/models - Error: ${result.message}`);
                    res.status(400).json(result);
                }
            }
            catch (error) {
                console.error('❌ Error in LARReportController.getAvailableModels:', error);
                next(error);
            }
        };
        this.getModelsLAR = async (req, res, next) => {
            try {
                console.log(`📋 GET /api/report/modelsLAR`);
                console.log(`📋 Query params:`, req.query);
                const parseArray = (value) => {
                    if (!value)
                        return undefined;
                    if (Array.isArray(value))
                        return value;
                    return [value];
                };
                const params = {
                    yearFrom: req.query.yearFrom,
                    wwFrom: req.query.wwFrom,
                    yearTo: req.query.yearTo,
                    wwTo: req.query.wwTo,
                    isCustomerReport: req.query.isCustomerReport === 'true',
                    productionSites: parseArray(req.query.productionSites),
                    customerSites: parseArray(req.query.customerSites),
                    productFamilies: parseArray(req.query.productFamilies),
                    productTypes: parseArray(req.query.productTypes),
                };
                const result = await this.service.getModelsLAR(params);
                if (result.success) {
                    console.log(`✅ GET /api/report/modelsLAR - Success: ${result.data?.length || 0} models`);
                    res.status(200).json(result);
                }
                else {
                    console.log(`❌ GET /api/report/modelsLAR - Error: ${result.message}`);
                    res.status(400).json(result);
                }
            }
            catch (error) {
                console.error('❌ Error in LARReportController.getModelsLAR:', error);
                next(error);
            }
        };
        this.getModelsDashboard = async (req, res, next) => {
            try {
                const parseArray = (value) => {
                    if (!value)
                        return undefined;
                    if (Array.isArray(value))
                        return value;
                    return [value];
                };
                const params = {
                    productionSites: parseArray(req.query.productionSites),
                    customerSites: parseArray(req.query.customerSites),
                    productFamilies: parseArray(req.query.productFamilies),
                    productTypes: parseArray(req.query.productTypes),
                };
                const result = await this.service.getModelsDashboard(params);
                if (result.success) {
                    res.status(200).json(result);
                }
                else {
                    res.status(400).json(result);
                }
            }
            catch (error) {
                console.error('❌ Error in ReportController.getModelsDashboard:', error);
                next(error);
            }
        };
        this.getLARDashboard = async (req, res, next) => {
            try {
                console.log(`📊 GET /api/report/lar-dashboard - Query params:`, req.query);
                const parseArray = (value) => {
                    if (!value)
                        return undefined;
                    if (Array.isArray(value))
                        return value;
                    return [value];
                };
                const queryParams = {
                    dateFrom: req.query.dateFrom,
                    dateTo: req.query.dateTo,
                    model: req.query.model,
                    models: parseArray(req.query.models),
                    productionSites: parseArray(req.query.productionSites),
                    customerSites: parseArray(req.query.customerSites),
                    productFamilies: parseArray(req.query.productFamilies),
                    productTypes: parseArray(req.query.productTypes),
                };
                Object.keys(queryParams).forEach(key => {
                    if (queryParams[key] === undefined) {
                        delete queryParams[key];
                    }
                });
                const result = await this.service.getLARDashboard(queryParams);
                if (result.success) {
                    console.log(`✅ GET /api/report/lar-dashboard - Success: ${result.data?.length || 0} records`);
                    res.status(200).json(result);
                }
                else {
                    console.log(`❌ GET /api/report/lar-dashboard - Error: ${result.message}`);
                    res.status(400).json(result);
                }
            }
            catch (error) {
                console.error('❌ Error in ReportController.getLARDashboard:', error);
                next(error);
            }
        };
        this.getDPPMDashboard = async (req, res, next) => {
            try {
                console.log(`📊 GET /api/report/dppm-dashboard - Query params:`, req.query);
                const parseArray = (value) => {
                    if (!value)
                        return undefined;
                    if (Array.isArray(value))
                        return value;
                    return [value];
                };
                const queryParams = {
                    dateFrom: req.query.dateFrom,
                    dateTo: req.query.dateTo,
                    model: req.query.model,
                    models: parseArray(req.query.models),
                    productionSites: parseArray(req.query.productionSites),
                    customerSites: parseArray(req.query.customerSites),
                    productFamilies: parseArray(req.query.productFamilies),
                    productTypes: parseArray(req.query.productTypes),
                };
                Object.keys(queryParams).forEach(key => {
                    if (queryParams[key] === undefined) {
                        delete queryParams[key];
                    }
                });
                const result = await this.service.getDPPMDashboard(queryParams);
                if (result.success) {
                    console.log(`✅ GET /api/report/dppm-dashboard - Success: ${result.data?.length || 0} records`);
                    res.status(200).json(result);
                }
                else {
                    console.log(`❌ GET /api/report/dppm-dashboard - Error: ${result.message}`);
                    res.status(400).json(result);
                }
            }
            catch (error) {
                console.error('❌ Error in ReportController.getDPPMDashboard:', error);
                next(error);
            }
        };
        this.getUnderkillDashboard = async (req, res, next) => {
            try {
                console.log(`📊 GET /api/report/underkill-dashboard - Query params:`, req.query);
                const parseArray = (value) => {
                    if (!value)
                        return undefined;
                    if (Array.isArray(value))
                        return value;
                    return [value];
                };
                const queryParams = {
                    dateFrom: req.query.dateFrom,
                    dateTo: req.query.dateTo,
                    model: req.query.model,
                    models: parseArray(req.query.models),
                    productionSites: parseArray(req.query.productionSites),
                    customerSites: parseArray(req.query.customerSites),
                    productFamilies: parseArray(req.query.productFamilies),
                    productTypes: parseArray(req.query.productTypes),
                };
                Object.keys(queryParams).forEach(key => {
                    if (queryParams[key] === undefined) {
                        delete queryParams[key];
                    }
                });
                const result = await this.service.getUnderkillDashboard(queryParams);
                if (result.success) {
                    console.log(`✅ GET /api/report/underkill-dashboard - Success: ${result.data?.length || 0} records`);
                    res.status(200).json(result);
                }
                else {
                    console.log(`❌ GET /api/report/underkill-dashboard - Error: ${result.message}`);
                    res.status(400).json(result);
                }
            }
            catch (error) {
                console.error('❌ Error in ReportController.getUnderkillDashboard:', error);
                next(error);
            }
        };
        this.getTopDefect = async (req, res, next) => {
            try {
                console.log(`📊 GET /api/report/top-defect - Query params:`, req.query);
                const queryParams = {
                    dateFrom: req.query.dateFrom,
                    dateTo: req.query.dateTo,
                    productionSites: req.query.productionSites ? (Array.isArray(req.query.productionSites) ? req.query.productionSites : [req.query.productionSites]) : undefined,
                    customerSites: req.query.customerSites ? (Array.isArray(req.query.customerSites) ? req.query.customerSites : [req.query.customerSites]) : undefined,
                    productFamilies: req.query.productFamilies ? (Array.isArray(req.query.productFamilies) ? req.query.productFamilies : [req.query.productFamilies]) : undefined,
                    productTypes: req.query.productTypes ? (Array.isArray(req.query.productTypes) ? req.query.productTypes : [req.query.productTypes]) : undefined,
                    models: req.query.models ? (Array.isArray(req.query.models) ? req.query.models : [req.query.models]) : undefined,
                };
                Object.keys(queryParams).forEach(key => {
                    if (queryParams[key] === undefined) {
                        delete queryParams[key];
                    }
                });
                const result = await this.service.getTopDefect(queryParams);
                if (result.success) {
                    console.log(`✅ GET /api/report/top-defect - Success: ${result.data?.length || 0} records`);
                    res.status(200).json(result);
                }
                else {
                    console.log(`❌ GET /api/report/top-defect - Error: ${result.message}`);
                    res.status(400).json(result);
                }
            }
            catch (error) {
                console.error('❌ Error in ReportController.getTopDefect:', error);
                next(error);
            }
        };
        this.getProductionLineHeatmap = async (req, res, next) => {
            try {
                console.log(`📊 GET /api/report/production-line-heatmap - Query params:`, req.query);
                const queryParams = {
                    dateFrom: req.query.dateFrom,
                    dateTo: req.query.dateTo
                };
                Object.keys(queryParams).forEach(key => {
                    if (queryParams[key] === undefined) {
                        delete queryParams[key];
                    }
                });
                const result = await this.service.getProductionLineHeatmap(queryParams);
                if (result.success) {
                    console.log(`✅ GET /api/report/production-line-heatmap - Success: ${result.data?.length || 0} records`);
                    res.status(200).json(result);
                }
                else {
                    console.log(`❌ GET /api/report/production-line-heatmap - Error: ${result.message}`);
                    res.status(400).json(result);
                }
            }
            catch (error) {
                console.error('❌ Error in ReportController.getProductionLineHeatmap:', error);
                next(error);
            }
        };
        this.getProductQualityScorecard = async (req, res, next) => {
            try {
                console.log(`📊 GET /api/report/product-quality-scorecard - Query params:`, req.query);
                const queryParams = {
                    dateFrom: req.query.dateFrom,
                    dateTo: req.query.dateTo
                };
                Object.keys(queryParams).forEach(key => {
                    if (queryParams[key] === undefined) {
                        delete queryParams[key];
                    }
                });
                const result = await this.service.getProductQualityScorecard(queryParams);
                if (result.success) {
                    console.log(`✅ GET /api/report/product-quality-scorecard - Success: ${result.data?.length || 0} records`);
                    res.status(200).json(result);
                }
                else {
                    console.log(`❌ GET /api/report/product-quality-scorecard - Error: ${result.message}`);
                    res.status(400).json(result);
                }
            }
            catch (error) {
                console.error('❌ Error in ReportController.getProductQualityScorecard:', error);
                next(error);
            }
        };
        this.getDefectRootCause = async (req, res, next) => {
            try {
                console.log(`📊 GET /api/report/defect-root-cause - Query params:`, req.query);
                const queryParams = {
                    dateFrom: req.query.dateFrom,
                    dateTo: req.query.dateTo
                };
                Object.keys(queryParams).forEach(key => {
                    if (queryParams[key] === undefined) {
                        delete queryParams[key];
                    }
                });
                const result = await this.service.getDefectRootCause(queryParams);
                if (result.success) {
                    console.log(`✅ GET /api/report/defect-root-cause - Success: ${result.data?.length || 0} records`);
                    res.status(200).json(result);
                }
                else {
                    console.log(`❌ GET /api/report/defect-root-cause - Error: ${result.message}`);
                    res.status(400).json(result);
                }
            }
            catch (error) {
                console.error('❌ Error in ReportController.getDefectRootCause:', error);
                next(error);
            }
        };
        this.getMonthlyQualityTrend = async (req, res, next) => {
            try {
                console.log(`📊 GET /api/report/monthly-quality-trend - Query params:`, req.query);
                const queryParams = {
                    dateFrom: req.query.dateFrom,
                    dateTo: req.query.dateTo
                };
                Object.keys(queryParams).forEach(key => {
                    if (queryParams[key] === undefined) {
                        delete queryParams[key];
                    }
                });
                const result = await this.service.getMonthlyQualityTrend(queryParams);
                if (result.success) {
                    console.log(`✅ GET /api/report/monthly-quality-trend - Success: ${result.data?.length || 0} records`);
                    res.status(200).json(result);
                }
                else {
                    console.log(`❌ GET /api/report/monthly-quality-trend - Error: ${result.message}`);
                    res.status(400).json(result);
                }
            }
            catch (error) {
                console.error('❌ Error in ReportController.getMonthlyQualityTrend:', error);
                next(error);
            }
        };
        this.getModelsSGAIQA = async (req, res, next) => {
            try {
                const { year, ww, fyww } = req.query;
                const fywwValue = fyww
                    || (year && ww ? `${year}${String(ww).padStart(2, '0')}` : undefined);
                console.log(`📋 GET /api/report/getModelsSGAIQA - fyww: ${fywwValue}`);
                const result = await this.service.getModelsSGAIQA(fywwValue);
                if (result.success) {
                    console.log(`✅ GET /api/report/getModelsSGAIQA - Success: ${result.data?.length || 0} models`);
                    res.status(200).json(result);
                }
                else {
                    console.log(`❌ GET /api/report/getModelsSGAIQA - Error: ${result.message}`);
                    res.status(400).json(result);
                }
            }
            catch (error) {
                console.error('❌ Error in LARReportController.getModelsSGAIQA:', error);
                next(error);
            }
        };
        this.getProductFamiliesSGAIQA = async (req, res, next) => {
            try {
                const { year, ww, fyww } = req.query;
                const fywwValue = fyww
                    || (year && ww ? `${year}${String(ww).padStart(2, '0')}` : undefined);
                console.log(`📋 GET /api/report/productFamiliesSGAIQA - fyww: ${fywwValue}`);
                const result = await this.service.getProductFamiliesSGAIQA(fywwValue);
                if (result.success) {
                    console.log(`✅ GET /api/report/productFamiliesSGAIQA - Success: ${result.data?.length || 0} product families`);
                    res.status(200).json(result);
                }
                else {
                    console.log(`❌ GET /api/report/productFamiliesSGAIQA - Error: ${result.message}`);
                    res.status(400).json(result);
                }
            }
            catch (error) {
                console.error('❌ Error in LARReportController.getProductFamiliesSGAIQA:', error);
                next(error);
            }
        };
        this.getFiscalYears = async (req, res, next) => {
            try {
                console.log(`📋 GET /api/report-lar/fiscal-years`);
                const { report } = req.params;
                const result = await this.service.getFiscalYears(report);
                if (result.success) {
                    console.log(`✅ GET /api/report-lar/fiscal-years - Success: ${result.data?.length || 0} fiscal years`);
                    res.status(200).json(result);
                }
                else {
                    console.log(`❌ GET /api/report-lar/fiscal-years - Error: ${result.message}`);
                    res.status(400).json(result);
                }
            }
            catch (error) {
                console.error('❌ Error in LARReportController.getFiscalYears:', error);
                next(error);
            }
        };
        this.getWorkWeeks = async (req, res, next) => {
            try {
                const fiscalYear = req.query.fy;
                console.log(`📋 GET /api/report-lar/work-weeks - fiscalYear:`, fiscalYear);
                const { report } = req.params;
                const result = await this.service.getWorkWeeks(report, fiscalYear);
                if (result.success) {
                    console.log(`✅ GET /api/report-lar/work-weeks - Success: ${result.data?.length || 0} work weeks`);
                    res.status(200).json(result);
                }
                else {
                    console.log(`❌ GET /api/report-lar/work-weeks - Error: ${result.message}`);
                    res.status(400).json(result);
                }
            }
            catch (error) {
                console.error('❌ Error in LARReportController.getWorkWeeks:', error);
                next(error);
            }
        };
        this.getSeagateIQAResult = async (req, res, next) => {
            try {
                const yearFrom = req.query.yearFrom;
                const wwFrom = req.query.wwFrom;
                console.log(`📊 GET /api/report-lar/seagate-iqa-result - Query params:`, { yearFrom, wwFrom });
                if (!yearFrom || !wwFrom) {
                    res.status(400).json({
                        success: false,
                        message: 'Year and WW parameters are required'
                    });
                    return;
                }
                const result = await this.service.getSeagateIQAResult({ yearFrom, wwFrom });
                if (result.success) {
                    console.log(`✅ GET /api/report-lar/seagate-iqa-result - Success: ${result.data?.length || 0} records`);
                    res.status(200).json(result);
                }
                else {
                    console.log(`❌ GET /api/report-lar/seagate-iqa-result - Error: ${result.message}`);
                    res.status(400).json(result);
                }
            }
            catch (error) {
                console.error('❌ Error in ReportController.getSeagateIQAResult:', error);
                next(error);
            }
        };
        this.getHistoryTracking = async (req, res, next) => {
            try {
                console.log(`📊 GET /api/report/history-tracking - Query params:`, req.query);
                const lotNumbersParam = req.query.lotNumbers;
                if (!lotNumbersParam) {
                    res.status(400).json({
                        success: false,
                        message: 'lotNumbers query parameter is required'
                    });
                    return;
                }
                const lotNumbers = lotNumbersParam.split(',').map(s => s.trim()).filter(s => s.length > 0);
                const result = await this.service.getHistoryTracking(lotNumbers);
                if (result.success) {
                    console.log(`✅ GET /api/report/history-tracking - Success: ${result.data?.length || 0} records`);
                    res.status(200).json(result);
                }
                else {
                    console.log(`❌ GET /api/report/history-tracking - Error: ${result.message}`);
                    res.status(400).json(result);
                }
            }
            catch (error) {
                console.error('❌ Error in ReportController.getHistoryTracking:', error);
                next(error);
            }
        };
        this.getDefectImageSummary = async (req, res, next) => {
            try {
                console.log(`📊 GET /api/report/defect-image-summary - Query params:`, req.query);
                const parseArray = (value) => {
                    if (!value)
                        return undefined;
                    if (Array.isArray(value))
                        return value;
                    return [value];
                };
                const params = {
                    dateFrom: req.query.dateFrom,
                    dateTo: req.query.dateTo,
                    sites: parseArray(req.query.sites),
                    customerSites: parseArray(req.query.customerSites),
                    productFamilies: parseArray(req.query.productFamilies),
                    productTypes: parseArray(req.query.productTypes),
                    models: parseArray(req.query.models),
                    defects: parseArray(req.query.defects),
                };
                if (!params.dateFrom || !params.dateTo) {
                    res.status(400).json({
                        success: false,
                        message: 'dateFrom and dateTo query parameters are required'
                    });
                    return;
                }
                const result = await this.service.getDefectImageSummary(params);
                if (result.success) {
                    console.log(`✅ GET /api/report/defect-image-summary - Success: ${result.data?.length || 0} records`);
                    res.status(200).json(result);
                }
                else {
                    console.log(`❌ GET /api/report/defect-image-summary - Error: ${result.message}`);
                    res.status(400).json(result);
                }
            }
            catch (error) {
                console.error('❌ Error in ReportController.getDefectImageSummary:', error);
                next(error);
            }
        };
        this.getPartsFilterOptions = async (req, res, next) => {
            try {
                const parseArray = (value) => {
                    if (!value)
                        return undefined;
                    if (Array.isArray(value))
                        return value;
                    return [value];
                };
                let customerSites;
                if (req.query.customerSites) {
                    customerSites = parseArray(req.query.customerSites);
                }
                else if (req.query.customerSite) {
                    customerSites = [req.query.customerSite];
                }
                else {
                    res.status(400).json({ success: false, message: 'customerSites query parameter is required' });
                    return;
                }
                const productFamilies = parseArray(req.query.productFamilies);
                const productTypes = parseArray(req.query.productTypes);
                const result = await this.service.getPartsFilterOptions({
                    customerSites,
                    productFamilies,
                    productTypes,
                });
                if (result.success) {
                    res.status(200).json(result);
                }
                else {
                    res.status(400).json(result);
                }
            }
            catch (error) {
                console.error('❌ Error in ReportController.getPartsFilterOptions:', error);
                next(error);
            }
        };
        this.getIQAOQADppmOverallChart = async (req, res, next) => {
            try {
                console.log(`📊 GET /api/report/iqa-oqa-dppm-overall-chart - Query params:`, req.query);
                const queryParams = {
                    yearTo: req.query.yearTo,
                    wwTo: req.query.wwTo
                };
                Object.keys(queryParams).forEach(key => {
                    if (queryParams[key] === undefined) {
                        delete queryParams[key];
                    }
                });
                const result = await this.service.getIQAOQADppmOverallChart(queryParams);
                if (result.success) {
                    console.log(`✅ GET /api/report/iqa-oqa-dppm-overall-chart - Success: ${result.data?.length || 0} records`);
                    res.status(200).json(result);
                }
                else {
                    console.log(`❌ GET /api/report/iqa-oqa-dppm-overall-chart - Error: ${result.message}`);
                    res.status(400).json(result);
                }
            }
            catch (error) {
                console.error('❌ Error in ReportController.getIQAOQADPPMOverallChart:', error);
                next(error);
            }
        };
        this.getOQADppmOverallChart = async (req, res, next) => {
            try {
                console.log(`📊 GET /api/report/oqa-dppm-overall-chart - Query params:`, req.query);
                const queryParams = {
                    yearFrom: req.query.year,
                    wwFrom: req.query.ww
                };
                Object.keys(queryParams).forEach(key => {
                    if (queryParams[key] === undefined) {
                        delete queryParams[key];
                    }
                });
                const result = await this.service.getOQADppmOverallChart(queryParams);
                if (result.success) {
                    console.log(`✅ GET /api/report/oqa-dppm-overall-chart - Success: ${result.data?.length || 0} records`);
                    res.status(200).json(result);
                }
                else {
                    console.log(`❌ GET /api/report/oqa-dppm-overall-chart - Error: ${result.message}`);
                    res.status(400).json(result);
                }
            }
            catch (error) {
                console.error('❌ Error in ReportController.getOQADPPMOverallChart:', error);
                next(error);
            }
        };
        this.getOQADppmOverallDefect = async (req, res, next) => {
            try {
                console.log(`📊 GET /api/report/oqa-dppm-overall-defect - Query params:`, req.query);
                const queryParams = {
                    yearFrom: req.query.yearFrom,
                    wwFrom: req.query.wwFrom
                };
                Object.keys(queryParams).forEach(key => {
                    if (queryParams[key] === undefined) {
                        delete queryParams[key];
                    }
                });
                const result = await this.service.getOQADppmOverallDefect(queryParams);
                if (result.success) {
                    console.log(`✅ GET /api/report/oqa-dppm-overall-defect - Success: ${result.data?.length || 0} defect records`);
                    res.status(200).json(result);
                }
                else {
                    console.log(`❌ GET /api/report/oqa-dppm-overall-defect - Error: ${result.message}`);
                    res.status(400).json(result);
                }
            }
            catch (error) {
                console.error('❌ Error in ReportController.getOQADPPMOverallDefect:', error);
                next(error);
            }
        };
        this.getSGTIQATrendChart = async (req, res, next) => {
            try {
                console.log(`📊 GET /api/report/sgt-iqa-trend-chart - Query params:`, req.query);
                const queryParams = {
                    yearTo: (req.query.year || req.query.yearTo),
                    wwTo: (req.query.ww || req.query.wwTo),
                    model: req.query.model,
                    models: req.query.models ? (Array.isArray(req.query.models) ? req.query.models : [req.query.models]) : undefined,
                    productFamilies: req.query.productFamilies ? (Array.isArray(req.query.productFamilies) ? req.query.productFamilies : [req.query.productFamilies]) : undefined,
                    product_type: req.query.product_type
                };
                Object.keys(queryParams).forEach(key => {
                    if (queryParams[key] === undefined) {
                        delete queryParams[key];
                    }
                });
                const result = await this.service.getSGTIQATrendChart(queryParams);
                if (result.success) {
                    console.log(`✅ GET /api/report/sgt-iqa-trend-chart - Success: ${result.data?.length || 0} records`);
                    res.status(200).json(result);
                }
                else {
                    console.log(`❌ GET /api/report/sgt-iqa-trend-chart - Error: ${result.message}`);
                    res.status(400).json(result);
                }
            }
            catch (error) {
                console.error('❌ Error in ReportController.getSGTIQATrendChart:', error);
                next(error);
            }
        };
        this.getSGTIQATrendDefect = async (req, res, next) => {
            try {
                console.log(`📊 GET /api/report/sgt-iqa-trend-defect - Query params:`, req.query);
                const queryParams = {
                    yearTo: (req.query.year || req.query.yearTo),
                    wwTo: (req.query.ww || req.query.wwTo),
                    model: req.query.model,
                    models: req.query.models ? (Array.isArray(req.query.models) ? req.query.models : [req.query.models]) : undefined,
                    productFamilies: req.query.productFamilies ? (Array.isArray(req.query.productFamilies) ? req.query.productFamilies : [req.query.productFamilies]) : undefined,
                    product_type: req.query.product_type
                };
                Object.keys(queryParams).forEach(key => {
                    if (queryParams[key] === undefined) {
                        delete queryParams[key];
                    }
                });
                const result = await this.service.getSGTIQATrendDefect(queryParams);
                if (result.success) {
                    console.log(`✅ GET /api/report/sgt-iqa-trend-defect - Success: ${result.data?.length || 0} defect records`);
                    res.status(200).json(result);
                }
                else {
                    console.log(`❌ GET /api/report/sgt-iqa-trend-defect - Error: ${result.message}`);
                    res.status(400).json(result);
                }
            }
            catch (error) {
                console.error('❌ Error in ReportController.getSGTIQATrendDefect:', error);
                next(error);
            }
        };
        this.getOQAVisualInspection = async (req, res, next) => {
            try {
                console.log(`📊 GET /api/report/oqa-vi-dashboard - Query params:`, req.query);
                const parseArray = (value) => {
                    if (!value)
                        return undefined;
                    if (Array.isArray(value))
                        return value;
                    return [value];
                };
                const queryParams = {
                    isCustomerReport: req.query.isCustomerReport === 'true',
                    dateFrom: req.query.dateFrom,
                    dateTo: req.query.dateTo,
                    model: req.query.model,
                    models: parseArray(req.query.models),
                    productionSites: parseArray(req.query.productionSites),
                    customerSites: parseArray(req.query.customerSites),
                    productFamilies: parseArray(req.query.productFamilies),
                    productTypes: parseArray(req.query.productTypes),
                };
                Object.keys(queryParams).forEach(key => {
                    if (queryParams[key] === undefined) {
                        delete queryParams[key];
                    }
                });
                const result = await this.service.getOQAVisualInspection(queryParams);
                if (result.success) {
                    console.log(`✅ GET /api/report/oqa-vi-dashboard - Success: ${result.data?.length || 0} records`);
                    res.status(200).json(result);
                }
                else {
                    console.log(`❌ GET /api/report/oqa-vi-dashboard - Error: ${result.message}`);
                    res.status(400).json(result);
                }
            }
            catch (error) {
                console.error('❌ Error in ReportController.getOQAVisualInspection:', error);
                next(error);
            }
        };
        this.getDefectTypeAnalysis = async (req, res, next) => {
            try {
                console.log(`📊 GET /api/report/defect-type-analysis - Query params:`, req.query);
                const dateFrom = req.query.dateFrom;
                const dateTo = req.query.dateTo;
                const models = req.query.models
                    ? (Array.isArray(req.query.models) ? req.query.models : [req.query.models])
                    : undefined;
                const shifts = req.query.shifts
                    ? (Array.isArray(req.query.shifts) ? req.query.shifts : [req.query.shifts])
                    : undefined;
                if (!dateFrom || !dateTo) {
                    res.status(400).json({
                        success: false,
                        message: 'dateFrom and dateTo query parameters are required'
                    });
                    return;
                }
                const result = await this.service.getDefectTypeAnalysis(dateFrom, dateTo, models, shifts);
                if (result.success) {
                    console.log(`✅ GET /api/report/defect-type-analysis - Success: ${result.data?.length || 0} records`);
                    res.status(200).json(result);
                }
                else {
                    console.log(`❌ GET /api/report/defect-type-analysis - Error: ${result.message}`);
                    res.status(400).json(result);
                }
            }
            catch (error) {
                console.error('❌ Error in ReportController.getDefectTypeAnalysis:', error);
                next(error);
            }
        };
        this.getOverviewOQA = async (req, res, next) => {
            try {
                console.log(`📊 GET /api/report/overview-oqa - Query params:`, req.query);
                const yearFrom = req.query.yearFrom;
                const wwFrom = req.query.wwFrom;
                const models = req.query.models
                    ? (Array.isArray(req.query.models) ? req.query.models : [req.query.models])
                    : undefined;
                if (!yearFrom || !wwFrom) {
                    res.status(400).json({
                        success: false,
                        message: 'yearFrom and wwFrom parameters are required'
                    });
                    return;
                }
                const result = await this.service.getOverviewOQA({ yearFrom, wwFrom, models });
                if (result.success) {
                    console.log(`✅ GET /api/report/overview-oqa - Success: ${result.data?.length || 0} records`);
                    res.status(200).json(result);
                }
                else {
                    console.log(`❌ GET /api/report/overview-oqa - Error: ${result.message}`);
                    res.status(400).json(result);
                }
            }
            catch (error) {
                console.error('❌ Error in ReportController.getOverviewOQA:', error);
                next(error);
            }
        };
        this.getOverviewOQALotDetail = async (req, res, next) => {
            try {
                const fy = req.query.fy;
                const ww = req.query.ww;
                const partno_customer = req.query.partno_customer;
                const defect_group = req.query.defect_group;
                if (!fy || !ww || !partno_customer || !defect_group) {
                    res.status(400).json({
                        success: false,
                        message: 'fy, ww, partno_customer and defect_group parameters are required'
                    });
                    return;
                }
                const result = await this.service.getOverviewOQALotDetail(fy, ww, partno_customer, defect_group);
                if (result.success) {
                    res.status(200).json(result);
                }
                else {
                    res.status(400).json(result);
                }
            }
            catch (error) {
                console.error('❌ Error in ReportController.getOverviewOQALotDetail:', error);
                next(error);
            }
        };
        this.getSOQMWeekly = async (req, res, next) => {
            try {
                console.log(`📊 GET /api/report/soqm-weekly - Query params:`, req.query);
                const parseArray = (value) => {
                    if (!value)
                        return undefined;
                    if (Array.isArray(value))
                        return value;
                    return [value];
                };
                const queryParams = {
                    yearFrom: req.query.yearFrom,
                    wwFrom: req.query.wwFrom,
                    yearTo: req.query.yearTo,
                    wwTo: req.query.wwTo,
                    model: req.query.model,
                    models: parseArray(req.query.models),
                    customerSites: parseArray(req.query.customerSites),
                    lotno: req.query.lotno,
                };
                Object.keys(queryParams).forEach(key => {
                    if (queryParams[key] === undefined) {
                        delete queryParams[key];
                    }
                });
                const result = await this.service.getSOQMWeekly(queryParams);
                if (result.success) {
                    console.log(`✅ GET /api/report/soqm-weekly - Success`);
                    res.status(200).json(result);
                }
                else {
                    console.log(`❌ GET /api/report/soqm-weekly - Error: ${result.message}`);
                    res.status(400).json(result);
                }
            }
            catch (error) {
                console.error('❌ Error in ReportController.getSOQMWeekly:', error);
                next(error);
            }
        };
        this.getSOQMDaily = async (req, res, next) => {
            try {
                console.log(`📊 GET /api/report/soqm-daily - Query params:`, req.query);
                const parseArray = (value) => {
                    if (!value)
                        return undefined;
                    if (Array.isArray(value))
                        return value;
                    return [value];
                };
                const queryParams = {
                    yearFrom: req.query.yearFrom,
                    wwFrom: req.query.wwFrom,
                    yearTo: req.query.yearTo,
                    wwTo: req.query.wwTo,
                    model: req.query.model,
                    models: parseArray(req.query.models),
                    customerSites: parseArray(req.query.customerSites),
                    lotno: req.query.lotno,
                };
                Object.keys(queryParams).forEach(key => {
                    if (queryParams[key] === undefined) {
                        delete queryParams[key];
                    }
                });
                const result = await this.service.getSOQMDaily(queryParams);
                if (result.success) {
                    console.log(`✅ GET /api/report/soqm-daily - Success: ${result.data?.length || 0} records`);
                    res.status(200).json(result);
                }
                else {
                    console.log(`❌ GET /api/report/soqm-daily - Error: ${result.message}`);
                    res.status(400).json(result);
                }
            }
            catch (error) {
                console.error('❌ Error in ReportController.getSOQMDaily:', error);
                next(error);
            }
        };
        this.getFVIInspection = async (req, res, next) => {
            try {
                console.log(`📊 GET /api/report/fvi-inspection - Query params:`, req.query);
                const params = {
                    inputDateFrom: req.query.inputDateFrom,
                    inputDateTo: req.query.inputDateTo,
                    lotno: req.query.lotno,
                    judgment: req.query.judgment,
                };
                const result = await this.service.getFVIInspection(params);
                if (result.success) {
                    console.log(`✅ GET /api/report/fvi-inspection - Success: ${result.data?.length || 0} records`);
                    res.status(200).json(result);
                }
                else {
                    console.log(`❌ GET /api/report/fvi-inspection - Error: ${result.message}`);
                    res.status(400).json(result);
                }
            }
            catch (error) {
                console.error('❌ Error in ReportController.getFVIInspection:', error);
                next(error);
            }
        };
        this.deleteFVILotInput = async (req, res, next) => {
            try {
                const lotno = req.params.lotno;
                console.log(`🗑️ DELETE /api/report/fvi-inspection/lotno/${lotno}`);
                if (!lotno || !lotno.trim()) {
                    res.status(400).json({ success: false, message: 'Lot number is required' });
                    return;
                }
                const result = await this.service.deleteFVILotInput(lotno.trim());
                if (result.success) {
                    console.log(`✅ DELETE fvi-inspection lotno - Success: ${result.deletedCount} deleted`);
                    res.status(200).json(result);
                }
                else {
                    console.log(`❌ DELETE fvi-inspection lotno - Error: ${result.message}`);
                    res.status(400).json(result);
                }
            }
            catch (error) {
                console.error('❌ Error in ReportController.deleteFVILotInput:', error);
                next(error);
            }
        };
        this.service = service;
    }
}
exports.ReportController = ReportController;
function createeportController(service) {
    return new ReportController(service);
}
exports.default = ReportController;
