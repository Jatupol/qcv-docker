// client/src/pages/report/customer/SGTFormatPage.tsx
// ===== COMBINED SGT FORMAT CUSTOMER REPORTS PAGE =====
// Displays all 5 customer reports in a tabbed compact view
// Manufacturing/Quality Control System

import React, { useState, useRef, useEffect } from 'react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import LARReportBase, { type LARReportConfig } from '../../../components/report/LARReportBase';
import { addSarabunFont } from '../../../utils/sarabunFont';
import sysconfigService from '../../../services/sysconfigService';
import SGTIQAvsNHKOQABase, { type SGTIQAvsNHKOQAConfig } from '../../../components/report/SGTIQAvsNHKOQABase';
import OverallOQAReportBase, { type OverallOQAReportConfig } from '../../../components/report/OverallOQAReportBase';
import SeagateIQAResultReportBase, { type SeagateIQAResultReportConfig } from '../../../components/report/SGTIQAResultReportBase';
import SGTIQATrendReportBase, { type SGTIQATrendReportConfig } from '../../../components/report/SGTIQATrendReportBase';
import { getCurrentFiscalYear, getCurrentFiscalWeek, getPreviousFiscalWeek } from '@qcv/shared';
import { getTodayDateString, formatDateTime, formatDate } from '../../../utils/formatUtils';
import {
  getLARChart,
  getLARDefect,
  getLARModels,
  getFiscalYearsLAR,
  getWorkWeeksLAR,
  buildCustomerDateRangeParams,
  getIQAOQADPPMOverallChart,
  getFiscalYearsIQAOQA,
  getWorkWeeksIQAOQA,
  getOQADPPMOverallChart,
  getOQADPPMOverallDefect,
  getFiscalYearsDPPM,
  getWorkWeeksDPPM,
  getSeagateIQAResult,
  getFiscalYearsResult,
  getWorkWeeksResult,
  getSGTIQATrendChart,
  getSGTIQATrendDefect,
  getAvailableModels,
  getFiscalYearsTrend,
  getWorkWeeksTrend,
  getDefaultDateRange
} from '../../../services/reportService';

// Tab configuration
type TabType = 'lar' | 'iqaoqa' | 'overalloqa' | 'result' | 'trend';

interface Tab {
  id: TabType;
  label: string;
  icon: string;
  color: string;
}

const tabs: Tab[] = [
  { id: 'lar', label: 'NHK LAR & DPPM by product', icon: '📊', color: 'from-blue-500 to-cyan-500' },
  { id: 'iqaoqa', label: 'IQA vs OQA DPPM', icon: '📈', color: 'from-purple-500 to-pink-500' },
  { id: 'overalloqa', label: 'Overall NHK LAR & DPPM', icon: '📉', color: 'from-green-500 to-teal-500' },
  { id: 'result', label: 'IQA Result', icon: '✅', color: 'from-orange-500 to-red-500' },
  { id: 'trend', label: 'IQA Trend', icon: '📊', color: 'from-indigo-500 to-purple-500' }
];

// ============ REPORT CONFIGURATIONS ============

// 1. LAR Report Configuration
const larConfig: LARReportConfig = {
  title: 'NHK LAR & DPPM by product',
  breadcrumbTitle: 'LAR Customer Report',
  dataSource: {
    fetchChartData: (params) => getLARChart(buildCustomerDateRangeParams({ ...params, isCustomerReport: true })),
    fetchDefectData: (params) => getLARDefect(buildCustomerDateRangeParams({ ...params, isCustomerReport: true })),
    fetchModels: (params) => getLARModels(buildCustomerDateRangeParams({ ...params, isCustomerReport: true })),
    fetchFiscalYears: getFiscalYearsLAR,
    fetchWorkWeeks: getWorkWeeksLAR,
  },
  showDateRangeFilters: false,
  showModelFilter: false,
  dateRangeRequired: false,
  modelRequired: false,
  defaultDateRange: getDefaultDateRange(),
  autoLoadOnMount: true,
  autoSelectAllModels: true,
  additionalParams: {
    isCustomerReport: true
  }
};

// 2. IQA vs OQA Configuration
const iqaoqaConfig: SGTIQAvsNHKOQAConfig = {
  title: 'IQA SGT vs OQA NHK : LAR&DPPM Trend',
  breadcrumbTitle: 'IQA SGT vs OQA NHK',
  dataSource: {
    fetchChartData: (params) => getIQAOQADPPMOverallChart({ ...params, isCustomerReport: true }),
    fetchFiscalYears: getFiscalYearsIQAOQA,
    fetchWorkWeeks: getWorkWeeksIQAOQA,
  },
  showFiscalYearFilter: false,
  showWorkWeekFilter: false,
  fiscalYearRequired: true,
  workWeekRequired: true,
  // Don't use defaultDateRange - rely on sharedFilters which are locked to current FY/WW
  autoLoadOnMount: true,
  additionalParams: {
    isCustomerReport: true
  }
};

// 3. Overall OQA Configuration
const overallOQAConfig: OverallOQAReportConfig = {
  title: 'Overall OQA TNHK : LAR & DPPM',
  breadcrumbTitle: 'Overall OQA DPPM',
  dataSource: {
    fetchChartData: (params) => getOQADPPMOverallChart({ ...params, isCustomerReport: true }),
    fetchDefectData: (params) => getOQADPPMOverallDefect({ ...params, isCustomerReport: true }),
    fetchFiscalYears: getFiscalYearsDPPM,
    fetchWorkWeeks: getWorkWeeksDPPM,
  },
  showFiscalYearFilter: false,
  showWorkWeekFilter: false,
  fiscalYearRequired: true,
  workWeekRequired: true,
  defaultDateRange: getDefaultDateRange(),
  autoLoadOnMount: true,
  additionalParams: {
    isCustomerReport: true
  }
};

// 4. Seagate IQA Result Configuration
const resultConfig: SeagateIQAResultReportConfig = {
  title: 'Seagate IQA Result',
  breadcrumbTitle: 'Seagate IQA Result',
  dataSource: {
    fetchReportData: (params) => getSeagateIQAResult({ ...params, isCustomerReport: true }),
    fetchFiscalYears: getFiscalYearsResult,
    fetchWorkWeeks: getWorkWeeksResult,
  },
  showFiscalYearFilter: false,
  showWorkWeekFilter: false,
  defaultDateRange: getDefaultDateRange(),
  autoLoadOnMount: true,
  additionalParams: {
    isCustomerReport: true
  }
};

// 5. SGT IQA Trend Configuration
const trendConfig: any = {
  title: 'SGT IQA Trend',
  breadcrumbTitle: 'SGT IQA Trend',
  dataSource: {
    fetchChartData: getSGTIQATrendChart,
    fetchDefectData: getSGTIQATrendDefect,
    fetchModels: getAvailableModels,
    fetchFiscalYears: getFiscalYearsTrend,
    fetchWorkWeeks: getWorkWeeksTrend
  },
  showDateFilters: false,
  showModelFilter: false,
  showProductTypeFilter: false,
  defaultDateRange: getDefaultDateRange(),
  autoLoadOnMount: true,
  autoSelectAllModels: true,
  additionalParams: {
    isCustomerReport: true
  }
};

const SGTFormatPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('lar');
  const [exportingPDF, setExportingPDF] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);
  const [exportingAll, setExportingAll] = useState(false);
  const [currentExportingTab, setCurrentExportingTab] = useState<string>('');
  const [systemName, setSystemName] = useState<string>('Sampling Inspection Control System');
  const [cancelExport, setCancelExport] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  // Load system name from sysconfig
  useEffect(() => {
    const loadSystemName = async () => {
      try {
        const response = await sysconfigService.getActiveSystemSetup();
        if (response && response.success && response.data && response.data.system_name) {
          setSystemName(response.data.system_name);
        }
      } catch (error) {
        console.error('Failed to load system name:', error);
      }
    };
    loadSystemName();
  }, []);

  // Shared filters for all reports - LOCKED to current FY/WW (no manual selection)
  const [fiscalYears, setFiscalYears] = useState<string[]>([]);
  const [workWeeks, setWorkWeeks] = useState<string[]>([]);
  // These values are locked to current FY/WW and cannot be changed by user
  const currentFY = getCurrentFiscalYear().toString();
  const currentWW = getCurrentFiscalWeek().toString().padStart(2, '0');
  // IQA Result & IQA Trend default to previous week (current WW - 1)
  const prevWeek = getPreviousFiscalWeek();
  const prevFY = prevWeek.fiscalYear.toString();
  const prevWW = prevWeek.weekNumber.toString().padStart(2, '0');
  const [selectedFY, setSelectedFY] = useState<string>(currentFY);
  const [selectedWW, setSelectedWW] = useState<string>(currentWW);
  const [filtersLoading, setFiltersLoading] = useState(true);

  // Debug logging
  React.useEffect(() => {
    console.log('🔍 SGTFormatPage - Initial state:', {
      currentFY,
      currentWW,
      selectedFY,
      selectedWW,
      hasFilters: !!(selectedFY && selectedWW)
    });
  }, []);

  // Ensure filters are always set to current FY/WW and never empty
  React.useEffect(() => {
    const currentFY = getCurrentFiscalYear().toString();
    const currentWW = getCurrentFiscalWeek().toString().padStart(2, '0');

    // Safety check: If filters are somehow empty, set them to current values
    if (!selectedFY || !selectedWW) {
      console.log('⚠️ Filters were empty, setting to current FY/WW:', { currentFY, currentWW });
      setSelectedFY(currentFY);
      setSelectedWW(currentWW);
    }
    // Only update if values have changed to avoid infinite loop
    else if (selectedFY !== currentFY || selectedWW !== currentWW) {
      console.log('🔒 Locking filters to current FY/WW:', { currentFY, currentWW });
      setSelectedFY(currentFY);
      setSelectedWW(currentWW);
    }
  }, []); // Run once on mount

  // Load fiscal years and work weeks on mount
  React.useEffect(() => {
    const loadFilters = async () => {
      try {
        setFiltersLoading(true);

        // Fetch fiscal years (using any of the report services, they should all have similar data)
        const fyResponse = await getFiscalYearsLAR();
        if (fyResponse.success && fyResponse.data) {
          setFiscalYears(fyResponse.data);
          // Don't overwrite - keep the current FY/WW from initial state
        }

        // Fetch work weeks for the current selected FY (initialized with getCurrentFiscalYear)
        const currentFY = getCurrentFiscalYear().toString();
        const wwResponse = await getWorkWeeksLAR(currentFY);
        if (wwResponse.success && wwResponse.data) {
          setWorkWeeks(wwResponse.data);
          // Don't overwrite - keep the current WW from initial state
        }
      } catch (error) {
        console.error('Error loading filters:', error);
      } finally {
        setFiltersLoading(false);
      }
    };

    loadFilters();
  }, []);

  // Update work weeks when fiscal year changes
  React.useEffect(() => {
    const loadWorkWeeks = async () => {
      if (!selectedFY) return;

      try {
        const wwResponse = await getWorkWeeksLAR(selectedFY);
        if (wwResponse.success && wwResponse.data) {
          setWorkWeeks(wwResponse.data);
          // Don't auto-select - preserve the current work week selection
          // Only clear if the current selection is not in the new list
          if (selectedWW && !wwResponse.data.includes(selectedWW)) {
            setSelectedWW('');
          }
        }
      } catch (error) {
        console.error('Error loading work weeks:', error);
      }
    };

    loadWorkWeeks();
  }, [selectedFY]);

  // Shared html2canvas configuration for consistency and performance
  const getOptimizedHtml2CanvasOptions = (element: HTMLElement, identifier?: string, highResolution: boolean = false, isTable: boolean = false, isChart: boolean = false) => ({
    scale: highResolution ? (isChart ? 4.0 : 2.5) : 0.2, // Even higher scale for charts to ensure crisp line rendering
    logging: false,
    useCORS: true,
    allowTaint: true,
    backgroundColor: '#ffffff',
    imageTimeout: 0,
    removeContainer: true,
    // SVG rendering settings for better line quality
    svgRendering: true,
    foreignObjectRendering: false, // Disable for better SVG capture
    ignoreElements: (el: Element) => {
      const htmlEl = el as HTMLElement;
      // Ignore hidden elements, tooltips, overlays, and selection boxes
      return htmlEl.classList?.contains('hidden') ||
             htmlEl.style?.display === 'none' ||
             htmlEl.classList?.contains('tooltip') ||
             htmlEl.classList?.contains('recharts-tooltip-wrapper');
    },
    onclone: (clonedDoc: Document) => {
      if (identifier) {
        const clonedElement = clonedDoc.querySelector(identifier) as HTMLElement;
        if (clonedElement) {
          clonedElement.style.animation = 'none';
          clonedElement.style.transition = 'none';

          // Keep the legend visible for better chart readability
          // (Commented out - legend is important for understanding the chart)
          // const legend = clonedElement.querySelector('.recharts-legend-wrapper');
          // if (legend) {
          //   (legend as HTMLElement).style.display = 'none';
          // }

          // Remove ALL gradient backgrounds for cleaner PDF
          clonedElement.style.background = 'white';
          clonedElement.style.backgroundImage = 'none';

          // Remove all gradient backgrounds from child elements
          const allGradients = clonedElement.querySelectorAll('[class*="bg-gradient"]');
          allGradients.forEach((el) => {
            const htmlEl = el as HTMLElement;
            // Don't remove gradients from the actual chart bars/lines (inside SVG)
            if (!htmlEl.closest('svg') && htmlEl.tagName !== 'svg') {
              htmlEl.style.background = 'white';
              htmlEl.style.backgroundImage = 'none';
              htmlEl.style.backgroundColor = 'white';
            }
          });

          // Also target specific gradient containers by class patterns
          const specificGradients = clonedElement.querySelectorAll(
            '.from-blue-50, .from-purple-50, .from-green-50, .from-teal-50, ' +
            '.from-indigo-50, .from-cyan-50, .from-yellow-50, .from-orange-50, ' +
            '.border-blue-300, .border-purple-200, .border-teal-300, .border-indigo-300'
          );
          specificGradients.forEach((el) => {
            const htmlEl = el as HTMLElement;
            if (!htmlEl.closest('svg') && htmlEl.tagName !== 'svg') {
              htmlEl.style.background = 'white';
              htmlEl.style.backgroundImage = 'none';
              htmlEl.style.backgroundColor = 'white';
              // Also remove colored borders
              htmlEl.style.borderColor = '#e5e7eb'; // gray-200
            }
          });

          // Remove any rounded-xl containers with gradient backgrounds
          const roundedContainers = clonedElement.querySelectorAll('.rounded-xl, .rounded-2xl');
          roundedContainers.forEach((el) => {
            const htmlEl = el as HTMLElement;
            const hasGradient = htmlEl.className.includes('bg-gradient');
            if (hasGradient && !htmlEl.closest('svg') && htmlEl.tagName !== 'svg') {
              htmlEl.style.background = 'white';
              htmlEl.style.backgroundImage = 'none';
              htmlEl.style.backgroundColor = 'white';
            }
          });

          // Remove darker gradient boxes (stat cards/summary boxes)
          const darkGradients = clonedElement.querySelectorAll(
            '.from-blue-500, .from-red-500, .from-green-500, .from-purple-500, ' +
            '.from-orange-500, .from-indigo-500, .from-teal-500, .from-cyan-500'
          );
          darkGradients.forEach((el) => {
            const htmlEl = el as HTMLElement;
            if (!htmlEl.closest('svg') && htmlEl.tagName !== 'svg') {
              // Hide these stat boxes or make them white with border
              htmlEl.style.display = 'none';
            }
          });

          // Hide chart title/header section during export
          const chartHeaders = clonedElement.querySelectorAll('h2, .flex.items-center.justify-between');
          chartHeaders.forEach((header) => {
            const htmlHeader = header as HTMLElement;
            // Only hide if it's the title header at the top of the chart
            if (htmlHeader.textContent?.includes('LAR VMI') ||
                htmlHeader.querySelector('svg')) {
              htmlHeader.style.display = 'none';
            }
          });

          // AGGRESSIVE: Remove ALL gradient backgrounds from divs (EXCEPT LAR table headers)
          const allDivs = clonedElement.querySelectorAll('div');
          allDivs.forEach((div) => {
            const htmlDiv = div as HTMLElement;
            const className = htmlDiv.className || '';

            // Skip LAR table headers (preserve teal/cyan gradient)
            const isLARTableHeader = htmlDiv.classList?.contains('px-6') &&
                                     htmlDiv.classList?.contains('py-4') &&
                                     htmlDiv.closest('[data-table]') !== null;

            if (isLARTableHeader) {
              return; // Skip - preserve LAR table header gradient
            }

            // Check if element has any gradient classes (ALL colors)
            if (className.includes('bg-gradient') ||
                className.includes('from-') ||
                className.includes('via-') ||
                className.includes('to-')) {
              
              // Remove all gradient-related classes from className
              let newClassName = className
                .replace(/bg-gradient-[\w-]+/g, '')
                .replace(/from-[\w-]+-\d+/g, '')
                .replace(/via-[\w-]+-\d+/g, '')
                .replace(/to-[\w-]+-\d+/g, '')
                .replace(/\s+/g, ' ')
                .trim();
              
              htmlDiv.className = newClassName;
              
              // Force white background with !important equivalent
              htmlDiv.style.cssText += 'background: white !important; background-image: none !important;';
              
              // Also remove borders and shadows from chart containers
              if (htmlDiv.hasAttribute('data-chart') || htmlDiv.querySelector('svg')) {
                htmlDiv.style.cssText += 'border: none !important; box-shadow: none !important;';
              }
              
              // Hide title headers inside chart containers
              const titleHeader = htmlDiv.querySelector('.flex.items-center.justify-between');
              if (titleHeader) {
                (titleHeader as HTMLElement).style.display = 'none';
              }
            }
          });

          // Also target table containers specifically
          const tableContainers = clonedElement.querySelectorAll('[data-table]');
          tableContainers.forEach((table) => {
            const htmlTable = table as HTMLElement;
            const className = htmlTable.className || '';
            
            // Remove gradient classes from table container
            let newClassName = className
              .replace(/bg-gradient-[\w-]+/g, '')
              .replace(/from-[\w-]+-\d+/g, '')
              .replace(/via-[\w-]+-\d+/g, '')
              .replace(/to-[\w-]+-\d+/g, '')
              .replace(/\s+/g, ' ')
              .trim();
            
            htmlTable.className = newClassName;
            htmlTable.style.cssText += 'background: white !important; background-image: none !important; border: 1px solid #e5e7eb !important; box-shadow: none !important;';
            
            // Remove gradient from table header
            const tableHeader = htmlTable.querySelector('.px-6.py-4');
            if (tableHeader) {
              const headerEl = tableHeader as HTMLElement;
              headerEl.style.cssText += 'background: #14b8a6 !important; background-image: none !important; color: white !important;';
            }
            
            // Remove gradient from thead rows
            const theadRows = htmlTable.querySelectorAll('thead tr');
            theadRows.forEach((row) => {
              const htmlRow = row as HTMLElement;
              htmlRow.style.cssText += 'background: white !important; background-image: none !important;';
            });
            
            // Make thead cells white with border
            const theadCells = htmlTable.querySelectorAll('thead th');
            theadCells.forEach((cell) => {
              const htmlCell = cell as HTMLElement;
              htmlCell.style.cssText += 'background: white !important; background-image: none !important; border-bottom: 2px solid #e5e7eb !important;';
            });
            
            // Make all table body rows white
            const tbodyRows = htmlTable.querySelectorAll('tbody tr');
            tbodyRows.forEach((row) => {
              const htmlRow = row as HTMLElement;
              htmlRow.style.cssText += 'background: white !important; background-image: none !important;';
            });
          });

          // Optimize chart for PDF export
          if (isChart) {
            // CRITICAL: Comprehensive SVG element preservation for perfect chart line rendering
            // Query ALL SVG elements that might have stroke or fill properties
            const allSvgElements = clonedElement.querySelectorAll('svg, svg *');
            allSvgElements.forEach((el) => {
              const svgEl = el as SVGElement;

              // Get all stroke-related attributes
              const stroke = svgEl.getAttribute('stroke');
              const strokeWidth = svgEl.getAttribute('stroke-width');
              const strokeDasharray = svgEl.getAttribute('stroke-dasharray');
              const strokeLinecap = svgEl.getAttribute('stroke-linecap');
              const strokeLinejoin = svgEl.getAttribute('stroke-linejoin');
              const strokeOpacity = svgEl.getAttribute('stroke-opacity');

              // Get fill-related attributes
              const fill = svgEl.getAttribute('fill');
              const fillOpacity = svgEl.getAttribute('fill-opacity');

              // Get other important attributes
              const opacity = svgEl.getAttribute('opacity');

              // Force all attributes as inline styles with setProperty for maximum compatibility
              // This ensures html2canvas captures them correctly
              if (stroke && stroke !== 'none' && stroke !== '') {
                svgEl.style.setProperty('stroke', stroke, 'important');
              }
              if (strokeWidth && strokeWidth !== '0') {
                svgEl.style.setProperty('stroke-width', strokeWidth, 'important');
              }
              if (strokeDasharray && strokeDasharray !== 'none' && strokeDasharray !== '0' && strokeDasharray !== '') {
                svgEl.style.setProperty('stroke-dasharray', strokeDasharray, 'important');
              }
              if (strokeLinecap) {
                svgEl.style.setProperty('stroke-linecap', strokeLinecap, 'important');
              }
              if (strokeLinejoin) {
                svgEl.style.setProperty('stroke-linejoin', strokeLinejoin, 'important');
              }
              if (strokeOpacity) {
                svgEl.style.setProperty('stroke-opacity', strokeOpacity, 'important');
              }
              if (fill && fill !== '') {
                svgEl.style.setProperty('fill', fill, 'important');
              }
              if (fillOpacity) {
                svgEl.style.setProperty('fill-opacity', fillOpacity, 'important');
              }
              if (opacity) {
                svgEl.style.setProperty('opacity', opacity, 'important');
              }

              // Special handling for path, line, polyline elements (chart lines)
              const tagName = svgEl.tagName.toLowerCase();
              if (tagName === 'path' || tagName === 'line' || tagName === 'polyline') {
                // Ensure visibility
                svgEl.style.setProperty('visibility', 'visible', 'important');
                svgEl.style.setProperty('display', 'inline', 'important');

                // Ensure minimum stroke width for all lines in PDF
                if (stroke && stroke !== 'none' && strokeWidth) {
                  const currentWidth = parseFloat(strokeWidth);
                  const minWidth = 3.0; // Minimum width for all lines in PDF
                  svgEl.style.setProperty('stroke-width', `${Math.max(currentWidth, minWidth)}`, 'important');
                }

                // For dashed lines, ensure the pattern is visible
                if (strokeDasharray && strokeDasharray !== 'none' && strokeDasharray !== '0') {
                  // Further increase stroke width for dashed lines to ensure visibility in PDF
                  const currentWidth = parseFloat(strokeWidth || '1');
                  const minWidth = 4.0; // Minimum width for dashed lines in PDF
                  svgEl.style.setProperty('stroke-width', `${Math.max(currentWidth, minWidth)}`, 'important');

                  // Ensure stroke-dasharray is properly set as style for html2canvas
                  svgEl.style.setProperty('stroke-dasharray', strokeDasharray, 'important');

                  // Ensure the line has proper stroke properties
                  if (stroke && stroke !== 'none') {
                    svgEl.style.setProperty('stroke', stroke, 'important');
                  }

                  // Set stroke-linecap to round for better dash rendering
                  svgEl.style.setProperty('stroke-linecap', 'round', 'important');
                  svgEl.style.setProperty('stroke-linejoin', 'round', 'important');
                } else {
                  // For solid lines, use butt or square for precise rendering
                  svgEl.style.setProperty('stroke-linecap', 'round', 'important');
                  svgEl.style.setProperty('stroke-linejoin', 'round', 'important');
                }

                // Ensure proper rendering quality
                svgEl.style.setProperty('vector-effect', 'non-scaling-stroke', 'important');
              }

              // Special handling for circles (dots on lines)
              if (tagName === 'circle') {
                // Ensure dots are visible
                svgEl.style.setProperty('visibility', 'visible', 'important');
                svgEl.style.setProperty('display', 'inline', 'important');

                // Ensure minimum radius for visibility
                const r = svgEl.getAttribute('r');
                if (r) {
                  const radius = parseFloat(r);
                  const minRadius = 3;
                  if (radius < minRadius) {
                    svgEl.setAttribute('r', minRadius.toString());
                    svgEl.style.setProperty('r', `${minRadius}`, 'important');
                  }
                }

                // Ensure fill and stroke are preserved
                if (fill && fill !== 'none') {
                  svgEl.style.setProperty('fill', fill, 'important');
                }
                if (stroke && stroke !== 'none') {
                  svgEl.style.setProperty('stroke', stroke, 'important');
                  // Add a slight stroke width to circles for better visibility
                  svgEl.style.setProperty('stroke-width', '1', 'important');
                }
              }
            });

            // Ensure SVG elements have proper viewBox and dimensions
            const allSvgs = clonedElement.querySelectorAll('svg');
            allSvgs.forEach((svg) => {
              const svgEl = svg as SVGElement;
              // Preserve viewBox if it exists
              const viewBox = svgEl.getAttribute('viewBox');
              if (viewBox) {
                svgEl.setAttribute('viewBox', viewBox);
              }
              // Ensure SVG has explicit dimensions for proper rendering
              const width = svgEl.getAttribute('width');
              const height = svgEl.getAttribute('height');
              if (width && height) {
                svgEl.style.width = width;
                svgEl.style.height = height;
              }
              // Ensure SVG rendering is sharp and crisp for PDF export
              svgEl.style.setProperty('shape-rendering', 'geometricPrecision', 'important');
              svgEl.style.setProperty('text-rendering', 'geometricPrecision', 'important');

              // Ensure all child elements are properly rendered
              svgEl.style.setProperty('image-rendering', 'optimizeQuality', 'important');

              // Force anti-aliasing for smoother lines in PDF
              svgEl.setAttribute('shape-rendering', 'geometricPrecision');

              // CRITICAL: Ensure SVG overflow is visible to prevent clipping of chart elements
              svgEl.style.setProperty('overflow', 'visible', 'important');

              // Disable any clipping paths that might hide elements
              const clipPath = svgEl.getAttribute('clip-path');
              if (clipPath) {
                svgEl.removeAttribute('clip-path');
              }
            });

            // CRITICAL: Force all SVG groups and containers to be visible
            const allGroups = clonedElement.querySelectorAll('g, svg > *');
            allGroups.forEach((el) => {
              const groupEl = el as SVGElement;
              groupEl.style.setProperty('visibility', 'visible', 'important');
              groupEl.style.setProperty('display', 'inline', 'important');

              // Preserve opacity but ensure it's at least visible
              const currentOpacity = groupEl.style.opacity || groupEl.getAttribute('opacity') || '1';
              groupEl.style.setProperty('opacity', currentOpacity, 'important');
            });

            // Remove fixed height constraints to show full chart
            const chartContainers = clonedElement.querySelectorAll('.h-96, .h-80, .h-64');
            chartContainers.forEach((container) => {
              const htmlContainer = container as HTMLElement;
              htmlContainer.style.height = 'auto';
              htmlContainer.style.minHeight = '450px'; // Increased for better chart visibility
            });

            // Find ResponsiveContainer and set explicit dimensions
            const responsiveContainers = clonedElement.querySelectorAll('.recharts-responsive-container');
            responsiveContainers.forEach((rc) => {
              const htmlRc = rc as HTMLElement;
              htmlRc.style.width = '100%';
              htmlRc.style.height = '450px'; // Increased for better chart visibility
            });

            // Reduce padding for compactness
            const innerElements = clonedElement.querySelectorAll('div');
            innerElements.forEach((el) => {
              const htmlEl = el as HTMLElement;
              const computedPadding = window.getComputedStyle(htmlEl).padding;
              const paddingValue = parseFloat(computedPadding);
              if (paddingValue > 10) {
                htmlEl.style.padding = '8px';
              }
              htmlEl.style.margin = '2px';
            });
          }

          // Optimize table to fit in PDF export
          if (isTable) {
            // Check if this is IQA Result table (data-table="main") vs LAR table (data-table="[model]")
            const isMainTable = clonedElement.getAttribute('data-table') === 'main';

            // All main tables now use professional styling (no colored metrics anymore)
            // Distinguish by checking for "Data Summary" text in header
            const isOverallOQATable = isMainTable && clonedElement.textContent?.includes('Data Summary');
            const isIQAResultTable = isMainTable && !isOverallOQATable;

            // IQA RESULT TABLE - Apply bright colors for PDF
            if (isIQAResultTable) {
              console.log('🎯 IQA Result table detected - applying bright colors for PDF');

              // Keep white container background
              clonedElement.style.setProperty('background', 'white', 'important');
              clonedElement.style.setProperty('background-color', 'white', 'important');
              clonedElement.style.setProperty('background-image', 'none', 'important');
              clonedElement.style.setProperty('border', '2px solid #8b5cf6', 'important'); // violet-500 border
              clonedElement.style.setProperty('box-shadow', 'none', 'important');

              // Apply bright violet title header
              const titleHeader = clonedElement.querySelector('div.px-6.py-4');
              if (titleHeader) {
                const headerEl = titleHeader as HTMLElement;
                console.log('✅ Applying violet to title header:', headerEl.textContent?.substring(0, 50));
                headerEl.style.setProperty('background', '#7c3aed', 'important'); // violet-600
                headerEl.style.setProperty('background-color', '#7c3aed', 'important');
                headerEl.style.setProperty('background-image', 'none', 'important');
                headerEl.style.setProperty('border-bottom', '2px solid #6d28d9', 'important');

                // Set white text for all elements inside
                const allInside = headerEl.querySelectorAll('*');
                allInside.forEach((el) => {
                  (el as HTMLElement).style.setProperty('color', 'white', 'important');
                });
                headerEl.style.setProperty('color', 'white', 'important');
              }

              // Apply bright violet table header row
              const theadRow = clonedElement.querySelector('thead tr');
              if (theadRow) {
                const theadRowEl = theadRow as HTMLElement;
                theadRowEl.style.setProperty('background', '#c4b5fd', 'important'); // violet-300
                theadRowEl.style.setProperty('background-color', '#c4b5fd', 'important');
                theadRowEl.style.setProperty('background-image', 'none', 'important');
              }

              // Apply bright alternating row backgrounds to body rows
              const allTableRows = clonedElement.querySelectorAll('tbody tr');
              allTableRows.forEach((row, index) => {
                const rowEl = row as HTMLElement;

                // Alternate between violet-100 and white
                if (index % 2 === 0) {
                  rowEl.style.setProperty('background', '#ede9fe', 'important'); // violet-100
                  rowEl.style.setProperty('background-color', '#ede9fe', 'important');
                  rowEl.style.setProperty('background-image', 'none', 'important');
                } else {
                  rowEl.style.setProperty('background', 'white', 'important');
                  rowEl.style.setProperty('background-color', 'white', 'important');
                  rowEl.style.setProperty('background-image', 'none', 'important');
                }
              });

            } else if (isOverallOQATable) {
              console.log('📊 Overall OQA table detected - applying bright colors for PDF');

              // Keep white container background
              clonedElement.style.setProperty('background', 'white', 'important');
              clonedElement.style.setProperty('background-color', 'white', 'important');
              clonedElement.style.setProperty('background-image', 'none', 'important');
              clonedElement.style.setProperty('border', '2px solid #06b6d4', 'important'); // cyan-500 border

              // Apply bright teal/cyan title header
              const tableHeader = clonedElement.querySelector('div.bg-slate-700');
              if (tableHeader) {
                const headerEl = tableHeader as HTMLElement;
                headerEl.style.setProperty('background', '#14b8a6', 'important'); // teal-500
                headerEl.style.setProperty('background-color', '#14b8a6', 'important');
                headerEl.style.setProperty('background-image', 'none', 'important');
                headerEl.style.setProperty('color', 'white', 'important');

                const allInside = headerEl.querySelectorAll('*');
                allInside.forEach((el) => {
                  (el as HTMLElement).style.setProperty('color', 'white', 'important');
                });
              }

              // Apply bright cyan table header row
              const theadRow = clonedElement.querySelector('thead tr');
              if (theadRow) {
                const theadRowEl = theadRow as HTMLElement;
                theadRowEl.style.setProperty('background', '#67e8f9', 'important'); // cyan-300
                theadRowEl.style.setProperty('background-color', '#67e8f9', 'important');
                theadRowEl.style.setProperty('background-image', 'none', 'important');
              }

              // Apply bright alternating row backgrounds
              const allTableRows = clonedElement.querySelectorAll('tbody tr');
              allTableRows.forEach((row, index) => {
                const rowEl = row as HTMLElement;

                // Alternate between cyan-100 and white
                if (index % 2 === 0) {
                  rowEl.style.setProperty('background', '#cffafe', 'important'); // cyan-100
                  rowEl.style.setProperty('background-color', '#cffafe', 'important');
                  rowEl.style.setProperty('background-image', 'none', 'important');
                } else {
                  rowEl.style.setProperty('background', 'white', 'important');
                  rowEl.style.setProperty('background-color', 'white', 'important');
                  rowEl.style.setProperty('background-image', 'none', 'important');
                }
              });

            } else {
              console.log('📊 LAR/Other table detected - applying bright colors for PDF');

              // Keep white container background
              clonedElement.style.setProperty('background', 'white', 'important');
              clonedElement.style.setProperty('background-color', 'white', 'important');
              clonedElement.style.setProperty('background-image', 'none', 'important');
              clonedElement.style.setProperty('border', '2px solid #14b8a6', 'important'); // teal-500 border

              // For LAR tables, apply bright teal header background
              const tableHeader = clonedElement.querySelector('div.bg-slate-700');
              if (tableHeader) {
                const headerEl = tableHeader as HTMLElement;
                console.log('✅ Setting LAR table header background to teal-600');
                headerEl.style.setProperty('background', '#0d9488', 'important'); // teal-600
                headerEl.style.setProperty('background-color', '#0d9488', 'important');
                headerEl.style.setProperty('background-image', 'none', 'important');
                headerEl.style.setProperty('color', 'white', 'important');

                // Set white text for all elements inside
                const allInside = headerEl.querySelectorAll('*');
                allInside.forEach((el) => {
                  (el as HTMLElement).style.setProperty('color', 'white', 'important');
                });
              }

              // Apply bright teal table header row
              const theadRow = clonedElement.querySelector('thead tr');
              if (theadRow) {
                const theadRowEl = theadRow as HTMLElement;
                theadRowEl.style.setProperty('background', '#5eead4', 'important'); // teal-300
                theadRowEl.style.setProperty('background-color', '#5eead4', 'important');
                theadRowEl.style.setProperty('background-image', 'none', 'important');
              }

              // Apply bright alternating row backgrounds
              const allTableRows = clonedElement.querySelectorAll('tbody tr');
              allTableRows.forEach((row, index) => {
                const rowEl = row as HTMLElement;

                // Alternate between teal-100 and white
                if (index % 2 === 0) {
                  rowEl.style.setProperty('background', '#ccfbf1', 'important'); // teal-100
                  rowEl.style.setProperty('background-color', '#ccfbf1', 'important');
                  rowEl.style.setProperty('background-image', 'none', 'important');
                } else {
                  rowEl.style.setProperty('background', 'white', 'important');
                  rowEl.style.setProperty('background-color', 'white', 'important');
                  rowEl.style.setProperty('background-image', 'none', 'important');
                }
              });

              // Note: Defect name cells keep their inline style colors (from legend)
              // This is intentional for visual identification
            }


            // Remove overflow-hidden that crops table content
            clonedElement.style.overflow = 'visible';
            const overflowHiddenElements = clonedElement.querySelectorAll('.overflow-hidden');
            overflowHiddenElements.forEach((el) => {
              const htmlEl = el as HTMLElement;
              htmlEl.style.overflow = 'visible';
            });

            // Reduce all text in table cells for compactness
            const allTextElements = clonedElement.querySelectorAll('td, th, div, span, p');
            allTextElements.forEach((el) => {
              const htmlEl = el as HTMLElement;
              const currentSize = window.getComputedStyle(htmlEl).fontSize;
              const currentSizeNum = parseFloat(currentSize);
              // Reduce font size by 25% for better readability
              htmlEl.style.fontSize = `${currentSizeNum * 0.75}px`;
              htmlEl.style.lineHeight = '1.4';
            });

            // Optimize the table
            const table = clonedElement.querySelector('table') as HTMLElement;
            if (table) {
              // Ensure table is visible and not clipped
              table.style.overflow = 'visible';
              
              // Set max width to ensure it fits in PDF
              table.style.maxWidth = '100%';
              table.style.width = '100%';
              table.style.tableLayout = 'fixed';

              // Increase cell padding for better row height
              const cells = table.querySelectorAll('td, th');
              cells.forEach((cell) => {
                const htmlCell = cell as HTMLElement;
                htmlCell.style.padding = '6px 8px';
                htmlCell.style.minHeight = '32px';
                htmlCell.style.wordWrap = 'break-word';
                htmlCell.style.overflow = 'visible';
              });
            }
            
            // Set container width to ensure no overflow
            const tableContainer = clonedElement.querySelector('[data-table]') as HTMLElement;
            if (tableContainer) {
              tableContainer.style.maxWidth = '1200px';
              tableContainer.style.width = '100%';
            }
          }
        }
      }
    }
  });

  // Export entire page to PDF
  const handleExportPDF = async () => {
    if (!contentRef.current) {
      alert('No content to export');
      return;
    }

    // Show modal immediately
    setExportingPDF(true);
    setExportProgress(0);
    setCancelExport(false);

    // Wait for modal to render before starting heavy work
    await new Promise(resolve => setTimeout(resolve, 100));

    try {
      if (cancelExport) {
        console.log('Export cancelled by user');
        return;
      }

      setExportProgress(5);

      const pdf = new jsPDF('l', 'mm', 'a4'); // Landscape orientation
      const pageWidth = pdf.internal.pageSize.getWidth();
      addSarabunFont(pdf); // Add Sarabun font (or fallback to built-in)
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 10;
      const footerHeight = 15;
      const headerHeight = 8;
      let yPosition = margin;
      let pageNumber = 1;

      // Get current report name
      const currentReportName = tabs.find(t => t.id === activeTab)?.label || 'Report';

      // Helper function to add page header with report name
      const addPageHeader = () => {
        pdf.setFontSize(10);
        pdf.setFont('Sarabun', 'bold');
        pdf.setTextColor(249, 115, 22); // Orange color matching theme
        pdf.text(currentReportName, margin, margin + 3);
        pdf.setTextColor(0, 0, 0);
        pdf.setFont('Sarabun', 'normal');
        return headerHeight;
      };

      // Helper function to add page footer
      const addPageFooter = (currentPage: number, totalPages: number) => {
        const footerY = pageHeight - 8;
        pdf.setDrawColor(200, 200, 200);
        pdf.setLineWidth(0.5);
        pdf.line(margin, pageHeight - footerHeight, pageWidth - margin, pageHeight - footerHeight);
        pdf.setFontSize(8);
        pdf.setTextColor(100, 100, 100);
        pdf.text('SGT Format - Customer Reports', margin, footerY);
        const dateStr = formatDateTime(new Date());
        pdf.text(`Generated: ${dateStr}`, pageWidth / 2, footerY, { align: 'center' });
        pdf.text(`Page ${currentPage} of ${totalPages}`, pageWidth - margin, footerY, { align: 'right' });
        pdf.setTextColor(0, 0, 0);
      };

      setExportProgress(10);

      // Add title
     // pdf.setFontSize(16);
      //pdf.text('SGT Format - Customer Reports', pageWidth / 2, yPosition, { align: 'center' });
      //yPosition += 10;

      setExportProgress(20);

      const maxContentHeight = pageHeight - margin - footerHeight;

      // Special handling for LAR Report and IQA Trend - export each model on separate page
      if (activeTab === 'lar' || activeTab === 'trend') {
        console.log(`🔍 ${activeTab.toUpperCase()} tab detected - using model-per-page export`);


        // Wait for DOM to fully render all models with polling
        console.log('⏳ Waiting for models to render...');
        let modelSections: NodeListOf<Element> = contentRef.current.querySelectorAll('[data-chart]');
        let attempts = 0;
        const maxAttempts = 20; // Wait up to 10 seconds (20 * 500ms)

        // Poll until we find models or timeout
        while (modelSections.length === 0 && attempts < maxAttempts) {
          await new Promise(resolve => setTimeout(resolve, 500));
          modelSections = contentRef.current.querySelectorAll('[data-chart]');
          attempts++;
          console.log(`   Attempt ${attempts}: Found ${modelSections.length} models`);
        }

        // Wait a bit more to ensure all models are fully rendered
        if (modelSections.length > 0) {
          console.log(`   ✅ Found ${modelSections.length} models, waiting for full render...`);
          await new Promise(resolve => setTimeout(resolve, 1500));
          // Query again after waiting to get final count
          modelSections = contentRef.current.querySelectorAll('[data-chart]');
          console.log(`   Final model count: ${modelSections.length}`);
        }

        // Log all model names found
        const modelNames = Array.from(modelSections).map(el => el.getAttribute('data-chart'));
        console.log('   Model names:', modelNames);

        if (modelSections.length === 0) {
          throw new Error('No model data found to export');
        }

        // Pre-load all images to ensure they're ready for capture
        console.log('📥 Pre-loading images...');
        const allImages = contentRef.current.querySelectorAll('img');
        await Promise.all(
          Array.from(allImages).map(img => {
            if (img.complete) return Promise.resolve();
            return new Promise((resolve) => {
              img.onload = () => resolve(null);
              img.onerror = () => resolve(null); // Continue even if image fails
            });
          })
        );
        console.log('✅ Images pre-loaded');
        setExportProgress(15);

        // Batch process models for better performance
        // Adaptive batch size: more models = larger batches for efficiency
        const totalModels = modelSections.length;
        const BATCH_SIZE = totalModels <= 6 ? 2 : totalModels <= 12 ? 3 : 4;
        console.log(`📊 Using batch size of ${BATCH_SIZE} for ${totalModels} models`);

        for (let batchStart = 0; batchStart < totalModels; batchStart += BATCH_SIZE) {
          const batchEnd = Math.min(batchStart + BATCH_SIZE, totalModels);
          const batchSize = batchEnd - batchStart;

          console.log(`\n🔄 Processing batch ${Math.floor(batchStart / BATCH_SIZE) + 1} (models ${batchStart + 1}-${batchEnd})`);

          // Pre-capture all models in this batch in parallel
          const batchCapturePromises = [];
          const batchModels = [];

          for (let i = batchStart; i < batchEnd; i++) {
            // Check for cancellation
            if (cancelExport) {
              console.log('❌ Export cancelled by user');
              return;
            }

            const modelElement = modelSections[i];
            const modelName = modelElement.getAttribute('data-chart');

            const chartElement = contentRef.current.querySelector(`[data-chart="${modelName}"]`) as HTMLElement;
            const tableElement = contentRef.current.querySelector(`[data-table="${modelName}"]`) as HTMLElement;

            if (chartElement && tableElement) {
              batchModels.push({ modelName, chartElement, tableElement, index: i });

              // Start capturing both chart and table in parallel using high resolution settings
              batchCapturePromises.push(
                (async () => {
                  // Wait for SVG to fully render before capturing
                  await new Promise(resolve => setTimeout(resolve, 300));
                  return Promise.all([
                    html2canvas(chartElement, getOptimizedHtml2CanvasOptions(chartElement, `[data-chart="${modelName}"]`, true, false, true) as any),
                    html2canvas(tableElement, getOptimizedHtml2CanvasOptions(tableElement, `[data-table="${modelName}"]`, true, true, false) as any)
                  ]);
                })()
              );
            }
          }

          // Wait for all captures in this batch to complete
          const batchStartTime = performance.now();
          const batchCanvases = await Promise.all(batchCapturePromises);
          console.log(`   ✅ Batch captured in ${(performance.now() - batchStartTime).toFixed(0)}ms`);

          // Process each model in the batch
          for (let j = 0; j < batchModels.length; j++) {
            const model = batchModels[j];
            const [chartCanvas, tableCanvas] = batchCanvases[j];
            const i = model.index;

            console.log(`   📦 Adding model ${i + 1}/${totalModels}: ${model.modelName}`);

            // Add new page for each model (first model uses the initial page)
            if (i > 0) {
              pdf.addPage('l', 'a4');
              pageNumber++;
            }

            yPosition = margin;
            // Add report name header
            yPosition += addPageHeader();

            // Add model title
            pdf.setFontSize(14);
            pdf.setFont('Sarabun', 'bold');
            pdf.setTextColor(120, 53, 168);
            pdf.text(`Model: ${model.modelName}`, pageWidth / 2, yPosition, { align: 'center' });
            yPosition += 10;
            pdf.setTextColor(0, 0, 0);

            const contentWidth = pageWidth - (2 * margin);
            const availableHeight = maxContentHeight - 10;
            const spacing = 3;

            // Calculate aspect ratios
            const chartAspectRatio = chartCanvas.width / chartCanvas.height;
            const tableAspectRatio = tableCanvas.width / tableCanvas.height;

            // Try fitting to width first
            let chartWidth = contentWidth * 0.95; // Use 95% of width for some padding
            let chartHeight = chartWidth / chartAspectRatio;
            let tableWidth = contentWidth * 0.95;
            let tableHeight = tableWidth / tableAspectRatio;

            let totalHeight = chartHeight + spacing + tableHeight;

            // If doesn't fit in height, scale down to fit available height
            if (totalHeight > availableHeight) {
              // Calculate scale factor to fit in available height
              const heightScaleFactor = availableHeight / totalHeight;

              chartHeight = chartHeight * heightScaleFactor;
              chartWidth = chartHeight * chartAspectRatio;
              tableHeight = tableHeight * heightScaleFactor;
              tableWidth = tableHeight * tableAspectRatio;
            }

            // Convert to high-quality JPEG for optimal balance of quality and file size
            const chartImgData = chartCanvas.toDataURL('image/jpeg', 0.85);
            const tableImgData = tableCanvas.toDataURL('image/jpeg', 0.85);

            // Center elements on page if they're smaller than page width
            const chartX = margin + (contentWidth - chartWidth) / 2;
            const tableX = margin + (contentWidth - tableWidth) / 2;

            // Add to PDF maintaining aspect ratio
            pdf.addImage(chartImgData, 'JPEG', chartX, yPosition, chartWidth, chartHeight);
            yPosition += chartHeight + spacing;
            pdf.addImage(tableImgData, 'JPEG', tableX, yPosition, tableWidth, tableHeight);

            // Update progress less frequently for better performance
            if (j === batchSize - 1 || i === totalModels - 1) {
              setExportProgress(20 + ((i + 1) / totalModels) * 70);
            }
          }

          // Yield to browser to update UI and handle user input
          await new Promise(resolve => setTimeout(resolve, 10));
        }

        // Add footers
        const totalPages = pdf.getNumberOfPages();
        for (let i = 1; i <= totalPages; i++) {
          pdf.setPage(i);
          addPageFooter(i, totalPages);
        }

        setExportProgress(90);
      } else {
        // High-quality export for other report tabs (IQA vs OQA, Overall OQA, IQA Result)
        // Use same approach as LAR - capture chart and table separately using data attributes
        console.log(`🔍 ${activeTab.toUpperCase()} tab detected - using chart+table export`);

        // Try to find chart and table with data attributes (IQA vs OQA style)
        let chartElement = contentRef.current.querySelector('[data-chart="main"]') as HTMLElement;
        let tableElement = contentRef.current.querySelector('[data-table="main"]') as HTMLElement;

        // Fallback: try to find any element with data-chart/data-table (for other reports)
        if (!chartElement) {
          chartElement = contentRef.current.querySelector('[data-chart]') as HTMLElement;
        }
        if (!tableElement) {
          tableElement = contentRef.current.querySelector('[data-table]') as HTMLElement;
        }

        if (chartElement || tableElement) {
          setExportProgress(30);

          const contentWidth = pageWidth - (2 * margin);
          const availableHeight = maxContentHeight - 10;
          const spacing = 3;

          // Add report name header on first page
          yPosition += addPageHeader();

          // Capture chart if exists
          if (chartElement) {
            // Wait for SVG to fully render
            await new Promise(resolve => setTimeout(resolve, 500));
          const chartCanvas = await html2canvas(chartElement, getOptimizedHtml2CanvasOptions(chartElement, '[data-chart]', true, false, true) as any);
            setExportProgress(50);

            const chartAspectRatio = chartCanvas.width / chartCanvas.height;
            let chartWidth = contentWidth * 0.95;
            let chartHeight = chartWidth / chartAspectRatio;

            // If chart alone doesn't fit, scale it down
            if (chartHeight > availableHeight) {
              chartHeight = availableHeight;
              chartWidth = chartHeight * chartAspectRatio;
            }

            const chartImgData = chartCanvas.toDataURL('image/jpeg', 0.85);
            const chartX = margin + (contentWidth - chartWidth) / 2;

            pdf.addImage(chartImgData, 'JPEG', chartX, yPosition, chartWidth, chartHeight);
            yPosition += chartHeight + spacing;
          }

          // Capture table if exists
          if (tableElement) {
            const tableCanvas = await html2canvas(tableElement, getOptimizedHtml2CanvasOptions(tableElement, '[data-table]', true, true, false) as any);
            setExportProgress(70);

            const tableAspectRatio = tableCanvas.width / tableCanvas.height;
            let tableWidth = contentWidth * 0.95;
            let tableHeight = tableWidth / tableAspectRatio;

            // Check if we need a new page for the table
            if (yPosition + tableHeight > maxContentHeight) {
              pdf.addPage('l', 'a4');
              pageNumber++;
              yPosition = margin;
              yPosition += addPageHeader();
            }

            // If table still doesn't fit, scale it down
            const remainingHeight = maxContentHeight - yPosition;
            if (tableHeight > remainingHeight) {
              tableHeight = remainingHeight;
              tableWidth = tableHeight * tableAspectRatio;
            }

            const tableImgData = tableCanvas.toDataURL('image/jpeg', 0.85);
            const tableX = margin + (contentWidth - tableWidth) / 2;

            pdf.addImage(tableImgData, 'JPEG', tableX, yPosition, tableWidth, tableHeight);
          }

          setExportProgress(80);
        } else {
          console.warn('⚠️  Could not find chart or table elements with data attributes');
          throw new Error('Report elements not found');
        }

        // Add footers to all pages
        const totalPages = pdf.getNumberOfPages();
        for (let i = 1; i <= totalPages; i++) {
          pdf.setPage(i);
          addPageFooter(i, totalPages);
        }

        setExportProgress(90);
      }

      // Generate filename
      const dateStr = getTodayDateString();
      const currentTab = tabs.find(t => t.id === activeTab)?.label || 'Report';
      const filename = `SGT_Format_${currentTab.replace(/\s+/g, '_')}_${dateStr}.pdf`;

      setExportProgress(95);

      pdf.save(filename);

      setExportProgress(100);

      console.log('✅ PDF exported successfully:', filename);
      console.log(`   Final page count: ${pdf.getNumberOfPages()}`);
    } catch (error) {
      console.error('❌ Error exporting PDF:', error);
      if (!cancelExport) {
        alert('Failed to export PDF. Please try again.');
      }
    } finally {
      setTimeout(() => {
        setExportingPDF(false);
        setExportProgress(0);
        setCancelExport(false);
      }, 500);
    }
  };

  // Export all 5 reports to a single PDF
  const handleExportAllReports = async () => {
    if (!contentRef.current) {
      alert('No content to export');
      return;
    }

    setExportingAll(true);
    setExportProgress(0);
    setCurrentExportingTab('');
    setCancelExport(false);

    await new Promise(resolve => setTimeout(resolve, 100));

    try {
      // Use LANDSCAPE orientation for all pages
      const pdf = new jsPDF('l', 'mm', 'a4');
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      addSarabunFont(pdf); // Add Sarabun font (or fallback to built-in)
      const margin = 15;
      const footerHeight = 20;
      const maxContentHeight = pageHeight - margin - footerHeight;

      // Helper function to add professional page footer (handles both portrait and landscape)
      const addPageFooter = (pageNum: number, currentPage: number, totalPages: number) => {
        // Get current page dimensions (could be portrait or landscape)
        const currentPageWidth = pdf.internal.pageSize.getWidth();
        const currentPageHeight = pdf.internal.pageSize.getHeight();
        const currentMargin = 10;
        const currentFooterHeight = 15;
        const footerY = currentPageHeight - 8;

        // Footer line
        pdf.setDrawColor(120, 53, 168); // Purple
        pdf.setLineWidth(0.8);
        pdf.line(currentMargin, currentPageHeight - currentFooterHeight, currentPageWidth - currentMargin, currentPageHeight - currentFooterHeight);

        // Footer text
        pdf.setFontSize(8);
        pdf.setTextColor(80, 80, 80);
        pdf.setFont('Sarabun', 'normal');
        pdf.text('Quality Engineering Department - Quality Control Report', currentMargin, footerY);

        const dateStr = formatDateTime(new Date());
        pdf.setFont('Sarabun', 'italic');
        pdf.text(`Generated: ${dateStr}`, currentPageWidth / 2, footerY, { align: 'center' });

        pdf.setFont('Sarabun', 'bold');
        pdf.text(`Page ${currentPage} / ${totalPages}`, currentPageWidth - currentMargin, footerY, { align: 'right' });
        pdf.setTextColor(0, 0, 0);
      };

      // ========== COVER PAGE (LANDSCAPE) ==========
      setCurrentExportingTab('Creating Cover Page');
      setExportProgress(2);

      // Cover page gradient background (simulate with rectangles) - landscape layout
      pdf.setFillColor(120, 53, 168); // Purple
      pdf.rect(0, 0, pageWidth, 70, 'F');
      pdf.setFillColor(249, 115, 22); // Orange
      pdf.rect(0, 70, pageWidth, 5, 'F');

      // Main title - centered in landscape
      pdf.setTextColor(255, 255, 255);
      pdf.setFont('Sarabun', 'bold');
      pdf.setFontSize(36);
      pdf.text('Customer Quality Reports (SGT FORMAT)', pageWidth / 2, 30, { align: 'center' });

      pdf.setFontSize(22);
      pdf.text(systemName, pageWidth / 2, 48, { align: 'center' });

      // Subtitle
      pdf.setFontSize(14);
      pdf.setFont('Sarabun', 'normal');
      pdf.text('Comprehensive Quality Control Dashboard', pageWidth / 2, 65, { align: 'center' });

      // Two-column layout for landscape
      const leftColX = margin + 20;
      const rightColX = pageWidth / 2 + 20;
      const contentStartY = 90;

      // LEFT COLUMN - Report Info
      pdf.setDrawColor(120, 53, 168);
      pdf.setLineWidth(1);
      pdf.setFillColor(248, 250, 252);
      pdf.roundedRect(leftColX, contentStartY, pageWidth / 2 - 50, 80, 3, 3, 'FD');

      pdf.setTextColor(120, 53, 168);
      pdf.setFont('Sarabun', 'bold');
      pdf.setFontSize(16);
      pdf.text('Report Information', leftColX + 10, contentStartY + 15);

      pdf.setTextColor(60, 60, 60);
      pdf.setFont('Sarabun', 'bold');
      pdf.setFontSize(12);
      pdf.text('Report Period:', leftColX + 10, contentStartY + 30);
      pdf.setFont('Sarabun', 'normal');
      pdf.setFontSize(20);
      pdf.setTextColor(120, 53, 168);
      pdf.text(`FY${selectedFY} / WW${selectedWW}`, leftColX + 10, contentStartY + 45);

      pdf.setTextColor(60, 60, 60);
      pdf.setFont('Sarabun', 'bold');
      pdf.setFontSize(11);
      pdf.text('Generated:', leftColX + 10, contentStartY + 60);
      pdf.setFont('Sarabun', 'normal');
      pdf.setFontSize(9);
      const fullDate = formatDateTime(new Date());
      pdf.text(fullDate, leftColX + 10, contentStartY + 70);

      // RIGHT COLUMN - Reports Included
      pdf.setDrawColor(120, 53, 168);
      pdf.setFillColor(248, 250, 252);
      pdf.roundedRect(rightColX, contentStartY, pageWidth / 2 - 50, 80, 3, 3, 'FD');

      pdf.setTextColor(120, 53, 168);
      pdf.setFont('Sarabun', 'bold');
      pdf.setFontSize(16);
      pdf.text('Reports Included', rightColX + 10, contentStartY + 15);

      pdf.setTextColor(60, 60, 60);
      pdf.setFont('Sarabun', 'normal');
      pdf.setFontSize(10);
      let reportListY = contentStartY + 28;
      tabs.forEach((tab, index) => {
        pdf.setTextColor(120, 53, 168);
        pdf.setFont('Sarabun', 'bold');
        pdf.text(`${index + 1}.`, rightColX + 10, reportListY);
        pdf.setTextColor(60, 60, 60);
        pdf.setFont('Sarabun', 'normal');
        pdf.text(tab.label, rightColX + 20, reportListY);
        pdf.setFontSize(8);
        pdf.setTextColor(120, 120, 120);
        pdf.text(tab.icon, rightColX + 100, reportListY);
        pdf.setFontSize(10);
        reportListY += 9;
      });

      // Footer note on cover
      pdf.setTextColor(100, 100, 100);
      pdf.setFont('Sarabun', 'italic');
      pdf.setFontSize(9);
      const footerNote = 'This document contains confidential information. Distribution is restricted.';
      pdf.text(footerNote, pageWidth / 2, pageHeight - 20, { align: 'center' });

      // Seagate branding
      pdf.setFont('Sarabun', 'bold');
      pdf.setFontSize(11);
      pdf.setTextColor(120, 53, 168);
      pdf.text('Quality Engineering Department', pageWidth / 2, pageHeight - 10, { align: 'center' });

      // ========== TABLE OF CONTENTS (LANDSCAPE) ==========
      pdf.addPage('l');
      setCurrentExportingTab('Creating Table of Contents');
      setExportProgress(4);

      // TOC Header with full width
      pdf.setFillColor(120, 53, 168);
      pdf.rect(0, 0, pageWidth, 45, 'F');
      pdf.setFillColor(249, 115, 22);
      pdf.rect(0, 45, pageWidth, 3, 'F');

      pdf.setTextColor(255, 255, 255);
      pdf.setFont('Sarabun', 'bold');
      pdf.setFontSize(28);
      pdf.text('TABLE OF CONTENTS', pageWidth / 2, 28, { align: 'center' });

      // TOC entries - centered content area
      const tocContentWidth = pageWidth - (2 * margin) - 80;
      const tocStartX = margin + 40;
      let tocY = 70;

      pdf.setTextColor(60, 60, 60);
      pdf.setFont('Sarabun', 'bold');
      pdf.setFontSize(11);

      // Pre-calculate page counts for each report
      setCurrentExportingTab('Calculating page numbers...');
      const reportPageCounts: number[] = [];
      const reportPageNumbers: number[] = [];

      for (let i = 0; i < tabs.length; i++) {
        const tab = tabs[i];

        // For multi-model reports (LAR, Trend), count models
        if (tab.id === 'lar' || tab.id === 'trend') {
          setActiveTab(tab.id);
          await new Promise(resolve => setTimeout(resolve, 800));

          let modelSections: NodeListOf<Element> = contentRef.current!.querySelectorAll('[data-chart]');
          let attempts = 0;
          const maxAttempts = 20;

          while (modelSections.length === 0 && attempts < maxAttempts) {
            await new Promise(resolve => setTimeout(resolve, 500));
            modelSections = contentRef.current!.querySelectorAll('[data-chart]');
            attempts++;
          }

          const modelCount = modelSections.length || 1;
          reportPageCounts.push(modelCount);
        } else {
          // Standard reports get 1 page
          reportPageCounts.push(1);
        }
      }

      // Calculate starting page number for each report
      let currentPageNum = 3; // Cover + TOC = 2 pages, reports start at page 3
      for (let i = 0; i < tabs.length; i++) {
        reportPageNumbers.push(currentPageNum);
        currentPageNum += reportPageCounts[i];
      }

      tabs.forEach((tab, index) => {
        // TOC entry box with hover effect styling
        pdf.setDrawColor(120, 53, 168);
        pdf.setLineWidth(0.5);
        pdf.setFillColor(248, 250, 252);
        pdf.roundedRect(tocStartX, tocY - 8, tocContentWidth, 18, 2, 2, 'FD');

        // Report number badge
        pdf.setFillColor(120, 53, 168);
        pdf.circle(tocStartX + 10, tocY, 5, 'F');
        pdf.setTextColor(255, 255, 255);
        pdf.setFont('Sarabun', 'bold');
        pdf.setFontSize(10);
        pdf.text(`${index + 1}`, tocStartX + 10, tocY + 2, { align: 'center' });

        // Report icon
        pdf.setTextColor(120, 53, 168);
        pdf.setFontSize(14);
        pdf.text(tab.icon, tocStartX + 25, tocY + 2);

        // Report name
        pdf.setTextColor(60, 60, 60);
        pdf.setFont('Sarabun', 'bold');
        pdf.setFontSize(12);
        pdf.text(tab.label, tocStartX + 40, tocY + 2);

        // Dotted line leader
        pdf.setDrawColor(200, 200, 200);
        pdf.setLineDash([2, 2]);
        pdf.line(tocStartX + 40 + pdf.getTextWidth(tab.label) + 10, tocY, tocStartX + tocContentWidth - 30, tocY);
        pdf.setLineDash([]);

        // Page number - show range if multiple pages
        pdf.setTextColor(120, 53, 168);
        pdf.setFont('Sarabun', 'bold');
        pdf.setFontSize(11);
        const startPage = reportPageNumbers[index];
        const pageCount = reportPageCounts[index];
        const pageText = pageCount > 1
          ? `Pages ${startPage}-${startPage + pageCount - 1}`
          : `Page ${startPage}`;
        pdf.text(pageText, tocStartX + tocContentWidth - 20, tocY + 2, { align: 'right' });

        tocY += 22;
      });

      // Instructions box
      pdf.setFillColor(255, 248, 230);
      pdf.setDrawColor(249, 115, 22);
      pdf.setLineWidth(0.5);
      pdf.roundedRect(tocStartX, tocY + 5, tocContentWidth, 15, 2, 2, 'FD');

      pdf.setTextColor(120, 80, 20);
      pdf.setFont('Sarabun', 'italic');
      pdf.setFontSize(9);
      pdf.text('Note: This report contains 5 comprehensive quality control analyses for the specified period.', tocStartX + 10, tocY + 13);

      const originalTab = activeTab;

      // Loop through all tabs and capture each report using individual export format
      for (let i = 0; i < tabs.length; i++) {
        // Check for cancellation before processing each report
        if (cancelExport) {
          console.log('❌ Export all cancelled by user');
          setActiveTab(originalTab); // Restore original tab
          return;
        }

        const tab = tabs[i];
        const progressStart = 6 + (i / tabs.length) * 84; // 6% for cover+TOC, 84% for reports
        const progressPerTab = 84 / tabs.length;

        setCurrentExportingTab(tab.label);
        setExportProgress(progressStart);

        // Switch to the tab to render its content
        setActiveTab(tab.id);
        await new Promise(resolve => setTimeout(resolve, 800));

        setExportProgress(progressStart + progressPerTab * 0.2);

        console.log(`📸 Capturing ${tab.label} using individual export format...`);

        // ========== SPECIAL HANDLING FOR LAR AND TREND REPORTS (Multi-Model Export) ==========
        if (tab.id === 'lar' || tab.id === 'trend') {
          console.log(`🔍 ${tab.label} detected - using model-per-page export in Export All`);

          // Wait for DOM to fully render all models with polling
          console.log('⏳ Waiting for models to render...');
          let modelSections: NodeListOf<Element> = contentRef.current!.querySelectorAll('[data-chart]');
          let attempts = 0;
          const maxAttempts = 20;

          while (modelSections.length === 0 && attempts < maxAttempts) {
            await new Promise(resolve => setTimeout(resolve, 500));
            modelSections = contentRef.current!.querySelectorAll('[data-chart]');
            attempts++;
            console.log(`   Attempt ${attempts}: Found ${modelSections.length} models`);
          }

          // Wait a bit more to ensure all models are fully rendered
          if (modelSections.length > 0) {
            console.log(`   ✅ Found ${modelSections.length} models, waiting for full render...`);
            await new Promise(resolve => setTimeout(resolve, 1500));
            modelSections = contentRef.current!.querySelectorAll('[data-chart]');
            console.log(`   Final model count: ${modelSections.length}`);
          }

          const modelNames = Array.from(modelSections).map(el => el.getAttribute('data-chart'));
          console.log('   Model names:', modelNames);

          if (modelSections.length === 0) {
            console.warn(`No models found for ${tab.label}, skipping...`);
            continue;
          }

          const totalModels = modelSections.length;

          // Process each model on a separate page
          for (let modelIdx = 0; modelIdx < totalModels; modelIdx++) {
            if (cancelExport) {
              console.log('❌ Export all cancelled by user');
              setActiveTab(originalTab);
              return;
            }

            const modelElement = modelSections[modelIdx];
            const modelName = modelElement.getAttribute('data-chart');

            const chartElement = contentRef.current!.querySelector(`[data-chart="${modelName}"]`) as HTMLElement;
            const tableElement = contentRef.current!.querySelector(`[data-table="${modelName}"]`) as HTMLElement;

            if (!chartElement || !tableElement) {
              console.warn(`Missing chart or table for model ${modelName}, skipping...`);
              continue;
            }

            console.log(`   📦 Adding model ${modelIdx + 1}/${totalModels}: ${modelName}`);

            // Add new page for this model
            pdf.addPage('l', 'a4');

            const landscapeWidth = pdf.internal.pageSize.getWidth();
            const landscapeHeight = pdf.internal.pageSize.getHeight();
            const landscapeMargin = 10;
            const landscapeFooterHeight = 15;
            const maxLandscapeContentHeight = landscapeHeight - landscapeMargin - landscapeFooterHeight;

            let yPosition = landscapeMargin;

            // Add section header
            const headerHeight = 18;
            const startY = yPosition;

            pdf.setFillColor(120, 53, 168);
            pdf.rect(landscapeMargin, startY, landscapeWidth - (2 * landscapeMargin), headerHeight, 'F');

            pdf.setFillColor(249, 115, 22);
            pdf.rect(landscapeMargin, startY + headerHeight, landscapeWidth - (2 * landscapeMargin), 2, 'FD');

            pdf.setFillColor(249, 115, 22);
            pdf.circle(landscapeMargin + 8, startY + 9, 6, 'F');
            pdf.setTextColor(255, 255, 255);
            pdf.setFont('Sarabun', 'bold');
            pdf.setFontSize(10);
            pdf.text(`${i + 1}`, landscapeMargin + 8, startY + 11, { align: 'center' });

            pdf.setTextColor(255, 255, 255);
            pdf.setFont('Sarabun', 'bold');
            pdf.setFontSize(14);
            pdf.text(tab.label, landscapeMargin + 20, startY + 11);

            pdf.setFontSize(16);
            pdf.text(tab.icon, landscapeWidth - landscapeMargin - 12, startY + 12);

            // FY/WW on same row as report name, aligned right
            pdf.setFont('Sarabun', 'normal');
            pdf.setFontSize(10);
            pdf.setTextColor(230, 230, 230);
            pdf.text(`FY${selectedFY} / WW${selectedWW}`, landscapeWidth - landscapeMargin - 25, startY + 11, { align: 'right' });

            yPosition += headerHeight + 5;

            // Add model name
            pdf.setFontSize(12);
            pdf.setFont('Sarabun', 'bold');
            pdf.setTextColor(120, 53, 168);
            pdf.text(`Model: ${modelName}`, landscapeWidth / 2, yPosition, { align: 'center' });
            yPosition += 8;
            pdf.setTextColor(0, 0, 0);

            // Capture chart and table with forced re-render for complete SVG rendering
            // Force browser to recalculate layout
            chartElement.style.visibility = 'hidden';
            await new Promise(resolve => setTimeout(resolve, 100));
            chartElement.style.visibility = 'visible';
            await new Promise(resolve => setTimeout(resolve, 2000));
            chartElement.getBoundingClientRect(); // Force layout recalculation

          const chartCanvas = await html2canvas(chartElement, getOptimizedHtml2CanvasOptions(chartElement, `[data-chart="${modelName}"]`, true, false, true) as any);
            const tableCanvas = await html2canvas(tableElement, getOptimizedHtml2CanvasOptions(tableElement, `[data-table="${modelName}"]`, true, true, false) as any);

            const contentWidth = landscapeWidth - (2 * landscapeMargin);
            const availableHeight = maxLandscapeContentHeight - yPosition;
            const spacing = 3;

            const chartAspectRatio = chartCanvas.width / chartCanvas.height;
            const tableAspectRatio = tableCanvas.width / tableCanvas.height;

            let chartWidth = contentWidth * 0.95;
            let chartHeight = chartWidth / chartAspectRatio;
            let tableWidth = contentWidth * 0.95;
            let tableHeight = tableWidth / tableAspectRatio;

            const totalHeight = chartHeight + spacing + tableHeight;

            if (totalHeight > availableHeight) {
              const heightScaleFactor = availableHeight / totalHeight;
              chartHeight = chartHeight * heightScaleFactor;
              chartWidth = chartHeight * chartAspectRatio;
              tableHeight = tableHeight * heightScaleFactor;
              tableWidth = tableHeight * tableAspectRatio;
            }

            const chartImgData = chartCanvas.toDataURL('image/jpeg', 0.85);
            const tableImgData = tableCanvas.toDataURL('image/jpeg', 0.85);

            const chartX = landscapeMargin + (contentWidth - chartWidth) / 2;
            const tableX = landscapeMargin + (contentWidth - tableWidth) / 2;

            pdf.addImage(chartImgData, 'JPEG', chartX, yPosition, chartWidth, chartHeight);
            yPosition += chartHeight + spacing;
            pdf.addImage(tableImgData, 'JPEG', tableX, yPosition, tableWidth, tableHeight);

            setExportProgress(progressStart + ((modelIdx + 1) / totalModels) * progressPerTab);
          }

          console.log(`   ✅ ${tab.label} captured with ${totalModels} models`);
          setExportProgress(progressStart + progressPerTab);

        } else {
          // ========== STANDARD SINGLE-PAGE EXPORT FOR OTHER REPORTS ==========
          console.log(`🔍 ${tab.label} detected - using standard single-page export`);

          // Wait for report data to load with polling
          console.log('⏳ Waiting for report data to load...');
          let chartElement: HTMLElement | null = null;
          let tableElement: HTMLElement | null = null;
          let attempts = 0;
          const maxAttempts = 30; // Wait up to 15 seconds (30 * 500ms)

          // Poll until we find chart/table or timeout
          while (attempts < maxAttempts) {
            chartElement = contentRef.current?.querySelector('[data-chart="main"]') as HTMLElement;
            tableElement = contentRef.current?.querySelector('[data-table="main"]') as HTMLElement;

            // Fallback: try to find any element with data-chart/data-table
            if (!chartElement) {
              chartElement = contentRef.current?.querySelector('[data-chart]') as HTMLElement;
            }
            if (!tableElement) {
              tableElement = contentRef.current?.querySelector('[data-table]') as HTMLElement;
            }

            // For IQA Result, only table is expected (no chart)
            if (tab.id === 'result') {
              if (tableElement) {
                console.log(`   ✅ Found table for ${tab.label} after ${attempts} attempts`);
                break;
              }
            } else {
              // For other reports, we need both chart and table
              if (chartElement && tableElement) {
                console.log(`   ✅ Found chart and table for ${tab.label} after ${attempts} attempts`);
                break;
              }
            }

            await new Promise(resolve => setTimeout(resolve, 500));
            attempts++;
            if (attempts % 5 === 0) {
              console.log(`   Attempt ${attempts}: Chart=${!!chartElement}, Table=${!!tableElement}`);
            }
          }

          if (tab.id === 'result' && !tableElement) {
            console.warn(`❌ Could not find table for ${tab.label} after ${attempts} attempts, skipping...`);
            continue;
          } else if (tab.id !== 'result' && (!chartElement || !tableElement)) {
            console.warn(`❌ Could not find chart/table for ${tab.label} after ${attempts} attempts, skipping...`);
            continue;
          }

          // Additional wait to ensure data is fully rendered
          await new Promise(resolve => setTimeout(resolve, 800));
          console.log(`   ⏱️ Additional render time completed for ${tab.label}`);

          // Use LANDSCAPE orientation for reports (matching individual export)
          pdf.addPage('l', 'a4');

        // Get landscape dimensions
        const landscapeWidth = pdf.internal.pageSize.getWidth();
        const landscapeHeight = pdf.internal.pageSize.getHeight();
        const landscapeMargin = 10;
        const landscapeFooterHeight = 15;
        const maxLandscapeContentHeight = landscapeHeight - landscapeMargin - landscapeFooterHeight;

        // ========== PROFESSIONAL SECTION HEADER (Landscape) ==========
        let yPosition = landscapeMargin;

        // Helper function to add section header on landscape page
        const addSectionHeader = (reportNum: number, reportName: string, reportIcon: string) => {
          const headerHeight = 25;
          const startY = yPosition;

          // Header banner
          pdf.setFillColor(120, 53, 168); // Purple
          pdf.rect(landscapeMargin, startY, landscapeWidth - (2 * landscapeMargin), headerHeight, 'F');

          // Accent stripe
          pdf.setFillColor(249, 115, 22); // Orange
          pdf.rect(landscapeMargin, startY + headerHeight, landscapeWidth - (2 * landscapeMargin), 2, 'FD');

          // Report number badge
          pdf.setFillColor(249, 115, 22);
          pdf.circle(landscapeMargin + 8, startY + 12, 6, 'F');
          pdf.setTextColor(255, 255, 255);
          pdf.setFont('Sarabun', 'bold');
          pdf.setFontSize(10);
          pdf.text(`${reportNum}`, landscapeMargin + 8, startY + 14, { align: 'center' });

          // Report title
          pdf.setTextColor(255, 255, 255);
          pdf.setFont('Sarabun', 'bold');
          pdf.setFontSize(14);
          pdf.text(reportName, landscapeMargin + 20, startY + 14);

          // Report icon
          pdf.setFontSize(16);
          pdf.text(reportIcon, landscapeWidth - landscapeMargin - 12, startY + 15);

          // Period info
          pdf.setFont('Sarabun', 'normal');
          pdf.setFontSize(8);
          pdf.setTextColor(230, 230, 230);
          pdf.text(`FY${selectedFY} / WW${selectedWW}`, landscapeMargin + 20, startY + 21);

          return headerHeight + 5; // Return header height + spacing
        };

        yPosition += addSectionHeader(i + 1, tab.label, tab.icon);

        // ========== CAPTURE CHART AND TABLE SEPARATELY (Same as individual export) ==========

        setExportProgress(progressStart + progressPerTab * 0.4);

        if (chartElement && tableElement) {
          // Both chart and table exist
          const contentWidth = landscapeWidth - (2 * landscapeMargin);
          const availableHeight = maxLandscapeContentHeight - yPosition;
          const spacing = 3;

          // Capture chart with forced re-render for complete SVG rendering
          // Force browser to recalculate layout
          chartElement.style.visibility = 'hidden';
          await new Promise(resolve => setTimeout(resolve, 100));
          chartElement.style.visibility = 'visible';
          await new Promise(resolve => setTimeout(resolve, 2000));
          chartElement.getBoundingClientRect(); // Force layout recalculation

          const chartCanvas = await html2canvas(chartElement, getOptimizedHtml2CanvasOptions(chartElement, '[data-chart]', true, false, true) as any);

          setExportProgress(progressStart + progressPerTab * 0.6);

          // Capture table
          const tableCanvas = await html2canvas(tableElement, getOptimizedHtml2CanvasOptions(tableElement, '[data-table]', true, true, false) as any);

          setExportProgress(progressStart + progressPerTab * 0.8);

          // Calculate sizes
          const chartAspectRatio = chartCanvas.width / chartCanvas.height;
          const tableAspectRatio = tableCanvas.width / tableCanvas.height;

          let chartWidth = contentWidth * 0.95;
          let chartHeight = chartWidth / chartAspectRatio;
          let tableWidth = contentWidth * 0.95;
          let tableHeight = tableWidth / tableAspectRatio;

          const totalHeight = chartHeight + spacing + tableHeight;

          // Scale if needed to fit on page
          if (totalHeight > availableHeight) {
            const heightScaleFactor = availableHeight / totalHeight;
            chartHeight = chartHeight * heightScaleFactor;
            chartWidth = chartHeight * chartAspectRatio;
            tableHeight = tableHeight * heightScaleFactor;
            tableWidth = tableHeight * tableAspectRatio;
          }

          // Convert to JPEG
          const chartImgData = chartCanvas.toDataURL('image/jpeg', 0.85);
          const tableImgData = tableCanvas.toDataURL('image/jpeg', 0.85);

          // Center elements
          const chartX = landscapeMargin + (contentWidth - chartWidth) / 2;
          const tableX = landscapeMargin + (contentWidth - tableWidth) / 2;

          // Add to PDF
          pdf.addImage(chartImgData, 'JPEG', chartX, yPosition, chartWidth, chartHeight);
          yPosition += chartHeight + spacing;
          pdf.addImage(tableImgData, 'JPEG', tableX, yPosition, tableWidth, tableHeight);

        } else if (chartElement) {
          // Only chart exists
          // Force browser to recalculate layout
          chartElement.style.visibility = 'hidden';
          await new Promise(resolve => setTimeout(resolve, 100));
          chartElement.style.visibility = 'visible';
          await new Promise(resolve => setTimeout(resolve, 2000));
          chartElement.getBoundingClientRect(); // Force layout recalculation

          const chartCanvas = await html2canvas(chartElement, getOptimizedHtml2CanvasOptions(chartElement, '[data-chart]', true, false, true) as any);

          const contentWidth = landscapeWidth - (2 * landscapeMargin);
          const chartAspectRatio = chartCanvas.width / chartCanvas.height;
          let chartWidth = contentWidth * 0.95;
          let chartHeight = chartWidth / chartAspectRatio;

          const chartImgData = chartCanvas.toDataURL('image/jpeg', 0.85);
          const chartX = landscapeMargin + (contentWidth - chartWidth) / 2;
          pdf.addImage(chartImgData, 'JPEG', chartX, yPosition, chartWidth, chartHeight);
        } else if (tableElement) {
          // Only table exists (e.g., IQA Result report)
          console.log(`   📋 Only table found for ${tab.label}, capturing table...`);
          await new Promise(resolve => setTimeout(resolve, 200));
          const tableCanvas = await html2canvas(tableElement, getOptimizedHtml2CanvasOptions(tableElement, '[data-table]', true, true, false) as any);

          setExportProgress(progressStart + progressPerTab * 0.8);

          const contentWidth = landscapeWidth - (2 * landscapeMargin);
          const tableAspectRatio = tableCanvas.width / tableCanvas.height;
          let tableWidth = contentWidth * 0.95;
          let tableHeight = tableWidth / tableAspectRatio;

          // Scale if needed to fit on page
          const availableHeight = maxLandscapeContentHeight - yPosition;
          if (tableHeight > availableHeight) {
            const heightScaleFactor = availableHeight / tableHeight;
            tableHeight = tableHeight * heightScaleFactor;
            tableWidth = tableHeight * tableAspectRatio;
          }

          const tableImgData = tableCanvas.toDataURL('image/jpeg', 0.85);
          const tableX = landscapeMargin + (contentWidth - tableWidth) / 2;
          pdf.addImage(tableImgData, 'JPEG', tableX, yPosition, tableWidth, tableHeight);
        } else {
          console.warn(`   ⚠️ No chart or table found for ${tab.label}, skipping capture`);
        }

          console.log(`   ✅ ${tab.label} captured in landscape format`);
          setExportProgress(progressStart + progressPerTab);
        }
      }

      // Restore original tab
      setActiveTab(originalTab);

      setCurrentExportingTab('Finalizing PDF');
      setExportProgress(92);

      // ========== ADD BACK COVER PAGE (LANDSCAPE) ==========
      pdf.addPage('l');
      pdf.setFillColor(120, 53, 168);
      pdf.rect(0, 0, pageWidth, pageHeight, 'F');

      // Large title at center
      pdf.setTextColor(255, 255, 255);
      pdf.setFont('Sarabun', 'bold');
      pdf.setFontSize(32);
      pdf.text('END OF REPORT', pageWidth / 2, pageHeight / 2 - 30, { align: 'center' });

      // Accent line
      pdf.setDrawColor(249, 115, 22);
      pdf.setLineWidth(2);
      pdf.line(pageWidth / 2 - 80, pageHeight / 2 - 15, pageWidth / 2 + 80, pageHeight / 2 - 15);

      // Thank you message
      pdf.setFont('Sarabun', 'normal');
      pdf.setFontSize(14);
      pdf.setTextColor(230, 230, 230);
      pdf.text('Thank you for reviewing this quality control report.', pageWidth / 2, pageHeight / 2 + 5, { align: 'center' });

      pdf.setFontSize(11);
      pdf.text('For questions or clarifications, please contact the Quality Assurance team.', pageWidth / 2, pageHeight / 2 + 20, { align: 'center' });

      // Report summary at bottom
      pdf.setFontSize(9);
      pdf.setTextColor(200, 200, 200);
      pdf.text(`Report Period: FY${selectedFY} / WW${selectedWW}`, pageWidth / 2, pageHeight / 2 + 40, { align: 'center' });
      const generatedDate = formatDate(new Date());
      pdf.text(`Generated: ${generatedDate}`, pageWidth / 2, pageHeight / 2 + 50, { align: 'center' });

      // Seagate logo/text at bottom
      pdf.setFont('Sarabun', 'bold');
      pdf.setFontSize(18);
      pdf.setTextColor(249, 115, 22);
      pdf.text('Quality Engineering Department', pageWidth / 2, pageHeight - 35, { align: 'center' });

      pdf.setFont('Sarabun', 'normal');
      pdf.setFontSize(11);
      pdf.setTextColor(200, 200, 200);
      pdf.text('Quality. Innovation. Excellence.', pageWidth / 2, pageHeight - 22, { align: 'center' });

      setExportProgress(95);

      // Add footers to all pages (except cover and back cover)
      const totalPages = pdf.getNumberOfPages();
      const contentPages = totalPages - 2; // Exclude cover and back cover
      for (let i = 1; i <= totalPages; i++) {
        pdf.setPage(i);
        // Skip footer on cover page (1) and back cover (last page)
        if (i > 1 && i < totalPages) {
          addPageFooter(i, i - 1, contentPages); // (actual page, display page number, total content pages)
        }
      }

      setExportProgress(97);
      await new Promise(resolve => setTimeout(resolve, 100));

      // Generate professional filename
      const dateStr = getTodayDateString().replace(/-/g, '');
      const filename = `SGT_Quality_Report_FY${selectedFY}_WW${selectedWW}_${dateStr}.pdf`;

      // Set PDF metadata for professional touch
      pdf.setProperties({
        title: `SGT Format - Quality Control Reports FY${selectedFY} WW${selectedWW}`,
        subject: 'Customer Quality Control Dashboard - All Reports',
        author: 'Quality Engineering Department - Quality Assurance Team',
        keywords: 'quality control, LAR, IQA, OQA, DPPM, defects',
        creator: 'SGT Format System'
      });

      pdf.save(filename);

      setExportProgress(100);
      await new Promise(resolve => setTimeout(resolve, 200));

      console.log('✅ Professional PDF exported successfully:', filename);
      console.log(`   📄 Total pages: ${totalPages}`);
      console.log(`   📊 Reports included: ${tabs.length}`);
    } catch (error) {
      console.error('❌ Error exporting all reports:', error);
      if (!cancelExport) {
        alert('Failed to export all reports. Please try again.');
      }
    } finally {
      setTimeout(() => {
        setExportingAll(false);
        setExportProgress(0);
        setCurrentExportingTab('');
        setCancelExport(false);
      }, 500);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50">
      <div className="max-w-[98%] mx-auto py-4 px-2">

        {/* Page Header */}
        <div className="bg-gradient-to-r from-purple-600 via-pink-600 to-orange-600 rounded-xl shadow-2xl border-2 border-purple-200 p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white drop-shadow-lg">SGT Format - Customer Reports</h1>
              <p className="text-pink-100 font-medium mt-1">Comprehensive Quality Control Dashboard</p>
            </div>
            <div className="flex items-center gap-4">
              {/* Selected Filter Display */}
              {selectedFY && selectedWW && (
                <div className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-blue-200 rounded-lg">
                  <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div>
                    <p className="text-xs font-semibold text-gray-600">Selected Period</p>
                    <p className="text-sm font-bold text-blue-700">
                      FY{selectedFY} / WW{selectedWW}
                    </p>
                  </div>
                </div>
              )}
              <div className="text-white text-sm bg-white bg-opacity-20 px-4 py-2 rounded-lg backdrop-blur-sm">
                <span className="font-semibold">Current View: </span>
                {tabs.find(t => t.id === activeTab)?.label}
              </div>
              <button
                onClick={handleExportPDF}
                disabled={exportingPDF || exportingAll}
                className="px-6 py-2.5 bg-white text-purple-600 font-bold rounded-lg hover:bg-purple-50 transition-all shadow-lg hover:shadow-xl transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-purple-600 disabled:bg-gray-300 disabled:text-gray-500 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:shadow-lg flex items-center gap-2"
              >
                {exportingPDF ? (
                  <>
                    <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Exporting...
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Export Current
                  </>
                )}
              </button>
              <button
                onClick={handleExportAllReports}
                disabled={exportingPDF || exportingAll}
                className="px-6 py-2.5 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold rounded-lg hover:from-green-600 hover:to-emerald-700 transition-all shadow-lg hover:shadow-xl transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-purple-600 disabled:bg-gray-300 disabled:text-gray-500 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:shadow-lg flex items-center gap-2"
              >
                {exportingAll ? (
                  <>
                    <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Exporting...
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Export All Reports
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="bg-white rounded-xl shadow-lg border-2 border-gray-200 mb-6 overflow-hidden">
          <div className="flex">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 px-2 py-3 font-semibold text-xs transition-all duration-200 ${
                  activeTab === tab.id
                    ? `bg-gradient-to-r ${tab.color} text-white shadow-lg`
                    : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                }`}
              >
                <div className="flex items-center justify-center space-x-1">
                  <span className="text-lg">{tab.icon}</span>
                  <span className="truncate">{tab.label}</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Report Content - Compact View */}
        <div ref={contentRef}>
          <div className="bg-white rounded-xl shadow-lg border-2 border-gray-200 overflow-hidden">
            {/* LAR Report */}
            {activeTab === 'lar' && selectedFY && selectedWW && (
              <div className="transform transition-all duration-300 ease-in-out" key={`lar-${selectedFY}-${selectedWW}`}>
                <LARReportBase
                  config={{
                    ...larConfig,
                    hideUI: { breadcrumb: true, filters: true, exportButton: true, header: false }
                  }}
                />
              </div>
            )}

            {/* IQA vs OQA Report */}
            {activeTab === 'iqaoqa' && selectedFY && selectedWW && (
              <div className="transform transition-all duration-300 ease-in-out" key={`iqaoqa-${selectedFY}-${selectedWW}`}>
                <SGTIQAvsNHKOQABase
                  config={{
                    ...iqaoqaConfig,
                    sharedFilters: { fiscalYear: selectedFY, workWeek: selectedWW },
                    hideUI: { breadcrumb: true, filters: true, exportButton: true, header: false }
                  }}
                />
              </div>
            )}

            {/* Overall OQA Report */}
            {activeTab === 'overalloqa' && selectedFY && selectedWW && (
              <div className="transform transition-all duration-300 ease-in-out" key={`overalloqa-${selectedFY}-${selectedWW}`}>
                <OverallOQAReportBase
                  config={{
                    ...overallOQAConfig,
                    sharedFilters: { fiscalYear: selectedFY, workWeek: selectedWW },
                    hideUI: {
                      breadcrumb: true,
                      filters: true,
                      exportButton: true,
                      header: false,
                      fiscalYearCard: true,
                      larCard: true,
                      totalNGCard: true
                    }
                  }}
                />
              </div>
            )}

            {/* Seagate IQA Result - defaults to previous week (WW-1) */}
            {activeTab === 'result' && prevFY && prevWW && (
              <div className="transform transition-all duration-300 ease-in-out" key={`result-${prevFY}-${prevWW}`}>
                <SeagateIQAResultReportBase
                  config={{
                    ...resultConfig,
                    sharedFilters: { fiscalYear: prevFY, workWeek: prevWW },
                    hideUI: { breadcrumb: true, filters: true, exportButton: true, header: true }
                  }}
                />
              </div>
            )}

            {/* SGT IQA Trend - defaults to previous week (WW-1) */}
            {activeTab === 'trend' && prevFY && prevWW && (
              <div className="transform transition-all duration-300 ease-in-out" key={`trend-${prevFY}-${prevWW}`}>
                <SGTIQATrendReportBase
                  config={{
                    ...trendConfig,
                    sharedFilters: { fiscalYear: prevFY, workWeek: prevWW },
                    hideUI: { breadcrumb: true, filters: true, exportButton: true, header: false }
                  }}
                />
              </div>
            )}

            {/* Loading or No filters message */}
            {(!selectedFY || !selectedWW) && (
              <div className="p-12 text-center">
                {filtersLoading ? (
                  <>
                    <div className="w-16 h-16 mx-auto mb-4 border-4 border-orange-200 border-t-orange-600 rounded-full animate-spin"></div>
                    <h3 className="text-xl font-bold text-gray-700 mb-2">Loading Report Filters...</h3>
                    <p className="text-gray-500">Initializing fiscal year and work week data</p>
                  </>
                ) : (
                  <>
                    <svg className="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    <h3 className="text-xl font-bold text-gray-700 mb-2">Select Filters to View Reports</h3>
                    <p className="text-gray-500">Please select both Fiscal Year and Work Week from the filters above to display the reports.</p>
                  </>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 text-center text-sm text-gray-500">
          <p>Generated on {formatDate(new Date())} • {systemName}</p>
        </div>
      </div>

      {/* Export Progress Modal */}
      {(exportingPDF || exportingAll) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full mx-4">
            <div className="text-center">
              <div className="mb-6">
                <svg className="animate-spin h-16 w-16 mx-auto text-purple-600" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              </div>

              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                {exportingAll ? 'Exporting All Reports' : 'Exporting PDF'}
              </h3>
              <p className="text-gray-600 mb-6">
                {exportingAll
                  ? 'Please wait while we generate all 5 reports...'
                  : 'Please wait while we generate your report...'}
              </p>

              {/* Current Report Being Exported (for Export All) */}
              {exportingAll && currentExportingTab && (
                <div className="mb-4 p-3 bg-purple-50 rounded-lg">
                  <p className="text-sm font-semibold text-purple-700">
                    Currently exporting: <span className="text-purple-900">{currentExportingTab}</span>
                  </p>
                </div>
              )}

              {/* Progress Bar */}
              <div className="w-full bg-gray-200 rounded-full h-4 mb-3 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 h-4 rounded-full transition-all duration-300 ease-out"
                  style={{ width: `${exportProgress}%` }}
                ></div>
              </div>

              {/* Progress Percentage */}
              <p className="text-lg font-semibold text-purple-600">{exportProgress}%</p>

              {/* Progress Status Text */}
              <p className="text-sm text-gray-500 mt-3 mb-4">
                {exportProgress < 20 && "Initializing..."}
                {exportProgress >= 20 && exportProgress < 70 && (exportingAll ? "Capturing reports..." : "Capturing report content...")}
                {exportProgress >= 70 && exportProgress < 100 && "Generating PDF file..."}
                {exportProgress === 100 && "Complete!"}
              </p>

              {/* Cancel Button */}
              {exportProgress < 100 && (
                <button
                  onClick={() => setCancelExport(true)}
                  className="px-6 py-2.5 bg-gradient-to-r from-red-500 to-red-600 text-white font-semibold rounded-lg hover:from-red-600 hover:to-red-700 transition-all shadow-lg hover:shadow-xl transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                >
                  Cancel Export
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SGTFormatPage;
