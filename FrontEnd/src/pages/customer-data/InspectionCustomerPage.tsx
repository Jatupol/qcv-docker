// client/src/pages/customer-data/InspectionCustomerPage.tsx
// OQA Station Customer Inspection Page
// Complete Separation Entity Architecture - Quality Control System

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ChevronLeftIcon, CheckCircleIcon, XCircleIcon, DocumentTextIcon, PhotoIcon, PrinterIcon, ArrowDownTrayIcon, FunnelIcon, CalendarIcon, UserIcon, PencilIcon, TrashIcon, ExclamationTriangleIcon, ChevronRightIcon, ChevronLeftIcon as ChevronLeftIconSolid, ClipboardDocumentCheckIcon, HomeIcon } from '@heroicons/react/24/outline';
import { inspectionDataService } from '../../services/inspectionDataService';
import { inspectionCustomerService } from '../../services/inspectionCustomerService';
import { formatNumber, toLocalDate } from '../../utils';
import { formatDate, formatDateForInput, getTodayDateString } from '../../utils/formatUtils';
import { useSound } from '../../hooks/useSoundNotification';
import { useNotificationHelpers } from '../../components/common/NotificationSystem';
import { exportToExcel, type ExcelColumn, ExcelFormatters } from '../../utils/excelUtils';
import RecordDetailModal from '../../components/inspection/RecordDetailModal';
import LotInfoModal from '../../components/inspection/lot-selection/LotInfoModal';
import type { LotData } from '../../types/inf-lotinput';
import type { InspectionRecord } from '../../types/inspectiondata';
import type { FilterOptions, SIVCreationResult } from '../../types/inspection-station';
import { STATION_CONFIGS } from '../../types/inspection-station';
// ==================== MAIN COMPONENT ====================

const InspectionCustomerPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Use OQA configuration (this page is OQA Station only)
  const config = STATION_CONFIGS.OQA_CUSTOMER;
  const theme = config.theme;

  // Helper function to get date 7 days ago in YYYY-MM-DD format (local timezone)
  const getSevenDaysAgoDate = () => {
    const date = new Date();
    date.setDate(date.getDate() - 7);
    return formatDateForInput(date);
  };

  const [records, setRecords] = useState<InspectionRecord[]>([]);
  const [filteredRecords, setFilteredRecords] = useState<InspectionRecord[]>([]);
  const [filters, setFilters] = useState<FilterOptions>({
    dateStart: getSevenDaysAgoDate(),
    dateEnd: getTodayDateString(),
    judgment: 'all',
    lotno: '',
    model: 'All'
  });
  const [selectedRecord, setSelectedRecord] = useState<InspectionRecord | null>(null);
  const [showFilters, setShowFilters] = useState(true);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [recordToDelete, setRecordToDelete] = useState<InspectionRecord | null>(null);

  // Debounced lot number for filtering (to avoid excessive re-renders during typing)
  const [debouncedLotNo, setDebouncedLotNo] = useState('');

  // SIV Creation Modal states
  const [showSIVConfirmModal, setShowSIVConfirmModal] = useState(false);
  const [showSIVResultModal, setShowSIVResultModal] = useState(false);
  const [sivCreationRecord, setSivCreationRecord] = useState<InspectionRecord | null>(null);
  const [sivCreationResult, setSivCreationResult] = useState<SIVCreationResult | null>(null);
  const [creatingSIV, setCreatingSIV] = useState(false);

  // Lot Info Modal states
  const [showLotInfoModal, setShowLotInfoModal] = useState(false);
  const [selectedLot, setSelectedLot] = useState<LotData | null>(null);
  const [loadingLot, setLoadingLot] = useState(false);

  // Sound notifications and UI helpers
  const sound = useSound();
  const { showSuccess, showError, showWarning, showInfo } = useNotificationHelpers();

  // Fetch inspection data from API
  useEffect(() => {
    loadInspectionData();
  }, [config.code]);

  const loadInspectionData = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log(`🔄 Fetching ${config.code} inspection data...`);
      // Fetch ALL records by setting a high limit to ensure we get all data for client-side filtering
      // TODO: In future, implement server-side date filtering by passing filters.dateStart and filters.dateEnd
      // to the API for better performance with large datasets
      const result = await inspectionDataService.getAllCustomerData({
        station: config.code,
        page: 1,
        limit: 1000 // Fetch up to 1000 records to ensure we get all data for client-side filtering
      });

      console.log('📋 API Response:', result);

      if (result.success && result.data) {
        const allData = result.data.data || [];
        console.log('📊 All inspection data:', allData);

        const stationData = allData.filter((item: any) => item.station === config.code);
        console.log(`📊 Filtered ${config.code} records:`, stationData.length);
        console.log('📊 Sample record from API:', stationData[0]);

        const transformedRecords: InspectionRecord[] = stationData.map((item: any) => ({
          id: item.id.toString(), // Use numeric database ID
          timestamp: toLocalDate(item.inspection_date).toISOString(),
          inspectionDate: toLocalDate(item.inspection_date),
          inspector: `QC${item.qc_id}`,
          model: `${item.model} ${item.version}`,
          samplingRound: item.round,
          fviLotQty: item.fvi_lot_qty || 0,
          generalSamplingQty: item.general_sampling_qty || 0,
          crackSamplingQty: item.crack_sampling_qty || 0,
          sampling_reason_id: item.sampling_reason_id || 0,
          sampling_reason_name: item.sampling_reason_name || '',
          sampling_reason_description: item.sampling_reason_description || '',
          judgment: item.judgment === null ? null : (item.judgment ? 'Pass' : 'Reject'),
          lotno: item.lotno,
          itemno: item.itemno,
          inspectionNo: item.inspection_no,
          inspectionNoRef: item.inspection_no_ref,
          ww: item.ww,
          mclineno: item.mclineno,
          shift: item.shift,
          // Additional database fields for detail modal
          station: item.station,
          fy: item.fy,
          month_year: item.month_year,
          partsite: item.partsite,
          version: item.version,
          fvilineno: item.fvilineno,
          qc_id: item.qc_id,
          ng_num: item.ng_num || 0,
          defect_num: item.defect_num || 0,
          created_at: item.created_at ? toLocalDate(item.created_at) : undefined,
          updated_at: item.updated_at ? toLocalDate(item.updated_at) : undefined,
          created_by: item.created_by,
          updated_by: item.updated_by,
          defects: item.defects || [] // Include defects array from API
        }));

        console.log('✅ Transformed records:', transformedRecords.length);
        console.log('✅ Sample transformed record:', transformedRecords[0]);
        console.log('✅ Defects in first record:', transformedRecords[0]?.defects);
        setRecords(transformedRecords);
        setFilteredRecords(transformedRecords);
      } else {
        console.error('❌ API returned unsuccessful response:', result);
        setError('Failed to load inspection data');
      }
    } catch (err) {
      console.error('❌ Error loading inspection data:', err);
      setError('Failed to load inspection data');
    } finally {
      setLoading(false);
    }
  };

  // Apply filters whenever filters change
  useEffect(() => {
    let filtered = [...records];

    // Filter by date range
    if (filters.dateStart || filters.dateEnd) {
      filtered = filtered.filter(record => {
        const recordDate = new Date(record.timestamp);
        recordDate.setHours(0, 0, 0, 0); // Reset time to start of day for comparison

        const startDate = filters.dateStart ? new Date(filters.dateStart) : null;
        const endDate = filters.dateEnd ? new Date(filters.dateEnd) : null;

        if (startDate) startDate.setHours(0, 0, 0, 0);
        if (endDate) endDate.setHours(23, 59, 59, 999); // End of day

        if (startDate && endDate) {
          return recordDate >= startDate && recordDate <= endDate;
        } else if (startDate) {
          return recordDate >= startDate;
        } else if (endDate) {
          return recordDate <= endDate;
        }
        return true;
      });
    }

    if (filters.judgment !== 'all') {
      filtered = filtered.filter(record =>
        record.judgment.toLowerCase() === filters.judgment
      );
    }

    // Live search for lot number - show all if blank, filter by partial match if not
    if (filters.lotno && filters.lotno.trim() !== '') {
      filtered = filtered.filter(record =>
        record.lotno.toLowerCase().includes(filters.lotno.toLowerCase().trim())
      );
    }

    if (filters.model !== 'All') {
      filtered = filtered.filter(record => record.model === filters.model);
    }

    setFilteredRecords(filtered);
  }, [filters, records]);

  const handleFilterChange = (key: keyof FilterOptions, value: string) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const getStatusColor = (judgment: string) => {
    return inspectionCustomerService.getStatusColor(judgment);
  };

  const getStatusIcon = (judgment: string) => {
    return judgment === 'Pass'
      ? <CheckCircleIcon className="h-5 w-5 text-green-600" />
      : <XCircleIcon className="h-5 w-5 text-red-600" />;
  };

  // Memoize statistics calculation to avoid re-computation on every render
  const stats = useMemo(() => {
    const total = filteredRecords.length;
    const passed = filteredRecords.filter(r => r.judgment === 'Pass').length;
    const rejected = filteredRecords.filter(r => r.judgment === 'Reject').length;
    const passRate = total > 0 ? ((passed / total) * 100).toFixed(1) : '0';

    return { total, passed, rejected, passRate };
  }, [filteredRecords]);

  // Memoize unique models for filter dropdown - only recalculate when records change
  const uniqueModels = useMemo(() => {
    return ['All', ...Array.from(new Set(records.map(r => r.model))).sort()];
  }, [records]);

  // Memoize highlight function to avoid regex creation on every render
  const highlightLotNumber = useCallback((lotno: string) => {
    const searchText = filters.lotno.trim();

    // If no search text, return normal text
    if (!searchText) {
      return <span>{lotno}</span>;
    }

    // Find the matching part (case-insensitive)
    const regex = new RegExp(`(${searchText})`, 'gi');
    const parts = lotno.split(regex);

    return (
      <span>
        {parts.map((part, index) =>
          regex.test(part) ? (
            <span key={index} className="bg-yellow-200 text-yellow-900 font-bold px-1 rounded">
              {part}
            </span>
          ) : (
            <span key={index}>{part}</span>
          )
        )}
      </span>
    );
  }, [filters.lotno]);

  const handleExport = () => {
    try {
      // Check if there are records to export
      if (filteredRecords.length === 0) {
        showWarning('No Data', 'No records to export. Please adjust your filters.');
        return;
      }

      // Define column configuration with proper formatting
      const columns: ExcelColumn[] = [
        { key: 'no', header: 'No.', width: 5 },
        { key: 'station', header: 'Station', width: 10 },
        { key: 'inspectionNo', header: 'Sampling No', width: 20 },
        { key: 'inspectionNoRef', header: 'Sampling No Ref', width: 20 },
        {
          key: 'inspectionDate',
          header: 'Sampling Date',
          width: 15,
          formatter: ExcelFormatters.date
        },
        { key: 'ww', header: 'WW', width: 8 },
        { key: 'shift', header: 'Shift', width: 8 },
        { key: 'lotno', header: 'Lot No', width: 15 },
        { key: 'mclineno', header: 'MC Line No', width: 12 },
        { key: 'itemno', header: 'Item No', width: 15 },
        { key: 'model', header: 'Model', width: 20 },
        { key: 'samplingRound', header: 'Round', width: 8 },
        { key: 'fviLotQty', header: 'FVI Lot Qty', width: 12 },
        { key: 'generalSamplingQty', header: 'General Sampling Qty', width: 18 },
        { key: 'crackSamplingQty', header: 'Crack Sampling Qty', width: 18 },
        { key: 'judgment', header: 'Judgment', width: 10 },
        { key: 'inspector', header: 'Inspector', width: 12 }
      ];

      // Prepare data with proper structure for export
      const exportData = filteredRecords.map((record, index) => ({
        no: index + 1,
        station: config.code,
        inspectionNo: record.inspectionNo,
        inspectionNoRef: record.inspectionNoRef || '',
        inspectionDate: record.inspectionDate,
        ww: record.ww,
        shift: record.shift,
        lotno: record.lotno,
        mclineno: record.mclineno,
        itemno: record.itemno,
        model: record.model,
        samplingRound: record.samplingRound,
        fviLotQty: record.fviLotQty,
        generalSamplingQty: record.generalSamplingQty,
        crackSamplingQty: record.crackSamplingQty,
        judgment: record.judgment,
        inspector: record.inspector
      }));

      // Generate filename with timestamp
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
      const filename = `${config.code}_Inspection_Records_${timestamp}`;

      // Use the exportToExcel utility function
      exportToExcel(exportData, {
        filename,
        sheetName: `${config.code} Inspections`,
        columns,
        autoWidth: true
      });

      // Show success notification
      sound.playSuccess();
      showSuccess('Export Successful', `${filteredRecords.length} records exported to ${filename}.xlsx`);

      console.log(`✅ Exported ${filteredRecords.length} records to ${filename}.xlsx`);
    } catch (error) {
      console.error('❌ Export error:', error);
      sound.playError();
      showError('Export Failed', error instanceof Error ? error.message : 'Failed to export records');
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleBackToStation = () => {
    navigate(config.pageRoute);
  };

  const handleGoHome = () => {
    navigate('/');
  };

  const handleEdit = (record: InspectionRecord) => {
    console.log('Edit record:', record);
    // Navigate to the station's page with the inspection data for editing
    navigate(config.pageRoute, {
      state: {
        editMode: true,
        inspectionId: record.id,
        inspectionData: {
          inspection_no: record.inspectionNo,
          inspection_date: record.inspectionDate,
          shift: record.shift,
          lotno: record.lotno,
          itemno: record.itemno,
          model: record.model,
          fviLotQty: record.fviLotQty,
          generalSamplingQty: record.generalSamplingQty,
          crackSamplingQty: record.crackSamplingQty,
          judgment: record.judgment,
          round: record.samplingRound
        }
      }
    });
  };

  const handleDelete = (record: InspectionRecord) => {
    setRecordToDelete(record);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    if (!recordToDelete) return;

    try {
      console.log('Deleting record:', recordToDelete.id);
      const numericId = parseInt(recordToDelete.id.replace(/\D/g, ''));

      const result = await inspectionDataService.delete(numericId);

      if (result.success) {
        await loadInspectionData();
        setShowDeleteConfirm(false);
        setRecordToDelete(null);
        sound.playDelete();
        showSuccess('Deleted Successfully', `Inspection record ${recordToDelete.inspectionNo} has been deleted.`);
      } else {
        sound.playError();
        showError('Delete Failed', result.message || 'Failed to delete inspection record. Please try again.');
      }
    } catch (err) {
      console.error('Error deleting record:', err);
      sound.playError();
      showError('Delete Error', err instanceof Error ? err.message : 'An error occurred while deleting the inspection record.');
    }
  };

  const handleInputDefect = (record: InspectionRecord) => {
    console.log('Input defect for record:', record);
    navigate('/customer-data/defect/new', {
      state: {
        inspectionData: {
          inspection_no: record.inspectionNo,
          lotno: record.lotno,
          itemno: record.itemno,
          model: record.model,
          shift: record.shift,
          inspection_date: record.inspectionDate,
          fvi_lot_qty: record.fviLotQty,
          general_sampling_qty: record.generalSamplingQty,
          crack_sampling_qty: record.crackSamplingQty,
          judgment: record.judgment,
          round: record.samplingRound,
          fvilineno: record.fvilineno || '',
          station: config.code // Add station code (OQA)
        }
      }
    });
  };

  const handleGenerateFVI = async (record: InspectionRecord) => {
    try {
      // BUSINESS LOGIC: Only OQA station with Pass judgment can create SIV
      if (!inspectionCustomerService.canCreateSIV(record)) {
        sound.playWarning();
        showWarning('Invalid Judgment', 'SIV inspection can only be created from OQA inspections with Pass judgment.');
        return;
      }

      console.log('🔧 Generating SIV from OQA inspection:', record.id);

      // Show confirmation modal
      setSivCreationRecord(record);
      setShowSIVConfirmModal(true);
    } catch (error) {
      console.error('❌ Error preparing SIV creation:', error);
      sound.playError();
      showError('Error', error instanceof Error ? error.message : 'Failed to prepare SIV creation');
    }
  };

  const handleConfirmSIVCreation = async () => {
    if (!sivCreationRecord) return;

    try {
      setCreatingSIV(true);

      // Use service to create SIV
      const result = await inspectionCustomerService.createSIVFromOQA(sivCreationRecord.id);

      if (result.success) {
        sound.playImportant();
        // Reload the inspection list
        loadInspectionData();
      } else {
        sound.playError();
      }

      setSivCreationResult(result);
    } catch (error) {
      console.error('❌ Error creating SIV:', error);
      sound.playError();
      setSivCreationResult({
        success: false,
        message: error instanceof Error ? error.message : 'Network error occurred'
      });
    } finally {
      setCreatingSIV(false);
      setShowSIVConfirmModal(false);
      setShowSIVResultModal(true);
    }
  };

  const handleCloseSIVResultModal = () => {
    setShowSIVResultModal(false);
    setSivCreationResult(null);
    setSivCreationRecord(null);
  };

  // Handle Lot Number Click - Fetch and display lot information
  const handleLotClick = async (lotno: string) => {
    try {
      setLoadingLot(true);

      // Use service to fetch lot details
      const lotData = await inspectionCustomerService.getLotDetails(lotno);

      if (lotData) {
        setSelectedLot(lotData);
        setShowLotInfoModal(true);
        sound.playSelect();
      } else {
        showWarning('Lot Not Found', `No lot information found for lot number: ${lotno}`);
      }
    } catch (error) {
      console.error('❌ Error fetching lot details:', error);
      showError('Error', `Failed to fetch lot details: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoadingLot(false);
    }
  };

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredRecords.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredRecords.length / itemsPerPage);

  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
  };

  return (
    <div className={`min-h-screen bg-gradient-to-br ${theme.background} p-6`}>
      <div className="max-w-7xl mx-auto space-y-8">

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className={`animate-spin rounded-full h-16 w-16 border-b-4 ${theme.spinner} mx-auto mb-4`}></div>
              <p className="text-gray-600 font-medium">Loading inspection data...</p>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-6">
            <div className="flex items-center space-x-3">
              <XCircleIcon className="h-8 w-8 text-red-600" />
              <div>
                <h3 className="text-lg font-semibold text-red-900">Error Loading Data</h3>
                <p className="text-red-700">{error}</p>
              </div>
            </div>
            <button
              onClick={loadInspectionData}
              className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-200"
            >
              Retry
            </button>
          </div>
        )}

        {/* Breadcrumb */}
        {!loading && !error && (
        <>
        <div className="bg-white rounded-xl shadow-md border border-gray-200 px-6 py-3">
          <nav className="flex items-center space-x-2 text-sm">
            <button
              onClick={handleGoHome}
              className={`flex items-center text-gray-600 ${theme.breadcrumb} transition-colors duration-200`}
            >
              <HomeIcon className="h-4 w-4 mr-1" />
              Home
            </button>
            <ChevronRightIcon className="h-4 w-4 text-gray-400" />
            <button
              onClick={handleBackToStation}
              className={`text-gray-600 ${theme.breadcrumb} transition-colors duration-200`}
            >
              {config.breadcrumbName}
            </button>
            <ChevronRightIcon className="h-4 w-4 text-gray-400" />
            <span className={`${theme.breadcrumbActive} font-semibold`}>{config.title}</span>
          </nav>
        </div>

        {/* Page Header with Statistics */}
        <div className={`bg-white rounded-2xl shadow-xl border ${theme.headerBorder} overflow-hidden`}>
          <div className={`bg-gradient-to-r ${theme.header} p-6`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <button
                  onClick={handleBackToStation}
                  className="bg-white/20 backdrop-blur-sm rounded-xl p-3 hover:bg-white/30 transition-colors duration-200"
                  title={`Back to ${config.name} Page`}
                >
                  <ChevronLeftIcon className="h-6 w-6 text-white" />
                </button>
                <div className="bg-white/20 backdrop-blur-sm rounded-xl p-3">
                  <DocumentTextIcon className="h-10 w-10 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-white">{config.title}</h1>
                  <p className={`${theme.subtitle} mt-1`}>{config.subtitle}</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                {/* Statistics Cards - Same size as buttons */}
                <div className="bg-white/10 backdrop-blur-sm rounded-xl px-4 py-3 border border-white/20 text-center min-w-[100px]">
                  <div className="text-white font-bold text-xl">{formatNumber(stats.total.toString())}</div>
                  <div className="text-white/70 text-xs">Total</div>
                </div>

                <div className="bg-white/10 backdrop-blur-sm rounded-xl px-4 py-3 border border-white/20 text-center min-w-[100px]">
                  <div className="text-green-100 font-bold text-xl">{formatNumber(stats.passed.toString())}</div>
                  <div className="text-white/70 text-xs">Passed</div>
                </div>

                <div className="bg-white/10 backdrop-blur-sm rounded-xl px-4 py-3 border border-white/20 text-center min-w-[100px]">
                  <div className="text-red-100 font-bold text-xl">{formatNumber(stats.rejected.toString())}</div>
                  <div className="text-white/70 text-xs">Rejected</div>
                </div>

                <div className="bg-white/10 backdrop-blur-sm rounded-xl px-4 py-3 border border-white/20 text-center min-w-[100px]">
                  <div className="text-yellow-100 font-bold text-xl">{formatNumber(stats.passRate,2)}%</div>
                  <div className="text-white/70 text-xs">Pass Rate</div>
                </div>

                {/* 
                <button
                  onClick={handlePrint}
                  className="bg-white/20 backdrop-blur-sm rounded-xl p-3 hover:bg-white/30 transition-colors duration-200"
                  title="Print Results"
                >
                  <PrinterIcon className="h-6 w-6 text-white" />
                </button>
                */}
                <button
                  onClick={handleExport}
                  className="bg-white/20 backdrop-blur-sm rounded-xl p-3 hover:bg-white/30 transition-colors duration-200"
                  title="Export Results"
                >
                  <ArrowDownTrayIcon className="h-6 w-6 text-white" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
          <div className="bg-gradient-to-r from-orange-100 to-amber-100 px-6 py-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-orange-800">Filters</h3>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="text-orange-600 hover:text-orange-800 transition-colors duration-200"
              >
                <FunnelIcon className="h-6 w-6" />
              </button>
            </div>
          </div>

          {showFilters && (
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Date Start
                  </label>
                  <input
                    type="date"
                    className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 ${theme.focusRing}`}
                    value={filters.dateStart}
                    onChange={(e) => handleFilterChange('dateStart', e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Date End
                  </label>
                  <input
                    type="date"
                    className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 ${theme.focusRing}`}
                    value={filters.dateEnd}
                    onChange={(e) => handleFilterChange('dateEnd', e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Judgment
                  </label>
                  <select
                    className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 ${theme.focusRing}`}
                    value={filters.judgment}
                    onChange={(e) => handleFilterChange('judgment', e.target.value)}
                  >
                    <option value="all">All Results</option>
                    <option value="pass">Pass Only</option>
                    <option value="reject">Reject Only</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Model
                  </label>
                  <select
                    className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 ${theme.focusRing}`}
                    value={filters.model}
                    onChange={(e) => handleFilterChange('model', e.target.value)}
                  >
                    {uniqueModels.map(model => (
                      <option key={model} value={model}>{model}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Lot No
                  </label>
                  <input
                    type="text"
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 transition-all duration-200 ${
                      filters.lotno.trim()
                        ? 'border-blue-400 bg-blue-50 text-blue-900 font-semibold ring-2 ring-blue-200'
                        : 'border-gray-300 bg-white'
                    } ${theme.focusRing}`}
                    value={filters.lotno}
                    onChange={(e) => handleFilterChange('lotno', e.target.value)}
                    placeholder="Search lot number..."
                  />
                </div>


              </div>
            </div>
          )}
        </div>

        {/* Results Table */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
          <div className="bg-gradient-to-r from-slate-100 to-gray-100 px-6 py-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-gray-800">Inspection Records</h3>
              {/* icon description */}
              <div className="flex items-center space-x-4 text-xs text-gray-600">
                <span className="flex items-center">
                  <DocumentTextIcon className="h-4 w-4 mr-1" /> Details
                </span>
                <span className="flex items-center">
                  <ExclamationTriangleIcon className="h-4 w-4 mr-1 text-orange-600" /> Input Defect
                </span>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">No.</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Sampling No</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Sampling Date</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Lot No</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Item No</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Round</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Quantities</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Status</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {currentItems.map((record, index) => (
                  <tr key={record.id} className="hover:bg-gray-50 transition-colors duration-150">
                    <td className="px-6 py-4 text-sm text-gray-600">{indexOfFirstItem + index + 1}</td>
                    <td className="px-6 py-4 text-sm">
                      <div className="font-medium text-gray-900">{record.inspectionNo}</div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      <div className="flex items-center space-x-2">
                        <CalendarIcon className="h-4 w-4 text-gray-400" />
                        <span>{formatDate(record.inspectionDate)}</span>
                      </div>
                      <div className="text-xs text-gray-500 mt-1">WW: {record.ww}</div>
                      {record.sampling_reason_description && (
                        <div className="text-xs text-orange-500 mt-1">{record.sampling_reason_description}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      <button
                        onClick={() => handleLotClick(record.lotno)}
                        disabled={loadingLot}
                        className="text-left hover:bg-blue-50 rounded px-2 py-1 -mx-2 transition-all duration-200 group disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Click to view lot details"
                      >
                        <div className="text-blue-600 hover:text-blue-800 font-medium group-hover:underline flex items-center">
                          {highlightLotNumber(record.lotno)}
                          <svg
                            className="h-4 w-4 ml-1 opacity-0 group-hover:opacity-100 transition-opacity"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                          </svg>
                        </div>
                        <div className="text-xs text-gray-500 mt-1">MC Line No. {record.mclineno}</div>
                      </button>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      <div>{record.itemno}</div>
                      <div className="text-xs text-gray-900 font-medium mt-1">{record.model}</div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{record.samplingRound}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      <div className="space-y-1">
                        <div>FVI: {formatNumber((record.fviLotQty ?? 0).toString())}</div>
                        <div>Gen: {formatNumber((record.generalSamplingQty ?? 0).toString())}</div>
                        <div>Crack: {formatNumber((record.crackSamplingQty ?? 0).toString())}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      <div className={`inline-flex items-center space-x-2 px-3 py-1 rounded-full border text-sm font-medium ${getStatusColor(record.judgment)}`}>
                        {getStatusIcon(record.judgment)}
                        <span>{record.judgment}</span>
                      </div>
                      {record.judgment === 'Reject' && (
                        <>
                          <div className="text-xs text-red-600 mt-1"><span>Defect: {record.defect_num}</span></div>
                          <div className="text-xs text-red-600 mt-1"><span>NG: {record.ng_num}</span></div>
                        </>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col space-y-2">
                        {/* Row 1 */}
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleEdit(record)}
                            className={`p-2 ${theme.editButton} rounded-lg transition-colors duration-200`}
                            title="Edit"
                          >
                            <PencilIcon className="h-5 w-5" />
                          </button>
                          <button
                            onClick={() => handleDelete(record)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200"
                            title="Delete"
                          >
                            <TrashIcon className="h-5 w-5" />
                          </button>
                        </div>
                        {/* Row 2 */}
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => setSelectedRecord(record)}
                            className="p-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors duration-200"
                            title="View Details"
                          >
                            <DocumentTextIcon className="h-5 w-5" />
                          </button>
                          {record.judgment === 'Reject' && (
                            <button
                              onClick={() => handleInputDefect(record)}
                              className="p-2 text-orange-600 hover:bg-orange-50 rounded-lg transition-colors duration-200"
                              title="Input Defect"
                            >
                              <ExclamationTriangleIcon className="h-5 w-5" />
                            </button>
                          )}
                          {/* Only show "Generate FVI" button for Pass judgment */}
                          {record.judgment === 'Pass' && (
                            <button
                              onClick={() => handleGenerateFVI(record)}
                              className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors duration-200"
                              title="Generate SIV (OQA Pass only)"
                            >
                              <ClipboardDocumentCheckIcon className="h-5 w-5" />
                            </button>
                          )}
                        </div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredRecords.length === 0 && !loading && (
            <div className="text-center py-12">
              <DocumentTextIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-700 mb-2">No Records Found</h3>
              <p className="text-gray-500">Try adjusting your filters to see more results.</p>
            </div>
          )}

          {/* Pagination */}
          {filteredRecords.length > 0 && (
            <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-700">
                  Showing <span className="font-medium">{indexOfFirstItem + 1}</span> to{' '}
                  <span className="font-medium">{Math.min(indexOfLastItem, filteredRecords.length)}</span> of{' '}
                  <span className="font-medium">{filteredRecords.length}</span> results
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className={`p-2 rounded-lg ${
                      currentPage === 1
                        ? 'text-gray-400 cursor-not-allowed'
                        : 'text-gray-700 hover:bg-gray-200 transition-colors duration-200'
                    }`}
                  >
                    <ChevronLeftIconSolid className="h-5 w-5" />
                  </button>

                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                    <button
                      key={pageNum}
                      onClick={() => handlePageChange(pageNum)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 ${
                        currentPage === pageNum
                          ? `${theme.pagination} text-white`
                          : 'text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {pageNum}
                    </button>
                  ))}

                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className={`p-2 rounded-lg ${
                      currentPage === totalPages
                        ? 'text-gray-400 cursor-not-allowed'
                        : 'text-gray-700 hover:bg-gray-200 transition-colors duration-200'
                    }`}
                  >
                    <ChevronRightIcon className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Record Detail Modal */}
        <RecordDetailModal
          record={selectedRecord}
          isOpen={!!selectedRecord}
          onClose={() => setSelectedRecord(null)}
          onPrint={handlePrint}
          theme={theme}
          stationCode={config.code}
          serviceType="defectdata-customer"
        />

        {/* Lot Information Modal */}
        <LotInfoModal
          lot={selectedLot}
          isOpen={showLotInfoModal}
          onClose={() => {
            setShowLotInfoModal(false);
            setSelectedLot(null);
          }}
          onPrint={() => window.print()}
          title="Lot Information"
          showPrintButton={true}
        />

        {/* Delete Confirmation Modal */}
        {showDeleteConfirm && recordToDelete && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
              <div className="px-6 py-4 bg-gradient-to-r from-red-500 to-rose-600 rounded-t-2xl">
                <h3 className="text-2xl font-bold text-white">Confirm Delete</h3>
              </div>
              <div className="p-6">
                <div className="flex items-center space-x-4 mb-6">
                  <div className="flex-shrink-0">
                    <TrashIcon className="h-12 w-12 text-red-600" />
                  </div>
                  <div>
                    <p className="text-gray-900 font-medium">
                      Are you sure you want to delete this inspection record?
                    </p>
                    <p className="text-gray-600 text-sm mt-1">
                      Inspection: {recordToDelete.inspectionNo}
                    </p>
                    <p className="text-red-600 text-sm mt-2 font-medium">
                      This action cannot be undone.
                    </p>
                  </div>
                </div>
                <div className="flex justify-end space-x-4">
                  <button
                    onClick={() => {
                      setShowDeleteConfirm(false);
                      setRecordToDelete(null);
                    }}
                    className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 font-semibold hover:bg-gray-50 transition-colors duration-200"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={confirmDelete}
                    className="px-6 py-3 bg-gradient-to-r from-red-500 to-rose-600 text-white rounded-lg font-semibold hover:from-red-600 hover:to-rose-700 transition-all duration-200 shadow-lg hover:shadow-xl"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* SIV Confirmation Modal */}
        {showSIVConfirmModal && sivCreationRecord && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full mx-4">
              <div className="flex items-center mb-4">
                <ClipboardDocumentCheckIcon className="w-8 h-8 text-blue-500 mr-3" />
                <h3 className="text-xl font-semibold text-gray-900">Create SIV Inspection</h3>
              </div>

              <p className="text-gray-700 mb-4">
                Create SIV inspection from OQA inspection <span className="font-semibold">{sivCreationRecord.inspectionNo}</span>?
              </p>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Lot No:</span>
                    <span className="font-semibold text-gray-900">{sivCreationRecord.lotno}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Model:</span>
                    <span className="font-semibold text-gray-900">{sivCreationRecord.model}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Judgment:</span>
                    <span className={`font-semibold ${sivCreationRecord.judgment === 'Pass' ? 'text-green-600' : 'text-red-600'}`}>
                      {sivCreationRecord.judgment}
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-6">
                <p className="text-xs text-amber-800">
                  <strong>Note:</strong> Only Pass OQA inspections can create SIV records.
                </p>
              </div>

              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => {
                    setShowSIVConfirmModal(false);
                    setSivCreationRecord(null);
                  }}
                  disabled={creatingSIV}
                  className="px-5 py-2.5 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmSIVCreation}
                  disabled={creatingSIV}
                  className="px-5 py-2.5 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg hover:from-blue-600 hover:to-indigo-700 transition-all duration-200 font-medium shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                >
                  {creatingSIV ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Creating...
                    </>
                  ) : (
                    'Yes, Create SIV'
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* SIV Result Modal */}
        {showSIVResultModal && sivCreationResult && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full mx-4">
              <div className="flex items-center mb-4">
                {sivCreationResult.success ? (
                  <CheckCircleIcon className="w-8 h-8 text-green-500 mr-3" />
                ) : (
                  <XCircleIcon className="w-8 h-8 text-red-500 mr-3" />
                )}
                <h3 className="text-xl font-semibold text-gray-900">
                  {sivCreationResult.success ? 'Success' : 'Failed'}
                </h3>
              </div>

              <p className={`text-lg mb-4 ${sivCreationResult.success ? 'text-green-700' : 'text-red-700'}`}>
                {sivCreationResult.message}
              </p>

              {sivCreationResult.success && sivCreationResult.inspectionNo && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                  <div className="text-sm">
                    <span className="text-gray-600">SIV Sampling No:</span>
                    <span className="ml-2 font-bold text-green-800 text-base">
                      {sivCreationResult.inspectionNo}
                    </span>
                  </div>
                </div>
              )}

              <div className="flex justify-end">
                <button
                  onClick={handleCloseSIVResultModal}
                  className={`px-6 py-2.5 rounded-lg font-medium transition-all duration-200 ${
                    sivCreationResult.success
                      ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:from-green-600 hover:to-emerald-700 shadow-lg'
                      : 'bg-gradient-to-r from-red-500 to-rose-600 text-white hover:from-red-600 hover:to-rose-700 shadow-lg'
                  }`}
                >
                  OK
                </button>
              </div>
            </div>
          </div>
        )}
        </>
        )}
      </div>
    </div>
  );
};

export default InspectionCustomerPage;
