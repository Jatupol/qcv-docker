// client/src/pages/report/customer/SGTIQATrendCustomerPage.tsx
// ===== SGT IQA TREND CUSTOMER REPORT PAGE =====
// Customer SGT IQA Trend Report - Uses shared base component with Model filter only
// Manufacturing/Quality Control System - Orange Theme Implementation

import React from 'react';
import SGTIQATrendReportBase, { type SGTIQATrendReportConfig, type DataSourceFunctions } from '../../../components/report/SGTIQATrendReportBase';
import { getSGTIQATrendChart, getSGTIQATrendDefect, getModelsSGAIQA, getFiscalYearsTrend, getWorkWeeksTrend } from '../../../services/reportService';
import { getPreviousFiscalWeek } from '@qcv/shared';

const prevWeek = getPreviousFiscalWeek();

// Data source for customer SGT IQA Trend report
// You can customize these functions to call different endpoints if needed
// For example: '/report/customer-sgt-iqa-trend-chart' instead of '/report/sgt-iqa-trend-chart'
const customerSGTIQATrendDataSource: DataSourceFunctions = {
  // Option 1: Use same endpoints (current implementation)
  fetchChartData: getSGTIQATrendChart,
  fetchDefectData: getSGTIQATrendDefect,
  fetchModels: getModelsSGAIQA,
  fetchFiscalYears: getFiscalYearsTrend,
  fetchWorkWeeks: getWorkWeeksTrend

  // Option 2: Use different customer-specific endpoints (example)
  // fetchChartData: async (params) => {
  //   // Call customer-specific endpoint
  //   return await api.get('/report/customer-sgt-iqa-trend-chart', params);
  // },
  // fetchDefectData: async (params) => {
  //   return await api.get('/report/customer-sgt-iqa-trend-defect', params);
  // },
  // ... etc
};

// Configuration for customer SGT IQA Trend report
const customerSGTIQATrendConfig: SGTIQATrendReportConfig = {
  // Report metadata
  title: 'SGT IQA Trend',
  breadcrumbTitle: 'SGT IQA Trend',

  // Show date and model filters, hide product type filter for customer report
  showDateFilters: true,
  showModelFilter: true,
  showProductTypeFilter: false,

  // Nothing is required (auto-loaded)
  dateRequired: false,
  modelRequired: false,

  // Data source configuration
  dataSource: customerSGTIQATrendDataSource,

  // Default date range to display (previous work week)
  defaultDateRange: {
    yearTo: prevWeek.fiscalYear.toString(),
    wwTo: prevWeek.weekNumber.toString()  // No padding - will be normalized by component
  },

  // Auto-load data on mount with all models
  autoLoadOnMount: true,
  autoSelectAllModels: true,

  // Additional fixed parameters for customer report
  additionalParams: {
    isCustomerReport: true
  }
};

const SGTIQATrendCustomerPage: React.FC = () => {
  return <SGTIQATrendReportBase config={customerSGTIQATrendConfig} />;
};

export default SGTIQATrendCustomerPage;
