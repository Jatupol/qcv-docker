"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = createReportRoutes;
exports.createLARReportRoutesWithController = createLARReportRoutesWithController;
const express_1 = require("express");
const controller_1 = require("./controller");
const service_1 = require("./service");
const model_1 = require("./model");
function createReportRoutes(db) {
    const router = (0, express_1.Router)();
    const model = new model_1.ReportModel(db);
    const service = new service_1.ReportService(model);
    const controller = new controller_1.ReportController(service);
    router.get('/lar-chart', (req, res, next) => {
        controller.getLARChart(req, res, next);
    });
    router.get('/lar-defect', (req, res, next) => {
        controller.getLARDefect(req, res, next);
    });
    router.get('/sgt-iqa-trend-chart', (req, res, next) => {
        controller.getSGTIQATrendChart(req, res, next);
    });
    router.get('/sgt-iqa-trend-defect', (req, res, next) => {
        controller.getSGTIQATrendDefect(req, res, next);
    });
    router.get('/models', (req, res, next) => {
        controller.getAvailableModels(req, res, next);
    });
    router.get('/modelsSGAIQA', (req, res, next) => {
        controller.getModelsSGAIQA(req, res, next);
    });
    router.get('/productFamiliesSGAIQA', (req, res, next) => {
        controller.getProductFamiliesSGAIQA(req, res, next);
    });
    router.get('/modelsLAR', (req, res, next) => {
        controller.getModelsLAR(req, res, next);
    });
    router.get('/modelsDashboard', (req, res, next) => {
        controller.getModelsDashboard(req, res, next);
    });
    router.get('/lar-dashboard', (req, res, next) => {
        controller.getLARDashboard(req, res, next);
    });
    router.get('/dppm-dashboard', (req, res, next) => {
        controller.getDPPMDashboard(req, res, next);
    });
    router.get('/underkill-dashboard', (req, res, next) => {
        controller.getUnderkillDashboard(req, res, next);
    });
    router.get('/top-defect', (req, res, next) => {
        controller.getTopDefect(req, res, next);
    });
    router.get('/production-line-heatmap', (req, res, next) => {
        controller.getProductionLineHeatmap(req, res, next);
    });
    router.get('/product-quality-scorecard', (req, res, next) => {
        controller.getProductQualityScorecard(req, res, next);
    });
    router.get('/defect-root-cause', (req, res, next) => {
        controller.getDefectRootCause(req, res, next);
    });
    router.get('/monthly-quality-trend', (req, res, next) => {
        controller.getMonthlyQualityTrend(req, res, next);
    });
    router.get('/parts-filter-options', (req, res, next) => {
        controller.getPartsFilterOptions(req, res, next);
    });
    router.get('/defect-image-summary', (req, res, next) => {
        controller.getDefectImageSummary(req, res, next);
    });
    router.get('/history-tracking', (req, res, next) => {
        controller.getHistoryTracking(req, res, next);
    });
    router.get('/fiscal-years/:report', (req, res, next) => {
        controller.getFiscalYears(req, res, next);
    });
    router.get('/work-weeks/:report', (req, res, next) => {
        controller.getWorkWeeks(req, res, next);
    });
    router.get('/seagate-iqa-result', (req, res, next) => {
        controller.getSeagateIQAResult(req, res, next);
    });
    router.get('/iqa-oqa-dppm-overall-chart', (req, res, next) => {
        controller.getIQAOQADppmOverallChart(req, res, next);
    });
    router.get('/oqa-dppm-overall-chart', (req, res, next) => {
        controller.getOQADppmOverallChart(req, res, next);
    });
    router.get('/oqa-dppm-overall-defect', (req, res, next) => {
        controller.getOQADppmOverallDefect(req, res, next);
    });
    router.get('/sgt-iqa-trend-chart', (req, res, next) => {
        controller.getSGTIQATrendChart(req, res, next);
    });
    router.get('/sgt-iqa-trend-defect', (req, res, next) => {
        controller.getSGTIQATrendDefect(req, res, next);
    });
    router.get('/oqa-vi-dashboard', (req, res, next) => {
        controller.getOQAVisualInspection(req, res, next);
    });
    router.get('/defect-type-analysis', (req, res, next) => {
        controller.getDefectTypeAnalysis(req, res, next);
    });
    router.get('/overview-oqa', (req, res, next) => {
        controller.getOverviewOQA(req, res, next);
    });
    router.get('/overview-oqa-lot-detail', (req, res, next) => {
        controller.getOverviewOQALotDetail(req, res, next);
    });
    router.get('/soqm-weekly', (req, res, next) => {
        controller.getSOQMWeekly(req, res, next);
    });
    router.get('/soqm-daily', (req, res, next) => {
        controller.getSOQMDaily(req, res, next);
    });
    router.get('/fvi-inspection', (req, res, next) => {
        controller.getFVIInspection(req, res, next);
    });
    router.delete('/fvi-inspection/lotno/:lotno', (req, res, next) => {
        controller.deleteFVILotInput(req, res, next);
    });
    return router;
}
function createLARReportRoutesWithController(controller) {
    const router = (0, express_1.Router)();
    router.get('/lar-chart', controller.getLARChart);
    router.get('/lar-defect', controller.getLARDefect);
    router.get('/models', controller.getAvailableModels);
    router.get('/modelsLAR', controller.getModelsLAR);
    router.get('/lar-fiscal-years', controller.getFiscalYears);
    router.get('/lar-work-weeks', controller.getWorkWeeks);
    router.get('/seagate-iqa-result', controller.getSeagateIQAResult);
    router.get('/oqa-dppm-overall-chart', controller.getOQADppmOverallChart);
    router.get('/oqa-dppm-overall-defect', controller.getOQADppmOverallDefect);
    router.get('/sgt-iqa-trend-chart', controller.getSGTIQATrendChart);
    router.get('/sgt-iqa-trend-defect', controller.getSGTIQATrendDefect);
    return router;
}
