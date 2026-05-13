// client/src/pages/report/SGTIQAOQAPage.tsx

import React from 'react';
import SGTIQAvsNHKOQABase, { type SGTIQAvsNHKOQAConfig } from '../../components/report/SGTIQAvsNHKOQABase';
import { getIQAOQADPPMOverallChart, getFiscalYearsIQAOQA, getWorkWeeksIQAOQA } from '../../services/reportService';
import { getCurrentFiscalYear, getCurrentFiscalWeek } from '@qcv/shared';

// Configuration for IQA SGT vs OQA NHK Report
const overallOQAConfig: SGTIQAvsNHKOQAConfig = {
  // Report metadata
  title: 'IQA SGT vs OQA NHK : LAR&DPPM Trend',
  breadcrumbTitle: 'IQA SGT vs OQA NHK',

  // Data source configuration
  dataSource: {
    fetchChartData: getIQAOQADPPMOverallChart,
    fetchFiscalYears: getFiscalYearsIQAOQA,
    fetchWorkWeeks: getWorkWeeksIQAOQA,
  },

  // Filter configuration
  showFiscalYearFilter: true,
  showWorkWeekFilter: true,
  fiscalYearRequired: true,
  workWeekRequired: true,

  // Default to current FY/WW and auto-load
  defaultDateRange: {
    yearTo: getCurrentFiscalYear().toString(),
    wwTo: getCurrentFiscalWeek().toString().padStart(2, '0'),
  },
  autoLoadOnMount: true,
};

const SGTIQAOQAPage: React.FC = () => {
  return <SGTIQAvsNHKOQABase config={overallOQAConfig} />;
};

export default SGTIQAOQAPage;
