// client/src/components/report/SGTIQAResultReportBase.tsx
// ===== SHARED SEAGATE IQA RESULT REPORT BASE COMPONENT =====
// Reusable Table Seagate IQA Report with configurable data sources
// Manufacturing/Quality Control System - Orange Theme Implementation

import React, { useState, useEffect, useMemo, useRef } from 'react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { type SGTIQAResultRecord } from '../../types/report';
import { getTodayDateString, formatDateTime } from '../../utils/formatUtils';
// ============ INTERFACES ============

// API Response structure
export interface APIResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
}

// Data source functions type definitions
export interface DataSourceFunctions {
  fetchReportData: (params: { yearFrom: string; wwFrom: string }) => Promise<APIResponse>;
  fetchFiscalYears: () => Promise<APIResponse<string[]>>;
  fetchWorkWeeks: (year: string) => Promise<APIResponse<string[]>>;
}

// Configuration for the Table Seagate IQA report
export interface SeagateIQAResultReportConfig {
  // Report metadata
  title: string;
  breadcrumbTitle: string;

  // Data source configuration
  dataSource: DataSourceFunctions;

  // Filter configuration
  showFiscalYearFilter?: boolean;
  showWorkWeekFilter?: boolean;

  // Default date range (for customer reports)
  defaultDateRange?: {
    yearFrom: string;
    wwFrom: string;
  };

  // Auto-load configuration
  autoLoadFirstFY?: boolean;
  autoLoadFirstWW?: boolean;
  autoLoadOnMount?: boolean;

  // Additional query parameters (optional)
  additionalParams?: Record<string, any>;

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
}

export interface SGTIQAResultReportBaseProps {
  config: SeagateIQAResultReportConfig;
}

// ============ MAIN COMPONENT ============

