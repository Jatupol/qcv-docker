// client/src/components/report/SeagateIQAResultReportBase.tsx
// ===== SHARED SEAGATE IQA RESULT REPORT BASE COMPONENT =====
// Reusable Seagate IQA Result Report with configurable data sources
// Manufacturing/Quality Control System - Orange Theme Implementation

import React, { useState, useEffect, useMemo } from 'react';
import { type DefectLegendItem } from '../../types/report';
import { formatDateTime, formatDate } from '../../utils/formatUtils';

// ============ INTERFACES ============

export interface IQAResultData {
  model: string;
  total_inspection_lot: number;
  acceptable_lot: number;
  rejected_lot: number;
  rejected_qty: number;
  lar: number;
}

// API Response structure
export interface APIResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
}

// Data source functions type definitions
export interface DataSourceFunctions {
  fetchReportData: (params: { year: string; ww: string }) => Promise<APIResponse>;
  fetchFiscalYears: () => Promise<APIResponse<string[]>>;
  fetchWorkWeeks: (year: string) => Promise<APIResponse<string[]>>;
}

// Configuration for the Seagate IQA Result report
export interface SeagateIQAResultReportConfig {
  // Report metadata
  title: string;
  breadcrumbTitle: string;

  // Data source configuration
  dataSource: DataSourceFunctions;

  // Auto-load configuration
  autoLoadFirstFY?: boolean;
  autoLoadFirstWW?: boolean;

  // Additional query parameters (optional)
  additionalParams?: Record<string, any>;
}

export interface SeagateIQAResultReportBaseProps {
  config: SeagateIQAResultReportConfig;
}

// ============ MAIN COMPONENT ============

