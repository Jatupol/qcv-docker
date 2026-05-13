// client/src/pages/report/customer/SGTIQAOQACustomerPage.tsx
// ===== IQA SGT vs OQA NHK CUSTOMER REPORT PAGE =====
// Customer IQA SGT vs OQA NHK Report - Shows DPPM comparison with default date range
// Manufacturing/Quality Control System - Auto-load with isCustomerReport

import React from 'react';
import SGTIQAvsNHKOQABase, { type SGTIQAvsNHKOQAConfig } from '../../../components/report/SGTIQAvsNHKOQABase';
import {
  getIQAOQADPPMOverallChart,
  getFiscalYearsIQAOQA,
  getWorkWeeksIQAOQA
} from '../../../services/reportService';
import { getCurrentFiscalYear, getCurrentFiscalWeek } from '@qcv/shared';

// Configuration for customer IQA SGT vs OQA NHK Report
const customerIQAOQAConfig: SGTIQAvsNHKOQAConfig = {
  // Report metadata
  title: 'IQA SGT vs OQA NHK : LAR&DPPM Trend',
  breadcrumbTitle: 'IQA SGT vs OQA NHK',

  // Data source configuration
  dataSource: {
    fetchChartData: (params) => getIQAOQADPPMOverallChart({ ...params, isCustomerReport: true }),
    fetchFiscalYears: getFiscalYearsIQAOQA,
    fetchWorkWeeks: getWorkWeeksIQAOQA,
  },

  // Filter configuration - show filters but with defaults pre-filled
  showFiscalYearFilter: true,
  showWorkWeekFilter: true,
  fiscalYearRequired: true,
  workWeekRequired: true,

  // Default date range to display (current fiscal year and work week)
  defaultDateRange: {
    yearTo: getCurrentFiscalYear().toString(),
    wwTo: getCurrentFiscalWeek().toString()  // No padding - will be normalized by component
  },

  // Auto-load data on mount
  autoLoadOnMount: true,

  // Additional parameters for customer report
  additionalParams: {
    isCustomerReport: true
  }
};

const SGTIQAOQACustomerPage: React.FC = () => {
  return <SGTIQAvsNHKOQABase config={customerIQAOQAConfig} />;
};

export default SGTIQAOQACustomerPage;
