// client/src/pages/report/customer/LARCustomerPage.tsx
// ===== LINE ACCEPTANCE RATE (LAR) CUSTOMER REPORT PAGE =====
// Customer LAR Report - Uses shared base component with Model filter only
// Manufacturing/Quality Control System - Orange Theme Implementation

import React from 'react';
import LARReportBase, {type LARReportConfig, type DataSourceFunctions } from '../../../components/report/LARReportBase';
import { 
  getLARChart, 
  getLARDefect, 
  getModelsLAR, 
  getFiscalYearsLAR, 
  getWorkWeeksLAR, 
  buildCustomerDateRangeParams, 
  getDefaultDateRange 
} from '../../../services/reportService';

// Data source for customer LAR report
// Uses same endpoints as LARPage but with isCustomerReport: true and default date range
const customerDataSource: DataSourceFunctions = {
  fetchChartData: (params) => getLARChart(buildCustomerDateRangeParams({ ...params, isCustomerReport: true })),
  fetchDefectData: (params) => getLARDefect(buildCustomerDateRangeParams({ ...params, isCustomerReport: true })),
  fetchModels: (params) => getModelsLAR(buildCustomerDateRangeParams({ ...params, isCustomerReport: true })),
  fetchFiscalYears: getFiscalYearsLAR,
  fetchWorkWeeks: getWorkWeeksLAR
};

// Configuration for customer LAR report
const customerLARConfig: LARReportConfig = {
  // Report metadata
  title: 'LAR Report',
  breadcrumbTitle: 'LAR Report',

  // Show model filter but hide date range filters for customer report
  showDateRangeFilters: true,
  showModelFilter: true,

  // Date range and model are not required (auto-loaded)
  dateRangeRequired: true,
  modelRequired: true,

  // Data source configuration
  dataSource: customerDataSource,

  // Default date range to display (backward 98 days to current)
  defaultDateRange: getDefaultDateRange(),

  // Auto-load data on mount with all models
  autoLoadOnMount: true,
  autoSelectAllModels: true,

  // Additional fixed parameters for customer report
  additionalParams: {
    isCustomerReport: true
  }
};

const LARCustomerPage: React.FC = () => {
  return <LARReportBase config={customerLARConfig} />;
};

export default LARCustomerPage;
