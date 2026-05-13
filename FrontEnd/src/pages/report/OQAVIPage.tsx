// client/src/pages/report/OQAVIPage.tsx
// ===== OQA VISUAL INSPECTION - IRIS FAMILY REPORT PAGE =====
// Uses config-based approach similar to LARPage
// Manufacturing/Quality Control System - Orange Theme Implementation

import React from 'react';
import OQAVIReportBase, { type OQAVIReportConfig } from '../../components/report/OQAVIReportBase';

// Configuration for OQA Visual Inspection - Iris Family report
const oqaviConfig: OQAVIReportConfig = {
  // Report metadata
  title: 'OQA visual inspection - Iris Family',
  breadcrumbTitle: 'OQA VI - Iris Family',

  // Iris models to display
  irisModels: [
    {
      name: 'Iris 20.4',
      data: [
        { period: 'Sep\'2023', dppm: 450, larPercent: 98 },
        { period: 'Oct\'2023', dppm: 320, larPercent: 98 },
        { period: 'Nov\'2023', dppm: 0, larPercent: 100 },
        { period: 'Dec\'2023', dppm: 0, larPercent: 100 },
        { period: 'Jan\'2024', dppm: 0, larPercent: 100 },
        { period: 'Feb\'2024', dppm: 350, larPercent: 95 },
        { period: 'Mar\'2024', dppm: 850, larPercent: 92 }
      ]
    },
    {
      name: 'Iris 20.5.2',
      data: [
        { period: 'Sep\'2023', dppm: 150, larPercent: 98 },
        { period: 'Oct\'2023', dppm: 320, larPercent: 98 },
        { period: 'Nov\'2023', dppm: 280, larPercent: 98 },
        { period: 'Dec\'2023', dppm: 0, larPercent: 100 },
        { period: 'Jan\'2024', dppm: 320, larPercent: 98 },
        { period: 'Feb\'2024', dppm: 350, larPercent: 98 },
        { period: 'Mar\'2024', dppm: 300, larPercent: 98 }
      ]
    },
    {
      name: 'Iris 20.6.2',
      data: [
        { period: 'Sep\'2023', dppm: 420, larPercent: 100 },
        { period: 'Oct\'2023', dppm: 250, larPercent: 100 },
        { period: 'Nov\'2023', dppm: 200, larPercent: 100 },
        { period: 'Dec\'2023', dppm: 0, larPercent: 100 },
        { period: 'Jan\'2024', dppm: 850, larPercent: 95 },
        { period: 'Feb\'2024', dppm: 400, larPercent: 98 },
        { period: 'Mar\'2024', dppm: 420, larPercent: 98 }
      ]
    },
    {
      name: 'Iris 36.2 SGT',
      data: [
        { period: 'Sep\'2023', dppm: 0, larPercent: 100 },
        { period: 'Oct\'2023', dppm: 0, larPercent: 100 },
        { period: 'Nov\'2023', dppm: 0, larPercent: 100 },
        { period: 'Dec\'2023', dppm: 550, larPercent: 98 },
        { period: 'Jan\'2024', dppm: 580, larPercent: 98 },
        { period: 'Feb\'2024', dppm: 420, larPercent: 98 },
        { period: 'Mar\'2024', dppm: 280, larPercent: 98 }
      ]
    }
  ],

  // Summary statistics
  summaryStats: {
    modelCount: 4,
    avgLAR: 98.2,
    peakDPPM: 850,
    periodMonths: 7
  },

  // Chart configuration
  maxDPPM: 900
};

const OQAVIPage: React.FC = () => {
  return <OQAVIReportBase config={oqaviConfig} />;
};

export default OQAVIPage;
