// client/src/pages/report/LARPage.tsx
// ===== LINE ACCEPTANCE RATE (LAR) REPORT PAGE =====
// Internal LAR Report - Uses shared base component with full filters
// Manufacturing/Quality Control System - Orange Theme Implementation

import React from 'react';
import LARReportBase, {type LARReportConfig, type DataSourceFunctions } from '../../components/report/LARReportBase';
import {
  getLARChart,
  getLARDefect,
  getModelsLAR,
  getFiscalYearsLAR,
  getWorkWeeksLAR,
  buildCustomerDateRangeParams,
  getDefaultDateRange
} from '../../services/reportService';

// Data source for internal LAR report (OQA station, round 1)
// Uses buildCustomerDateRangeParams to ensure default date range is applied
const internalDataSource: DataSourceFunctions = {
  fetchChartData: (params) => getLARChart(buildCustomerDateRangeParams({ ...params, isCustomerReport: false })),
  fetchDefectData: (params) => getLARDefect(buildCustomerDateRangeParams({ ...params, isCustomerReport: false })),
  fetchModels: (params) => getModelsLAR(buildCustomerDateRangeParams({ ...params, isCustomerReport: false })),
  fetchFiscalYears: getFiscalYearsLAR,
  fetchWorkWeeks: getWorkWeeksLAR
};

// Configuration for internal LAR report
const internalLARConfig: LARReportConfig = {
  // Report metadata
  title: 'OQA VMI LAR Report',
  breadcrumbTitle: 'LAR Report',

  // Show all filters for internal report
  showDateRangeFilters: true,
  showModelFilter: true,

  // All filters are required for internal report
  dateRangeRequired: true,
  modelRequired: true,

  // Data source configuration
  dataSource: internalDataSource,

  // Default date range to display (backward 91 days to current)
  defaultDateRange: getDefaultDateRange(),

  // Auto-load data on mount with all models
  autoLoadOnMount: true,
  autoSelectAllModels: true,

  // Additional fixed parameters (station='OQA' and round=1 are handled by server)
  additionalParams: {
    isCustomerReport: false
  }
};

const LARPage: React.FC = () => {
  return <LARReportBase config={internalLARConfig} />;
};

export default LARPage;
