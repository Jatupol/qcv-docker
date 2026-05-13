// client/src/components/report/LARReportBase.tsx
// ===== SHARED LAR REPORT BASE COMPONENT =====
// Reusable LAR Report with configurable filters and data sources
// Eliminates code duplication between internal and customer LAR reports

import React, { useState, useEffect, useRef } from 'react';
import { ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { addSarabunFont } from '../../utils/sarabunFont';
import { formatNumber } from '../../utils';
import { getTodayDateString, formatDateTime } from '../../utils/formatUtils';
import { type DefectLegendItem, type LARReportRecord } from '../../types/report';
// ============ INTERFACES ============

interface ModelLARData {
  model: string;
  data: LARReportRecord[];
}

// API Response structure
export interface APIResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
}

// Data source functions type definitions
export interface DataSourceFunctions {
  // Fetch main chart data
  fetchChartData: (params: any) => Promise<APIResponse>;

  // Fetch defect breakdown data
  fetchDefectData: (params: any) => Promise<APIResponse>;

  // Fetch available models for dropdown
  fetchModels: (params: any) => Promise<APIResponse>;

  // Fetch available fiscal years for dropdown
  fetchFiscalYears: () => Promise<APIResponse<string[]>>;

  // Fetch work weeks for a given fiscal year
  fetchWorkWeeks: (fiscalYear: string) => Promise<APIResponse<string[]>>;
}

// Configuration for filter display and data sources
export interface LARReportConfig {
  // Report metadata
  title: string;
  breadcrumbTitle: string;

  // Filter visibility
  showDateRangeFilters: boolean;  // Show Fiscal Year From/To and WW From/To
  showModelFilter: boolean;        // Show Model dropdown

  // Filter requirements
  dateRangeRequired: boolean;      // Date range filters are mandatory
  modelRequired: boolean;          // Model filter is mandatory

  // Data source functions
  dataSource: DataSourceFunctions;

  // Additional query parameters (optional - for fixed parameters like station, round, etc.)
  additionalParams?: Record<string, any>;

  // Default date range to display (optional - used when showDateRangeFilters is false)
  defaultDateRange?: {
    yearFrom: string;
    wwFrom: string;
    yearTo: string;
    wwTo: string;
  };

  // Auto-load configuration
  autoLoadOnMount?: boolean;       // Auto-load data when component mounts
  autoSelectAllModels?: boolean;   // Auto-select all available models

  // Shared filters from parent (for embedded mode)
  sharedFilters?: {
    fiscalYear: string;
    workWeek: string;
  };

  // UI visibility options (for embedded mode in combined reports)
  hideUI?: {
    breadcrumb?: boolean;      // Hide breadcrumb navigation
    filters?: boolean;          // Hide filter controls
    exportButton?: boolean;     // Hide export PDF button
    header?: boolean;           // Hide report header/title
  };
}

interface LARReportBaseProps {
  config: LARReportConfig;
}

// ============ MAIN COMPONENT ============

