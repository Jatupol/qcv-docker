// client/src/components/report/SGTIQATrendReportBase.tsx
// ===== SHARED SGT IQA TREND REPORT BASE COMPONENT =====
// Reusable SGT IQA Trend Report with configurable filters and data sources
// Manufacturing/Quality Control System - Orange Theme Implementation

import React, { useState, useEffect, useRef } from 'react';
import { ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { getMonthTrendName, formatNumber } from '../../utils';
import { getTodayDateString, formatDateTime } from '../../utils/formatUtils';
import { type DefectLegendItem, type SGTIQATrendRecord } from '../../types/report';

// ============ INTERFACES ============

interface SGTIQAData extends SGTIQATrendRecord{
  isHighlighted?: string;
}

// API Response structure
export interface APIResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
}

// Data source functions type definitions
export interface DataSourceFunctions {
  fetchChartData: (params: any) => Promise<APIResponse>;
  fetchDefectData: (params: any) => Promise<APIResponse>;
  fetchModels: (params?: { year?: string; ww?: string }) => Promise<APIResponse<string[]>>;
  fetchFiscalYears: () => Promise<APIResponse<string[]>>;
  fetchWorkWeeks: (fiscalYear: string) => Promise<APIResponse<string[]>>;
}

// Configuration for the SGT IQA Trend report
export interface SGTIQATrendReportConfig {
  // Report metadata
  title: string;
  breadcrumbTitle: string;

  // Filter visibility options
  showDateFilters?: boolean;          // Show FY/WW filters (default: true)
  showModelFilter?: boolean;           // Show Model filter (default: true)
  showProductTypeFilter?: boolean;     // Show Product Type filter (default: true)

  // Filter requirement flags
  dateRequired?: boolean;              // Is date selection required? (default: true)
  modelRequired?: boolean;             // Is model selection required? (default: false)

  // Data source functions
  dataSource: DataSourceFunctions;

  // Additional query parameters (optional)
  additionalParams?: Record<string, any>;

  // Auto-load configuration
  autoLoadOnMount?: boolean;           // Auto-load data when component mounts
  autoSelectAllModels?: boolean;       // Auto-select all available models

  // Default date range for initial display
  defaultDateRange?: {
    yearTo: string;
    wwTo: string;
  };

  // Shared filters from parent component
  sharedFilters?: {
    fiscalYear: string;
    workWeek: string;
  };

  // UI visibility control
  hideUI?: {
    breadcrumb?: boolean;
    filters?: boolean;
    exportButton?: boolean;
    header?: boolean;
  };

  // Model filter customization
  modelFilterLabel?: string;             // Custom label for model filter (default: 'Models')
  modelParamName?: string;               // Query param name for selected items (default: 'models', use 'productFamilies' for product family filter)
}

interface SGTIQATrendReportBaseProps {
  config: SGTIQATrendReportConfig;
}

// ============ MAIN COMPONENT ============

interface ModelSGTIQAData {
  model: string;
  data: SGTIQAData[];
}

