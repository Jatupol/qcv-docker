// client/src/pages/report/SGTIQATrendPage.tsx
// ===== SGT IQA TREND REPORT PAGE =====
// Complete Separation Entity Architecture - SGT vs OQA Trend Visualization
// Manufacturing/Quality Control System - Orange Theme Implementation

import React from 'react';
import SGTIQATrendReportBase, { type SGTIQATrendReportConfig, type DataSourceFunctions } from '../../components/report/SGTIQATrendReportBase';
import { getSGTIQATrendChart, getSGTIQATrendDefect, getModelsSGAIQA, getFiscalYearsTrend, getWorkWeeksTrend } from '../../services/reportService';
import { getCurrentFiscalYear, getCurrentFiscalWeek } from '@qcv/shared';

// Data source for SGT IQA Trend report
const sgtIQATrendDataSource: DataSourceFunctions = {
  fetchChartData: getSGTIQATrendChart,
  fetchDefectData: getSGTIQATrendDefect,
  fetchModels: getModelsSGAIQA,
  fetchFiscalYears: getFiscalYearsTrend,
  fetchWorkWeeks: getWorkWeeksTrend
};

// Configuration for SGT IQA Trend report
const sgtIQATrendConfig: SGTIQATrendReportConfig = {
  // Report metadata
  title: 'SGT IQA Trend',
  breadcrumbTitle: 'SGT IQA Trend',

  // Show all filters for internal report
  showDateFilters: true,
  showModelFilter: true,
  showProductTypeFilter: true,

  // Data source configuration
  dataSource: sgtIQATrendDataSource,

  // Default date range to display (current fiscal year and work week)
  defaultDateRange: {
    yearTo: getCurrentFiscalYear().toString(),
    wwTo: getCurrentFiscalWeek().toString()  // No padding - will be normalized by component
  },

  // Auto-load data on mount with all models
  autoLoadOnMount: true,
  autoSelectAllModels: true,

  // Additional fixed parameters
  additionalParams: {
    isCustomerReport: false
  }
};

const SGTIQATrendPage: React.FC = () => {
  return <SGTIQATrendReportBase config={sgtIQATrendConfig} />;
};

export default SGTIQATrendPage;
