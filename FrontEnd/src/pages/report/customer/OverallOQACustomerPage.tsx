// client/src/pages/report/customer/OverallOQACustomerPage.tsx
// ===== OVERALL OQA DPPM REPORT PAGE =====
// Uses config-based approach similar to LARPage
// Manufacturing/Quality Control System - Orange Theme Implementation

import React from 'react';
import OverallOQAReportBase, { type OverallOQAReportConfig } from '../../../components/report/OverallOQAReportBase';
import { 
  getOQADPPMOverallChart, 
  getOQADPPMOverallDefect, 
  getFiscalYearsDPPM, 
  getWorkWeeksDPPM,
  getDefaultDateRange
 } from '../../../services/reportService';

// Configuration for Overall OQA DPPM Report
const overallOQAConfig: OverallOQAReportConfig = {
  // Report metadata
  title: 'Overall OQA TNHK : LAR & DPPM',
  breadcrumbTitle: 'Overall OQA DPPM',

  // Data source configuration
  dataSource: {
    fetchChartData: (params) => getOQADPPMOverallChart({ ...params, isCustomerReport: true }),
    fetchDefectData: (params) => getOQADPPMOverallDefect({ ...params, isCustomerReport: true }),
    fetchFiscalYears: getFiscalYearsDPPM,
    fetchWorkWeeks: getWorkWeeksDPPM,
  },

  // Filter configuration - hide filters but keep them required
  showFiscalYearFilter: true,
  showWorkWeekFilter: true,
  fiscalYearRequired: true,
  workWeekRequired: true,

  // Default date range to display (current fiscal year and week)
  defaultDateRange: (() => {
    const range = getDefaultDateRange();
    return {
      yearFrom: range.yearTo, // Use current fiscal year
      wwFrom: range.wwTo      // Use current work week
    };
  })(),

  // Auto-load data on mount
  autoLoadOnMount: true,

  // Additional parameters for customer report
  additionalParams: {
    isCustomerReport: true
  }


};

const OverallOQACustomerPage: React.FC = () => {
  return <OverallOQAReportBase config={overallOQAConfig} />;
};

export default OverallOQACustomerPage;
