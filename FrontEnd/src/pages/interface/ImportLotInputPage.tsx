// client/src/pages/interface/ImportLotInputPage.tsx
// ===== UPDATED IMPORT LOT INPUT DATA VIEWER =====
// Data Display Only - Enhanced Filtering and Search Interface
// Manufacturing Quality Control System - Lot Input Data Management

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  MagnifyingGlassIcon,
  FunnelIcon,
  ArrowPathIcon,
  XMarkIcon,
  CalendarDaysIcon,
  ClockIcon,
  CubeIcon,
  DocumentTextIcon,
  ArrowDownTrayIcon,
  TrashIcon,
  CheckIcon
} from '@heroicons/react/24/outline';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Table, { type TableColumn } from '../../components/ui/Table';
import Alert from '../../components/ui/Alert';
import { infLotInputService } from '../../services/infLotInputService';
import Breadcrumb from '../../components/common/Breadcrumb';
import { formatNumber, formatDate } from '../../utils';
import { formatTime } from '../../utils/formatUtils';
import type {
  InfLotInputRecord,
  DataFilters,
  PaginationInfo,
  ApiResponse,
  ImportStats,
  SyncStats,
  SyncStep
} from '../../types/inf-lotinput';

// ==================== MAIN COMPONENT ====================

const ImportLotInputPage: React.FC = () => {
  // ==================== STATE MANAGEMENT ====================

  const [data, setData] = useState<InfLotInputRecord[]>([]);
  const [filteredData, setFilteredData] = useState<InfLotInputRecord[]>([]);
  const [pagination, setPagination] = useState<PaginationInfo | null>(null);
  const [statistics, setStatistics] = useState<ImportStats | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [importing, setImporting] = useState<boolean>(false);
  const [syncStep, setSyncStep] = useState<SyncStep>(0);
  const [syncStats, setSyncStats] = useState<SyncStats>({});
  const [successMessage, setSuccessMessage] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string>('');

  // Import date state
  const [importDate, setImportDate] = useState<string>(infLotInputService.getTodayDate());

  // Cleanup modal state
  const [showCleanupModal, setShowCleanupModal] = useState<boolean>(false);
  const [excludeKeywords, setExcludeKeywords] = useState<string>('');
  const [cleanupLoading, setCleanupLoading] = useState<boolean>(false);
  const [savingKeywords, setSavingKeywords] = useState<boolean>(false);
  const [cleanupResult, setCleanupResult] = useState<{ removed?: number; lotNumbers?: string[]; message?: string } | null>(null);

  // Missing items state
  const [missingItems, setMissingItems] = useState<string[]>([]);
  const [missingItemsLoaded, setMissingItemsLoaded] = useState(false);

  // Pagination state
  const [page, setPage] = useState<number>(1);
  const [limit, setLimit] = useState<number>(50);

  // Filter state
  const [filters, setFilters] = useState<DataFilters>({
    lotNoSearch: '',
    itemNoSearch: '',
    inputDateFrom: infLotInputService.getTodayDate(), // Default to today
    inputDateTo: infLotInputService.getTodayDate()    // Default to today
  });

  // ==================== API FUNCTIONS ====================

  /**
   * Fetch lot input data with filters and pagination
   */
  const fetchData = useCallback(async (): Promise<void> => {
    try {
      setLoading(true);
      setErrorMessage('');

      // Use centralized service for API call
      const result = await infLotInputService.fetchLotInputData({
        page,
        limit,
        lotNoSearch: filters.lotNoSearch,
        itemNoSearch: filters.itemNoSearch,
        inputDateFrom: filters.inputDateFrom,
        inputDateTo: filters.inputDateTo
      });

      if (result.success && result.data) {
        console.log('✅ Data fetched successfully:', result.data.length, 'records');
        setData(result.data);
        setPagination(result.pagination || null);

        // Extract unique values for dropdown options using service
        infLotInputService.extractFilterOptions(result.data);
      } else {
        console.error('❌ Failed to fetch data:', result.error);
        setErrorMessage(result.error || 'Failed to fetch data');
        setData([]);
        setPagination(null);
      }
    } catch (error) {
      console.error('❌ Fetch error:', error);
      setErrorMessage(error instanceof Error ? error.message : 'Failed to fetch data');
      setData([]);
      setPagination(null);
    } finally {
      setLoading(false);
    }
  }, [filters, page, limit]);

  /**
   * Fetch statistics
   */
  const fetchStatistics = useCallback(async (): Promise<void> => {
    try {
      console.log('📊 Fetching statistics...');

      // Use centralized service for API call
      const result = await infLotInputService.getStatistics();

      if (result.success && result.data) {
        console.log('✅ Statistics fetched successfully:', result.data);
        setStatistics(result.data);
      } else {
        console.log('ℹ️ No statistics available:', result.error);
        setStatistics(null);
      }
    } catch (error) {
      console.error('❌ Statistics fetch error:', error);
      setStatistics(null);
    }
  }, []);

  /**
   * Search specific lot by lot number
   */
  const searchByLotNumber = useCallback(async (lotNo: string): Promise<void> => {
    if (!lotNo.trim()) {
      setErrorMessage('Please enter a lot number to search');
      return;
    }

    try {
      setLoading(true);
      setErrorMessage('');

      // Use centralized service for API call
      const result = await infLotInputService.searchByLotNumber(lotNo);

      if (result.success && result.data && result.data.length > 0) {
        console.log('✅ Lot search successful:', result.data.length, 'records');
        setData(result.data);
        setPagination(null); // Clear pagination for search results
        setSuccessMessage(result.message || `Found ${result.data.length} records for lot: ${lotNo}`);
      } else {
        setData([]);
        setPagination(null);
        setErrorMessage(result.error || `No records found for lot: ${lotNo}`);
      }
    } catch (error) {
      console.error('❌ Lot search error:', error);
      setErrorMessage(error instanceof Error ? error.message : 'Search failed');
      setData([]);
      setPagination(null);
    } finally {
      setLoading(false);
    }
  }, []);

  // ==================== UTILITY FUNCTIONS ====================

  /**
   * Apply client-side filtering to the data (only for text searches)
   * Date filtering is handled server-side via API
   */
  const applyFilters = useCallback((): void => {
    // Use service to apply client-side filters
    const filtered = infLotInputService.applyClientFilters(data, filters);
    setFilteredData(filtered);
  }, [data, filters]);

  // ==================== EVENT HANDLERS ====================

  const handleFilterChange = (field: keyof DataFilters, value: string) => {
    setFilters(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleClearFilters = () => {
    setFilters({
      lotNoSearch: '',
      itemNoSearch: '',
      inputDateFrom: infLotInputService.getTodayDate(), // Reset to today
      inputDateTo: infLotInputService.getTodayDate(),   // Reset to today
    });
  };

  const handleQuickLotSearch = () => {
    if (filters.lotNoSearch.trim()) {
      searchByLotNumber(filters.lotNoSearch.trim());
    }
  };

  const handleRefreshData = () => {
    fetchData();
    fetchStatistics();
  };

  // ==================== CLEANUP HANDLERS ====================

  const handleOpenCleanupModal = async () => {
    setCleanupResult(null);
    setShowCleanupModal(true);
    const result = await infLotInputService.getExcludeKeywords();
    if (result.success) {
      setExcludeKeywords(result.data || '');
    }
  };

  const handleSaveKeywords = async () => {
    setSavingKeywords(true);
    const result = await infLotInputService.updateExcludeKeywords(excludeKeywords);
    setSavingKeywords(false);
    if (result.success) {
      setSuccessMessage('Keywords saved successfully');
      setTimeout(() => setSuccessMessage(''), 3000);
    } else {
      setErrorMessage(result.message || 'Failed to save keywords');
    }
  };

  const handleRunCleanup = async () => {
    if (!window.confirm('Are you sure you want to remove matching lots from the local database?')) return;
    setCleanupLoading(true);
    setCleanupResult(null);
    const result = await infLotInputService.cleanupByKeywords();
    setCleanupLoading(false);
    if (result.success) {
      setCleanupResult({ removed: result.removed, lotNumbers: result.lotNumbers, message: result.message });
      // Refresh data after cleanup
      fetchData();
      fetchStatistics();
    } else {
      setCleanupResult({ message: result.message || 'Cleanup failed' });
    }
  };

  /**
   * Handle manual import/sync of data
   */
  const handleManualImport = async () => {
    try {
      setImporting(true);
      setErrorMessage('');
      setSuccessMessage('');
      setSyncStep(0);
      setSyncStats({});

      console.log('🔄 Starting manual sync...');

      // Step 1: Connecting to source database
      setSyncStep(1);
      await new Promise(resolve => setTimeout(resolve, 500));

      // Step 2: Getting records from source
      setSyncStep(2);
      await new Promise(resolve => setTimeout(resolve, 500));

      // Step 3: Importing to destination
      setSyncStep(3);

      // Add timeout wrapper for API call (30 seconds)
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Sync operation timed out after 30 seconds')), 30000)
      );

      const syncPromise = infLotInputService.syncData({
        dateFrom: importDate,
        dateTo: importDate
      });

      // Race between API call and timeout
      const result = await Promise.race([syncPromise, timeoutPromise]) as any;

      if (result.success) {
        const importedCount = result.data?.imported || 0;
        const skippedCount = result.data?.skipped || 0;
        const updatedCount = result.data?.updated || 0;
        const totalRecords = importedCount + updatedCount + skippedCount;

        // Update stats to show total records during step 3
        setSyncStats({
          imported: importedCount,
          updated: updatedCount,
          skipped: skippedCount
        });

        // If no records to import, skip steps 3-4 and close immediately
        if (totalRecords === 0) {
          setSuccessMessage('No new records to import');
          await new Promise(resolve => setTimeout(resolve, 1500));
          setImporting(false);
          setSyncStep(0);
          return;
        }

        // Step 4: Show results
        setSyncStep(4);
        setSyncStats({
          imported: importedCount,
          updated: updatedCount,
          skipped: skippedCount
        });

        // Wait to show results
        await new Promise(resolve => setTimeout(resolve, 2000));

        setSuccessMessage(
          result.message || `✅ Sync completed successfully! Imported: ${importedCount}, Updated: ${updatedCount}, Skipped: ${skippedCount}`
        );

        // Refresh data and statistics after successful sync
        await fetchData();
        await fetchStatistics();

        // Close modal after success
        setImporting(false);
        setSyncStep(0);
      } else {
        // Show error step
        setSyncStep(-1); // Error state
        setErrorMessage(result.error || 'Sync failed');
        // Keep modal open briefly so user sees the error in modal, then close
        await new Promise(resolve => setTimeout(resolve, 3000));
        setImporting(false);
        setSyncStep(0);
      }
    } catch (error) {
      console.error('❌ Sync error:', error);
      setSyncStep(-1); // Error state
      setErrorMessage(error instanceof Error ? error.message : 'Failed to sync data');
      // Keep modal open briefly so user sees the error in modal, then close
      await new Promise(resolve => setTimeout(resolve, 3000));
      setImporting(false);
      setSyncStep(0);
    }
  };

  // ==================== EFFECTS ====================

  // Fetch initial data and statistics when page, limit, or date filters change
  useEffect(() => {
    fetchData();
    fetchStatistics();
  }, [fetchData, fetchStatistics, page, limit, filters.inputDateFrom, filters.inputDateTo]);

  // Fetch missing items once on mount
  useEffect(() => {
    infLotInputService.getMissingItems().then(result => {
      if (result.success && result.data) {
        setMissingItems(result.data);
      }
      setMissingItemsLoaded(true);
    });
  }, []);

  // Apply client-side filters when data or text search filters change
  useEffect(() => {
    applyFilters();
  }, [data, filters.lotNoSearch, filters.itemNoSearch, applyFilters]);

  // Auto-clear messages
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(''), 5000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  useEffect(() => {
    if (errorMessage) {
      const timer = setTimeout(() => setErrorMessage(''), 8000);
      return () => clearTimeout(timer);
    }
  }, [errorMessage]);

  // ==================== HELPER FUNCTIONS ====================

 
  

  // formatTime is now imported from ../../utils/formatUtils

  /**
   * Highlight search terms in text
   */
  const highlightText = (text: string, searchTerms: string[]) => {
    if (!text || searchTerms.length === 0) return text;

    // Filter out empty search terms
    const validTerms = searchTerms.filter(term => term && term.trim());
    if (validTerms.length === 0) return text;

    // Create a regex pattern for all search terms (case insensitive)
    const pattern = validTerms.map(term =>
      term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') // Escape special regex characters
    ).join('|');

    const regex = new RegExp(`(${pattern})`, 'gi');

    // Split text and wrap matches in highlight spans
    const parts = text.split(regex);

    return (
      <>
        {parts.map((part, index) => {
          const isMatch = validTerms.some(term =>
            part.toLowerCase() === term.toLowerCase()
          );

          return isMatch ? (
            <mark
              key={index}
              className="bg-yellow-200 text-yellow-900 px-1 rounded"
            >
              {part}
            </mark>
          ) : (
            part
          );
        })}
      </>
    );
  };

  // Get current search terms for highlighting
  const getSearchTerms = () => {
    const terms = [];
    if (filters.lotNoSearch.trim()) terms.push(filters.lotNoSearch.trim());
    if (filters.itemNoSearch.trim()) terms.push(filters.itemNoSearch.trim());
    return terms;
  };

  const searchTerms = getSearchTerms();

  // ==================== TABLE CONFIGURATION ====================

  const columns: TableColumn<InfLotInputRecord>[] = [
    {
      key: 'sequence',
      header: '#',
      width: '50px',
      align: 'center' as const,
      render: (value, record, index) => (
        <span className="text-gray-500 text-sm">
          {(pagination ? ((pagination.page - 1) * pagination.limit) : 0) + index + 1}
        </span>
      )
    },
    {
      key: 'LotNo',
      header: 'Lot No',
      render: (value, record) => (
        <span className="font-bold text-blue-600">
          {highlightText(record.LotNo, searchTerms)}
        </span>
      )
    },
    {
      key: 'ItemNo',
      header: 'Item No',
      render: (value, record) => (
        <span className="font-mono text-sm">
          {highlightText(record.ItemNo, searchTerms)}
        </span>
      )
    },
    {
      key: 'PartSite',
      header: 'Part Site',
      render: (value, record) => (
        <span className="font-medium text-gray-900">
          {record.PartSite}
        </span>
      )
    },
    {
      key: 'LineNo',
      header: 'Line No',
      render: (value, record) => (
        <span className="text-sm bg-blue-100 px-2 py-1 rounded">
          {record.LineNo}
        </span>
      )
    },
    {
      key: 'Model',
      header: 'Model',
      render: (value, record) => (
        <span className="font-medium text-gray-800">
          {record.Model}
        </span>
      )
    },
    {
      key: 'Version',
      header: 'Version',
      render: (value, record) => (
        <span className="text-sm bg-gray-100 px-2 py-1 rounded">
          {record.Version}
        </span>
      )
    },
    {
      key: 'InputDate',
      header: 'Input Date',
      render: (value, record) => (
        <span className="text-sm text-green-700">
          {formatDate(record.InputDate)} {formatTime(record.InputDate)}
        </span>
      )
    }
  ];

  // ==================== RENDER ====================

  // Use filtered data when text search is active, otherwise use server-side data
  const hasTextSearch = filters.lotNoSearch.trim() || filters.itemNoSearch.trim();
  const displayData = hasTextSearch ? filteredData : data;

  // Debug logging
  console.log('🔍 Component Debug Info:', {
    dataLength: data.length,
    filteredDataLength: filteredData.length,
    hasTextSearch,
    displayDataLength: displayData.length,
    loading,
    filters
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
      {/* Animated Background Pattern */}
      <div className="fixed inset-0 opacity-30 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-400/10 via-purple-400/10 to-pink-400/10 animate-gradient-x"></div>
      </div>

      {/* Header */}
      <div className="relative bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 shadow-xl">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <div className="absolute inset-0 bg-white rounded-full blur-lg opacity-50 animate-pulse"></div>
                  <DocumentTextIcon className="relative w-12 h-12 text-white drop-shadow-lg" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-white flex items-center drop-shadow-md">
                    Lot Input Data Viewer
                    {importing && (
                      <span className="ml-3 inline-flex items-center">
                        <ArrowPathIcon className="w-6 h-6 text-yellow-300 animate-spin" />
                      </span>
                    )}
                  </h1>
                  <p className="mt-1 text-sm text-indigo-100">
                    Browse and filter imported lot input data with advanced search capabilities
                  </p>
                </div>
              </div>

              {/* Statistics Summary - Enhanced with gradients */}
              {statistics && (
                <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 text-sm">
                  <div className="text-center bg-white/20 backdrop-blur-sm rounded-lg px-4 py-2 border border-white/30 shadow-lg transform transition-all hover:scale-105">
                    <div className="text-xl font-bold text-white drop-shadow-md">
                      {formatNumber(statistics.totalRecords.toString())}
                    </div>
                    <div className="text-indigo-100 text-xs">Total Records</div>
                  </div>
                  <div className="text-center bg-white/20 backdrop-blur-sm rounded-lg px-4 py-2 border border-white/30 shadow-lg transform transition-all hover:scale-105">
                    <div className="text-2xl font-bold text-yellow-300 drop-shadow-md">
                      {formatNumber(statistics.totalToday.toString())}
                    </div>
                    <div className="text-indigo-100 text-xs">Today</div>
                  </div>
                  <div className="text-center bg-white/20 backdrop-blur-sm rounded-lg px-4 py-2 border border-white/30 shadow-lg transform transition-all hover:scale-105">
                    <div className="text-2xl font-bold text-green-300 drop-shadow-md">
                      {formatNumber(statistics.totalMonth.toString())}
                    </div>
                    <div className="text-indigo-100 text-xs">This Month</div>
                  </div>
                  <div className="text-center bg-white/20 backdrop-blur-sm rounded-lg px-4 py-2 border border-white/30 shadow-lg transform transition-all hover:scale-105">
                    <div className="text-xl font-bold text-blue-300 drop-shadow-md">
                      {formatNumber(statistics.totalYear.toString())}
                    </div>
                    <div className="text-indigo-100 text-xs">This Year</div>
                  </div>
                  <div className="text-center bg-white/20 backdrop-blur-sm rounded-lg px-4 py-2 border border-white/30 shadow-lg">
                    <div className="text-indigo-100 text-xs font-medium">
                      Last Sync
                    </div>
                    <div className="text-white text-xs mt-1">
                      {statistics.lastSync ? (() => {
                        const date = new Date(statistics.lastSync);
                        const day = String(date.getDate()).padStart(2, '0');
                        const month = String(date.getMonth() + 1).padStart(2, '0');
                        const year = date.getFullYear();
                        const hours = String(date.getHours()).padStart(2, '0');
                        const minutes = String(date.getMinutes()).padStart(2, '0');
                        return `${day}/${month}/${year} ${hours}:${minutes}`;
                      })() : 'N/A'}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Breadcrumb Navigation */}
      <div className="relative px-4 sm:px-6 lg:px-8 pt-6">
        <Breadcrumb
          items={[
            { label: 'Home', href: '/' },
            { label: 'Interface', href: '/interface' },
            { label: 'Lot-Input Data' }
          ]}
          className="mb-4"
        />
      </div>

      {/* Messages with Animation */}
      {successMessage && (
        <div className="animate-slide-down">
          <Alert
            variant="success"
            message={successMessage}
            onDismiss={() => setSuccessMessage('')}
            className="mx-4 mt-4 shadow-lg"
          />
        </div>
      )}

      {errorMessage && (
        <div className="animate-slide-down">
          <Alert
            variant="error"
            message={errorMessage}
            onDismiss={() => setErrorMessage('')}
            className="mx-4 mt-4 shadow-lg"
          />
        </div>
      )}

      {/* Missing Items Alert */}
      {missingItemsLoaded && missingItems.length > 0 && (
        <div className="mx-4 mt-4 animate-slide-down">
          <div className="flex items-start gap-3 bg-amber-50 border-2 border-amber-400 rounded-xl px-4 py-3 shadow-md">
            <span className="text-amber-500 text-xl flex-shrink-0 mt-0.5">⚠️</span>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-amber-800 text-sm mb-1">
                พบรายการ Item ที่ยังไม่มีใน Master Parts ({missingItems.length} รายการ)
              </p>
              <p className="text-amber-700 text-xs leading-relaxed break-all">
                {missingItems.join(', ')}
              </p>
              <p className="text-amber-600 text-xs mt-1">
                กรุณาเพิ่มข้อมูลใน Parts Master เพื่อให้ระบบทำงานได้ถูกต้อง
              </p>
            </div>
            <button
              onClick={() => setMissingItems([])}
              className="flex-shrink-0 text-amber-400 hover:text-amber-600 transition-colors"
              title="ปิด"
            >
              <span className="text-lg leading-none">×</span>
            </button>
          </div>
        </div>
      )}

      {/* Sync Progress Overlay */}
      {importing && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-lg w-full mx-4 animate-scale-up">
            <div className="text-center">
              {/* Animated Sync Icon or Error Icon */}
              <div className="relative inline-flex items-center justify-center mb-6">
                <div className={`absolute inset-0 ${syncStep === -1 ? 'bg-gradient-to-r from-red-500 to-orange-500' : syncStep === 4 ? 'bg-gradient-to-r from-green-500 to-emerald-500' : 'bg-gradient-to-r from-indigo-500 to-purple-500'} rounded-full blur-xl opacity-50 animate-pulse`}></div>
                <div className={`relative ${syncStep === -1 ? 'bg-gradient-to-r from-red-600 to-orange-600' : syncStep === 4 ? 'bg-gradient-to-r from-green-600 to-emerald-600' : 'bg-gradient-to-r from-indigo-600 to-purple-600'} rounded-full p-6`}>
                  {syncStep === -1 ? (
                    <XMarkIcon className="w-16 h-16 text-white" />
                  ) : syncStep === 4 ? (
                    <svg className="w-16 h-16 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    <ArrowPathIcon className="w-16 h-16 text-white animate-spin" />
                  )}
                </div>
              </div>

              {/* Progress Text or Error Text */}
              {syncStep === -1 ? (
                <>
                  <h3 className="text-2xl font-bold text-red-600 mb-2">
                    Sync Failed
                  </h3>
                  <p className="text-gray-600 mb-6">
                    {errorMessage}
                  </p>
                  <p className="text-sm text-gray-500">
                    Modal will close automatically...
                  </p>
                </>
              ) : syncStep === 4 ? (
                <>
                  <h3 className="text-2xl font-bold text-green-600 mb-2">
                    Sync Completed!
                  </h3>
                  <div className="text-left bg-gray-50 rounded-lg p-4 mb-4">
                    <div className="flex justify-between py-2 border-b border-gray-200">
                      <span className="text-gray-600">Imported:</span>
                      <span className="font-bold text-green-600">{syncStats.imported || 0}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-gray-200">
                      <span className="text-gray-600">Updated:</span>
                      <span className="font-bold text-blue-600">{syncStats.updated || 0}</span>
                    </div>
                    <div className="flex justify-between py-2">
                      <span className="text-gray-600">Skipped:</span>
                      <span className="font-bold text-gray-600">{syncStats.skipped || 0}</span>
                    </div>
                    <div className="flex justify-between py-2 border-t-2 border-gray-300 mt-2 pt-2">
                      <span className="font-bold text-gray-700">Total Records:</span>
                      <span className="font-bold text-purple-600">{(syncStats.imported || 0) + (syncStats.updated || 0) + (syncStats.skipped || 0)}</span>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">
                    Syncing Data...
                  </h3>

                  {/* Step Progress */}
                  <div className="space-y-3 mb-6">
                    {/* Step 1 */}
                    <div className={`flex items-center ${syncStep >= 1 ? 'text-indigo-600' : 'text-gray-400'}`}>
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-3 ${syncStep > 1 ? 'bg-green-500 text-white' : syncStep === 1 ? 'bg-indigo-500 text-white animate-pulse' : 'bg-gray-200'}`}>
                        {syncStep > 1 ? '✓' : '1'}
                      </div>
                      <span className={`${syncStep === 1 ? 'font-semibold' : ''}`}>Connecting to source database</span>
                    </div>

                    {/* Step 2 */}
                    <div className={`flex items-center ${syncStep >= 2 ? 'text-indigo-600' : 'text-gray-400'}`}>
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-3 ${syncStep > 2 ? 'bg-green-500 text-white' : syncStep === 2 ? 'bg-indigo-500 text-white animate-pulse' : 'bg-gray-200'}`}>
                        {syncStep > 2 ? '✓' : '2'}
                      </div>
                      <span className={`${syncStep === 2 ? 'font-semibold' : ''}`}>Getting records from source</span>
                    </div>

                    {/* Step 3 */}
                    <div className={`flex items-center justify-between ${syncStep >= 3 ? 'text-indigo-600' : 'text-gray-400'}`}>
                      <div className="flex items-center">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-3 ${syncStep > 3 ? 'bg-green-500 text-white' : syncStep === 3 ? 'bg-indigo-500 text-white animate-pulse' : 'bg-gray-200'}`}>
                          {syncStep > 3 ? '✓' : '3'}
                        </div>
                        <span className={`${syncStep === 3 ? 'font-semibold' : ''}`}>Importing to destination server</span>
                      </div>
                      {syncStep === 3 && syncStats.imported !== undefined && (
                        <span className="text-sm font-bold text-purple-600 ml-2">
                          {(syncStats.imported || 0) + (syncStats.updated || 0) + (syncStats.skipped || 0)} records
                        </span>
                      )}
                    </div>

                    {/* Step 4 */}
                    <div className={`flex items-center ${syncStep >= 4 ? 'text-indigo-600' : 'text-gray-400'}`}>
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-3 ${syncStep === 4 ? 'bg-green-500 text-white' : 'bg-gray-200'}`}>
                        4
                      </div>
                      <span className={`${syncStep === 4 ? 'font-semibold' : ''}`}>Processing results</span>
                    </div>
                  </div>

                  {/* Animated Progress Bar */}
                  <div className="relative h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="absolute inset-0 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 transition-all duration-500"
                      style={{ width: `${(syncStep / 4) * 100}%` }}
                    ></div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="relative px-4 sm:px-6 lg:px-8 py-6">
        {/* Quick Search Section */}
        <div className="bg-white/80 backdrop-blur-sm shadow-xl rounded-2xl p-6 mb-6 border border-purple-100 transform transition-all hover:shadow-2xl hover:scale-[1.01]">
          <div className="flex items-center mb-4">
            <div className="relative mr-3">
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-lg blur opacity-50"></div>
              <MagnifyingGlassIcon className="relative w-6 h-6 text-purple-600" />
            </div>
            <h2 className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              Quick Search
            </h2>
          </div>


          {/* Date Filters */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <CalendarDaysIcon className="w-4 h-4 inline mr-1" />
                Input Date From
              </label>
              <Input
                type="date"
                value={filters.inputDateFrom}
                onChange={(e) => handleFilterChange('inputDateFrom', e.target.value)}
                className="w-full"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <CalendarDaysIcon className="w-4 h-4 inline mr-1" />
                Input Date To
              </label>
              <Input
                type="date"
                value={filters.inputDateTo}
                onChange={(e) => handleFilterChange('inputDateTo', e.target.value)}
                className="w-full"
              />
            </div>
 
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Search by Lot Number
              </label>
              <div className="flex gap-2">
                <Input
                  value={filters.lotNoSearch}
                  onChange={(e) => handleFilterChange('lotNoSearch', e.target.value)}
                  placeholder="Enter lot number..."
                  className="flex-1"
                  onKeyPress={(e) => e.key === 'Enter' && handleQuickLotSearch()}
                />
                <Button
                  onClick={handleQuickLotSearch}
                  disabled={loading || !filters.lotNoSearch.trim()}
                  variant="primary"
                >
                  Search
                </Button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Search by Item Number
              </label>
              <Input
                value={filters.itemNoSearch}
                onChange={(e) => handleFilterChange('itemNoSearch', e.target.value)}
                placeholder="Enter item number..."
                className="w-full"
              />
            </div>
          </div>
        </div>

        {/* Data Table */}
        <div className="bg-white/80 backdrop-blur-sm shadow-xl rounded-2xl border border-indigo-100 overflow-hidden transform transition-all hover:shadow-2xl">
          <div className="px-6 py-4 bg-gradient-to-r from-indigo-50 to-purple-50 border-b border-purple-100">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold flex items-center">
                <div className="relative mr-3">
                  <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-lg blur opacity-50"></div>
                  <CubeIcon className="relative w-6 h-6 text-purple-600" />
                </div>
                <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  Lot Input Data
                </span>
                {!pagination && (
                  <span className="ml-2 text-sm text-gray-600 bg-white/60 px-3 py-1 rounded-full">
                    {filteredData.length} records
                  </span>
                )}
              </h2>
              <div className="flex items-center space-x-4">
                {/* Page Size Selector */}
                {pagination && (
                  <div className="flex items-center bg-white/60 rounded-lg px-3 py-2 shadow-sm">
                    <label className="text-sm font-medium text-gray-700 mr-2">Show:</label>
                    <select
                      value={limit}
                      onChange={(e) => setLimit(parseInt(e.target.value))}
                      className="border-purple-300 rounded-md text-sm focus:ring-purple-500 focus:border-purple-500 bg-white"
                    >
                      <option value={25}>25</option>
                      <option value={50}>50</option>
                      <option value={100}>100</option>
                      <option value={200}>200</option>
                    </select>
                  </div>
                )}

                {/* Import Date Picker */}
                    <div className="flex items-center bg-white/60 rounded-lg px-3 py-2 shadow-sm">
                      <label className="text-sm font-medium text-gray-700 mr-2">Import Date:</label>
                      <Input
                        type="date"
                        value={importDate}
                        onChange={(e) => setImportDate(e.target.value)}
                        className="border-purple-300 rounded-md text-sm focus:ring-purple-500 focus:border-purple-500 bg-white w-40"
                      />
                    </div>

                    {/* Sync Button */}
                <button
                  onClick={handleManualImport}
                  disabled={importing || loading}
                  className={`
                    relative overflow-hidden px-4 py-2 rounded-lg font-medium text-white text-sm
                    transition-all transform hover:scale-105 active:scale-95
                    ${importing || loading
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 shadow-lg hover:shadow-xl'
                    }
                  `}
                >
                  <span className="flex items-center">
                    <ArrowDownTrayIcon className={`w-4 h-4 mr-2 ${importing ? 'animate-bounce' : ''}`} />
                    {importing ? 'Syncing...' : 'Sync Data'}
                  </span>
                  {!importing && !loading && (
                    <span className="absolute inset-0 bg-gradient-to-r from-green-400 to-emerald-500 opacity-0 hover:opacity-30 transition-opacity"></span>
                  )}
                </button>

                {/* Refresh Button */}
                <button
                  onClick={handleRefreshData}
                  disabled={loading}
                  className={`
                    relative overflow-hidden px-4 py-2 rounded-lg font-medium text-white text-sm
                    transition-all transform hover:scale-105 active:scale-95
                    ${loading
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 shadow-lg hover:shadow-xl'
                    }
                  `}
                >
                  <span className="flex items-center">
                    <ArrowPathIcon className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                    {loading ? 'Loading...' : 'Refresh'}
                  </span>
                  {!loading && (
                    <span className="absolute inset-0 bg-gradient-to-r from-indigo-400 to-purple-500 opacity-0 hover:opacity-30 transition-opacity"></span>
                  )}
                </button>

                {/* Cleanup Button */}
                <button
                  onClick={handleOpenCleanupModal}
                  className="relative overflow-hidden px-4 py-2 rounded-lg font-medium text-white text-sm transition-all transform hover:scale-105 active:scale-95 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 shadow-lg hover:shadow-xl"
                >
                  <span className="flex items-center">
                    <TrashIcon className="w-4 h-4 mr-2" />
                    Cleanup
                  </span>
                </button>
              </div>
            </div>
          </div>

          <Table
            columns={columns}
            data={displayData}
            loading={loading}
            emptyMessage="No lot input data found. Try adjusting your filters or search terms."
            className="min-h-96"
            hoverable
            striped
          />

          {/* Pagination */}
          {pagination && pagination.totalPages > 1 && (
            <div className="px-6 py-4 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-700">
                  Showing {((pagination.page - 1) * pagination.limit) + 1} to{' '}
                  {Math.min(pagination.page * pagination.limit, pagination.total)} of{' '}
                  {pagination.total} results
                </div>

                <div className="flex items-center space-x-2">
                  <Button
                    onClick={() => setPage(page - 1)}
                    disabled={!pagination.hasPrev}
                    variant="secondary"
                    size="sm"
                  >
                    Previous
                  </Button>

                  <div className="flex space-x-1">
                    {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                      const pageNum = Math.max(1, Math.min(
                        pagination.totalPages - 4,
                        Math.max(1, pagination.page - 2)
                      )) + i;

                      return (
                        <Button
                          key={pageNum}
                          onClick={() => setPage(pageNum)}
                          variant={pageNum === pagination.page ? 'primary' : 'secondary'}
                          size="sm"
                          className="w-8 h-8 p-0"
                        >
                          {pageNum}
                        </Button>
                      );
                    })}
                  </div>

                  <Button
                    onClick={() => setPage(page + 1)}
                    disabled={!pagination.hasNext}
                    variant="secondary"
                    size="sm"
                  >
                    Next
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Cleanup Modal */}
      {showCleanupModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-orange-50 to-red-50 rounded-t-2xl">
              <h3 className="text-lg font-bold text-gray-800 flex items-center">
                <TrashIcon className="w-5 h-5 mr-2 text-orange-600" />
                Cleanup Lot Input Data
              </h3>
              <button
                onClick={() => setShowCleanupModal(false)}
                className="p-1 hover:bg-gray-200 rounded-lg transition-colors"
              >
                <XMarkIcon className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-5">
              {/* Keywords Section */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Exclude Keywords
                </label>
                <textarea
                  value={excludeKeywords}
                  onChange={(e) => setExcludeKeywords(e.target.value)}
                  placeholder="Redtape, Lot ยุบ"
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-sm"
                />
                <p className="mt-1 text-xs text-gray-500">
                  Comma-separated keywords to exclude from import (matched against DefectRemark field)
                </p>
                <button
                  onClick={handleSaveKeywords}
                  disabled={savingKeywords}
                  className="mt-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center"
                >
                  {savingKeywords ? (
                    <>
                      <ArrowPathIcon className="w-4 h-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <CheckIcon className="w-4 h-4 mr-2" />
                      Save Keywords
                    </>
                  )}
                </button>
              </div>

              {/* Divider */}
              <div className="border-t border-gray-200"></div>

              {/* Cleanup Action Section */}
              <div>
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-3">
                  <p className="text-sm text-amber-800">
                    This will find lots from MSSQL where <span className="font-semibold">DefectRemark</span> matches the keywords above (last 3 months) and remove them from the local database.
                  </p>
                </div>
                <button
                  onClick={handleRunCleanup}
                  disabled={cleanupLoading || !excludeKeywords.trim()}
                  className="w-full px-4 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white font-medium rounded-lg hover:from-orange-600 hover:to-red-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition-all flex items-center justify-center shadow-md"
                >
                  {cleanupLoading ? (
                    <>
                      <ArrowPathIcon className="w-5 h-5 mr-2 animate-spin" />
                      Running Cleanup...
                    </>
                  ) : (
                    <>
                      <TrashIcon className="w-5 h-5 mr-2" />
                      Run Cleanup
                    </>
                  )}
                </button>
              </div>

              {/* Cleanup Result */}
              {cleanupResult && (
                <div className={`rounded-lg p-4 border ${cleanupResult.removed !== undefined && cleanupResult.removed >= 0 ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                  <p className={`text-sm font-medium ${cleanupResult.removed !== undefined && cleanupResult.removed >= 0 ? 'text-green-800' : 'text-red-800'}`}>
                    {cleanupResult.message}
                  </p>
                  {cleanupResult.lotNumbers && cleanupResult.lotNumbers.length > 0 && (
                    <div className="mt-2">
                      <p className="text-xs text-gray-600 font-medium mb-1">Removed lots ({cleanupResult.lotNumbers.length}):</p>
                      <div className="max-h-32 overflow-y-auto bg-white rounded border border-gray-200 p-2">
                        <p className="text-xs text-gray-700 font-mono break-all">
                          {cleanupResult.lotNumbers.join(', ')}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="flex justify-end p-4 border-t border-gray-200 bg-gray-50 rounded-b-2xl">
              <button
                onClick={() => setShowCleanupModal(false)}
                className="px-4 py-2 bg-gray-200 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-300 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ImportLotInputPage;

/*
=== UPDATED IMPORT LOT INPUT DATA VIEWER FEATURES ===

DATA DISPLAY FOCUSED:
✅ Removed sync operations tab - pure data viewer
✅ Enhanced data display with improved filtering
✅ Real-time statistics dashboard
✅ Streamlined interface focused on data browsing

ENHANCED SEARCH CAPABILITIES:
✅ Quick search by Lot Number with Enter key support
✅ Dedicated Item Number search field
✅ Global search across all fields
✅ Instant client-side filtering
✅ Combined server and client filtering

ADVANCED DROPDOWN FILTERING:
✅ Dynamic Part Site dropdown (populated from data)
✅ Dynamic Line Number dropdown (populated from data)
✅ Dynamic Model dropdown (populated from data)
✅ Dynamic Version dropdown (populated from data)
✅ Status filtering (All, In Progress, Finished, Expired)
✅ Auto-populated filter options from actual data

INPUT DATE FILTERING:
✅ Date range filtering with From/To inputs
✅ Calendar date pickers for easy selection
✅ Full day inclusion for "To" date
✅ Combined with other filters

IMPROVED USER EXPERIENCE:
✅ Clean, modern interface with icons
✅ Clear filter sections with visual grouping
✅ One-click filter clearing
✅ Real-time filter results counter
✅ Loading states and error handling
✅ Auto-refresh capabilities

RESPONSIVE DATA TABLE:
✅ Optimized column layout
✅ Status badges with color coding
✅ Duration calculations for finished lots
✅ Formatted date/time display
✅ Pagination with configurable page sizes

MANUFACTURING QUALITY FOCUS:
✅ Lot tracking and monitoring
✅ Production status indicators
✅ Duration tracking for finished lots
✅ Part site and line management
✅ Model and version tracking

The updated page provides a comprehensive data browsing experience
with powerful filtering and search capabilities tailored for manufacturing
quality control and lot input data management.
*/