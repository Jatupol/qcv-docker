// client/src/pages/report/SGTIQAResultCustomerPage.tsx
// ===== SEAGATE IQA RESULT REPORT PAGE =====
// Uses config-based approach similar to LARPage
// Manufacturing/Quality Control System - Orange Theme Implementation

import React from 'react';
import SeagateIQAResultReportBase, { type SeagateIQAResultReportConfig } from '../../../components/report/SGTIQAResultReportBase';
import {
  getSeagateIQAResult,
  getFiscalYearsResult,
  getWorkWeeksResult,
} from '../../../services/reportService';
// Configuration for Table Seagate IQA Report
const seagateIQAResultConfig: SeagateIQAResultReportConfig = {
  // Report metadata
  title: 'Table Seagate IQA',
  breadcrumbTitle: 'Table Seagate IQA',

  // Data source configuration
  dataSource: {
    fetchReportData: (params) => getSeagateIQAResult({ ...params, isCustomerReport: true }),
    fetchFiscalYears: getFiscalYearsResult,
    fetchWorkWeeks: getWorkWeeksResult,
  },

  // Filter configuration
  showFiscalYearFilter: true,
  showWorkWeekFilter: true,

  // No defaultDateRange - auto-selects latest FY/WW from API

  // Auto-load data on mount
  autoLoadOnMount: true,

  // Additional parameters for customer report
  additionalParams: {
    isCustomerReport: true
  }
};

const SGTIQAResultCustomerPage: React.FC = () => {
  return <SeagateIQAResultReportBase config={seagateIQAResultConfig} />;
};

export default SGTIQAResultCustomerPage;