const SGTIQATrendReportBase: React.FC<SGTIQATrendReportBaseProps> = ({ config }) => {
  const [selectedPeriod, setSelectedPeriod] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [sgtDataByModel, setSgtDataByModel] = useState<ModelSGTIQAData[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [exportingPDF, setExportingPDF] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);
  const contentRef = useRef<HTMLDivElement>(null);

  // Filter states - initialize from sharedFilters if provided (same pattern as IQA Result)
  const [fiscalYear, setfiscalYear] = useState<string>(
    config.sharedFilters?.fiscalYear || ''
  );
  const [ww, setww] = useState<string>(
    config.sharedFilters?.workWeek || ''
  );
  const [selectedModels, setSelectedModels] = useState<string[]>([]);
  const [selectedProductType, setSelectedProductType] = useState<string>('');
  const [availableModels, setAvailableModels] = useState<string[]>([]);
  const [availableFiscalYears, setAvailableFiscalYears] = useState<string[]>([]);
  const [availableWorkWeeksFrom, setAvailableWorkWeeks] = useState<string[]>([]);
  const [initialLoadDone, setInitialLoadDone] = useState<boolean>(false);

  // ============ DATA FETCHING ============

  // Fetch available models on component mount
  useEffect(() => {
    const fetchFilters = async () => {
      console.log('🔄 Fetching available filters...');

      // Fetch models
      const modelsResult = await config.dataSource.fetchModels();
      if (modelsResult.success && modelsResult.data) {
        setAvailableModels(modelsResult.data);
        if (config.autoSelectAllModels && modelsResult.data.length > 0) {
          setSelectedModels(modelsResult.data);
        }
      }

      // Fetch fiscal years
      const fyResult = await config.dataSource.fetchFiscalYears();
      if (fyResult.success && fyResult.data) {
        setAvailableFiscalYears(fyResult.data);
        // Only set default FY when NOT using sharedFilters
        if (!config.sharedFilters && config.defaultDateRange?.yearTo && fyResult.data.includes(config.defaultDateRange.yearTo)) {
          setfiscalYear(config.defaultDateRange.yearTo);
        }
      }
    };
    fetchFilters();
  }, []);

  // Helper to find matching ww value in list (handles format differences: "01" vs "1")
  const findMatchingWw = (wwValue: string, list: string[]): string | undefined => {
    if (!wwValue) return undefined;
    const wwNum = parseInt(wwValue, 10).toString();
    return list.find(item => parseInt(item, 10).toString() === wwNum);
  };

  // Fetch work weeks when fiscal year changes
  useEffect(() => {
    if (!fiscalYear) {
      setAvailableWorkWeeks([]);
      return;
    }
    const fetchWorkWeeks = async () => {
      const wwResult = await config.dataSource.fetchWorkWeeks(fiscalYear);
      if (wwResult.success && wwResult.data) {
        setAvailableWorkWeeks(wwResult.data);
        // Only auto-set WW when NOT using sharedFilters
        if (!config.sharedFilters && config.defaultDateRange?.wwTo) {
          const matchingWw = findMatchingWw(config.defaultDateRange.wwTo, wwResult.data);
          if (matchingWw) {
            setww(matchingWw);
          } else {
            const sortedWeeks = [...wwResult.data].sort((a, b) => parseInt(b, 10) - parseInt(a, 10));
            setww(sortedWeeks[0] || '');
          }
        }
      }
    };
    fetchWorkWeeks();
  }, [fiscalYear]);

  // Refresh models when FY/WW changes (standalone mode only)
  // getModelsSGAIQA accepts { year?, ww? } to filter models by period
  useEffect(() => {
    if (config.sharedFilters) return; // Skip for embedded mode
    const refreshModels = async () => {
      if (fiscalYear) {
        const params: { year?: string; ww?: string } = { year: fiscalYear };
        if (ww) params.ww = ww;
        const modelsResult = await config.dataSource.fetchModels(params);
        if (modelsResult.success && modelsResult.data) {
          setAvailableModels(modelsResult.data);
          if (config.autoSelectAllModels && modelsResult.data.length > 0) {
            setSelectedModels(modelsResult.data);
          }
        }
      }
    };
    refreshModels();
  }, [fiscalYear, ww]);

  // Handle shared filters from parent - load data immediately (same pattern as IQA Result)
  useEffect(() => {
    if (config.sharedFilters && !initialLoadDone) {
      console.log('🔄 SharedFilters loading data - FY:', config.sharedFilters.fiscalYear, 'WW:', config.sharedFilters.workWeek);
      setfiscalYear(config.sharedFilters.fiscalYear);
      setww(config.sharedFilters.workWeek);
      // Fetch immediately - no model filter needed, backend returns all data
      fetchSGTData(config.sharedFilters.fiscalYear, config.sharedFilters.workWeek);
      setInitialLoadDone(true);
    }
  }, [config.sharedFilters?.fiscalYear, config.sharedFilters?.workWeek]);

  // Auto-load for non-sharedFilters mode
  useEffect(() => {
    if (config.sharedFilters) return;
    if (config.autoLoadOnMount && !initialLoadDone && selectedModels.length > 0 && fiscalYear && ww) {
      console.log('🔄 Auto-loading SGT IQA Trend data - FY:', fiscalYear, 'WW:', ww);
      fetchSGTData();
      setInitialLoadDone(true);
    }
  }, [selectedModels, fiscalYear, ww]);

  // Load data when FY/WW changes manually (non-sharedFilters mode)
  useEffect(() => {
    if (config.sharedFilters) return;
    if (fiscalYear && ww && selectedModels.length > 0 && initialLoadDone) {
      fetchSGTData();
    }
  }, [fiscalYear, ww]);

  // Fetch SGT IQA Trend data
  // Accepts optional direct params to bypass state (used by sharedFilters)
  const fetchSGTData = async (directFY?: string, directWW?: string, directModels?: string[]) => {
    try {
      setLoading(true);
      setError(null);

      const useFY = directFY || fiscalYear;
      const useWW = directWW || ww;
      const useModels = directModels || selectedModels;

      console.log('🔄 Fetching SGT IQA Trend report data - FY:', useFY, 'WW:', useWW, 'Models:', useModels.length);

      // Build query parameters
      const queryParams: any = { ...config.additionalParams };

      if (useFY) {
        queryParams.year = useFY;
      }

      if (useWW) queryParams.ww = useWW;
      const paramName = config.modelParamName || 'models';
      if (useModels.length > 0) queryParams[paramName] = useModels;
      if (selectedProductType) queryParams.product_type = selectedProductType;

      // Fetch SGT IQA Trend chart data from API
      const result = await config.dataSource.fetchChartData(queryParams);
      console.log('📊 SGT IQA Trend Chart API Response:', result);
      console.log('📊 Result.success:', result.success);
      console.log('📊 Result.data type:', typeof result.data);
      console.log('📊 Result.data:', result.data);
      console.log('📊 Result.data is Array:', Array.isArray(result.data));
      console.log('📊 Result.data length:', result.data?.length);

      if (result.success && result.data && Array.isArray(result.data) && result.data.length > 0) {
        console.log(`✅ SGT IQA data fetched: ${result.data.length} records`);
        console.log('📋 First record data sample:', result.data[0]);

        // Group data by model AND yearmonth (similar to LAR report)
        const modelMap = new Map<string, Map<string, SGTIQAData>>();

        for (const record of result.data) {
          // Skip records with null, undefined, or empty model values
          if (!record.model || record.model.trim() === '') {
            console.log(`⏭️ Skipping record with empty model - yearmonth: ${record.yearmonth}`);
            continue;
          }
          const modelKey = record.model;
          console.log(`🔍 Processing record - model: ${modelKey}, yearmonth: ${record.yearmonth}`);

          if (!modelMap.has(modelKey)) {
            modelMap.set(modelKey, new Map<string, SGTIQAData>());
          }

          const monthMap = modelMap.get(modelKey)!;

          if (!monthMap.has(record.yearmonth)) {
            monthMap.set(record.yearmonth, {
              yearmonth: record.yearmonth,
              model: record.model,
              product_type: record.product_type,
              total_ng: parseInt(String(record.total_ng)) || 0,
              total_inspection: parseInt(String(record.total_inspection)) || 0,
              lar: parseFloat(String(record.lar)) || 0,
              dppm: parseFloat(String(record.dppm)) || 0,
              total_lot: parseInt(String(record.total_lot)) || 0,
              total_pass_lot: parseInt(String(record.total_pass_lot)) || 0,
              total_fail_lot: parseInt(String(record.total_fail_lot)) || 0,
              defects: {}
            });
          } else {
            // Aggregate data if multiple records for same model and month
            const existingData = monthMap.get(record.yearmonth)!;
            existingData.total_ng += parseInt(String(record.total_ng)) || 0;
            existingData.total_inspection += parseInt(String(record.total_inspection)) || 0;
            existingData.total_lot += parseInt(String(record.total_lot)) || 0;
            existingData.total_pass_lot += parseInt(String(record.total_pass_lot)) || 0;
            existingData.total_fail_lot += parseInt(String(record.total_fail_lot)) || 0;
          }
        }

        // Fetch defect data separately
        console.log('🔄 Fetching SGT IQA Trend defect data...');
        const defectResult = await config.dataSource.fetchDefectData(queryParams);
        console.log('📊 SGT IQA Trend Defect API Response:', defectResult);

        if (defectResult.success && defectResult.data && defectResult.data.length > 0) {
          console.log(`✅ Defect data fetched: ${defectResult.data.length} records`);

          // Merge defect data into modelMap
          for (const defectRecord of defectResult.data) {
            // Skip records with null, undefined, or empty model values
            if (!defectRecord.model || defectRecord.model.trim() === '') {
              continue;
            }
            const modelKey = defectRecord.model;
            const monthMap = modelMap.get(modelKey);

            if (monthMap) {
              const monthData = monthMap.get(defectRecord.yearmonth);
              const defectName = defectRecord.defect?.trim();
              if (monthData && defectName) {
                if (!monthData.defects[defectName]) {
                  monthData.defects[defectName] = 0;
                }
                monthData.defects[defectName] += Number(defectRecord.rej) || 0;
              }
            }
          }
          console.log('✅ Defect data merged into model/month data');
        } else {
          console.warn('⚠️ No defect data found or error fetching defects:', defectResult.message);
        }

        // Transform modelMap to array of ModelSGTIQAData
        const transformedDataByModel: ModelSGTIQAData[] = Array.from(modelMap.entries()).map(([model, monthMap]) => ({
          model,
          data: Array.from(monthMap.values()).sort((a, b) => a.yearmonth.localeCompare(b.yearmonth))
        }));

        console.log('🔄 Transformed data by model:', transformedDataByModel);
        console.log('🔄 Number of models:', transformedDataByModel.length);
        transformedDataByModel.forEach((modelData, idx) => {
          console.log(`  Model ${idx + 1}: "${modelData.model}" with ${modelData.data.length} months`);
        });
        console.log('🔄 Setting sgtDataByModel state with', transformedDataByModel.length, 'models');
        setSgtDataByModel(transformedDataByModel);
        console.log('✅ sgtDataByModel state updated');
      } else {
        const errorMsg = result.message || 'No SGT IQA Trend data available in database';
        console.warn('⚠️ SGT IQA fetch warning:', errorMsg);
        console.warn('⚠️ Result:', result);
        setError(errorMsg);
        setSgtDataByModel([]);
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Unknown error fetching SGT IQA Trend data';
      console.error('❌ SGT IQA fetch exception:', errorMsg);
      setError(errorMsg);
      setSgtDataByModel([]);
    } finally {
      setLoading(false);
    }
  };

  // ============ HELPER FUNCTIONS FOR CHART RENDERING ============

  const defectColors = [

    '#8B5CF6',  
    '#EC4899',  
    '#91047280',  
    '#cc0aa2', 
    '#E11D48', 
    '#7a2802',  
    '#a00cf7',  
    '#DC2626',   
    '#968704',  
    '#EF4444',  
    '#8f8c8d',
  ];

  // Helper function to get chart data for a specific model
  const getChartDataForModel = (sgtData: SGTIQAData[]) => {
    return sgtData.map(item => ({
      month: item.yearmonth,
      displayMonth: getMonthTrendName(item.yearmonth),
      larPercentage: item.lar,
      totalDPPM: item.dppm,
      inspectionLot: item.total_lot,
      passLot: item.total_pass_lot,
      failLot: item.total_fail_lot,
      dataNG: item.total_ng,
      dataInspection: item.total_inspection,
      isHighlighted: item.isHighlighted,
      ...item.defects  // Spread all defect data dynamically
    }));
  };

  // Helper function to get defect legend for a specific model
  const getDefectLegendForModel = (sgtData: SGTIQAData[]): DefectLegendItem[] => {
    const allDefectNames = new Set<string>();
    sgtData.forEach(month => {
      Object.keys(month.defects).forEach(defectName => {
        allDefectNames.add(defectName);
      });
    });

    return Array.from(allDefectNames).map((name, index) => ({
      name,
      color: defectColors[index % defectColors.length]
    }));
  };

  // ============ EXPORT PDF FUNCTION ============

  // Optimized html2canvas configuration for high-quality PDF export
  const getOptimizedHtml2CanvasOptions = (element: HTMLElement, identifier?: string, highResolution: boolean = false, isTable: boolean = false, isChart: boolean = false) => ({
    scale: highResolution ? (isChart ? 4.0 : 2.5) : 0.2,
    logging: false,
    useCORS: true,
    allowTaint: true,
    backgroundColor: '#ffffff',
    imageTimeout: 0,
    removeContainer: true,
    svgRendering: true,
    foreignObjectRendering: false,
    ignoreElements: (el: Element) => {
      const htmlEl = el as HTMLElement;
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
          clonedElement.style.background = 'white';
          clonedElement.style.backgroundImage = 'none';

          const allGradients = clonedElement.querySelectorAll('[class*="bg-gradient"]');
          allGradients.forEach((el) => {
            const htmlEl = el as HTMLElement;
            if (!htmlEl.closest('svg') && htmlEl.tagName !== 'svg') {
              htmlEl.style.background = 'white';
              htmlEl.style.backgroundImage = 'none';
              htmlEl.style.backgroundColor = 'white';
            }
          });
        }
      }
    }
  });

  const handleExportPDF = async () => {
    if (!contentRef.current || sgtDataByModel.length === 0) {
      alert('No data to export');
      return;
    }

    setExportingPDF(true);
    setExportProgress(0);

    try {
      // Create PDF with portrait orientation
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 10;
      const footerHeight = 15;
      let yPosition = margin;
      let pageNumber = 1;

      // Helper function to add page footer
      const addPageFooter = (currentPage: number, totalPages: number) => {
        const footerY = pageHeight - 8;

        // Add horizontal line
        pdf.setDrawColor(200, 200, 200);
        pdf.setLineWidth(0.5);
        pdf.line(margin, pageHeight - footerHeight, pageWidth - margin, pageHeight - footerHeight);

        // Add footer text
        pdf.setFontSize(8);
        pdf.setTextColor(100, 100, 100);

        // Left side: Report name
        pdf.text(config.title, margin, footerY);

        // Center: Generated date
        const dateStr = formatDateTime(new Date());
        pdf.text(`Generated: ${dateStr}`, pageWidth / 2, footerY, { align: 'center' });

        // Right side: Page number
        pdf.text(`Page ${currentPage} of ${totalPages}`, pageWidth - margin, footerY, { align: 'right' });

        // Reset text color
        pdf.setTextColor(0, 0, 0);
      };

      // Update progress: initialization
      setExportProgress(10);

      // Add title
      pdf.setFontSize(16);
      pdf.text(config.title, pageWidth / 2, yPosition, { align: 'center' });
      yPosition += 10;

      // Add filter info
      pdf.setFontSize(10);
      if (fiscalYear && ww) {
        pdf.text(`Period: FY${fiscalYear} WW${ww}`, margin, yPosition);
        yPosition += 6;
      }
      if (selectedModels.length > 0) {
        pdf.text(`Models: ${selectedModels.join(', ')}`, margin, yPosition);
        yPosition += 6;
      }
      if (selectedProductType) {
        pdf.text(`Product Type: ${selectedProductType}`, margin, yPosition);
        yPosition += 6;
      }
      yPosition += 4;

      // Update progress: header added
      setExportProgress(20);

      // Wait for DOM to fully render all models
      console.log('⏳ Waiting for models to render...');
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Calculate progress step per model
      const totalModels = sgtDataByModel.length;
      const progressPerModel = 70 / totalModels; // 70% for all models
      const maxContentHeight = pageHeight - margin - footerHeight;

      // Export each model section
      for (let i = 0; i < sgtDataByModel.length; i++) {
        const modelData = sgtDataByModel[i];

        // Update progress for current model
        const currentProgress = 20 + (i * progressPerModel);
        setExportProgress(Math.round(currentProgress));

        // Find the chart and table elements for this model
        const chartElement = contentRef.current?.querySelector(`[data-chart="${modelData.model}"]`) as HTMLElement;
        const tableElement = contentRef.current?.querySelector(`[data-table="${modelData.model}"]`) as HTMLElement;

        if (chartElement && tableElement) {
          console.log(`📦 Exporting model ${i + 1}/${totalModels}: ${modelData.model}`);

          // Force chart re-render by temporarily hiding/showing
          chartElement.style.visibility = 'hidden';
          await new Promise(resolve => setTimeout(resolve, 100));
          chartElement.style.visibility = 'visible';

          // Wait longer for ALL SVG paths to fully render
          await new Promise(resolve => setTimeout(resolve, 2000));

          // Force another layout recalculation
          chartElement.getBoundingClientRect();

          // Capture chart and table in parallel with high quality
          const [chartCanvas, tableCanvas] = await Promise.all([
            html2canvas(chartElement, getOptimizedHtml2CanvasOptions(chartElement, `[data-chart="${modelData.model}"]`, true, false, true) as any),
            html2canvas(tableElement, getOptimizedHtml2CanvasOptions(tableElement, `[data-table="${modelData.model}"]`, true, true, false) as any)
          ]);

          setExportProgress(Math.round(currentProgress + (progressPerModel * 0.6)));

          // Convert to JPEG for smaller file size
          const chartImgData = chartCanvas.toDataURL('image/jpeg', 0.85);
          const tableImgData = tableCanvas.toDataURL('image/jpeg', 0.85);

          const chartImgWidth = pageWidth - (2 * margin);
          const chartImgHeight = (chartCanvas.height * chartImgWidth) / chartCanvas.width;
          const tableImgWidth = pageWidth - (2 * margin);
          const tableImgHeight = (tableCanvas.height * tableImgWidth) / tableCanvas.width;

          // Add chart
          if (yPosition + chartImgHeight > maxContentHeight) {
            pageNumber++;
            pdf.addPage('p');
            yPosition = margin;
          }
          pdf.addImage(chartImgData, 'JPEG', margin, yPosition, chartImgWidth, chartImgHeight);
          yPosition += chartImgHeight + 5;

          // Add table
          if (yPosition + tableImgHeight > maxContentHeight) {
            pageNumber++;
            pdf.addPage('p');
            yPosition = margin;
          }
          pdf.addImage(tableImgData, 'JPEG', margin, yPosition, tableImgWidth, tableImgHeight);
          yPosition += tableImgHeight + 10;

          setExportProgress(Math.round(currentProgress + progressPerModel));
        }

        // Add page break between models (except last one)
        if (i < sgtDataByModel.length - 1 && yPosition > margin) {
          pageNumber++;
          pdf.addPage('p');
          yPosition = margin;
        }
      }

      // Add footers to all pages
      const totalPages = pdf.getNumberOfPages();
      for (let i = 1; i <= totalPages; i++) {
        pdf.setPage(i);
        addPageFooter(i, totalPages);
      }

      // Update progress: generating file
      setExportProgress(95);

      // Generate filename
      const dateStr = getTodayDateString();
      const modelsStr = selectedModels.length > 0 ? selectedModels.join('_').replace(/\s+/g, '-') : 'All';
      const filename = `SGT_IQA_Trend_Report_${modelsStr}_${dateStr}.pdf`;

      pdf.save(filename);

      // Update progress: complete
      setExportProgress(100);

      console.log('✅ PDF exported successfully:', filename);
    } catch (error) {
      console.error('❌ Error exporting PDF:', error);
      alert('Failed to export PDF. Please try again.');
    } finally {
      // Reset after a short delay to show 100%
      setTimeout(() => {
        setExportingPDF(false);
        setExportProgress(0);
      }, 500);
    }
  };

  // ============ CUSTOM TOOLTIP ============

  const createCustomTooltip = (dynamicDefectLegend: DefectLegendItem[]) => {
    return ({ active, payload, label }: any) => {
      if (active && payload && payload.length) {
        const data = payload[0].payload;
        return (
          <div className="bg-white p-4 shadow-lg rounded-lg border border-gray-200 max-h-96 overflow-y-auto">
            <h3 className="font-semibold text-gray-900 mb-2">{data.displayMonth}</h3>
            <div className="space-y-1 text-sm">
              <p className="text-blue-600 font-medium">LAR: {data.larPercentage != null ? data.larPercentage.toFixed(2) : '0.00'}%</p>
              <p className="text-gray-600">Total Lot Pass: {data.passLot || 0}</p>
              <p className="text-gray-600">Total Lot inspection: {data.inspectionLot || 0}</p>
              <p className="text-orange-600">DPPM: {formatNumber(data.totalDPPM != null ? data.totalDPPM.toFixed(2) : '0')}</p>
              <p className="text-gray-600">Total NG: {formatNumber(data.dataNG || 0)}</p>
              <p className="text-gray-600">Total inspection: {formatNumber((data.dataInspection || 0).toString())}</p>

              {/* Defect Breakdown */}
              <div className="border-t border-gray-200 mt-2 pt-2">
                <p className="font-medium text-gray-700 mb-1">Defect Breakdown:</p>
                {dynamicDefectLegend.map((defect) => {
                  const quantity = data[defect.name] || 0;
                  if (quantity > 0) {
                    return (
                      <div key={defect.name} className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div
                            className="w-3 h-3 rounded mr-2"
                            style={{ backgroundColor: defect.color }}
                          />
                          <span className="text-gray-600">{defect.name}:</span>
                        </div>
                        <span className="font-medium text-gray-900 ml-2">{Math.round(quantity)}</span>
                      </div>
                    );
                  }
                  return null;
                })}
              </div>
            </div>
          </div>
        );
      }
      return null;
    };
  };

  // ============ RENDER METHODS ============

  const renderHeader = () => (
    <div className="bg-gradient-to-r from-purple-600 via-pink-600 to-orange-600 rounded-xl shadow-2xl border-2 border-purple-200 p-6 mb-6">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white drop-shadow-lg">{config.title}</h1>
          <p className="text-pink-100 font-medium mt-1">SGT IQA Trend Analysis</p>
        </div>
      </div>
    </div>
  );

  const renderFilters = () => {
    console.log('🎨 Rendering filters - availableModels:', availableModels, 'availableFiscalYears:', availableFiscalYears);

    // Extract config options with defaults
    const showDateFilters = config.showDateFilters !== false; // default true
    const showModelFilter = config.showModelFilter !== false; // default true
    const showProductTypeFilter = config.showProductTypeFilter !== false; // default true
    const dateRequired = config.dateRequired !== false; // default true
    const modelRequired = config.modelRequired || false; // default false

    // Validation function to check if all required fields are selected
    const isFilterValid = (): boolean => {
      // Check date filters if they are shown and required
      if (showDateFilters && dateRequired) {
        if (!fiscalYear || !ww) return false;
      }
      // Check model filter if it is shown and required
      if (showModelFilter && modelRequired) {
        if (selectedModels.length === 0) return false;
      }
      return true;
    };

    const handleApplyFilters = () => {
      // Validate date fields if shown and required
      if (showDateFilters && dateRequired) {
        if (!fiscalYear) {
          alert('Please select Fiscal Year');
          return;
        }
        if (!ww) {
          alert('Please select WW');
          return;
        }
      }

      // Validate model if shown and required
      if (showModelFilter && modelRequired) {
        if (selectedModels.length === 0) {
          alert('Please select at least one Model');
          return;
        }
      }

      // All validations passed, fetch data
      fetchSGTData();
    };

    const handleClearFilters = () => {
      setfiscalYear('');
      setww('');
      setSelectedModels([]);
      setSelectedProductType('');
    };

    // Calculate grid columns dynamically based on visible filters
    let filterCount = 0;
    if (showDateFilters) filterCount += 2; // FY + WW
    if (showModelFilter) filterCount += 1;
    if (showProductTypeFilter) filterCount += 1;
    const gridCols = filterCount + 1; // +1 for action buttons

    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 px-4 py-3 mb-4">
        <div className="flex flex-wrap items-center gap-3">
          {/* Fiscal Year */}
          {showDateFilters && (
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-gray-600">FY:</span>
              <select
                value={fiscalYear}
                onChange={(e) => setfiscalYear(e.target.value)}
                className="px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-purple-500"
              >
                <option value="">Select</option>
                {availableFiscalYears.map((fy) => (
                  <option key={fy} value={fy}>{fy}</option>
                ))}
              </select>
            </div>
          )}

          {/* WW */}
          {showDateFilters && (
            <>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-gray-600">WW:</span>
                <select
                  value={ww}
                  onChange={(e) => setww(e.target.value)}
                  className="px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-purple-500 disabled:bg-gray-100"
                  disabled={!fiscalYear}
                >
                  <option value="">{fiscalYear ? 'Select' : 'FY first'}</option>
                  {availableWorkWeeksFrom.map((ww) => (
                    <option key={ww} value={ww}>{ww.padStart(2, '0')}</option>
                  ))}
                </select>
              </div>
              <div className="w-px h-6 bg-gray-300" />
            </>
          )}

          {/* Model Filter */}
          {showModelFilter && (
            <>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-gray-600">{config.modelFilterLabel || 'Models'}:</span>
                <select
                  multiple
                  value={selectedModels}
                  onChange={(e) => {
                    const selected = Array.from(e.target.selectedOptions, option => option.value);
                    setSelectedModels(selected);
                  }}
                  className="px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-cyan-500 min-w-[100px] max-h-20"
                >
                  {availableModels.map((model) => (
                    <option key={model} value={model}>{model}</option>
                  ))}
                </select>
                <button
                  onClick={() => setSelectedModels([...availableModels])}
                  className="px-2 py-1 text-xs bg-cyan-100 text-cyan-700 rounded hover:bg-cyan-200"
                >
                  All
                </button>
                <span className="text-xs text-gray-500">({selectedModels.length}/{availableModels.length})</span>
              </div>
              <div className="w-px h-6 bg-gray-300" />
            </>
          )}

          {/* Product Type */}
          {showProductTypeFilter && (
            <>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-gray-600">Type:</span>
                <select
                  value={selectedProductType}
                  onChange={(e) => setSelectedProductType(e.target.value)}
                  className="px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-indigo-500"
                >
                  <option value="">All</option>
                  <option value="HSA">HSA</option>
                  <option value="HDD">HDD</option>
                </select>
              </div>
              <div className="w-px h-6 bg-gray-300" />
            </>
          )}

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleApplyFilters}
              disabled={!isFilterValid()}
              className="px-3 py-1 text-sm bg-green-600 text-white font-medium rounded hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              Apply
            </button>
            <button
              onClick={handleClearFilters}
              className="px-3 py-1 text-sm bg-orange-500 text-white font-medium rounded hover:bg-orange-600"
            >
              Clear
            </button>
            {!config.hideUI?.exportButton && (
              <button
                onClick={handleExportPDF}
                disabled={sgtDataByModel.length === 0 || exportingPDF}
                className="px-3 py-1 text-sm bg-blue-600 text-white font-medium rounded hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center gap-1"
              >
                {exportingPDF ? (
                  <>
                    <svg className="animate-spin h-3 w-3" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Exporting...
                  </>
                ) : 'PDF'}
              </button>
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderChart = () => (
    <div className="bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 rounded-xl shadow-2xl border-2 border-purple-300 p-6 mb-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 flex items-center">
          <svg className="w-6 h-6 mr-2 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
            <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
          </svg>
          Seagate IQA Weekly Result
        </h2>
        <div className="flex items-center space-x-4">
          <div className="text-sm text-blue-700 font-medium bg-blue-100 px-3 py-1 rounded-full">
            {/* Period: Apr'24 - May'24 */}
          </div>
        </div>
      </div>

      {/* Chart Container */}
      <div className="h-96 w-full relative">
        {/* Background green area to match the image */}
        <div className="absolute inset-0 bg-green-100 opacity-30 rounded"></div>

        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart
            data={chartData}
            margin={{ top: 20, right: 80, left: 60, bottom: 60 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
            <XAxis
              dataKey="displayMonth"
              axisLine={true}
              tickLine={true}
              tick={{ fontSize: 12, fill: '#374151' }}
              angle={0}
              textAnchor="middle"
              height={60}
              interval={0}
            />
            {/* Left Y-axis for DPPM */}
            <YAxis
              yAxisId="right"
              axisLine={true}
              tickLine={true}
              tick={{ fontSize: 12, fill: '#374151' }}
              label={{
                value: 'DPPM',
                angle: -90,
                position: 'insideLeft',
                style: { textAnchor: 'middle', fontWeight: 'bold', fontSize: '14px' }
              }}
            />
            {/* Right Y-axis for LAR % */}
            <YAxis
              yAxisId="left"
              orientation="right"
              axisLine={true}
              tickLine={true}
              tick={{ fontSize: 12, fill: '#374151' }}
              label={{
                value: 'LAR %',
                angle: 90,
                position: 'insideRight',
                style: { textAnchor: 'middle', fontWeight: 'bold', fontSize: '14px' }
              }}
              domain={[0, 100]}
            />

            <Tooltip content={<CustomTooltip />} />

            {/* DPPM Bar Chart */}
            <Bar
              yAxisId="right"
              dataKey="totalDPPM"
              fill="#1E3A8C"
              name="DPPM"
              barSize={20}
              label={{
                position: 'inside',
                content: ({ x, y, value, width, height }: any) => (
                  <text
                    x={x + (width || 0) / 2}
                    y={y + (height || 0) / 2 + 4}
                    fill="#FFFFFF"
                    fontSize={10}
                    fontWeight="bold"
                    textAnchor="middle"
                  >
                    {value != null ? formatNumber(Math.round(value).toString()) : '0'}
                  </text>
                )
              }}
            />

            {/* LAR % Line - Green */}
            <Line
              yAxisId="left"
              type="monotone"
              dataKey="larPercentage"
              stroke="#16A34A"
              strokeWidth={4}
              name="LAR %"
              dot={{ fill: '#16A34A', r: 5 }}
              activeDot={{ r: 7 }}
              label={{
                position: 'top',
                content: ({ x, y, value }: any) => (
                  <text
                    x={x}
                    y={y - 10}
                    fill="#16A34A"
                    fontSize={11}
                    fontWeight="bold"
                    textAnchor="middle"
                  >
                    {value != null ? value.toFixed(2) : '0.00'}%
                  </text>
                )
              }}
            />

          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap justify-center items-center gap-4 mt-6">
        <div className="flex items-center">
          <svg className="w-4 h-4 mr-1" viewBox="0 0 16 16"><polygon points="8,2 14,8 8,14 2,8" fill="#1E3A8C" /></svg>
          <span className="text-xs text-gray-700 font-medium">DPPM</span>
        </div>
        <div className="flex items-center">
          <div className="w-8 h-0.5 mr-2" style={{ backgroundColor: '#16A34A' }}></div>
          <span className="text-xs text-gray-700 font-medium">%LAR</span>
        </div>
      </div>
    </div>
  );

  const renderDataTable = () => {
    // Define metrics to display as rows based on SGTIQAData structure
    const metrics = [
      { key: 'larPercentage', label: '%LAR', colorClass: 'text-purple-600', format: (val: number) => val != null ? `${val.toFixed(2)}%` : '0.00%' },
      { key: 'inspectionLot', label: 'Lot Audit Visual', colorClass: 'text-purple-600', format: (val: number) => val != null ? val.toString() : '0' },
      { key: 'passLot', label: 'Lot Pass Visual', colorClass: 'text-green-600', format: (val: number) => val != null ? val.toString() : '0' },
      { key: 'failLot', label: 'Lot Fail Visual', colorClass: 'text-red-600', format: (val: number) => val != null ? val.toString() : '0' },
      { key: 'dataInspection', label: 'Sampling Q`ty', colorClass: 'text-blue-600', format: (val: number) => val != null ? val.toString() : '0' },
      { key: 'dataNG', label: 'Defect Q`ty', colorClass: 'text-orange-600', format: (val: number) => val != null ? val.toString() : '0' },
      { key: 'totalDPPM', label: 'DPPM', colorClass: 'text-purple-700', format: (val: number) => val != null ? Math.round(val).toString() : '0' }
    ];

    return (
      <div className="bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 rounded-xl shadow-2xl border-2 border-teal-400 overflow-hidden">
        <div className="px-6 py-4 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-600 border-b-2 border-teal-400">
          <h2 className="text-xl font-bold text-white drop-shadow-md flex items-center">
            <svg className="w-6 h-6 mr-2 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M3 3a1 1 0 000 2v8a2 2 0 002 2h2.586l-1.293 1.293a1 1 0 101.414 1.414L10 15.414l2.293 2.293a1 1 0 001.414-1.414L12.414 15H15a2 2 0 002-2V5a1 1 0 100-2H3zm11.707 4.707a1 1 0 00-1.414-1.414L10 9.586 8.707 8.293a1 1 0 00-1.414 0l-2 2a1 1 0 101.414 1.414L8 10.414l1.293 1.293a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            SGT IQA Data
          </h2>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="bg-gradient-to-r from-teal-100 to-cyan-100">
                <th className="px-4 py-2 text-left text-sm font-bold text-teal-800 border-r border-gray-300 w-48 uppercase tracking-wider">
                  Metric / Defect
                </th>
                {sgtData.map((item, index) => (
                  <th
                    key={`${item.yearmonth}-${index}`}
                    className={`px-3 py-2 text-center text-sm font-medium border-r border-gray-300 min-w-20 ${
                      item.inspectionLot === 0
                        ? 'bg-gray-400'
                        : item.yearmonth.slice(-2) !== "99"
                        ? 'bg-green-100'
                        : 'text-gray-700'
                    }`}
                  >
                    {getMonthTrendName(item.yearmonth)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>

              {/* Metric Rows */}
              {metrics.map((metric, metricIndex) => (
                <tr
                  key={metric.key}
                  className={`${
                    metricIndex % 2 === 0
                      ? 'bg-white hover:bg-blue-50'
                      : 'bg-gradient-to-r from-blue-50 to-cyan-50 hover:bg-cyan-100'
                  } border-b border-gray-200 transition-colors duration-150`}
                >
                  <td className={`px-4 py-2 whitespace-nowrap text-sm font-semibold ${metric.colorClass} border-r border-gray-300`}>
                    {metric.label}
                  </td>
                  {sgtData.map((item, index) => {
                    const value = item[metric.key as keyof SGTIQAData] as number;
                    const isZeroInspectionLot = item.inspectionLot === 0;
                    const isWW = item.yearmonth.slice(-2) !== "99" ;

                    return (
                      <td
                        key={`${item.yearmonth}-${index}`}
                        className={`px-3 py-2 whitespace-nowrap text-center text-sm font-medium border-r border-gray-300 ${
                          isZeroInspectionLot
                            ? 'bg-gray-400'
                            : isWW
                            ? 'bg-green-100'
                            : ''
                        }`}
                      >
                        {formatNumber(metric.format(value))}
                      </td>
                    );
                  })}
                </tr>
              ))}

              {/* Defect Type Rows */}
              {dynamicDefectLegend.map((defectType) => {
                // Skip if name is empty or undefined
                if (!defectType.name || defectType.name.trim() === '') return null;
                return (
                  <tr key={defectType.name} className="border-b border-gray-200">
                    <td
                      className="px-4 py-1 text-sm font-medium text-white border-r border-gray-300 text-left"
                      style={{ backgroundColor: defectType.color }}
                    >
                      {defectType.name}
                    </td>
                    {sgtData.map((item, index) => {
                      const value = item.defects[defectType.name] || 0;
                      const isZeroInspectionLot = item.inspectionLot === 0;
                      const isWW = item.yearmonth.slice(-2) !== "99" ;
                      return (
                        <td
                          key={`${item.yearmonth}-${index}`}
                          className={`px-3 py-1 text-center text-sm border-r border-gray-300 ${
                            isZeroInspectionLot
                            ? 'bg-gray-400'
                            : isWW
                            ? 'bg-green-100'
                            : ''
                          }`}
                        >
                          {formatNumber(Math.round(value).toString())}
                        </td>
                      );
                    })}
                  </tr>
                );
              })}

            </tbody>
          </table>
        </div>
      </div>
    );
  };

  // ============ MAIN RENDER ============

  console.log('🎨 Rendering SGTIQATrendReportBase - loading:', loading, 'sgtDataByModel.length:', sgtDataByModel.length);

  // ============ LOADING STATE ============

  if (loading) {
    return (
      <div className={config.hideUI?.breadcrumb && config.hideUI?.filters ? "p-6 flex items-center justify-center" : "min-h-screen bg-gray-50 p-6 flex items-center justify-center"}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Loading {config.title}...</p>
        </div>
      </div>
    );
  }

  // ============ EMPTY STATE ============

  if (!loading && sgtDataByModel.length === 0) {
    return (
      <div className={config.hideUI?.breadcrumb && config.hideUI?.filters ? "p-6" : "min-h-screen bg-gray-50 p-6"}>
        <div className="max-w-7xl mx-auto">
          {!config.hideUI?.filters && renderFilters()}

          {/* Empty State Card */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
            <svg className="mx-auto h-24 w-24 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            <h3 className="mt-4 text-lg font-medium text-gray-900">No Data Available</h3>
            <p className="mt-2 text-sm text-gray-500">
              No {config.title} data found for the selected period.
            </p>
          </div>
        </div>
      </div>
    );
  }


  // ============ HELPER FUNCTION FOR OVERALL AGGREGATION (NO GROUPING) ============

  const getOverallAggregatedData = (): SGTIQAData[] => {
    const monthMap = new Map<string, SGTIQAData>();

    sgtDataByModel.forEach(modelData => {
      modelData.data.forEach(monthData => {
        if (!monthMap.has(monthData.yearmonth)) {
          monthMap.set(monthData.yearmonth, {
            yearmonth: monthData.yearmonth,
            model: 'Overall',
            product_type: 'All',
            total_ng: Number(monthData.total_ng) || 0,
            total_inspection: Number(monthData.total_inspection) || 0,
            lar: 0,
            dppm: 0,
            total_lot: Number(monthData.total_lot) || 0,
            total_pass_lot: Number(monthData.total_pass_lot) || 0,
            total_fail_lot: Number(monthData.total_fail_lot) || 0,
            defects: { ...monthData.defects }
          });
        } else {
          const existing = monthMap.get(monthData.yearmonth)!;
          existing.total_ng += Number(monthData.total_ng) || 0;
          existing.total_inspection += Number(monthData.total_inspection) || 0;
          existing.total_lot += Number(monthData.total_lot) || 0;
          existing.total_pass_lot += Number(monthData.total_pass_lot) || 0;
          existing.total_fail_lot += Number(monthData.total_fail_lot) || 0;

          Object.keys(monthData.defects).forEach(defectName => {
            if (!existing.defects[defectName]) {
              existing.defects[defectName] = 0;
            }
            existing.defects[defectName] += Number(monthData.defects[defectName]) || 0;
          });
        }
      });
    });

    // Recalculate LAR % and DPPM
    monthMap.forEach(monthData => {
      if (monthData.total_lot > 0) {
        monthData.lar = (monthData.total_pass_lot / monthData.total_lot) * 100;
      }
      if (monthData.total_inspection > 0) {
        monthData.dppm = (monthData.total_ng / monthData.total_inspection) * 1000000;
      }
    });

    return Array.from(monthMap.values()).sort((a, b) => a.yearmonth.localeCompare(b.yearmonth));
  };

  // ============ HELPER FUNCTION FOR PRODUCT TYPE AGGREGATION ============

  const getProductTypeAggregatedData = () => {
    // Aggregate data by product type and month
    const productTypeMap = new Map<string, Map<string, SGTIQAData>>();

    sgtDataByModel.forEach(modelData => {
      modelData.data.forEach(monthData => {
        const productType = monthData.product_type;

        // Skip null, undefined, or empty product_type values
        if (!productType || productType.trim() === '') {
          return;
        }

        if (!productTypeMap.has(productType)) {
          productTypeMap.set(productType, new Map<string, SGTIQAData>());
        }

        const monthMap = productTypeMap.get(productType)!;

        if (!monthMap.has(monthData.yearmonth)) {
          monthMap.set(monthData.yearmonth, {
            yearmonth: monthData.yearmonth,
            model: 'Overall',
            product_type: productType,
            total_ng: Number(monthData.total_ng) || 0,
            total_inspection: Number(monthData.total_inspection) || 0,
            lar: 0, // Will be recalculated
            dppm: 0, // Will be recalculated
            total_lot: Number(monthData.total_lot) || 0,
            total_pass_lot: Number(monthData.total_pass_lot) || 0,
            total_fail_lot: Number(monthData.total_fail_lot) || 0,
            defects: { ...monthData.defects }
          });
        } else {
          const existingData = monthMap.get(monthData.yearmonth)!;
          existingData.total_ng += Number(monthData.total_ng) || 0;
          existingData.total_inspection += Number(monthData.total_inspection) || 0;
          existingData.total_lot += Number(monthData.total_lot) || 0;
          existingData.total_pass_lot += Number(monthData.total_pass_lot) || 0;
          existingData.total_fail_lot += Number(monthData.total_fail_lot) || 0;

          // Merge defects
          Object.keys(monthData.defects).forEach(defectName => {
            if (!existingData.defects[defectName]) {
              existingData.defects[defectName] = 0;
            }
            existingData.defects[defectName] += Number(monthData.defects[defectName]) || 0;
          });
        }
      });
    });

    // Recalculate LAR % and DPPM for aggregated data
    productTypeMap.forEach(monthMap => {
      monthMap.forEach(monthData => {
        if (monthData.total_lot > 0) {
          monthData.lar = (monthData.total_pass_lot / monthData.total_lot) * 100;
        }
        if (monthData.total_inspection > 0) {
          monthData.dppm = (monthData.total_ng / monthData.total_inspection) * 1000000;
        }
      });
    });

    return Array.from(productTypeMap.entries()).map(([productType, monthMap]) => ({
      productType,
      data: Array.from(monthMap.values()).sort((a, b) => a.yearmonth.localeCompare(b.yearmonth))
    }));
  };

  // ============ MAIN RENDER WITH DATA ============

  console.log('✨ Rendering main content with', sgtDataByModel.length, 'models');

  // Helper to get models grouped by product type
  const getModelsByProductType = () => {
    const productTypeGroups = new Map<string, ModelSGTIQAData[]>();

    sgtDataByModel.forEach(modelData => {
      // Get product type from first data point (assuming all data for a model has same product type)
      const productType = modelData.data[0]?.product_type;

      // Skip null, undefined, or empty product_type values
      if (!productType || productType.trim() === '') {
        return;
      }

      if (!productTypeGroups.has(productType)) {
        productTypeGroups.set(productType, []);
      }

      productTypeGroups.get(productType)!.push(modelData);
    });

    return Array.from(productTypeGroups.entries()).map(([productType, models]) => ({
      productType,
      models
    }));
  };

  return (
    <div className={config.hideUI?.breadcrumb && config.hideUI?.filters ? "" : "min-h-screen bg-gray-50 p-6"}>
      <div className="max-w-7xl mx-auto">
        {/* Breadcrumb */}
        {!config.hideUI?.breadcrumb && (
          <nav className="flex mb-6" aria-label="Breadcrumb">
            <ol className="inline-flex items-center space-x-1 md:space-x-3">
              <li className="inline-flex items-center">
                <a href="/" className="inline-flex items-center text-sm font-medium text-gray-700 hover:text-orange-600">
                  <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z"></path>
                  </svg>
                  Dashboard
                </a>
              </li>
              <li>
                <div className="flex items-center">
                  <svg className="w-6 h-6 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd"></path>
                  </svg>
                  <a href="/reports" className="ml-1 text-sm font-medium text-gray-700 hover:text-orange-600 md:ml-2">Reports</a>
                </div>
              </li>
              <li aria-current="page">
                <div className="flex items-center">
                  <svg className="w-6 h-6 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd"></path>
                  </svg>
                  <span className="ml-1 text-sm font-medium text-orange-600 md:ml-2">{config.breadcrumbTitle}</span>
                </div>
              </li>
            </ol>
          </nav>
        )}

        {/* Filters */}
        {!config.hideUI?.filters && renderFilters()}

        {/* Main Content - Overall then Product Type then Models */}
        <div ref={contentRef}>
          {/* OVERALL SECTION (ALL MODELS COMBINED, NO GROUPING) */}
          {sgtDataByModel.length > 0 && (() => {
            const overallData = getOverallAggregatedData();
            const overallChartData = getChartDataForModel(overallData);
            const overallDefectLegend = getDefectLegendForModel(overallData);
            const OverallTooltip = createCustomTooltip(overallDefectLegend);

            return (
              <div className="mb-12">
                {/* Overall Header */}
                <div className="bg-gradient-to-r from-violet-100 to-purple-100 rounded-xl shadow-md border-2 border-violet-300 p-4 mb-6">
                  <h2 className="text-xl font-bold text-violet-900 flex items-center">
                    <svg className="w-6 h-6 mr-2 text-violet-600" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
                    </svg>
                    SGT IQA Trend Overall
                  </h2>
                </div>

                {/* Overall Chart */}
                <div className="bg-gradient-to-br from-violet-50 via-purple-50 to-fuchsia-50 rounded-xl shadow-lg border-2 border-violet-200 p-6 mb-6" data-chart="overall">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-lg font-semibold text-violet-900 flex items-center">
                      <svg className="w-6 h-6 mr-2 text-violet-600" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
                      </svg>
                      Seagate IQA Weekly Result - Overall
                    </h2>
                  </div>

                  <div className="h-96 w-full relative">
                    <div className="absolute inset-0 bg-violet-100 opacity-30 rounded"></div>
                    <ResponsiveContainer width="100%" height="100%">
                      <ComposedChart
                        data={overallChartData}
                        margin={{ top: 20, right: 80, left: 60, bottom: 60 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                        <XAxis
                          dataKey="displayMonth"
                          axisLine={true}
                          tickLine={true}
                          tick={{ fontSize: 12, fill: '#374151' }}
                          angle={0}
                          textAnchor="middle"
                          height={60}
                          interval={0}
                        />
                        <YAxis
                          yAxisId="right"
                          axisLine={true}
                          tickLine={true}
                          tick={{ fontSize: 12, fill: '#374151' }}
                          label={{
                            value: 'DPPM',
                            angle: -90,
                            position: 'insideLeft',
                            style: { textAnchor: 'middle', fontWeight: 'bold', fontSize: '14px' }
                          }}
                        />
                        <YAxis
                          yAxisId="left"
                          orientation="right"
                          axisLine={true}
                          tickLine={true}
                          tick={{ fontSize: 12, fill: '#374151' }}
                          label={{
                            value: 'LAR %',
                            angle: 90,
                            position: 'insideRight',
                            style: { textAnchor: 'middle', fontWeight: 'bold', fontSize: '14px' }
                          }}
                          domain={[0, 100]}
                        />
                        <Tooltip content={<OverallTooltip />} />

                        {/* Stacked Defect Bars */}
                        {overallDefectLegend.map((defect, index) => (
                          <Bar
                            key={defect.name}
                            yAxisId="right"
                            dataKey={defect.name}
                            stackId="defects"
                            fill={defect.color}
                            name={defect.name}
                            radius={index === overallDefectLegend.length - 1 ? [4, 4, 0, 0] : [0, 0, 0, 0]}
                            label={index === overallDefectLegend.length - 1 ? {
                              position: 'top',
                              content: ({ x, y, width, index: dataIndex }: any) => {
                                const entry = overallChartData[dataIndex] || {};
                                const total = overallDefectLegend.reduce((sum, d) => sum + (Number(entry[d.name]) || 0), 0);
                                if (total === 0) return null;
                                return (
                                  <text x={x + (width || 0) / 2} y={y - 5} fill="#374151" fontSize={10} fontWeight="bold" textAnchor="middle">
                                    {formatNumber(Math.round(total).toString())}
                                  </text>
                                );
                              }
                            } : undefined}
                          />
                        ))}

                        {/* DPPM Bar Chart */}
                        <Bar
                          yAxisId="right"
                          dataKey="totalDPPM"
                          fill="#1E3A8C"
                          name="DPPM"
                          barSize={20}
                          label={{
                            position: 'inside',
                            content: ({ x, y, value, width, height }: any) => (
                              <text
                                x={x + (width || 0) / 2}
                                y={y + (height || 0) / 2 + 4}
                                fill="#FFFFFF"
                                fontSize={10}
                                fontWeight="bold"
                                textAnchor="middle"
                              >
                                {value != null ? formatNumber(Math.round(value).toString()) : '0'}
                              </text>
                            )
                          }}
                        />

                        {/* LAR % Line - Green */}
                        <Line
                          yAxisId="left"
                          type="monotone"
                          dataKey="larPercentage"
                          stroke="#16A34A"
                          strokeWidth={4}
                          name="LAR %"
                          dot={{ fill: '#16A34A', r: 5 }}
                          activeDot={{ r: 7 }}
                          label={{
                            position: 'top',
                            content: ({ x, y, value }: any) => (
                              <text
                                x={x}
                                y={y - 10}
                                fill="#16A34A"
                                fontSize={11}
                                fontWeight="bold"
                                textAnchor="middle"
                              >
                                {value != null ? value.toFixed(2) : '0.00'}%
                              </text>
                            )
                          }}
                        />
                      </ComposedChart>
                    </ResponsiveContainer>
                  </div>

                  {/* Legend */}
                  <div className="flex flex-wrap justify-center items-center gap-4 mt-6">
                    {overallDefectLegend.map((defect) => (
                      <div key={defect.name} className="flex items-center">
                        <div className="w-4 h-4 rounded mr-1" style={{ backgroundColor: defect.color }}></div>
                        <span className="text-xs text-gray-700 font-medium">{defect.name}</span>
                      </div>
                    ))}
                    <div className="flex items-center">
                      <svg className="w-4 h-4 mr-1" viewBox="0 0 16 16"><polygon points="8,2 14,8 8,14 2,8" fill="#1E3A8C" /></svg>
                      <span className="text-xs text-gray-700 font-medium">DPPM</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-8 h-0.5 mr-2" style={{ backgroundColor: '#16A34A' }}></div>
                      <span className="text-xs text-gray-700 font-medium">%LAR</span>
                    </div>
                  </div>
                </div>

                {/* Overall Data Table */}
                {renderDataTableForModel(overallData, overallDefectLegend, 'Overall')}
              </div>
            );
          })()}

          {/* PRODUCT TYPE & MODEL SECTIONS */}
          {sgtDataByModel.length > 0 && (() => {
            const productTypeGroups = getModelsByProductType();

            return productTypeGroups.map((ptGroup) => {
              const productTypeData = getProductTypeAggregatedData();
              const ptData = productTypeData.find(pt => pt.productType === ptGroup.productType);

              return (
                <div key={`group-${ptGroup.productType}`}>
                  {/* PRODUCT TYPE OVERALL SECTION - SHOWN FIRST */}
                  {ptData && (() => {
                    const chartData = getChartDataForModel(ptData.data);
                    const dynamicDefectLegend = getDefectLegendForModel(ptData.data);
                    const CustomTooltip = createCustomTooltip(dynamicDefectLegend);

                    return (
                      <div className="mb-12">
                        {/* Product Type Header */}
                        <div className="bg-gradient-to-r from-emerald-100 to-teal-100 rounded-xl shadow-md border-2 border-emerald-300 p-4 mb-6">
                          <h2 className="text-xl font-bold text-emerald-900 flex items-center">
                            <svg className="w-6 h-6 mr-2 text-emerald-600" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
                            </svg>
                            SGT IQA Trend Over all_{ptData.productType}
                          </h2>
                        </div>

                        {/* Chart for this product type */}
                        <div className="bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 rounded-xl shadow-lg border-2 border-emerald-200 p-6 mb-6" data-chart={`producttype-${ptData.productType}`}>
                          <div className="flex items-center justify-between mb-6">
                            <h2 className="text-lg font-semibold text-emerald-900 flex items-center">
                              <svg className="w-6 h-6 mr-2 text-emerald-600" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
                              </svg>
                              Seagate IQA Weekly result - {ptData.productType} (Overall)
                            </h2>
                          </div>

                          {/* Chart Container */}
                          <div className="h-96 w-full relative">
                            <div className="absolute inset-0 bg-emerald-100 opacity-30 rounded"></div>
                            <ResponsiveContainer width="100%" height="100%">
                              <ComposedChart
                                data={chartData}
                                margin={{ top: 20, right: 80, left: 60, bottom: 60 }}
                              >
                                <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                                <XAxis
                                  dataKey="displayMonth"
                                  axisLine={true}
                                  tickLine={true}
                                  tick={{ fontSize: 12, fill: '#374151' }}
                                  angle={0}
                                  textAnchor="middle"
                                  height={60}
                                  interval={0}
                                />
                                <YAxis
                                  yAxisId="right"
                                  axisLine={true}
                                  tickLine={true}
                                  tick={{ fontSize: 12, fill: '#374151' }}
                                  label={{
                                    value: 'DPPM',
                                    angle: -90,
                                    position: 'insideLeft',
                                    style: { textAnchor: 'middle', fontWeight: 'bold', fontSize: '14px' }
                                  }}
                                />
                                <YAxis
                                  yAxisId="left"
                                  orientation="right"
                                  axisLine={true}
                                  tickLine={true}
                                  tick={{ fontSize: 12, fill: '#374151' }}
                                  label={{
                                    value: 'LAR %',
                                    angle: 90,
                                    position: 'insideRight',
                                    style: { textAnchor: 'middle', fontWeight: 'bold', fontSize: '14px' }
                                  }}
                                  domain={[0, 100]}
                                />
                                <Tooltip content={<CustomTooltip />} />

                                {/* Stacked Defect Bars */}
                                {dynamicDefectLegend.map((defect, index) => (
                                  <Bar
                                    key={defect.name}
                                    yAxisId="right"
                                    dataKey={defect.name}
                                    stackId="defects"
                                    fill={defect.color}
                                    name={defect.name}
                                    radius={index === dynamicDefectLegend.length - 1 ? [4, 4, 0, 0] : [0, 0, 0, 0]}
                                    label={index === dynamicDefectLegend.length - 1 ? {
                                      position: 'top',
                                      content: ({ x, y, width, index: dataIndex }: any) => {
                                        const entry = chartData[dataIndex] || {};
                                        const total = dynamicDefectLegend.reduce((sum, d) => sum + (Number(entry[d.name]) || 0), 0);
                                        if (total === 0) return null;
                                        return (
                                          <text x={x + (width || 0) / 2} y={y - 5} fill="#374151" fontSize={10} fontWeight="bold" textAnchor="middle">
                                            {formatNumber(Math.round(total).toString())}
                                          </text>
                                        );
                                      }
                                    } : undefined}
                                  />
                                ))}

                                {/* DPPM Bar Chart */}
                                <Bar
                                  yAxisId="right"
                                  dataKey="totalDPPM"
                                  fill="#1E3A8C"
                                  name="DPPM"
                                  barSize={20}
                                  label={{
                                    position: 'inside',
                                    content: ({ x, y, value, width, height }: any) => (
                                      <text
                                        x={x + (width || 0) / 2}
                                        y={y + (height || 0) / 2 + 4}
                                        fill="#FFFFFF"
                                        fontSize={10}
                                        fontWeight="bold"
                                        textAnchor="middle"
                                      >
                                        {value != null ? formatNumber(Math.round(value).toString()) : '0'}
                                      </text>
                                    )
                                  }}
                                />

                                {/* LAR % Line - Green */}
                                <Line
                                  yAxisId="left"
                                  type="monotone"
                                  dataKey="larPercentage"
                                  stroke="#16A34A"
                                  strokeWidth={4}
                                  name="LAR %"
                                  dot={{ fill: '#16A34A', r: 5 }}
                                  activeDot={{ r: 7 }}
                                  label={{
                                    position: 'top',
                                    content: ({ x, y, value }: any) => (
                                      <text
                                        x={x}
                                        y={y - 10}
                                        fill="#16A34A"
                                        fontSize={11}
                                        fontWeight="bold"
                                        textAnchor="middle"
                                      >
                                        {value != null ? value.toFixed(2) : '0.00'}%
                                      </text>
                                    )
                                  }}
                                />
                              </ComposedChart>
                            </ResponsiveContainer>
                          </div>

                          {/* Legend */}
                          <div className="flex flex-wrap justify-center items-center gap-4 mt-6">
                            {dynamicDefectLegend.map((defect) => (
                              <div key={defect.name} className="flex items-center">
                                <div className="w-4 h-4 rounded mr-1" style={{ backgroundColor: defect.color }}></div>
                                <span className="text-xs text-gray-700 font-medium">{defect.name}</span>
                              </div>
                            ))}
                            <div className="flex items-center">
                              <svg className="w-4 h-4 mr-1" viewBox="0 0 16 16"><polygon points="8,2 14,8 8,14 2,8" fill="#1E3A8C" /></svg>
                              <span className="text-xs text-gray-700 font-medium">DPPM</span>
                            </div>
                            <div className="flex items-center">
                              <div className="w-8 h-0.5 mr-2" style={{ backgroundColor: '#16A34A' }}></div>
                              <span className="text-xs text-gray-700 font-medium">%LAR</span>
                            </div>
                          </div>
                        </div>

                        {/* Data Table for this product type */}
                        {renderDataTableForProductType(ptData.data, dynamicDefectLegend, ptData.productType)}
                      </div>
                    );
                  })()}

                  {/* INDIVIDUAL MODELS FOR THIS PRODUCT TYPE */}
                  {ptGroup.models.map((modelData) => {
                    const chartData = getChartDataForModel(modelData.data);
                    const dynamicDefectLegend = getDefectLegendForModel(modelData.data);
                    const CustomTooltip = createCustomTooltip(dynamicDefectLegend);

                    return (
                      <div key={modelData.model}>
                        {/* Model Header */}
                        <div className="bg-gradient-to-r from-orange-100 to-amber-100 rounded-xl shadow-md border-2 border-orange-300 p-4 mb-6">
                          <h2 className="text-xl font-bold text-orange-900 flex items-center">
                            <svg className="w-6 h-6 mr-2 text-orange-600" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M7 3a1 1 0 000 2h6a1 1 0 100-2H7zM4 7a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1zM2 11a2 2 0 012-2h12a2 2 0 012 2v4a2 2 0 01-2 2H4a2 2 0 01-2-2v-4z" />
                            </svg>
                            Model: {modelData.model}
                          </h2>
                        </div>

                        {/* Chart for this model */}
                        <div className="bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 rounded-xl shadow-lg border-2 border-blue-200 p-6 mb-6" data-chart={modelData.model}>
                          <div className="flex items-center justify-between mb-6">
                            <h2 className="text-lg font-semibold text-blue-900 flex items-center">
                              <svg className="w-6 h-6 mr-2 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
                              </svg>
                              Seagate IQA Weekly result  {modelData.model}
                            </h2>
                          </div>

                          {/* Chart Container */}
                          <div className="h-96 w-full relative">
                            <div className="absolute inset-0 bg-green-100 opacity-30 rounded"></div>
                            <ResponsiveContainer width="100%" height="100%">
                              <ComposedChart
                                data={chartData}
                                margin={{ top: 20, right: 80, left: 60, bottom: 60 }}
                              >
                                <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                                <XAxis
                                  dataKey="displayMonth"
                                  axisLine={true}
                                  tickLine={true}
                                  tick={{ fontSize: 12, fill: '#374151' }}
                                  angle={0}
                                  textAnchor="middle"
                                  height={60}
                                  interval={0}
                                />
                                <YAxis
                                  yAxisId="right"
                                  axisLine={true}
                                  tickLine={true}
                                  tick={{ fontSize: 12, fill: '#374151' }}
                                  label={{
                                    value: 'DPPM',
                                    angle: -90,
                                    position: 'insideLeft',
                                    style: { textAnchor: 'middle', fontWeight: 'bold', fontSize: '14px' }
                                  }}
                                />
                                <YAxis
                                  yAxisId="left"
                                  orientation="right"
                                  axisLine={true}
                                  tickLine={true}
                                  tick={{ fontSize: 12, fill: '#374151' }}
                                  label={{
                                    value: 'LAR %',
                                    angle: 90,
                                    position: 'insideRight',
                                    style: { textAnchor: 'middle', fontWeight: 'bold', fontSize: '14px' }
                                  }}
                                  domain={[0, 100]}
                                />
                                <Tooltip content={<CustomTooltip />} />

                                {/* Stacked Defect Bars */}
                                {dynamicDefectLegend.map((defect, index) => (
                                  <Bar
                                    key={defect.name}
                                    yAxisId="right"
                                    dataKey={defect.name}
                                    stackId="defects"
                                    fill={defect.color}
                                    name={defect.name}
                                    radius={index === dynamicDefectLegend.length - 1 ? [4, 4, 0, 0] : [0, 0, 0, 0]}
                                    label={index === dynamicDefectLegend.length - 1 ? {
                                      position: 'top',
                                      content: ({ x, y, width, index: dataIndex }: any) => {
                                        const entry = chartData[dataIndex] || {};
                                        const total = dynamicDefectLegend.reduce((sum, d) => sum + (Number(entry[d.name]) || 0), 0);
                                        if (total === 0) return null;
                                        return (
                                          <text x={x + (width || 0) / 2} y={y - 5} fill="#374151" fontSize={10} fontWeight="bold" textAnchor="middle">
                                            {formatNumber(Math.round(total).toString())}
                                          </text>
                                        );
                                      }
                                    } : undefined}
                                  />
                                ))}

                                {/* DPPM Bar Chart */}
                                <Bar
                                  yAxisId="right"
                                  dataKey="totalDPPM"
                                  fill="#1E3A8C"
                                  name="DPPM"
                                  barSize={20}
                                  label={{
                                    position: 'inside',
                                    content: ({ x, y, value, width, height }: any) => (
                                      <text
                                        x={x + (width || 0) / 2}
                                        y={y + (height || 0) / 2 + 4}
                                        fill="#FFFFFF"
                                        fontSize={10}
                                        fontWeight="bold"
                                        textAnchor="middle"
                                      >
                                        {value != null ? formatNumber(Math.round(value).toString()) : '0'}
                                      </text>
                                    )
                                  }}
                                />

                                {/* LAR % Line - Green */}
                                <Line
                                  yAxisId="left"
                                  type="monotone"
                                  dataKey="larPercentage"
                                  stroke="#16A34A"
                                  strokeWidth={4}
                                  name="LAR %"
                                  dot={{ fill: '#16A34A', r: 5 }}
                                  activeDot={{ r: 7 }}
                                  label={{
                                    position: 'top',
                                    content: ({ x, y, value }: any) => (
                                      <text
                                        x={x}
                                        y={y - 10}
                                        fill="#16A34A"
                                        fontSize={11}
                                        fontWeight="bold"
                                        textAnchor="middle"
                                      >
                                        {value != null ? value.toFixed(2) : '0.00'}%
                                      </text>
                                    )
                                  }}
                                />
                              </ComposedChart>
                            </ResponsiveContainer>
                          </div>

                          {/* Legend */}
                          <div className="flex flex-wrap justify-center items-center gap-4 mt-6">
                            {dynamicDefectLegend.map((defect) => (
                              <div key={defect.name} className="flex items-center">
                                <div className="w-4 h-4 rounded mr-1" style={{ backgroundColor: defect.color }}></div>
                                <span className="text-xs text-gray-700 font-medium">{defect.name}</span>
                              </div>
                            ))}
                            <div className="flex items-center">
                              <svg className="w-4 h-4 mr-1" viewBox="0 0 16 16"><polygon points="8,2 14,8 8,14 2,8" fill="#1E3A8C" /></svg>
                              <span className="text-xs text-gray-700 font-medium">DPPM</span>
                            </div>
                            <div className="flex items-center">
                              <div className="w-8 h-0.5 mr-2" style={{ backgroundColor: '#16A34A' }}></div>
                              <span className="text-xs text-gray-700 font-medium">%LAR</span>
                            </div>
                          </div>
                        </div>

                        {/* Data Table for this model */}
                        {renderDataTableForModel(modelData.data, dynamicDefectLegend, modelData.model)}
                      </div>
                    );
                  })}
                </div>
              );
            });
          })()}
        </div>

      </div>

      {/* Export Progress Modal */}
      {exportingPDF && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full mx-4">
            <div className="text-center">
              <div className="mb-6">
                <svg className="animate-spin h-16 w-16 mx-auto text-blue-600" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              </div>

              <h3 className="text-2xl font-bold text-gray-900 mb-2">Exporting PDF</h3>
              <p className="text-gray-600 mb-6">Please wait while we generate your report...</p>

              {/* Progress Bar */}
              <div className="w-full bg-gray-200 rounded-full h-4 mb-3 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-blue-500 to-indigo-600 h-4 rounded-full transition-all duration-300 ease-out"
                  style={{ width: `${exportProgress}%` }}
                ></div>
              </div>

              {/* Progress Percentage */}
              <p className="text-lg font-semibold text-blue-600">{exportProgress}%</p>

              {/* Progress Status Text */}
              <p className="text-sm text-gray-500 mt-3">
                {exportProgress < 20 && "Initializing..."}
                {exportProgress >= 20 && exportProgress < 90 && "Capturing charts and tables..."}
                {exportProgress >= 90 && exportProgress < 100 && "Generating PDF file..."}
                {exportProgress === 100 && "Complete!"}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Helper function to render data table for a specific model
function renderDataTableForModel(sgtData: SGTIQAData[], dynamicDefectLegend: DefectLegendItem[], modelName: string) {
  const metrics = [
    { key: 'lar', label: '%LAR', colorClass: 'text-purple-600', format: (val: number) => val != null ? `${val.toFixed(2)}%` : '0.00%' },
    { key: 'total_lot', label: 'Lot Audit Visual', colorClass: 'text-purple-600', format: (val: number) => val != null ? val.toString() : '0' },
    { key: 'total_pass_lot', label: 'Lot Pass Visual', colorClass: 'text-green-600', format: (val: number) => val != null ? val.toString() : '0' },
    { key: 'total_fail_lot', label: 'Lot Fail Visual', colorClass: 'text-red-600', format: (val: number) => val != null ? val.toString() : '0' },
    { key: 'total_inspection', label: 'Sampling Q`ty', colorClass: 'text-blue-600', format: (val: number) => val != null ? val.toString() : '0' },
    { key: 'total_ng', label: 'Defect Q`ty', colorClass: 'text-orange-600', format: (val: number) => val != null ? val.toString() : '0' },
    { key: 'dppm', label: 'DPPM', colorClass: 'text-purple-700', format: (val: number) => val != null ? Math.round(val).toString() : '0' }
  ];

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-300 overflow-hidden mb-6" data-table={modelName}>
      <div className="px-6 py-4 bg-slate-700 border-b border-slate-600">
        <h2 className="text-lg font-bold text-white flex items-center">
          <svg className="w-6 h-6 mr-2" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M3 3a1 1 0 000 2v8a2 2 0 002 2h2.586l-1.293 1.293a1 1 0 101.414 1.414L10 15.414l2.293 2.293a1 1 0 001.414-1.414L12.414 15H15a2 2 0 002-2V5a1 1 0 100-2H3zm11.707 4.707a1 1 0 00-1.414-1.414L10 9.586 8.707 8.293a1 1 0 00-1.414 0l-2 2a1 1 0 101.414 1.414L8 10.414l1.293 1.293a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
          SGT IQA : {modelName}
        </h2>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full border-collapse">
          <thead>
            <tr className="bg-slate-100 border-b-2 border-slate-300">
              <th className="px-4 py-2.5 text-left text-xs font-bold text-slate-700 uppercase tracking-wider border-r border-gray-300 w-48">
                Metric / Defect
              </th>
              {sgtData.map((item, index) => (
                <th
                  key={`${item.yearmonth}-${index}`}
                  className={`px-3 py-2.5 text-center text-xs font-bold uppercase tracking-wider border-r border-gray-300 min-w-20 ${
                    item.total_inspection === 0
                      ? 'bg-gray-400 text-white'
                      : 'text-slate-700'
                  }`}
                >
                  {getMonthTrendName(item.yearmonth)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {metrics.map((metric, metricIndex) => {
              const isEvenRow = metricIndex % 2 === 0;
              return (
                <tr key={metric.key} className={`border-b border-gray-200 hover:bg-slate-100 transition-colors ${isEvenRow ? 'bg-slate-50' : 'bg-white'}`}>
                  <td className="px-4 py-2.5 whitespace-nowrap text-sm font-semibold text-slate-900 border-r border-gray-300">
                    {metric.label}
                  </td>
                  {sgtData.map((item, index) => {
                    const value = item[metric.key as keyof SGTIQAData] as number;
                    const isZeroInspectionLot = item.total_inspection === 0;

                    return (
                      <td
                        key={`${item.yearmonth}-${index}`}
                        className={`px-3 py-2.5 whitespace-nowrap text-center text-sm font-medium border-r border-gray-300 ${
                          isZeroInspectionLot
                            ? 'bg-gray-400 text-white'
                            : 'text-slate-700'
                        }`}
                      >
                        {formatNumber(metric.format(value))}
                      </td>
                    );
                  })}
                </tr>
              );
            })}

            {dynamicDefectLegend.map((defectType, defectIndex) => {
              if (!defectType.name || defectType.name.trim() === '') return null;
              return (
                <tr key={defectType.name} className="border-b border-gray-200 hover:opacity-90 transition-colors"
                  style={{ backgroundColor: `${defectType.color}18` }}
                >
                  <td
                    className="px-4 py-2 text-sm font-semibold text-white border-r border-gray-300 text-left"
                    style={{ backgroundColor: defectType.color }}
                  >
                    {defectType.name}
                  </td>
                  {sgtData.map((item, index) => {
                    const value = item.defects[defectType.name] || 0;
                    const isZeroInspectionLot = item.total_inspection === 0;
                    return (
                      <td
                        key={`${item.yearmonth}-${index}`}
                        className={`px-3 py-2 text-center text-sm font-medium border-r border-gray-300 ${
                          isZeroInspectionLot ? 'bg-gray-400 text-white' : 'text-slate-700'
                        }`}
                        style={!isZeroInspectionLot ? { backgroundColor: `${defectType.color}15` } : undefined}
                      >
                        {formatNumber(Math.round(value).toString())}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}


// Helper function to render data table for product type overall view
function renderDataTableForProductType(sgtData: SGTIQAData[], dynamicDefectLegend: DefectLegendItem[], productType: string) {
  const metrics = [
    { key: 'lar', label: '%LAR', colorClass: 'text-purple-600', format: (val: number) => val != null ? `${val.toFixed(2)}%` : '0.00%' },
    { key: 'total_lot', label: 'Lot Audit Visual', colorClass: 'text-purple-600', format: (val: number) => val != null ? val.toString() : '0' },
    { key: 'total_pass_lot', label: 'Lot Pass Visual', colorClass: 'text-green-600', format: (val: number) => val != null ? val.toString() : '0' },
    { key: 'total_fail_lot', label: 'Lot Fail Visual', colorClass: 'text-red-600', format: (val: number) => val != null ? val.toString() : '0' },
    { key: 'total_inspection', label: 'Sampling Q`ty', colorClass: 'text-blue-600', format: (val: number) => val != null ? val.toString() : '0' },
    { key: 'total_ng', label: 'Defect Q`ty', colorClass: 'text-orange-600', format: (val: number) => val != null ? val.toString() : '0' },
    { key: 'dppm', label: 'DPPM', colorClass: 'text-purple-700', format: (val: number) => val != null ? Math.round(val).toString() : '0' }
  ];

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-300 overflow-hidden mb-6" data-table={`producttype-${productType}`}>
      <div className="px-6 py-4 bg-slate-700 border-b border-slate-600">
        <h2 className="text-lg font-bold text-white flex items-center">
          <svg className="w-6 h-6 mr-2" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M3 3a1 1 0 000 2v8a2 2 0 002 2h2.586l-1.293 1.293a1 1 0 101.414 1.414L10 15.414l2.293 2.293a1 1 0 001.414-1.414L12.414 15H15a2 2 0 002-2V5a1 1 0 100-2H3zm11.707 4.707a1 1 0 00-1.414-1.414L10 9.586 8.707 8.293a1 1 0 00-1.414 0l-2 2a1 1 0 101.414 1.414L8 10.414l1.293 1.293a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
          SGT IQA Trend Report - {productType} Overall
        </h2>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full border-collapse">
          <thead>
            <tr className="bg-slate-100 border-b-2 border-slate-300">
              <th className="px-4 py-2.5 text-left text-xs font-bold text-slate-700 uppercase tracking-wider border-r border-gray-300 w-48">
                Metric / Defect
              </th>
              {sgtData.map((item, index) => (
                <th
                  key={`${item.yearmonth}-${index}`}
                  className={`px-3 py-2.5 text-center text-xs font-bold uppercase tracking-wider border-r border-gray-300 min-w-20 ${
                    item.total_inspection === 0
                      ? 'bg-gray-400 text-white'
                      : 'text-slate-700'
                  }`}
                >
                  {getMonthTrendName(item.yearmonth)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {metrics.map((metric, metricIndex) => {
              const isEvenRow = metricIndex % 2 === 0;
              return (
                <tr key={metric.key} className={`border-b border-gray-200 hover:bg-slate-100 transition-colors ${isEvenRow ? 'bg-slate-50' : 'bg-white'}`}>
                  <td className="px-4 py-2.5 whitespace-nowrap text-sm font-semibold text-slate-900 border-r border-gray-300">
                    {metric.label}
                  </td>
                  {sgtData.map((item, index) => {
                    const value = item[metric.key as keyof SGTIQAData] as number;
                    const isZeroInspectionLot = item.total_inspection === 0;

                    return (
                      <td
                        key={`${item.yearmonth}-${index}`}
                        className={`px-3 py-2.5 whitespace-nowrap text-center text-sm font-medium border-r border-gray-300 ${
                          isZeroInspectionLot
                            ? 'bg-gray-400 text-white'
                            : 'text-slate-700'
                        }`}
                      >
                        {formatNumber(metric.format(value))}
                      </td>
                    );
                  })}
                </tr>
              );
            })}

            {dynamicDefectLegend.map((defectType, defectIndex) => {
              if (!defectType.name || defectType.name.trim() === '') return null;
              return (
                <tr key={defectType.name} className="border-b border-gray-200 hover:opacity-90 transition-colors"
                  style={{ backgroundColor: `${defectType.color}18` }}
                >
                  <td
                    className="px-4 py-2 text-sm font-semibold text-white border-r border-gray-300 text-left"
                    style={{ backgroundColor: defectType.color }}
                  >
                    {defectType.name}
                  </td>
                  {sgtData.map((item, index) => {
                    const value = item.defects[defectType.name] || 0;
                    const isZeroInspectionLot = item.total_inspection === 0;
                    return (
                      <td
                        key={`${item.yearmonth}-${index}`}
                        className={`px-3 py-2 text-center text-sm font-medium border-r border-gray-300 ${
                          isZeroInspectionLot ? 'bg-gray-400 text-white' : 'text-slate-700'
                        }`}
                        style={!isZeroInspectionLot ? { backgroundColor: `${defectType.color}15` } : undefined}
                      >
                        {formatNumber(Math.round(value).toString())}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default SGTIQATrendReportBase;