const LARReportBase: React.FC<LARReportBaseProps> = ({ config }) => {
  const [selectedWeek, setSelectedWeek] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [larDataByModel, setLarDataByModel] = useState<ModelLARData[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [exportingPDF, setExportingPDF] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);
  const contentRef = useRef<HTMLDivElement>(null);

  // Filter states
  const [fiscalYearFrom, setFiscalYearFrom] = useState<string>('');
  const [wwFrom, setWwFrom] = useState<string>('');
  const [fiscalYearTo, setFiscalYearTo] = useState<string>('');
  const [wwTo, setWwTo] = useState<string>('');
  const [selectedModels, setSelectedModels] = useState<string[]>([]);
  const [availableModels, setAvailableModels] = useState<string[]>([]);
  const [availableFiscalYears, setAvailableFiscalYears] = useState<string[]>([]);
  const [availableWorkWeeksFrom, setAvailableWorkWeeksFrom] = useState<string[]>([]);
  const [availableWorkWeeksTo, setAvailableWorkWeeksTo] = useState<string[]>([]);

  // ============ DATA FETCHING ============

  // Handle shared filters from parent component (for embedded mode)
  useEffect(() => {
    if (config.sharedFilters) {
      console.log('🔄 Using shared filters:', config.sharedFilters);

      // Set date range to match shared filters (single FY/WW)
      setFiscalYearFrom(config.sharedFilters.fiscalYear);
      setWwFrom(config.sharedFilters.workWeek);
      setFiscalYearTo(config.sharedFilters.fiscalYear);
      setWwTo(config.sharedFilters.workWeek);

      // Auto-load models and data
      const loadData = async () => {
        // Fetch models
        const modelsResult = await config.dataSource.fetchModels({
          yearFrom: config.sharedFilters!.fiscalYear,
          wwFrom: config.sharedFilters!.workWeek,
          yearTo: config.sharedFilters!.fiscalYear,
          wwTo: config.sharedFilters!.workWeek
        });

        if (modelsResult.success && modelsResult.data) {
          setAvailableModels(modelsResult.data);
          setSelectedModels(modelsResult.data); // Auto-select all models

          // Trigger data fetch after a short delay to ensure state is updated
          setTimeout(() => {
            fetchLARData();
          }, 100);
        }
      };

      loadData();
    }
  }, [config.sharedFilters?.fiscalYear, config.sharedFilters?.workWeek]);

  // Initialize date range from defaultDateRange
  useEffect(() => {
    if (config.defaultDateRange && !config.sharedFilters) {
      console.log('🔄 Initializing date range from defaultDateRange:', config.defaultDateRange);
      setFiscalYearFrom(config.defaultDateRange.yearFrom);
      setWwFrom(config.defaultDateRange.wwFrom);
      setFiscalYearTo(config.defaultDateRange.yearTo);
      setWwTo(config.defaultDateRange.wwTo);
    }
  }, [config.showDateRangeFilters, config.defaultDateRange, config.sharedFilters]);


  // Fetch available models and fiscal years on component mount
  useEffect(() => {
    const fetchFilters = async () => {
      console.log('🔄 Fetching available filters...');

      // Fetch models only if date range filters are NOT shown or if auto-load is enabled
      // (when date range is shown, models will be fetched after date range is selected)
      if ((config.showModelFilter && !config.showDateRangeFilters) || config.autoLoadOnMount) {
        const modelsResult = await config.dataSource.fetchModels({});
        console.log('📊 Models API result:', modelsResult);
        if (modelsResult.success && modelsResult.data) {
          console.log(`✅ Setting ${modelsResult.data.length} models:`, modelsResult.data);
          setAvailableModels(modelsResult.data);

          // Auto-select all models if configured
          if (config.autoSelectAllModels && modelsResult.data.length > 0) {
            console.log('🔄 Auto-selecting all models:', modelsResult.data);
            setSelectedModels(modelsResult.data);
          }
        } else {
          console.warn('⚠️ Failed to fetch models:', modelsResult.message);
        }
      }

      // Fetch fiscal years if needed
      if (config.showDateRangeFilters) {
        const fyResult = await config.dataSource.fetchFiscalYears();
        console.log('📊 Fiscal Years API result:', fyResult);
        if (fyResult.success && fyResult.data) {
          console.log(`✅ Setting ${fyResult.data.length} fiscal years:`, fyResult.data);
          setAvailableFiscalYears(fyResult.data);
        } else {
          console.warn('⚠️ Failed to fetch fiscal years:', fyResult.message);
        }
      }
    };
    fetchFilters();
  }, [config.showModelFilter, config.showDateRangeFilters, config.dataSource, config.autoLoadOnMount, config.autoSelectAllModels]);

  // Fetch work weeks for "From" fiscal year
  useEffect(() => {
    if (!config.showDateRangeFilters) return;

    // Helper to find matching ww value in list (handles format differences: "01" vs "1")
    const findMatchingWw = (ww: string, list: string[]): string | undefined => {
      if (!ww) return undefined;
      const wwNum = parseInt(ww, 10).toString(); // Normalize: "01" -> "1"
      return list.find(item => parseInt(item, 10).toString() === wwNum);
    };

    const fetchWorkWeeksFrom = async () => {
      if (fiscalYearFrom) {
        console.log('🔄 Fetching work weeks for fiscal year FROM:', fiscalYearFrom);
        const wwResult = await config.dataSource.fetchWorkWeeks(fiscalYearFrom);
        console.log('📊 Work Weeks FROM API result:', wwResult);
        if (wwResult.success && wwResult.data) {
          console.log(`✅ Setting ${wwResult.data.length} work weeks FROM:`, wwResult.data);
          setAvailableWorkWeeksFrom(wwResult.data);

          // Check if current wwFrom or default exists in the list
          const defaultWwFrom = config.defaultDateRange?.wwFrom;
          const currentMatchingWw = findMatchingWw(wwFrom, wwResult.data);
          const defaultMatchingWw = findMatchingWw(defaultWwFrom || '', wwResult.data);

          if (currentMatchingWw) {
            // Current wwFrom exists in list - normalize format to match dropdown options
            if (wwFrom !== currentMatchingWw) {
              console.log(`🔄 Normalizing wwFrom: "${wwFrom}" -> "${currentMatchingWw}"`);
              setWwFrom(currentMatchingWw);
            }
          } else if (defaultMatchingWw) {
            // Use default if current doesn't exist
            console.log(`🔄 Setting wwFrom to default: "${defaultMatchingWw}"`);
            setWwFrom(defaultMatchingWw);
          } else {
            // Neither current nor default exists - clear
            setWwFrom('');
          }
        } else {
          console.warn('⚠️ Failed to fetch work weeks FROM:', wwResult.message);
        }
      } else {
        setAvailableWorkWeeksFrom([]);
        setWwFrom('');
      }
    };
    fetchWorkWeeksFrom();
  }, [fiscalYearFrom, config.showDateRangeFilters, config.dataSource]);

  // Fetch work weeks for "To" fiscal year
  useEffect(() => {
    if (!config.showDateRangeFilters) return;

    // Helper to find matching ww value in list (handles format differences: "01" vs "1")
    const findMatchingWw = (ww: string, list: string[]): string | undefined => {
      if (!ww) return undefined;
      const wwNum = parseInt(ww, 10).toString(); // Normalize: "01" -> "1"
      return list.find(item => parseInt(item, 10).toString() === wwNum);
    };

    const fetchWorkWeeksTo = async () => {
      if (fiscalYearTo) {
        console.log('🔄 Fetching work weeks for fiscal year TO:', fiscalYearTo);
        const wwResult = await config.dataSource.fetchWorkWeeks(fiscalYearTo);
        console.log('📊 Work Weeks TO API result:', wwResult);
        if (wwResult.success && wwResult.data) {
          console.log(`✅ Setting ${wwResult.data.length} work weeks TO:`, wwResult.data);
          setAvailableWorkWeeksTo(wwResult.data);

          // Check if current wwTo or default exists in the list
          const defaultWwTo = config.defaultDateRange?.wwTo;
          const currentMatchingWw = findMatchingWw(wwTo, wwResult.data);
          const defaultMatchingWw = findMatchingWw(defaultWwTo || '', wwResult.data);

          if (currentMatchingWw) {
            // Current wwTo exists in list - normalize format to match dropdown options
            if (wwTo !== currentMatchingWw) {
              console.log(`🔄 Normalizing wwTo: "${wwTo}" -> "${currentMatchingWw}"`);
              setWwTo(currentMatchingWw);
            }
          } else if (defaultMatchingWw) {
            // Use default if current doesn't exist
            console.log(`🔄 Setting wwTo to default: "${defaultMatchingWw}"`);
            setWwTo(defaultMatchingWw);
          } else {
            // Neither current nor default exists - use latest available WW
            const sortedWeeks = [...wwResult.data].sort((a, b) => parseInt(b, 10) - parseInt(a, 10));
            if (sortedWeeks.length > 0) {
              console.log(`🔄 Setting wwTo to latest available: "${sortedWeeks[0]}"`);
              setWwTo(sortedWeeks[0]);
            } else {
              setWwTo('');
            }
          }
        } else {
          console.warn('⚠️ Failed to fetch work weeks TO:', wwResult.message);
        }
      } else {
        setAvailableWorkWeeksTo([]);
        setWwTo('');
      }
    };
    fetchWorkWeeksTo();
  }, [fiscalYearTo, config.showDateRangeFilters, config.dataSource]);

  // Refresh models when any date range field changes (fy or ww)
  useEffect(() => {
    if (!config.showModelFilter || !config.showDateRangeFilters) return;

    const refreshModels = async () => {
      // Use current values or fall back to defaults
      const yearFromValue = fiscalYearFrom || config.defaultDateRange?.yearFrom;
      const wwFromValue = wwFrom || config.defaultDateRange?.wwFrom;
      const yearToValue = fiscalYearTo || config.defaultDateRange?.yearTo;
      const wwToValue = wwTo || config.defaultDateRange?.wwTo;

      // Only refresh when we have a complete date range (from values or defaults)
      if (yearFromValue && wwFromValue && yearToValue && wwToValue) {
        console.log('🔄 Refreshing models for date range:', { yearFromValue, wwFromValue, yearToValue, wwToValue });

        const modelsResult = await config.dataSource.fetchModels({
          yearFrom: yearFromValue,
          wwFrom: wwFromValue,
          yearTo: yearToValue,
          wwTo: wwToValue
        });

        console.log('📊 Models API result (refreshed):', modelsResult);
        if (modelsResult.success && modelsResult.data) {
          console.log(`✅ Setting ${modelsResult.data.length} models:`, modelsResult.data);
          setAvailableModels(modelsResult.data);
          // Auto-select all models if configured, otherwise clear selection
          if (config.autoSelectAllModels && modelsResult.data.length > 0) {
            console.log('🔄 Auto-selecting all models after refresh:', modelsResult.data);
            setSelectedModels(modelsResult.data);
          } else {
            setSelectedModels([]);
          }
        } else {
          console.warn('⚠️ Failed to refresh models:', modelsResult.message);
        }
      }
    };
    refreshModels();
  }, [fiscalYearFrom, wwFrom, fiscalYearTo, wwTo, config.showModelFilter, config.showDateRangeFilters, config.dataSource, config.autoSelectAllModels, config.defaultDateRange]);

  // Auto-load data when models are selected and auto-load is enabled
  useEffect(() => {
    if (config.autoLoadOnMount && selectedModels.length > 0 && larDataByModel.length === 0) {
      console.log('🔄 Auto-loading LAR data with all models...');
      fetchLARData();
    }
  }, [config.autoLoadOnMount, selectedModels, larDataByModel.length]);

  // Fetch LAR data
  const fetchLARData = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log('🔄 Fetching LAR report data...');

      // Build query parameters
      const queryParams: any = { ...config.additionalParams };

      // Add date range from filters, with fallback to defaultDateRange
      if (config.showDateRangeFilters) {
        // Use state values, but fall back to defaults if state is empty
        queryParams.yearFrom = fiscalYearFrom || config.defaultDateRange?.yearFrom;
        queryParams.yearTo = fiscalYearTo || config.defaultDateRange?.yearTo;
        queryParams.wwFrom = wwFrom || config.defaultDateRange?.wwFrom;
        queryParams.wwTo = wwTo || config.defaultDateRange?.wwTo;
      } else if (config.defaultDateRange) {
        // Use defaultDateRange when filters are hidden
        queryParams.yearFrom = config.defaultDateRange.yearFrom;
        queryParams.wwFrom = config.defaultDateRange.wwFrom;
        queryParams.yearTo = config.defaultDateRange.yearTo;
        queryParams.wwTo = config.defaultDateRange.wwTo;
      }

      // Add models if enabled (support both single and multiple models)
      if (config.showModelFilter && selectedModels.length > 0) {
        queryParams.models = selectedModels;
      }

      console.log('📋 Query parameters:', queryParams);
      console.log('📋 Query parameters stringified:', JSON.stringify(queryParams, null, 2));

      // Fetch LAR chart data from configured data source
      const result = await config.dataSource.fetchChartData(queryParams);
      console.log('📊 LAR Chart API Response:', result);
      console.log('📊 Data length:', result.data?.length);

      if (result.success && result.data && result.data.length > 0) {
        console.log(`✅ LAR data fetched: ${result.data.length} records`);
        console.log('📋 First record data sample:', result.data[0]);
        console.log('📋 All record keys:', Object.keys(result.data[0]));

        // Group data by model first, then by week within each model
        const modelMap = new Map<string, Map<string, LARReportRecord>>();

        for (const record of result.data) {
          const modelKey = record.model || 'Unknown';
          // Ensure ww is stored as string for consistent lookup
          const wwKey = String(record.ww);
          console.log(`🔍 Processing record - model: ${modelKey}, fy: ${record.fy}, ww: ${wwKey}`);

          if (!modelMap.has(modelKey)) {
            modelMap.set(modelKey, new Map<string, LARReportRecord>());
          }

          const weekMap = modelMap.get(modelKey)!;

          if (!weekMap.has(wwKey)) {
            weekMap.set(wwKey, {
              ww: 'WW ' + wwKey,
              total_ng: record.total_ng || 0,
              total_inspection: record.total_inspection || 0,
              lar: parseFloat(String(record.lar)) || 0,
              dppm: parseFloat(String(record.dppm)) || 0,
              total_lot: parseInt(String(record.total_lot)) || 0,
              total_pass_lot: parseInt(String(record.total_pass_lot)) || 0,
              total_fail_lot: parseInt(String(record.total_fail_lot)) || 0,
              defects: {}
            });
          } else {
            // Aggregate data if multiple records for same model and week
            const existingData = weekMap.get(wwKey)!;
            existingData.total_ng += record.total_ng || 0;
            existingData.total_inspection += record.total_inspection || 0;
            existingData.total_lot += parseInt(String(record.total_lot)) || 0;
            existingData.total_pass_lot += parseInt(String(record.total_pass_lot)) || 0;
            existingData.total_fail_lot += parseInt(String(record.total_fail_lot)) || 0;
          }
        }

        // Fetch defect data separately from configured data source
        console.log('🔄 Fetching LAR defect data...');
        const defectResult = await config.dataSource.fetchDefectData(queryParams);
        console.log('📊 LAR Defect API Response:', defectResult);

        if (defectResult.success && defectResult.data && defectResult.data.length > 0) {
          console.log(`✅ Defect data fetched: ${defectResult.data.length} records`);
          console.log('📋 First defect record sample:', defectResult.data[0]);

          // Merge defect data into modelMap
          for (const defectRecord of defectResult.data) {
            const modelKey = defectRecord.model || 'Unknown';
            const weekMap = modelMap.get(modelKey);

            if (weekMap) {
              // Ensure ww format matches - convert to string for consistent lookup
              const wwKey = String(defectRecord.ww);
              const weekData = weekMap.get(wwKey);

              console.log(`🔍 Looking up defect - model: ${modelKey}, ww: ${wwKey}, found: ${!!weekData}, defectname: ${defectRecord.defectname}`);

              if (weekData && defectRecord.defectname) {
                if (!weekData.defects[defectRecord.defectname]) {
                  weekData.defects[defectRecord.defectname] = 0;
                }
                weekData.defects[defectRecord.defectname] += defectRecord.ng_qty || 0;
                console.log(`✅ Added defect: ${defectRecord.defectname} = ${defectRecord.ng_qty} to ${wwKey}`);
              } else if (!weekData) {
                console.warn(`⚠️ Week data not found for model: ${modelKey}, ww: ${wwKey}`);
                console.log(`📋 Available weeks for ${modelKey}:`, Array.from(weekMap.keys()));
              }
            } else {
              console.warn(`⚠️ Model not found in modelMap: ${modelKey}`);
            }
          }
          console.log('✅ Defect data merged into model/week data');

          // Debug: Log defects for each model/week
          modelMap.forEach((weekMap, model) => {
            weekMap.forEach((weekData, ww) => {
              const defectCount = Object.keys(weekData.defects).length;
              if (defectCount > 0) {
                console.log(`📊 ${model} - ${ww}: ${defectCount} defect types`, weekData.defects);
              }
            });
          });
        } else {
          console.warn('⚠️ No defect data found or error fetching defects:', defectResult.message);
        }

        // Transform modelMap to array of ModelLARData
        const transformedDataByModel: ModelLARData[] = Array.from(modelMap.entries()).map(([model, weekMap]) => ({
          model,
          data: Array.from(weekMap.values())
        }));

        console.log('🔄 Transformed data by model:', transformedDataByModel);
        console.log('🔄 Number of models:', transformedDataByModel.length);
        transformedDataByModel.forEach((modelData, idx) => {
          console.log(`  Model ${idx + 1}: "${modelData.model}" with ${modelData.data.length} weeks`);
        });
        console.log('🔄 Setting larDataByModel state with', transformedDataByModel.length, 'models');
        setLarDataByModel(transformedDataByModel);
        console.log('✅ larDataByModel state updated');
      } else {
        const errorMsg = result.message || 'No LAR data available in database';
        console.warn('⚠️ LAR fetch warning:', errorMsg);
        console.warn('⚠️ Result:', result);
        setError(errorMsg);
        setLarDataByModel([]);
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Unknown error fetching LAR data';
      console.error('❌ LAR fetch exception:', errorMsg);
      setError(errorMsg);
      setLarDataByModel([]);
    } finally {
      setLoading(false);
    }
  };

  // ============ HELPER FUNCTIONS FOR CHART RENDERING ============

  const defectColors = [
    '#F97316', '#3B82F6', '#10B981', '#8B5CF6', '#F59E0B',
    '#EF4444', '#EC4899', '#14B8A6', '#F59E0B', '#6366F1'
  ];

  // Helper function to generate all weeks in the selected date range
  const generateAllWeeksInRange = () => {
    const weeks: string[] = [];

    // Get date range from state first, fall back to config defaults
    const yearFrom = fiscalYearFrom || config.defaultDateRange?.yearFrom;
    const weekFrom = wwFrom || config.defaultDateRange?.wwFrom;
    const yearTo = fiscalYearTo || config.defaultDateRange?.yearTo;
    const weekTo = wwTo || config.defaultDateRange?.wwTo;

    if (!yearFrom || !weekFrom || !yearTo || !weekTo) {
      return weeks;
    }

    const startYear = parseInt(yearFrom);
    const endYear = parseInt(yearTo);
    const startWeek = parseInt(weekFrom);
    const endWeek = parseInt(weekTo);

    for (let year = startYear; year <= endYear; year++) {
      const weekStart = year === startYear ? startWeek : 1;
      const weekEnd = year === endYear ? endWeek : 53;

      for (let week = weekStart; week <= weekEnd; week++) {
        const wwStr = `WW ${String(week).padStart(2, '0')}`;
        weeks.push(wwStr);
      }
    }

    return weeks;
  };

  // Helper function to get chart data for a specific model
  const getChartDataForModel = (larData: LARReportRecord[]) => {
    const allWeeks = generateAllWeeksInRange();

    // Create a map of existing data by week
    const dataMap = new Map<string, any>();
    larData.forEach(item => {
      dataMap.set(item.ww, {
        week: item.ww,
        larPercentage: item.lar,
        totalDPPM: item.dppm,
        inspectionLot: item.total_lot,
        passLot: item.total_pass_lot,
        failLot: item.total_fail_lot,
        dataNG: item.total_ng,
        dataInspection: item.total_inspection,
        ...item.defects
      });
    });

    // Return all weeks with data or default values
    return allWeeks.map(week => {
      if (dataMap.has(week)) {
        return dataMap.get(week);
      }
      // Return default values for weeks without data
      return {
        week: week,
        larPercentage: 0,
        totalDPPM: 0,
        inspectionLot: 0,
        passLot: 0,
        failLot: 0,
        dataNG: 0,
        dataInspection: 0
      };
    });
  };

  // Helper function to get defect legend for a specific model
  const getDefectLegendForModel = (larData: LARReportRecord[]): DefectLegendItem[] => {
    const allDefectNames = new Set<string>();
    larData.forEach(week => {
      Object.keys(week.defects).forEach(defectName => {
        allDefectNames.add(defectName);
      });
    });

    return Array.from(allDefectNames).map((name, index) => ({
      name,
      color: defectColors[index % defectColors.length]
    }));
  };

  // ============ VALIDATION & HANDLERS ============

  const isFilterValid = (): boolean => {
    // Check date range if required
    if (config.dateRangeRequired && config.showDateRangeFilters) {
      if (!fiscalYearFrom || !wwFrom || !fiscalYearTo || !wwTo) {
        return false;
      }
    }

    // Check model if required
    if (config.modelRequired && config.showModelFilter) {
      if (selectedModels.length === 0) {
        return false;
      }
    }

    return true;
  };

  const handleApplyFilters = () => {
    // Validate based on config
    if (config.dateRangeRequired && config.showDateRangeFilters) {
      if (!fiscalYearFrom) {
        alert('Please select Fiscal Year From');
        return;
      }
      if (!wwFrom) {
        alert('Please select WW From');
        return;
      }
      if (!fiscalYearTo) {
        alert('Please select Fiscal Year To');
        return;
      }
      if (!wwTo) {
        alert('Please select WW To');
        return;
      }
    }

    if (config.modelRequired && config.showModelFilter) {
      if (selectedModels.length === 0) {
        alert('Please select at least one Model');
        return;
      }
    }

    fetchLARData();
  };

  const handleClearFilters = () => {
    if (config.showDateRangeFilters) {
      setFiscalYearFrom('');
      setWwFrom('');
      setFiscalYearTo('');
      setWwTo('');
    }
    if (config.showModelFilter) {
      setSelectedModels([]);
    }
  };

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
    if (!contentRef.current || larDataByModel.length === 0) {
      alert('No data to export');
      return;
    }

    setExportingPDF(true);
    setExportProgress(0);

    try {
      // Create PDF with landscape orientation
      const pdf = new jsPDF('l', 'mm', 'a4'); // 'l' for landscape
      addSarabunFont(pdf); // Add Sarabun font support
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
        pdf.setFont('Sarabun', 'normal');
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
      pdf.setFont('Sarabun', 'bold');
      pdf.text(config.title, pageWidth / 2, yPosition, { align: 'center' });
      yPosition += 10;

      // Add date range and models info
      pdf.setFontSize(10);
      pdf.setFont('Sarabun', 'normal');
      if (config.showDateRangeFilters && fiscalYearFrom && wwFrom && fiscalYearTo && wwTo) {
        pdf.text(`Period: FY${fiscalYearFrom} WW${wwFrom} - FY${fiscalYearTo} WW${wwTo}`, margin, yPosition);
        yPosition += 6;
      }
      if (selectedModels.length > 0) {
        pdf.text(`Models: ${selectedModels.join(', ')}`, margin, yPosition);
        yPosition += 10;
      } else {
        yPosition += 6;
      }

      // Update progress: header added
      setExportProgress(20);

      // Wait for DOM to fully render all models
      console.log('⏳ Waiting for models to render...');
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Calculate progress step per model
      const totalModels = larDataByModel.length;
      const progressPerModel = 70 / totalModels;
      const maxContentHeight = pageHeight - margin - footerHeight;
      const headerHeight = 8;

      // Helper function to add page header with model name
      const addModelHeader = (modelName: string) => {
        pdf.setFontSize(14);
        pdf.setFont('Sarabun', 'bold');
        pdf.setTextColor(120, 53, 168);
        pdf.text(`Model: ${modelName}`, pageWidth / 2, yPosition, { align: 'center' });
        yPosition += 10;
        pdf.setTextColor(0, 0, 0);
        pdf.setFont('Sarabun', 'normal');
        return headerHeight;
      };

      // Export each model on a separate page
      for (let i = 0; i < larDataByModel.length; i++) {
        const modelData = larDataByModel[i];

        // Update progress for current model
        const currentProgress = 20 + (i * progressPerModel);
        setExportProgress(Math.round(currentProgress));

        // Find the chart and table elements for this model
        const chartElement = contentRef.current?.querySelector(`[data-chart="${modelData.model}"]`) as HTMLElement;
        const tableElement = contentRef.current?.querySelector(`[data-table="${modelData.model}"]`) as HTMLElement;

        if (chartElement && tableElement) {
          console.log(`📦 Exporting model ${i + 1}/${totalModels}: ${modelData.model}`);

          // Add new page for each model (first model uses the initial page)
          if (i > 0) {
            pdf.addPage('l', 'a4');
            pageNumber++;
          }

          yPosition = margin;
          // Add model header
          yPosition += addModelHeader(modelData.model);

          // Wait for SVG to fully render before capturing
          await new Promise(resolve => setTimeout(resolve, 100));

          // Capture chart and table in parallel with high quality
          const [chartCanvas, tableCanvas] = await Promise.all([
            html2canvas(chartElement, getOptimizedHtml2CanvasOptions(chartElement, `[data-chart="${modelData.model}"]`, true, false, true) as any),
            html2canvas(tableElement, getOptimizedHtml2CanvasOptions(tableElement, `[data-table="${modelData.model}"]`, true, true, false) as any)
          ]);

          setExportProgress(Math.round(currentProgress + (progressPerModel * 0.6)));

          // Calculate dimensions to fit on page
          const contentWidth = pageWidth - (2 * margin);
          const availableHeight = maxContentHeight - 10;
          const spacing = 3;

          const chartAspectRatio = chartCanvas.width / chartCanvas.height;
          const tableAspectRatio = tableCanvas.width / tableCanvas.height;

          let chartWidth = contentWidth * 0.95;
          let chartHeight = chartWidth / chartAspectRatio;
          let tableWidth = contentWidth * 0.95;
          let tableHeight = tableWidth / tableAspectRatio;

          let totalHeight = chartHeight + spacing + tableHeight;

          // Scale down if doesn't fit in available height
          if (totalHeight > availableHeight) {
            const heightScaleFactor = availableHeight / totalHeight;
            chartHeight = chartHeight * heightScaleFactor;
            chartWidth = chartHeight * chartAspectRatio;
            tableHeight = tableHeight * heightScaleFactor;
            tableWidth = tableHeight * tableAspectRatio;
          }

          // Convert to JPEG for smaller file size
          const chartImgData = chartCanvas.toDataURL('image/jpeg', 0.85);
          const tableImgData = tableCanvas.toDataURL('image/jpeg', 0.85);

          // Center elements on page
          const chartX = margin + (contentWidth - chartWidth) / 2;
          const tableX = margin + (contentWidth - tableWidth) / 2;

          // Add to PDF
          pdf.addImage(chartImgData, 'JPEG', chartX, yPosition, chartWidth, chartHeight);
          yPosition += chartHeight + spacing;
          pdf.addImage(tableImgData, 'JPEG', tableX, yPosition, tableWidth, tableHeight);

          setExportProgress(Math.round(currentProgress + progressPerModel));
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
      const filename = `LAR_Report_${modelsStr}_${dateStr}.pdf`;

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

  // ============ RENDER METHODS ============

  const renderFilters = () => {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 px-4 py-3 mb-4">
        <div className="flex flex-wrap items-center gap-3">
          {/* Default Date Range Display (when filters are hidden) */}
          {!config.showDateRangeFilters && config.defaultDateRange && (
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-gray-600">Date Range:</span>
              <span className="px-2 py-1 bg-purple-50 border border-purple-200 rounded text-sm text-purple-800">
                FY{config.defaultDateRange.yearFrom} WW{config.defaultDateRange.wwFrom} - FY{config.defaultDateRange.yearTo} WW{config.defaultDateRange.wwTo}
              </span>
            </div>
          )}

          {/* Date Range Filters */}
          {config.showDateRangeFilters && (
            <>
              {/* From */}
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-gray-600">From:</span>
                <select
                  value={fiscalYearFrom}
                  onChange={(e) => setFiscalYearFrom(e.target.value)}
                  className="px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-purple-500"
                >
                  <option value="">FY</option>
                  {availableFiscalYears.map((fy) => (
                    <option key={fy} value={fy}>{fy}</option>
                  ))}
                </select>
                <select
                  value={wwFrom}
                  onChange={(e) => setWwFrom(e.target.value)}
                  className="px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-purple-500 disabled:bg-gray-100"
                  disabled={!fiscalYearFrom}
                >
                  <option value="">WW</option>
                  {availableWorkWeeksFrom.map((ww) => (
                    <option key={ww} value={ww}>{ww.padStart(2, '0')}</option>
                  ))}
                </select>
              </div>

              <div className="w-px h-6 bg-gray-300" />

              {/* To */}
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-gray-600">To:</span>
                <select
                  value={fiscalYearTo}
                  onChange={(e) => setFiscalYearTo(e.target.value)}
                  className="px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-indigo-500"
                >
                  <option value="">FY</option>
                  {availableFiscalYears.map((fy) => (
                    <option key={fy} value={fy}>{fy}</option>
                  ))}
                </select>
                <select
                  value={wwTo}
                  onChange={(e) => setWwTo(e.target.value)}
                  className="px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-indigo-500 disabled:bg-gray-100"
                  disabled={!fiscalYearTo}
                >
                  <option value="">WW</option>
                  {availableWorkWeeksTo.map((ww) => (
                    <option key={ww} value={ww}>{ww.padStart(2, '0')}</option>
                  ))}
                </select>
              </div>

              <div className="w-px h-6 bg-gray-300" />
            </>
          )}

          {/* Model Filter - Multi-Select */}
          {config.showModelFilter && (
            <>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-gray-600">Models:</span>
                <div className="relative">
                  <select
                    multiple
                    value={selectedModels}
                    onChange={(e) => {
                      const selected = Array.from(e.target.selectedOptions, option => option.value);
                      setSelectedModels(selected);
                    }}
                    className="px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-cyan-500 min-w-[120px] max-h-24"
                  >
                    {availableModels.map((model) => (
                      <option key={model} value={model}>{model}</option>
                    ))}
                  </select>
                </div>
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
                disabled={larDataByModel.length === 0 || exportingPDF}
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

  // Render one chart for a specific model
  const renderChartForModel = (modelName: string, larData: LARReportRecord[]) => {
    const chartData = getChartDataForModel(larData);
    const dynamicDefectLegend = getDefectLegendForModel(larData);

    return (
      <div key={modelName} className="bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 rounded-xl shadow-lg border-2 border-blue-300 p-6 mb-6" data-chart={modelName}>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 flex items-center">
            <svg className="w-6 h-6 mr-2 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
              <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
            </svg>
            LAR VMI - {modelName}
          </h2>
        </div>

        <div className="h-96 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart
              data={chartData}
              margin={{ top: 20, right: 60, left: 20, bottom: 40 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis
                dataKey="week"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: '#6B7280' }}
                angle={-45}
                textAnchor="end"
                height={60}
              />
              <YAxis
                yAxisId="left"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: '#6B7280' }}
                label={{ value: 'LAR %', angle: -90, position: 'insideLeft' }}
                domain={[0, 100]}
              />
              <YAxis
                yAxisId="right"
                orientation="right"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: '#6B7280' }}
                label={{ value: 'DPPM / Defect Qty', angle: 90, position: 'insideRight' }}
              />

              <Tooltip
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="bg-white p-3 border border-gray-300 rounded-lg shadow-lg">
                        <p className="font-bold text-gray-800 mb-2">{label}</p>
                        {payload.map((entry: any, index: number) => (
                          <p key={index} className="text-sm" style={{ color: entry.color }}>
                            {entry.name}: {typeof entry.value === 'number'
                              ? entry.name === 'LAR %'
                                ? `${entry.value.toFixed(2)}%`
                                : entry.name === 'DPPM'
                                  ? entry.value.toFixed(2)
                                  : formatNumber(entry.value.toString())
                              : entry.value}
                          </p>
                        ))}
                      </div>
                    );
                  }
                  return null;
                }}
              />

              <Line
                yAxisId="left"
                type="monotone"
                dataKey="larPercentage"
                stroke="#3B82F6"
                strokeWidth={3}
                name="LAR %"
                dot={{ fill: '#3B82F6', r: 4 }}
                activeDot={{ r: 6 }}
                label={{
                  position: 'top',
                  content: ({ x, y, value }: any) => (
                    <text
                      x={x}
                      y={y - 10}
                      fill="#3B82F6"
                      fontSize={11}
                      fontWeight="bold"
                      textAnchor="middle"
                    >
                      {value.toFixed(2)}%
                    </text>
                  )
                }}
              />

              <Line
                yAxisId="right"
                type="monotone"
                dataKey="totalDPPM"
                stroke="#EF4444"
                strokeWidth={2}
                name="DPPM"
                dot={{ fill: '#EF4444', r: 3 }}
                activeDot={{ r: 5 }}
                strokeDasharray="5 5"
              />

              {dynamicDefectLegend.map((defect, index) => (
                <Bar
                  key={defect.name}
                  yAxisId="right"
                  dataKey={defect.name}
                  stackId="defects"
                  fill={defect.color}
                  name={defect.name}
                  radius={index === dynamicDefectLegend.length - 1 ? [4, 4, 0, 0] : [0, 0, 0, 0]}
                />
              ))}
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>
    );
  };

  // Render chart and table together for a specific model
  const renderModelSection = (modelName: string, larData: LARReportRecord[]) => {
    return (
      <div key={`section-${modelName}`} className="mb-8">
        {renderChartForModel(modelName, larData)}
        {renderDataTableForModel(modelName, larData)}
      </div>
    );
  };

  // Render all model sections (chart + table for each model)
  const renderModelSections = () => {
    return larDataByModel.map(modelData =>
      renderModelSection(modelData.model, modelData.data)
    );
  };

  // ============ DATA TABLE RENDERING ============

  // Render one data table for a specific model
  const renderDataTableForModel = (modelName: string, larData: LARReportRecord[]) => {
    const dynamicDefectLegend = getDefectLegendForModel(larData);
    const tableData = getChartDataForModel(larData);

    return (
      <div key={`table-${modelName}`} className="bg-white rounded-xl shadow-lg border border-gray-300 overflow-hidden mb-6" data-table={modelName}>
        <div className="px-6 py-4 bg-green-700 border-b border-slate-600">
          <h3 className="text-lg font-bold text-white flex items-center">
            <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M5 4a3 3 0 00-3 3v6a3 3 0 003 3h10a3 3 0 003-3V7a3 3 0 00-3-3H5zm-1 9v-1h5v2H5a1 1 0 01-1-1zm7 1h4a1 1 0 001-1v-1h-5v2zm0-4h5V8h-5v2zM9 8H4v2h5V8z" clipRule="evenodd" />
            </svg>
            {modelName}
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full border-collapse">
            <thead>
              <tr className="bg-slate-100 border-b-2 border-slate-300">
                <th className="px-2 py-2 text-left text-xs font-bold text-slate-700 uppercase tracking-wider border-r border-gray-300 w-40">
                  DEFECT
                </th>
                {tableData.map((item) => (
                <th
                  key={item.week}
                  className={`px-1 py-2 text-center text-xs font-bold uppercase tracking-wider border-r border-gray-300 min-w-16 ${
                    item.dataInspection === 0 ? 'bg-gray-500 text-white' : 'text-slate-700'
                  }`}
                >
                  {item.week}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {/* Defect Type Rows */}
            {dynamicDefectLegend.map((defectType, defectIndex) => (
              <tr key={defectType.name} className="border-b border-gray-200 hover:bg-slate-100 transition-colors">
                <td
                  className="px-2 py-1.5 text-xs font-semibold text-white border-r border-gray-300 text-left"
                  style={{ backgroundColor: defectType.color }}
                >
                  {defectType.name}
                </td>
                {tableData.map((item) => {
                  const value = item[defectType.name] || 0;
                  const isZeroInspectionLot = item.dataInspection === 0;
                  const isEvenRow = defectIndex % 2 === 0;
                  return (
                    <td
                      key={item.week}
                      className={`px-1 py-1.5 text-center text-xs font-medium border-r border-gray-300 ${
                        isZeroInspectionLot
                          ? 'bg-gray-400 text-white'
                          : isEvenRow
                            ? 'bg-slate-50 text-slate-700'
                            : 'bg-white text-slate-700'
                      }`}
                    >
                      {formatNumber(value.toString())}
                    </td>
                  );
                })}
              </tr>
            ))}

            {/* LAR Percentage Row */}
            <tr className="bg-slate-50 border-b border-gray-200">
              <td className="px-2 py-1.5 text-xs font-semibold text-slate-900 border-r border-gray-300">
                <div className="flex items-center">
                  <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                  % LAR
                </div>
              </td>
              {tableData.map((item) => {
                const isZeroInspectionLot = item.dataInspection === 0;
                return (
                  <td
                    key={item.week}
                    className={`px-1 py-1.5 text-center text-xs font-semibold border-r border-gray-300 ${
                      isZeroInspectionLot ? 'bg-gray-400 text-white' : 'text-slate-900'
                    }`}
                  >
                    {formatNumber(item.larPercentage.toString(), 2)}%
                  </td>
                );
              })}
            </tr>

            {/* Inspection Lot Row */}
            <tr className="bg-white border-b border-gray-200">
              <td className="px-2 py-1.5 text-xs font-semibold text-slate-900 border-r border-gray-300">
                LOT / Sampling Qty.
              </td>
              {tableData.map((item) => {
                const isZeroInspectionLot = item.dataInspection === 0;
                return (
                  <td
                    key={item.week}
                    className={`px-1 py-1.5 text-center text-xs font-medium border-r border-gray-300 ${
                      isZeroInspectionLot ? 'bg-gray-400 text-white font-semibold' : 'text-slate-700'
                    }`}
                  >
                    {formatNumber(item.inspectionLot.toString())} / {formatNumber(item.dataInspection.toString())}
                  </td>
                );
              })}
            </tr>

            {/* Total DPPM Row */}
            <tr className="bg-slate-50 border-b border-gray-200">
              <td className="px-2 py-1.5 text-xs font-semibold text-slate-900 border-r border-gray-300">
                Total DPPM
              </td>
              {tableData.map((item) => {
                const isZeroInspectionLot = item.dataInspection === 0;
                return (
                  <td
                    key={item.week}
                    className={`px-1 py-1.5 text-center text-xs font-medium border-r border-gray-300 ${
                      isZeroInspectionLot ? 'bg-gray-400 text-white' : 'text-slate-700'
                    }`}
                  >
                    {formatNumber(item.totalDPPM.toString(),2)}
                  </td>
                );
              })}
            </tr>
          </tbody>
        </table>
      </div>
      </div>
    );
  };

  // ============ MAIN RENDER ============

  console.log('🎨 Rendering LARReportBase - loading:', loading, 'larDataByModel.length:', larDataByModel.length);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-100 via-pink-100 to-orange-100 p-6 flex items-center justify-center">
        <div className="text-center bg-white rounded-2xl shadow-2xl p-8 border-4 border-purple-300">
          <div className="animate-spin rounded-full h-20 w-20 border-t-4 border-b-4 border-gradient-to-r from-purple-500 to-pink-500 mx-auto mb-4"></div>
          <p className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600 text-xl font-bold">Loading LAR Report...</p>
        </div>
      </div>
    );
  }

  if (!loading && larDataByModel.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-100 via-purple-100 to-pink-100 p-6">
        <div className="max-w-7xl mx-auto">
          {/* Breadcrumb */}
          <nav className="flex mb-6" aria-label="Breadcrumb">
            <ol className="inline-flex items-center space-x-1 md:space-x-3">
              <li className="inline-flex items-center">
                <a href="/" className="inline-flex items-center text-sm font-medium text-gray-700 hover:text-orange-600">
                  <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
                  </svg>
                  Home
                </a>
              </li>
              <li>
                <div className="flex items-center">
                  <svg className="w-6 h-6 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                  </svg>
                  <span className="ml-1 text-sm font-medium text-gray-500 md:ml-2">Reports</span>
                </div>
              </li>
              <li aria-current="page">
                <div className="flex items-center">
                  <svg className="w-6 h-6 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                  </svg>
                  <span className="ml-1 text-sm font-medium text-orange-600 md:ml-2">{config.breadcrumbTitle}</span>
                </div>
              </li>
            </ol>
          </nav>

          {renderFilters()}

          {error && (
            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-yellow-700">{error}</p>
                </div>
              </div>
            </div>
          )}

          <div className="bg-gradient-to-br from-yellow-50 via-orange-50 to-red-50 rounded-2xl shadow-2xl border-4 border-yellow-300 p-12 text-center">
            <svg className="mx-auto h-28 w-28 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            <h3 className="mt-6 text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-orange-600 to-red-600">No Data Loaded</h3>
            <p className="mt-4 text-base text-gray-700 font-medium">
              Please select filter criteria and click <strong className="text-orange-600">Apply</strong> to load LAR report data.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={config.hideUI?.breadcrumb && config.hideUI?.filters ? "" : "min-h-screen bg-gradient-to-br from-blue-100 via-purple-100 to-pink-100 p-6"}>
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

        {!config.hideUI?.filters && renderFilters()}
        <div ref={contentRef}>
          {renderModelSections()}
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

export default LARReportBase;
