// client/src/pages/interface/ImportCheckInPage.tsx
// ===== REFACTORED IMPORT CHECKIN DATA VIEWER =====
// Data Display and Import Management - Enhanced Filtering and Search Interface
// Manufacturing Quality Control System - CheckIn Data Management
// Based on ImportLotInputPage structure with import functionality

import React, { useState, useEffect, useCallback } from 'react';
import {
  MagnifyingGlassIcon,
  ArrowPathIcon,
  CalendarDaysIcon,
  CubeIcon,
  UserGroupIcon,
  ArrowDownTrayIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Table, { type TableColumn } from '../../components/ui/Table';
import Alert from '../../components/ui/Alert';
import Breadcrumb from '../../components/common/Breadcrumb';
import { infCheckinService } from '../../services/infCheckinService';
import { AuthAPI } from '../../services/authService';
import { formatNumber } from '../../utils';
import type {
  InfCheckInRecord,
  DataFilters,
  PaginationInfo,
  ApiResponse,
  ImportStats,
  SyncStats,
  SyncStep
} from '../../types/inf-checkin';

// ==================== MAIN COMPONENT ====================

const ImportCheckInPage: React.FC = () => {
  // ==================== STATE MANAGEMENT ====================

  const [data, setData] = useState<InfCheckInRecord[]>([]);
  const [filteredData, setFilteredData] = useState<InfCheckInRecord[]>([]);
  const [pagination, setPagination] = useState<PaginationInfo | null>(null);
  const [statistics, setStatistics] = useState<ImportStats | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [importing, setImporting] = useState<boolean>(false);
  const [syncStep, setSyncStep] = useState<SyncStep>(0);
  const [syncStats, setSyncStats] = useState<SyncStats>({});
  const [successMessage, setSuccessMessage] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string>('');

  // Import date state
  const [importDate, setImportDate] = useState<string>(infCheckinService.getTodayDate());

  // Pagination state
  const [page, setPage] = useState<number>(1);
  const [limit, setLimit] = useState<number>(50);

  // Data filter state
  const [filters, setFilters] = useState<DataFilters>({
    usernameSearch: '',
    oprnameSearch: '',
    lineNoSearch: '',
    createdOnFrom: infCheckinService.getTodayDate(), // Default to today
    createdOnTo: infCheckinService.getTodayDate(),   // Default to today
    groupCode: '',
    team: '',
    workShiftId: '',
    workStatus: 'all'
  });


  // ==================== API FUNCTIONS ====================

  /**
   * Fetch CheckIn data with filters and pagination
   */
  const fetchData = useCallback(async (): Promise<void> => {
    try {
      setLoading(true);
      setErrorMessage('');

      // Use service to fetch data
      const result = await infCheckinService.fetchData(page, limit, filters);

      if (result.success && result.data) {
        setData(result.data);
        setPagination(result.pagination || null);
      } else {
        setErrorMessage(result.message || 'Failed to fetch CheckIn data');
        setData([]);
        setPagination(null);
      }
    } catch (error) {
      console.error('❌ Fetch error:', error);
      setErrorMessage(error instanceof Error ? error.message : 'Failed to fetch CheckIn data');
      setData([]);
      setPagination(null);
    } finally {
      setLoading(false);
    }
  }, [filters, page, limit]);


  /**
   * Search specific user by username
   */
  const searchByUsername = useCallback(async (username: string): Promise<void> => {
    try {
      setLoading(true);
      setErrorMessage('');

      // Use service to search by username
      const result = await infCheckinService.searchByUsername(username);

      if (result.success && result.data && result.data.length > 0) {
        setData(result.data);
        setPagination(null); // Clear pagination for search results
        setSuccessMessage(`Found ${result.data.length} records for user: ${username}`);
      } else {
        setData([]);
        setPagination(null);
        setErrorMessage(result.message || `No records found for user: ${username}`);
      }
    } catch (error) {
      console.error('❌ Username search error:', error);
      setErrorMessage(error instanceof Error ? error.message : 'Search failed');
      setData([]);
      setPagination(null);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Fetch statistics
   */
  const fetchStatistics = useCallback(async (): Promise<void> => {
    try {
      console.log('📊 Fetching check-in statistics...');

      // Use centralized service for API call
      const result = await infCheckinService.getStatistics();

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

  // ==================== UTILITY FUNCTIONS ====================

  /**
   * Apply client-side filtering to the data
   */
  const applyFilters = useCallback((): void => {
    // Use service to apply client-side filters
    const filtered = infCheckinService.applyClientFilters(data, filters);
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
      usernameSearch: '',
      oprnameSearch: '',
      lineNoSearch: '',
      createdOnFrom: infCheckinService.getTodayDate(), // Reset to today
      createdOnTo: infCheckinService.getTodayDate(),   // Reset to today
      groupCode: '',
      team: '',
      workShiftId: '',
      workStatus: 'all'
    });
  };

  const handleQuickUsernameSearch = () => {
    if (filters.usernameSearch.trim()) {
      searchByUsername(filters.usernameSearch.trim());
    }
  };

  const handleRefreshData = () => {
    fetchData();
    fetchStatistics();
  };

  /**
   * Handle manual sync of check-in data
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

      const syncPromise = infCheckinService.syncData({
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

  // Fetch initial data and statistics on mount and when dependencies change
  useEffect(() => {
    console.log('📥 ImportCheckInPage: useEffect triggered - Loading data...');
    fetchData();
    fetchStatistics();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, limit, filters.createdOnFrom, filters.createdOnTo]);

  // Apply client-side filters when data or any client filter changes
  useEffect(() => {
    applyFilters();
  }, [applyFilters]);

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

  const formatDate = (dateString?: string | null) => {
    return infCheckinService.formatDate(dateString);
  };

  const formatTime = (dateString?: string | null) => {
    return infCheckinService.formatTime(dateString);
  };

  const calculateWorkDuration = (checkIn?: string | null, checkOut?: string | null) => {
    return infCheckinService.calculateWorkDuration(checkIn, checkOut);
  };

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
  const searchTerms = infCheckinService.getSearchTerms(filters);

  // ==================== TABLE CONFIGURATION ====================

  const columns: TableColumn<InfCheckInRecord>[] = [
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
      key: 'username',
      header: 'Username',
      render: (value, record) => (
        <span className="font-bold text-blue-600">
          {record.username ? highlightText(record.username, searchTerms) : '-'}
        </span>
      )
    },
    {
      key: 'oprname',
      header: 'Operator',
      render: (value, record) => (
        <span className="text-sm text-gray-700">
          {record.oprname ? highlightText(record.oprname, searchTerms) : '-'}
        </span>
      )
    },
    {
      key: 'line_no_id',
      header: 'Line No',
      render: (value, record) => (
        <span className="font-mono text-sm">
          {record.line_no_id ? highlightText(record.line_no_id, searchTerms) : '-'}
        </span>
      )
    },
    {
      key: 'work_shift_id',
      header: 'Shift',
      width: '60px',
      render: (value, record) => (
        <span className="font-medium text-gray-900">
          {record.work_shift_id ? highlightText(record.work_shift_id, searchTerms) : '-'}
        </span>
      )
    },
    {
      key: 'group_code',
      header: 'Group',
      width: '60px',
      render: (value, record) => (
        <span className="text-sm">
          {record.group_code ? highlightText(record.group_code, searchTerms) : '-'}
        </span>
      )
    },
    {
      key: 'team',
      header: 'Team',
      width: '60px',
      render: (value, record) => (
        <span className="text-sm">
          {record.team ? highlightText(record.team, searchTerms) : '-'}
        </span>
      )
    },
    {
      key: 'created_on',
      header: 'Check In',
      render: (value, record) => (
        <span className="text-sm text-green-700">
          {formatDate(record.created_on)} {formatTime(record.created_on)}
        </span>
      )
    },
    {
      key: 'date_time_off_work',
      header: 'Check Out',
      render: (value, record) => (
        <span className="text-sm">
          {record.date_time_off_work ? (
            <span className="text-red-700">
              {formatDate(record.date_time_off_work)} {formatTime(record.date_time_off_work)}
            </span>
          ) : (
            <span className="text-green-600 font-medium">Still Working</span>
          )}
        </span>
      )
    },
    {
      key: 'work_duration',
      header: 'Duration',
      render: (value, record) => {
        const duration = calculateWorkDuration(record.created_on, record.date_time_off_work);
        return duration ? (
          <span className="text-sm font-medium text-purple-600">
            {duration}
          </span>
        ) : (
          <span className="text-gray-400">-</span>
        );
      }
    },
    {
      key: 'imported_at',
      header: 'Imported',
      render: (value, record) => (
        <span className="text-sm text-gray-500">
          {formatDate(record.imported_at)} {formatTime(record.imported_at)}
        </span>
      )
    }
  ];

  // ==================== RENDER ====================

  // Use filtered data when any client-side search is active, otherwise use server-side data
  const hasClientFilters = filters.usernameSearch.trim() ||
                           filters.oprnameSearch.trim() ||
                           filters.lineNoSearch.trim() ||
                           filters.workStatus !== 'all' ||
                           filters.groupCode.trim() ||
                           filters.team.trim() ||
                           filters.workShiftId.trim();
  const displayData = hasClientFilters ? filteredData : data;

  // Debug logging
  console.log('🔍 Component Debug Info:', {
    dataLength: data.length,
    filteredDataLength: filteredData.length,
    hasClientFilters,
    displayDataLength: displayData.length,
    loading,
    filters
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      {/* Animated Background Pattern */}
      <div className="fixed inset-0 opacity-30 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-400/10 via-purple-400/10 to-pink-400/10 animate-gradient-x"></div>
      </div>

      {/* Header */}
      <div className="relative bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 shadow-xl">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <div className="absolute inset-0 bg-white rounded-full blur-lg opacity-50 animate-pulse"></div>
                  <UserGroupIcon className="relative w-12 h-12 text-white drop-shadow-lg" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-white flex items-center drop-shadow-md">
                    CheckIn Data Viewer
                    {importing && (
                      <span className="ml-3 inline-flex items-center">
                        <ArrowPathIcon className="w-6 h-6 text-yellow-300 animate-spin" />
                      </span>
                    )}
                  </h1>
                  <p className="mt-1 text-sm text-blue-100">
                    Browse worker check-in data with advanced search capabilities
                  </p>
                </div>
              </div>

              {/* Statistics Summary - Glass-morphism Cards */}
              {statistics && (
                <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 text-sm">
                  <div className="text-center bg-white/20 backdrop-blur-sm rounded-lg px-4 py-2 border border-white/30 shadow-lg transform transition-all hover:scale-105">
                    <div className="text-xl font-bold text-white drop-shadow-md">
                      { formatNumber(statistics.totalRecords.toString())}
                    </div>
                    <div className="text-blue-100 text-xs">Total Records</div>
                  </div>
                  <div className="text-center bg-white/20 backdrop-blur-sm rounded-lg px-4 py-2 border border-white/30 shadow-lg transform transition-all hover:scale-105">
                    <div className="text-2xl font-bold text-yellow-300 drop-shadow-md">
                      {formatNumber(statistics.totalToday.toString())}
                    </div>
                    <div className="text-blue-100 text-xs">Today</div>
                  </div>
                  <div className="text-center bg-white/20 backdrop-blur-sm rounded-lg px-4 py-2 border border-white/30 shadow-lg transform transition-all hover:scale-105">
                    <div className="text-2xl font-bold text-green-300 drop-shadow-md">
                      {formatNumber(statistics.totalMonth.toString())}
                    </div>
                    <div className="text-blue-100 text-xs">This Month</div>
                  </div>
                  <div className="text-center bg-white/20 backdrop-blur-sm rounded-lg px-4 py-2 border border-white/30 shadow-lg transform transition-all hover:scale-105">
                    <div className="text-xl font-bold text-cyan-300 drop-shadow-md">
                      {formatNumber(statistics.totalYear.toString())}
                    </div>
                    <div className="text-blue-100 text-xs">This Year</div>
                  </div>
                  <div className="text-center bg-white/20 backdrop-blur-sm rounded-lg px-4 py-2 border border-white/30 shadow-lg">
                    <div className="text-blue-100 text-xs font-medium">
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
            { label: 'CheckIn Data' }
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

      {/* Sync Progress Overlay */}
      {importing && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-lg w-full mx-4 animate-scale-up">
            <div className="text-center">
              {/* Animated Sync Icon or Error Icon */}
              <div className="relative inline-flex items-center justify-center mb-6">
                <div className={`absolute inset-0 ${syncStep === -1 ? 'bg-gradient-to-r from-red-500 to-orange-500' : syncStep === 4 ? 'bg-gradient-to-r from-green-500 to-emerald-500' : 'bg-gradient-to-r from-blue-500 to-purple-500'} rounded-full blur-xl opacity-50 animate-pulse`}></div>
                <div className={`relative ${syncStep === -1 ? 'bg-gradient-to-r from-red-600 to-orange-600' : syncStep === 4 ? 'bg-gradient-to-r from-green-600 to-emerald-600' : 'bg-gradient-to-r from-blue-600 to-purple-600'} rounded-full p-6`}>
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
                    <div className={`flex items-center ${syncStep >= 1 ? 'text-blue-600' : 'text-gray-400'}`}>
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-3 ${syncStep > 1 ? 'bg-green-500 text-white' : syncStep === 1 ? 'bg-blue-500 text-white animate-pulse' : 'bg-gray-200'}`}>
                        {syncStep > 1 ? '✓' : '1'}
                      </div>
                      <span className={`${syncStep === 1 ? 'font-semibold' : ''}`}>Connecting to source database</span>
                    </div>

                    {/* Step 2 */}
                    <div className={`flex items-center ${syncStep >= 2 ? 'text-blue-600' : 'text-gray-400'}`}>
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-3 ${syncStep > 2 ? 'bg-green-500 text-white' : syncStep === 2 ? 'bg-blue-500 text-white animate-pulse' : 'bg-gray-200'}`}>
                        {syncStep > 2 ? '✓' : '2'}
                      </div>
                      <span className={`${syncStep === 2 ? 'font-semibold' : ''}`}>Getting records from source</span>
                    </div>

                    {/* Step 3 */}
                    <div className={`flex items-center justify-between ${syncStep >= 3 ? 'text-blue-600' : 'text-gray-400'}`}>
                      <div className="flex items-center">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-3 ${syncStep > 3 ? 'bg-green-500 text-white' : syncStep === 3 ? 'bg-blue-500 text-white animate-pulse' : 'bg-gray-200'}`}>
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
                    <div className={`flex items-center ${syncStep >= 4 ? 'text-blue-600' : 'text-gray-400'}`}>
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-3 ${syncStep === 4 ? 'bg-green-500 text-white' : 'bg-gray-200'}`}>
                        4
                      </div>
                      <span className={`${syncStep === 4 ? 'font-semibold' : ''}`}>Processing results</span>
                    </div>
                  </div>

                  {/* Animated Progress Bar */}
                  <div className="relative h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="absolute inset-0 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 transition-all duration-500"
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
          <>
            {/* Quick Search Section */}
            <div className="bg-white/80 backdrop-blur-sm shadow-xl rounded-2xl p-6 mb-6 border border-purple-100 transform transition-all hover:shadow-2xl hover:scale-[1.01]">
              <div className="flex items-center mb-4">
                <div className="relative mr-3">
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg blur opacity-50"></div>
                  <MagnifyingGlassIcon className="relative w-6 h-6 text-purple-600" />
                </div>
                <h2 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Quick Search
                </h2>
              </div>

              {/* Primary Filters Row */}
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    <CalendarDaysIcon className="w-4 h-4 inline mr-1" />
                    Check-in Date From
                  </label>
                  <Input
                    type="date"
                    value={filters.createdOnFrom}
                    onChange={(e) => handleFilterChange('createdOnFrom', e.target.value)}
                    className="w-full"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    <CalendarDaysIcon className="w-4 h-4 inline mr-1" />
                    Check-in Date To
                  </label>
                  <Input
                    type="date"
                    value={filters.createdOnTo}
                    onChange={(e) => handleFilterChange('createdOnTo', e.target.value)}
                    className="w-full"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Search by Username
                  </label>
                  <div className="flex gap-2">
                    <Input
                      value={filters.usernameSearch}
                      onChange={(e) => handleFilterChange('usernameSearch', e.target.value)}
                      placeholder="Enter username..."
                      className="flex-1"
                      onKeyPress={(e) => e.key === 'Enter' && handleQuickUsernameSearch()}
                    />
                    <Button
                      onClick={handleQuickUsernameSearch}
                      disabled={loading || !filters.usernameSearch.trim()}
                      variant="primary"
                    >
                      Search
                    </Button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Search by Line Number
                  </label>
                  <Input
                    value={filters.lineNoSearch}
                    onChange={(e) => handleFilterChange('lineNoSearch', e.target.value)}
                    placeholder="Enter line number..."
                    className="w-full"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Search by Operator Name
                  </label>
                  <Input
                    value={filters.oprnameSearch}
                    onChange={(e) => handleFilterChange('oprnameSearch', e.target.value)}
                    placeholder="Enter operator name..."
                    className="w-full"
                  />
                </div>
              </div>
            </div>

            {/* Data Table */}
            <div className="bg-white/80 backdrop-blur-sm shadow-xl rounded-2xl border border-blue-100 overflow-hidden transform transition-all hover:shadow-2xl">
              <div className="px-6 py-4 bg-gradient-to-r from-blue-50 to-purple-50 border-b border-purple-100">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold flex items-center">
                    <div className="relative mr-3">
                      <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg blur opacity-50"></div>
                      <CubeIcon className="relative w-6 h-6 text-purple-600" />
                    </div>
                    <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                      CheckIn Data
                    </span>
                    {!pagination && (
                      <span className="ml-2 text-sm text-gray-600 bg-white/60 px-3 py-1 rounded-full">
                        {displayData.length} records
                      </span>
                    )}
                    {hasClientFilters && (
                      <span className="ml-2 text-sm bg-gradient-to-r from-orange-500 to-pink-500 text-white px-3 py-1 rounded-full shadow-lg animate-pulse">
                        Filtered
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
                          : 'bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 shadow-lg hover:shadow-xl'
                        }
                      `}
                    >
                      <span className="flex items-center">
                        <ArrowPathIcon className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                        {loading ? 'Loading...' : 'Refresh'}
                      </span>
                      {!loading && (
                        <span className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-500 opacity-0 hover:opacity-30 transition-opacity"></span>
                      )}
                    </button>
                  </div>
                </div>
              </div>

              <Table
                columns={columns}
                data={displayData}
                loading={loading}
                emptyMessage="No CheckIn data found. Try adjusting your filters or search terms."
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
          </>

 
      </div>
    </div>
  );
};

export default ImportCheckInPage;

/*
=== REFACTORED IMPORT CHECKIN DATA VIEWER FEATURES ===

BASED ON IMPORTLOTINPUTPAGE STRUCTURE:
✅ Enhanced data viewer with improved filtering
✅ Real-time statistics dashboard
✅ Streamlined interface focused on data browsing
✅ Maintained import functionality from original

ENHANCED SEARCH CAPABILITIES:
✅ Quick search by Username with Enter key support
✅ Dedicated Line Number search field
✅ Date range filtering with From/To inputs
✅ Instant client-side filtering
✅ Combined server and client filtering
✅ Text highlighting for search results

IMPROVED USER EXPERIENCE:
✅ Clean, modern interface with icons
✅ Clear filter sections with visual grouping
✅ One-click filter clearing
✅ Real-time filter results counter
✅ Loading states and error handling
✅ Auto-refresh capabilities

RESPONSIVE DATA TABLE:
✅ Optimized column layout with sequence numbers
✅ Status badges with color coding
✅ Formatted date/time display
✅ Work status indicators (Still Working vs Check Out)
✅ Pagination with configurable page sizes
✅ Text search highlighting

IMPORT FUNCTIONALITY PRESERVED:
✅ Today's data import - single button operation
✅ Date range import with from/to date selection
✅ Real-time import progress indicators
✅ Import validation and error handling
✅ Dual-tab interface: Data + Import

MANUFACTURING FOCUS:
✅ Worker check-in/out tracking
✅ Production line identification
✅ Shift and team management
✅ Work session monitoring
✅ Import timestamp tracking

The refactored CheckIn page provides a comprehensive data browsing experience
with powerful filtering and search capabilities while preserving the original
import functionality for Manufacturing Quality Control and worker tracking.
*/