const SGTIQAResultReportBase: React.FC<SGTIQAResultReportBaseProps> = ({ config }) => {
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [iqaResultData, setIqaResultData] = useState<SGTIQAResultRecord[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  // Filter states - initialize with defaults if provided, prefer sharedFilters
  const [fiscalYears, setFiscalYears] = useState<string[]>([]);
  const [workWeeks, setWorkWeeks] = useState<string[]>([]);
  const [selectedFY, setSelectedFY] = useState<string>(
    config.sharedFilters?.fiscalYear || config.defaultDateRange?.yearFrom || ''
  );
  const [selectedWW, setSelectedWW] = useState<string>(
    config.sharedFilters?.workWeek || config.defaultDateRange?.wwFrom || ''
  );
  const [initialLoadDone, setInitialLoadDone] = useState<boolean>(false);

  // ============ DATA FETCHING ============

  // Load fiscal years on component mount
  useEffect(() => {
    loadFiscalYears();
  }, []);

  // Load work weeks when fiscal year changes
  useEffect(() => {
    if (selectedFY) {
      loadWorkWeeks(selectedFY);
    } else {
      setWorkWeeks([]);
      // Only reset WW if not using default date range
      if (!config.defaultDateRange?.wwFrom) {
        setSelectedWW('');
      }
    }
  }, [selectedFY]);

  // Auto-load data on mount if configured
  useEffect(() => {
    if (config.autoLoadOnMount && !initialLoadDone && selectedFY && selectedWW) {
      console.log('🔄 Auto-loading report data...');
      loadReportData(selectedFY, selectedWW);
      setInitialLoadDone(true);
    }
  }, [config.autoLoadOnMount, initialLoadDone, selectedFY, selectedWW]);

  // Handle shared filters from parent component
  useEffect(() => {
    if (config.sharedFilters) {
      console.log('🔄 Applying shared filters:', config.sharedFilters);
      setSelectedFY(config.sharedFilters.fiscalYear);
      setSelectedWW(config.sharedFilters.workWeek);

      // Load data directly with shared filters (only one API call)
      setTimeout(() => {
        loadReportData(config.sharedFilters!.fiscalYear, config.sharedFilters!.workWeek);
        setInitialLoadDone(true); // Mark as loaded to prevent duplicate calls
      }, 100);
    }
  }, [config.sharedFilters?.fiscalYear, config.sharedFilters?.workWeek]);

  // Load report data when both FY and WW are selected (for manual changes only)
  // Skip if using sharedFilters to avoid duplicate API calls
  useEffect(() => {
    // Don't run if using sharedFilters (parent controls data loading)
    if (config.sharedFilters) {
      return;
    }

    if (selectedFY && selectedWW && (!config.autoLoadOnMount || initialLoadDone)) {
      loadReportData(selectedFY, selectedWW);
    } else if (!selectedFY || !selectedWW) {
      setIqaResultData([]);
    }
  }, [selectedFY, selectedWW]);

  const loadFiscalYears = async () => {
    try {
      console.log('🔄 Fetching fiscal years...');
      const result = await config.dataSource.fetchFiscalYears();

      if (result.success && Array.isArray(result.data)) {
        console.log(`✅ Setting ${result.data.length} fiscal years:`, result.data);
        setFiscalYears(result.data);
        // Set default to latest fiscal year if auto-load is enabled
        if (result.data.length > 0 && config.autoLoadFirstFY !== false) {
          const sorted = [...result.data].sort((a, b) => parseInt(b, 10) - parseInt(a, 10));
          setSelectedFY(sorted[0]);
        }
      } else {
        console.warn('⚠️ Failed to fetch fiscal years:', result.message);
      }
    } catch (err) {
      console.error('❌ Error loading fiscal years:', err);
    }
  };

  const loadWorkWeeks = async (fy: string) => {
    try {
      console.log('🔄 Fetching work weeks for fiscal year:', fy);
      const result = await config.dataSource.fetchWorkWeeks(fy);

      if (result.success && Array.isArray(result.data)) {
        console.log(`✅ Setting ${result.data.length} work weeks:`, result.data);
        setWorkWeeks(result.data);
        // Set default to latest work week if auto-load is enabled
        if (result.data.length > 0 && config.autoLoadFirstWW !== false) {
          const sorted = [...result.data].sort((a, b) => parseInt(b, 10) - parseInt(a, 10));
          setSelectedWW(sorted[0]);
        }
      } else {
        console.warn('⚠️ Failed to fetch work weeks:', result.message);
      }
    } catch (err) {
      console.error('❌ Error loading work weeks:', err);
    }
  };

  const loadReportData = async (yearFrom: string, wwFrom: string) => {
    setIsLoading(true);
    setError(null);

    try {
      console.log('🔄 Fetching Table Seagate IQA report data...');
      const params = {
        yearFrom,
        wwFrom,
        ...config.additionalParams
      };

      const result = await config.dataSource.fetchReportData(params);

      if (result.success && Array.isArray(result.data)) {
        // Parse numeric fields from database strings to numbers
        const parsedData = result.data.map((item: any) => ({
          ...item,
          total_inspection_lot: parseInt(item.total_inspection_lot) || 0,
          acceptable_lot: parseInt(item.acceptable_lot) || 0,
          rejected_lot: parseInt(item.rejected_lot) || 0,
          rejected_qty: parseInt(item.rejected_qty) || 0,
          lar: parseFloat(item.lar) || 0
        }));
        console.log(`✅ IQA Result data fetched: ${parsedData.length} records`);
        setIqaResultData(parsedData);
        setLastUpdated(new Date());
      } else {
        const errorMsg = result.message || 'No data available in database';
        console.warn('⚠️ IQA Result fetch warning:', errorMsg);
        setError(errorMsg);
        setIqaResultData([]);
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Unknown error fetching report data';
      console.error('❌ IQA Result fetch exception:', errorMsg);
      setError(errorMsg);
      setIqaResultData([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Calculate totals from fetched data
  const totals = useMemo(() => {
    if (iqaResultData.length === 0) {
      return {
        model: 'Total',
        total_inspection_lot: 0,
        acceptable_lot: 0,
        rejected_lot: 0,
        rejected_qty: 0,
        lar: 0
      };
    }

    const totalInspectionLot = iqaResultData.reduce((sum, item) => sum + (item.total_inspection_lot || 0), 0);
    const totalAcceptableLot = iqaResultData.reduce((sum, item) => sum + (item.acceptable_lot || 0), 0);
    const totalRejectedLot = iqaResultData.reduce((sum, item) => sum + (item.rejected_lot || 0), 0);
    const totalRejectedQty = iqaResultData.reduce((sum, item) => sum + (item.rejected_qty || 0), 0);
    const averageLAR = totalInspectionLot > 0 ? (totalAcceptableLot / totalInspectionLot) * 100 : 0;

    return {
      model: 'Total',
      total_inspection_lot: totalInspectionLot,
      acceptable_lot: totalAcceptableLot,
      rejected_lot: totalRejectedLot,
      rejected_qty: totalRejectedQty,
      lar: averageLAR
    };
  }, [iqaResultData]);

  // ============ EVENT HANDLERS ============

  const handleExportPDF = async () => {
    if (!contentRef.current || iqaResultData.length === 0) {
      alert('No data to export');
      return;
    }

    setIsExporting(true);
    setExportProgress(0);

    try {
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 10;
      const footerHeight = 15;
      let yPosition = margin;

      const addPageFooter = (currentPage: number, totalPages: number) => {
        const footerY = pageHeight - 8;
        pdf.setDrawColor(200, 200, 200);
        pdf.setLineWidth(0.5);
        pdf.line(margin, pageHeight - footerHeight, pageWidth - margin, pageHeight - footerHeight);
        pdf.setFontSize(8);
        pdf.setTextColor(100, 100, 100);
        pdf.text(config.title, margin, footerY);
        const dateStr = formatDateTime(new Date());
        pdf.text(`Generated: ${dateStr}`, pageWidth / 2, footerY, { align: 'center' });
        pdf.text(`Page ${currentPage} of ${totalPages}`, pageWidth - margin, footerY, { align: 'right' });
        pdf.setTextColor(0, 0, 0);
      };

      setExportProgress(10);

      // Add title
      pdf.setFontSize(16);
      pdf.text(config.title, pageWidth / 2, yPosition, { align: 'center' });
      yPosition += 10;

      // Add filter info
      pdf.setFontSize(10);
      if (selectedFY && selectedWW) {
        pdf.text(`FY${selectedFY} / WW${selectedWW.padStart(2, '0')}`, margin, yPosition);
        yPosition += 10;
      }

      setExportProgress(20);

      const maxContentHeight = pageHeight - margin - footerHeight;

      // Capture table
      const tableElement = document.querySelector('[data-table="main"]') as HTMLElement;
      if (tableElement) {
        const tableCanvas = await html2canvas(tableElement, { scale: 2, logging: false, useCORS: true });
        const tableImgData = tableCanvas.toDataURL('image/png');
        const tableImgWidth = pageWidth - (2 * margin);
        const tableImgHeight = (tableCanvas.height * tableImgWidth) / tableCanvas.width;

        if (yPosition + tableImgHeight > maxContentHeight) {
          pdf.addPage('p');
          yPosition = margin;
        }

        pdf.addImage(tableImgData, 'PNG', margin, yPosition, tableImgWidth, tableImgHeight);
      }

      setExportProgress(90);

      // Add footers
      const totalPages = pdf.getNumberOfPages();
      for (let i = 1; i <= totalPages; i++) {
        pdf.setPage(i);
        addPageFooter(i, totalPages);
      }

      const dateStr = getTodayDateString();
      const filename = `Seagate_IQA_Result_FY${selectedFY}_WW${selectedWW}_${dateStr}.pdf`;
      pdf.save(filename);

      setExportProgress(100);
    } catch (error) {
      console.error('Error exporting PDF:', error);
      alert('Failed to export PDF. Please try again.');
    } finally {
      setTimeout(() => {
        setIsExporting(false);
        setExportProgress(0);
      }, 500);
    }
  };

  const handleRefresh = () => {
    if (selectedFY && selectedWW) {
      loadReportData(selectedFY, selectedWW);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  // ============ RENDER HELPERS ============

  const renderTableRow = (data: SGTIQAResultRecord | typeof totals, isTotal: boolean = false, index: number = 0) => {
    const larValue = typeof data.lar === 'string' ? parseFloat(data.lar) : data.lar;

    // Determine LAR color based on value
    const getLARColor = (lar: number) => {
      if (lar >= 95) return 'text-green-600 bg-green-50';
      if (lar >= 90) return 'text-blue-600 bg-blue-50';
      if (lar >= 80) return 'text-yellow-600 bg-yellow-50';
      return 'text-red-600 bg-red-50';
    };

    return (
      <tr
        key={data.model}
        className={`${isTotal
          ? 'bg-gradient-to-r from-purple-100 via-pink-100 to-orange-100 border-t-4 border-purple-300 font-bold'
          : index % 2 === 0 ? 'bg-white hover:bg-blue-50' : 'bg-gradient-to-r from-blue-50 to-cyan-50 hover:bg-cyan-100'
        } transition-colors duration-150`}
      >
        <td className={`px-6 py-4 whitespace-nowrap text-sm ${
          isTotal ? 'font-bold text-purple-900' : 'text-indigo-700 font-semibold'
        }`}>
          {data.model}
        </td>
        <td className={`px-6 py-4 whitespace-nowrap text-center text-sm ${
          isTotal ? 'font-bold text-gray-900' : 'text-gray-700'
        }`}>
          {data.total_inspection_lot}
        </td>
        <td className={`px-6 py-4 whitespace-nowrap text-center text-sm ${
          isTotal ? 'font-bold text-green-700' : 'text-green-600 font-medium'
        }`}>
          {data.acceptable_lot}
        </td>
        <td className={`px-6 py-4 whitespace-nowrap text-center text-sm ${
          isTotal ? 'font-bold text-red-700' : 'text-red-600 font-semibold'
        }`}>
          {data.rejected_lot}
        </td>
        <td className={`px-6 py-4 whitespace-nowrap text-center text-sm ${
          isTotal ? 'font-bold text-orange-700' : 'text-orange-600 font-semibold'
        }`}>
          {data.rejected_qty}
        </td>
        <td className={`px-6 py-4 whitespace-nowrap text-center text-sm font-bold ${
          isTotal ? 'text-purple-900' : getLARColor(larValue)
        } rounded-lg`}>
          {larValue.toFixed(2)}%
        </td>
      </tr>
    );
  };

  // ============ MAIN RENDER ============

  console.log('🎨 Rendering SGTIQAResultReportBase - loading:', isLoading, 'data.length:', iqaResultData.length);

  // ============ LOADING STATE ============

  if (isLoading) {
    console.log('⏳ Showing loading state');
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-100 via-pink-100 to-orange-100 p-6 flex items-center justify-center">
        <div className="text-center bg-white rounded-2xl shadow-2xl p-8 border-4 border-purple-300">
          <div className="animate-spin rounded-full h-20 w-20 border-t-4 border-b-4 border-purple-500 mx-auto mb-4"></div>
          <p className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600 text-xl font-bold">Loading {config.title}...</p>
        </div>
      </div>
    );
  }

  // ============ MAIN RENDER WITH DATA ============

  return (
    <div className={config.hideUI?.breadcrumb && config.hideUI?.filters ? "" : "min-h-screen bg-gradient-to-br from-blue-100 via-purple-100 to-pink-100"}>
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">

        {/* ==================== BREADCRUMB ==================== */}
        {!config.hideUI?.breadcrumb && (
          <nav className="flex mb-6" aria-label="Breadcrumb">
            <ol className="inline-flex items-center space-x-1 md:space-x-3">
              <li className="inline-flex items-center">
                <a href="/" className="inline-flex items-center text-sm font-medium text-gray-700 hover:text-orange-600">
                  <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
                  </svg>
                  Dashboard
                </a>
              </li>
              <li>
                <div className="flex items-center">
                  <svg className="w-6 h-6 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                  </svg>
                  <a href="/reports" className="ml-1 text-sm font-medium text-gray-700 hover:text-orange-600 md:ml-2">Reports</a>
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
        )}

        {/* ==================== PAGE HEADER ==================== */}
        {!config.hideUI?.header && (
          <div className="mb-8">
            <div className="bg-white rounded-xl shadow-2xl border-2 border-purple-200 overflow-hidden">
              <div className="bg-gradient-to-r from-purple-600 via-pink-600 to-orange-600 px-6 py-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h1 className="text-3xl font-bold text-white mb-2 drop-shadow-lg">
                      {config.title} {selectedFY && selectedWW ? `FY${selectedFY} WW${selectedWW}` : ''}
                    </h1>
                    <p className="text-pink-100 font-medium">
                      Last updated: {formatDateTime(lastUpdated)}
                    </p>
                  </div>

                  <div className="flex space-x-3">
                    <button
                      onClick={handleRefresh}
                      disabled={!selectedFY || !selectedWW}
                      className="bg-white bg-opacity-20 hover:bg-opacity-30 text-white px-4 py-2 rounded-lg font-medium transition-all duration-200 flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                      <span>Refresh</span>
                    </button>

                    <button
                      onClick={handlePrint}
                      className="bg-white bg-opacity-20 hover:bg-opacity-30 text-white px-4 py-2 rounded-lg font-medium transition-all duration-200 flex items-center space-x-2"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H3a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                      </svg>
                      <span>Print</span>
                    </button>

                    {!config.hideUI?.exportButton && (
                      <button
                        onClick={handleExportPDF}
                        disabled={isExporting}
                        className="bg-white text-primary-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed px-4 py-2 rounded-lg font-medium transition-all duration-200 flex items-center space-x-2"
                      >
                        {isExporting ? (
                          <>
                        <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        <span>Exporting...</span>
                      </>
                    ) : (
                      <>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <span>Export PDF</span>
                      </>
                    )}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ==================== FILTER CONTROLS ==================== */}
        {!config.hideUI?.filters && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 px-4 py-3 mb-4">
            <div className="flex flex-wrap items-center gap-3">
              {/* Default Date Range Display (when filters are hidden) */}
              {config.showFiscalYearFilter === false && config.showWorkWeekFilter === false && config.defaultDateRange && (
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-gray-600">FY/WW:</span>
                  <span className="px-2 py-1 bg-purple-50 border border-purple-200 rounded text-sm text-purple-800">
                    FY{config.defaultDateRange.yearFrom} / WW{config.defaultDateRange.wwFrom.padStart(2, '0')}
                  </span>
                </div>
              )}

              {/* Fiscal Year Filter */}
              {config.showFiscalYearFilter !== false && (
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-gray-600">FY:</span>
                  <select
                    value={selectedFY}
                    onChange={(e) => setSelectedFY(e.target.value)}
                    className="px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-purple-500"
                  >
                    <option value="">Select</option>
                    {fiscalYears.map((fy) => (
                      <option key={fy} value={fy}>{fy}</option>
                    ))}
                  </select>
                </div>
              )}

              {/* Work Week Filter */}
              {config.showWorkWeekFilter !== false && (
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-gray-600">WW:</span>
                  <select
                    value={selectedWW}
                    onChange={(e) => setSelectedWW(e.target.value)}
                    disabled={!selectedFY || workWeeks.length === 0}
                    className="px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-indigo-500 disabled:bg-gray-100"
                  >
                    <option value="">{selectedFY ? 'Select' : 'FY first'}</option>
                    {workWeeks.map((ww) => (
                      <option key={ww} value={ww}>{ww.padStart(2, '0')}</option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ==================== ERROR MESSAGE ==================== */}
        {error && (
          <div className="mb-6 bg-yellow-50 border-l-4 border-yellow-400 p-4">
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

        {/* ==================== EMPTY STATE ==================== */}
        {!isLoading && iqaResultData.length === 0 && !error && (
          <div className="bg-gradient-to-br from-yellow-50 via-orange-50 to-red-50 rounded-2xl shadow-2xl border-4 border-yellow-300 p-12 text-center">
            <svg className="mx-auto h-28 w-28 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            <h3 className="mt-6 text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-orange-600 to-red-600">No Data Loaded</h3>
            <p className="mt-4 text-base text-gray-700 font-medium">
              Please select both Fiscal Year and Work Week to load <strong className="text-orange-600">{config.title}</strong> data.
            </p>
          </div>
        )}

        {/* ==================== MAIN DATA TABLE ==================== */}
        {iqaResultData.length > 0 && (
          <div ref={contentRef}>
            <div className="bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 rounded-xl shadow-2xl border-2 border-teal-400 overflow-hidden" data-table="main">
              <div className="px-6 py-4 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-600 border-b-2 border-teal-400">
                <h3 className="text-lg font-bold text-white flex items-center drop-shadow-md">
                  <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5 4a3 3 0 00-3 3v6a3 3 0 003 3h10a3 3 0 003-3V7a3 3 0 00-3-3H5zm-1 9v-1h5v2H5a1 1 0 01-1-1zm7 1h4a1 1 0 001-1v-1h-5v2zm0-4h5V8h-5v2zM9 8H4v2h5V8z" clipRule="evenodd" />
                  </svg>
                  IQA Result Data
                </h3>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead>
                    <tr className="bg-gradient-to-r from-teal-100 to-cyan-100">
                      <th className="px-6 py-4 text-left text-sm font-bold text-teal-800 uppercase tracking-wider">
                        Model
                      </th>
                      <th className="px-6 py-4 text-center text-sm font-bold text-teal-800 uppercase tracking-wider">
                        Total Inspection Lot
                      </th>
                      <th className="px-6 py-4 text-center text-sm font-bold text-teal-800 uppercase tracking-wider">
                        Acceptable Lot
                      </th>
                      <th className="px-6 py-4 text-center text-sm font-bold text-teal-800 uppercase tracking-wider">
                        Rejected Lot
                      </th>
                      <th className="px-6 py-4 text-center text-sm font-bold text-teal-800 uppercase tracking-wider">
                        Rejected Q'ty
                      </th>
                      <th className="px-6 py-4 text-center text-sm font-bold text-teal-800 uppercase tracking-wider">
                        LAR
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {iqaResultData.map((data, index) => renderTableRow(data, false, index))}
                    {renderTableRow(totals, true, 0)}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

 

      </div>

      {/* Export Progress Modal */}
      {isExporting && (
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
                {exportProgress >= 20 && exportProgress < 90 && "Capturing table data..."}
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

export default SGTIQAResultReportBase;
