// client/src/pages/report/OverallOQAPage.tsx
// ===== OVERALL OQA DPPM REPORT PAGE =====
// Uses config-based approach similar to LARPage
// Manufacturing/Quality Control System - Orange Theme Implementation

import React from 'react';
import OverallOQAReportBase, { type OverallOQAReportConfig } from '../../components/report/OverallOQAReportBase';
import { getOQADPPMOverallChart, getOQADPPMOverallDefect, getFiscalYearsDPPM, getWorkWeeksDPPM } from '../../services/reportService';
import { getCurrentFiscalYear, getCurrentFiscalWeek } from '@qcv/shared';

// Configuration for Overall OQA DPPM Report
const overallOQAConfig: OverallOQAReportConfig = {
  // Report metadata
  title: 'Overall OQA TNHK : LAR & DPPM',
  breadcrumbTitle: 'Overall OQA DPPM',

  // Data source configuration
  dataSource: {
    fetchChartData: getOQADPPMOverallChart,
    fetchDefectData: getOQADPPMOverallDefect,
    fetchFiscalYears: getFiscalYearsDPPM,
    fetchWorkWeeks: getWorkWeeksDPPM,
  },

  // Filter configuration
  showFiscalYearFilter: true,
  showWorkWeekFilter: true,
  fiscalYearRequired: true,
  workWeekRequired: true,

  // Default to current FY/WW and auto-load
  defaultDateRange: {
    yearFrom: getCurrentFiscalYear().toString(),
    wwFrom: getCurrentFiscalWeek().toString().padStart(2, '0'),
  },
  autoLoadOnMount: true,
};

const OverallOQAPage: React.FC = () => {
  return <OverallOQAReportBase config={overallOQAConfig} />;
};

export default OverallOQAPage;
