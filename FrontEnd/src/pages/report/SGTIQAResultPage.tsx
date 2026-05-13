// client/src/pages/report/SGTIQAResultPage.tsx
// ===== SEAGATE IQA RESULT REPORT PAGE =====
// Uses config-based approach similar to LARPage
// Manufacturing/Quality Control System - Orange Theme Implementation

import React from 'react';
import SeagateIQAResultReportBase, { type SeagateIQAResultReportConfig } from '../../components/report/SGTIQAResultReportBase';
import { getSeagateIQAResult, getFiscalYearsResult, getWorkWeeksResult } from '../../services/reportService';

// Configuration for Table Seagate IQA Report
const seagateIQAResultConfig: SeagateIQAResultReportConfig = {
  // Report metadata
  title: 'Table Seagate IQA',
  breadcrumbTitle: 'Table Seagate IQA',

  // Data source configuration
  dataSource: {
    fetchReportData: getSeagateIQAResult,
    fetchFiscalYears: getFiscalYearsResult,
    fetchWorkWeeks: getWorkWeeksResult,
  },

  // Auto-load configuration
  autoLoadFirstFY: true,
  autoLoadFirstWW: true,
};

const SGTIQAResultPage: React.FC = () => {
  return <SeagateIQAResultReportBase config={seagateIQAResultConfig} />;
};

export default SGTIQAResultPage;