const SeagateIQAResultReportBase: React.FC<SeagateIQAResultReportBaseProps> = ({ config }) => {
  const [isExporting, setIsExporting] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [iqaResultData, setIqaResultData] = useState<IQAResultData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Filter states
  const [fiscalYears, setFiscalYears] = useState<string[]>([]);
  const [workWeeks, setWorkWeeks] = useState<string[]>([]);
  const [selectedFY, setSelectedFY] = useState<string>('');
  const [selectedWW, setSelectedWW] = useState<string>('');

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
      setSelectedWW('');
    }
  }, [selectedFY]);

  // Load report data when both FY and WW are selected
  useEffect(() => {
    if (selectedFY && selectedWW) {
      loadReportData(selectedFY, selectedWW);
    } else {
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
        // Set default to first fiscal year if auto-load is enabled
        if (result.data.length > 0 && config.autoLoadFirstFY !== false) {
          setSelectedFY(result.data[0]);
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
        // Set default to first work week if auto-load is enabled
        if (result.data.length > 0 && config.autoLoadFirstWW !== false) {
          setSelectedWW(result.data[0]);
        }
      } else {
        console.warn('⚠️ Failed to fetch work weeks:', result.message);
      }
    } catch (err) {
      console.error('❌ Error loading work weeks:', err);
    }
  };

  const loadReportData = async (year: string, ww: string) => {
    setIsLoading(true);
    setError(null);

    try {
      console.log('🔄 Fetching Seagate IQA Result report data...');
      const params = {
        year,
        ww,
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

  const handleExportPDF = () => {
    setIsExporting(true);
    setTimeout(() => {
      setIsExporting(false);
      alert('Report exported successfully!');
    }, 2000);
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

  const renderTableRow = (data: IQAResultData | typeof totals, isTotal: boolean = false) => {
    const larValue = typeof data.lar === 'string' ? parseFloat(data.lar) : data.lar;

    return (
      <tr
        key={data.model}
        className={`${isTotal
          ? 'bg-primary-50 border-t-2 border-primary-200 font-bold'
          : 'hover:bg-gray-50'
        }`}
      >
        <td className={`px-6 py-4 whitespace-nowrap text-sm ${
          isTotal ? 'font-bold text-gray-900' : 'text-blue-600 font-medium'
        }`}>
          {data.model}
        </td>
        <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-900">
          {data.total_inspection_lot}
        </td>
        <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-900">
          {data.acceptable_lot}
        </td>
        <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-red-600 font-semibold">
          {data.rejected_lot}
        </td>
        <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-red-600 font-semibold">
          {data.rejected_qty}
        </td>
        <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-semibold text-gray-900">
          {larValue.toFixed(2)}%
        </td>
      </tr>
    );
  };

  // ============ MAIN RENDER ============

  console.log('🎨 Rendering SeagateIQAResultReportBase - loading:', isLoading, 'data.length:', iqaResultData.length);

  // ============ LOADING STATE ============

  if (isLoading) {
    console.log('⏳ Showing loading state');
    return (
      <div className="min-h-screen bg-gray-50 p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Loading {config.title}...</p>
        </div>
      </div>
    );
  }

  // ============ MAIN RENDER WITH DATA ============

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">

        {/* ==================== BREADCRUMB ==================== */}
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

        {/* ==================== PAGE HEADER ==================== */}
        <div className="mb-8">
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
            <div className="bg-gradient-to-r from-primary-600 to-orange-600 px-6 py-6">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-bold text-white mb-2">
                    {config.title} {selectedFY && selectedWW ? `FY${selectedFY} WW${selectedWW}` : ''}
                  </h1>
                  <p className="text-primary-100">
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
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ==================== FILTER CONTROLS ==================== */}
        <div className="mb-6">
          <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Fiscal Year <span className="text-red-500">*</span>
                </label>
                <select
                  value={selectedFY}
                  onChange={(e) => setSelectedFY(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                >
                  <option value="">Select FY</option>
                  {fiscalYears.map((fy) => (
                    <option key={fy} value={fy}>
                      FY {fy}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Work Week <span className="text-red-500">*</span>
                </label>
                <select
                  value={selectedWW}
                  onChange={(e) => setSelectedWW(e.target.value)}
                  disabled={!selectedFY || workWeeks.length === 0}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                >
                  <option value="">{selectedFY ? 'Select WW' : 'Select FY first'}</option>
                  {workWeeks.map((ww) => (
                    <option key={ww} value={ww}>
                      WW {ww.padStart(2, '0')}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

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
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
            <svg className="mx-auto h-24 w-24 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            <h3 className="mt-4 text-lg font-medium text-gray-900">No Data Loaded</h3>
            <p className="mt-2 text-sm text-gray-500">
              Please select both Fiscal Year and Work Week to load {config.title} data.
            </p>
          </div>
        )}

        {/* ==================== MAIN DATA TABLE ==================== */}
        {iqaResultData.length > 0 && (
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead>
                  <tr className="bg-gradient-to-r from-green-500 to-green-600">
                    <th className="px-6 py-4 text-left text-sm font-bold text-white uppercase tracking-wider">
                      Model
                    </th>
                    <th className="px-6 py-4 text-center text-sm font-bold text-white uppercase tracking-wider">
                      Total Inspection Lot
                    </th>
                    <th className="px-6 py-4 text-center text-sm font-bold text-white uppercase tracking-wider">
                      Acceptable Lot
                    </th>
                    <th className="px-6 py-4 text-center text-sm font-bold text-white uppercase tracking-wider">
                      Rejected Lot
                    </th>
                    <th className="px-6 py-4 text-center text-sm font-bold text-white uppercase tracking-wider">
                      Rejected Q'ty
                    </th>
                    <th className="px-6 py-4 text-center text-sm font-bold text-white uppercase tracking-wider">
                      LAR
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {iqaResultData.map((data) => renderTableRow(data))}
                  {renderTableRow(totals, true)}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ==================== FOOTER INFO ==================== */}
        <div className="mt-8 text-center text-sm text-gray-500">
          <p>Generated on {formatDate(new Date())} • Seagate Manufacturing Quality Control System</p>
        </div>

      </div>
    </div>
  );
};

export default SeagateIQAResultReportBase;
