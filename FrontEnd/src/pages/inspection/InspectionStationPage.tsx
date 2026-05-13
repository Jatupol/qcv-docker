// client/src/pages/inspection/InspectionStationPage.tsx
// Generic Inspection Station Page - Unified component for OQA, OBA, and SIV
// Complete Separation Entity Architecture - Quality Control System

import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import { ChevronLeftIcon, CheckCircleIcon, XCircleIcon, DocumentTextIcon, PhotoIcon, PrinterIcon, ArrowDownTrayIcon, CalendarIcon, UserIcon, PencilIcon, TrashIcon, ExclamationTriangleIcon, ChevronRightIcon, ChevronLeftIcon as ChevronLeftIconSolid, ClipboardDocumentCheckIcon, HomeIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { inspectionDataService } from '../../services/inspectionDataService';
import { inspectionStationService } from '../../services/inspectionStationService';
import { apiBaseUrl } from '../../services/api';
import { formatNumber, toLocalDate } from '../../utils';
import { formatDate, formatDateTimeFull, parseAsLocalDate } from '../../utils/formatUtils';
import * as XLSX from 'xlsx';
import { useSound } from '../../hooks/useSoundNotification';
import { useNotificationHelpers } from '../../components/common/NotificationSystem';
import { exportToExcel, type ExcelColumn, ExcelFormatters } from '../../utils/excelUtils';
import RecordDetailModal from '../../components/inspection/RecordDetailModal';
import LotInfoModal from '../../components/inspection/lot-selection/LotInfoModal';
import type { LotData } from '../../types/inf-lotinput';
import type { InspectionRecord } from '../../types/inspectiondata';
import type { FilterOptions, SIVCreationResult } from '../../types/inspection-station';
import { STATION_CONFIGS } from '../../types/inspection-station';

// ==================== AQL SAMPLING VALIDATION ====================

/**
 * AQL Sampling Validation Rules
 * Returns the minimum required General Sampling Qty based on FVI Lot Qty
 */
const getMinimumGeneralSamplingQty = (fviLotQty: number): number => {
  if (fviLotQty <= 280) return 32;
  if (fviLotQty <= 500) return 48;
  if (fviLotQty <= 3200) return 72;
  if (fviLotQty <= 10000) return 86;
  if (fviLotQty <= 35000) return 108;
  if (fviLotQty <= 150000) return 123;
  if (fviLotQty <= 500000) return 156;
  return 189; // > 500000
};

/**
 * Check if General Sampling Qty meets AQL requirements
 */
const isValidAQLSampling = (fviLotQty: number, generalSamplingQty: number): boolean => {
  const minRequired = getMinimumGeneralSamplingQty(fviLotQty);
  const isValid = generalSamplingQty >= minRequired;

  // Debug logging
  if (!isValid) {
    console.log('🔍 AQL Validation Failed:', {
      fviLotQty,
      generalSamplingQty,
      minRequired,
      isValid,
      range: getAQLRangeDescription(fviLotQty)
    });
  }

  return isValid;
};

/**
 * Get AQL range description for display
 */
const getAQLRangeDescription = (fviLotQty: number): string => {
  if (fviLotQty <= 280) return '0 - 280';
  if (fviLotQty <= 500) return '281 - 500';
  if (fviLotQty <= 3200) return '501 - 3,200';
  if (fviLotQty <= 10000) return '3,201 - 10,000';
  if (fviLotQty <= 35000) return '10,001 - 35,000';
  if (fviLotQty <= 150000) return '35,001 - 150,000';
  if (fviLotQty <= 500000) return '150,001 - 500,000';
  return '> 500,000';
};

// ==================== MAIN COMPONENT ====================

const InspectionStationPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();

  // Detect station from URL path using service
  const stationKey = inspectionStationService.detectStationFromPath(location.pathname);
  const config = STATION_CONFIGS[stationKey] || STATION_CONFIGS.OQA;
  const theme = config.theme;

  // Restore filters from sessionStorage to keep state when navigating back
  const filterStorageKey = `inspection_filters_${config.code}`;

  const [records, setRecords] = useState<InspectionRecord[]>([]);
  const [filteredRecords, setFilteredRecords] = useState<InspectionRecord[]>([]);

  const [filters, setFilters] = useState<FilterOptions>(() => {
    try {
      const saved = sessionStorage.getItem(filterStorageKey);
      if (saved) return JSON.parse(saved);
    } catch {}
    return {
      dateStart: inspectionStationService.getTodayDate(),
      dateEnd: inspectionStationService.getTodayDate(),
      judgment: 'all',
      lotno: '',
      model: 'All',
      fvilineno: '',
      partsite: 'All'
    };
  });
  const filtersRef = useRef(filters);
  filtersRef.current = filters;

  // Persist filters to sessionStorage
  useEffect(() => {
    try { sessionStorage.setItem(filterStorageKey, JSON.stringify(filters)); } catch {}
  }, [filters, filterStorageKey]);
  const [selectedRecord, setSelectedRecord] = useState<InspectionRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(25); // Default 25 records per page
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
  const [sgtParts, setSgtParts] = useState<Set<string>>(new Set());

  // Lot Info Modal states
  const [showLotInfoModal, setShowLotInfoModal] = useState(false);
  const [selectedLot, setSelectedLot] = useState<LotData | null>(null);
  const [loadingLot, setLoadingLot] = useState(false);

  // URL params: inspection_no & lotno (from overview-oqa lot modal link)
  const urlInspectionNoRef = useRef(searchParams.get('inspection_no'));
  const urlLotNoRef = useRef(searchParams.get('lotno'));
  const [highlightInspectionNo, setHighlightInspectionNo] = useState<string | null>(null);

  // Sound notifications and UI helpers
  const sound = useSound();
  const { showSuccess, showError, showWarning, showInfo } = useNotificationHelpers();

  // Fetch SGT parts on mount (for hiding Generate SIV button) - cached in sessionStorage
  useEffect(() => {
    if (stationKey === 'OQA') {
      const CACHE_KEY = 'sgt_parts_cache';
      const CACHE_TTL = 30 * 60 * 1000; // 30 minutes

      // Try cache first
      try {
        const cached = sessionStorage.getItem(CACHE_KEY);
        if (cached) {
          const parsed = JSON.parse(cached);
          if (Date.now() - parsed.timestamp < CACHE_TTL) {
            console.log(`⚡ [OQA] getPartsSGT from cache (${parsed.parts.length} parts)`);
            setSgtParts(new Set(parsed.parts));
            return;
          }
        }
      } catch { /* cache miss */ }

      const t = performance.now();
      inspectionStationService.getPartsSGT().then(parts => {
        console.log(`⏱️ [OQA] getPartsSGT: ${(performance.now() - t).toFixed(0)}ms (${parts.size} parts)`);
        setSgtParts(parts);
        try {
          sessionStorage.setItem(CACHE_KEY, JSON.stringify({ timestamp: Date.now(), parts: [...parts] }));
        } catch { /* ignore */ }
      });
    }
  }, [stationKey]);

  // Load inspection data function wrapped in useCallback to prevent infinite loops
  const loadInspectionData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const { dateStart, dateEnd } = filtersRef.current;
      console.log(`🔄 Loading ${config.code} data (${dateStart} to ${dateEnd})`);

      // Use date strings directly without timezone conversion
      // Backend expects YYYY-MM-DD format and handles it correctly in local timezone
      console.log('📅 Date range:', {
        from: dateStart,
        to: dateEnd
      });

      // Load records - use customer API for OQA_CUSTOMER, regular API for others
      const isCustomer = stationKey === 'OQA_CUSTOMER';
      const tApi = performance.now();
      const result = isCustomer
        ? await inspectionDataService.getAllCustomerData({
            station: config.code,
            page: 1,
            limit: 999999,
            inspection_date_from: dateStart,
            inspection_date_to: dateEnd
          })
        : await inspectionDataService.getAll({
            station: config.code,
            page: 1,
            limit: 999999, // Load all records
            inspection_date_from: dateStart,
            inspection_date_to: dateEnd
          });
      console.log(`⏱️ [OQA] ${isCustomer ? 'getAllCustomerData' : 'getAll'}: ${(performance.now() - tApi).toFixed(0)}ms`);

      if (result.success && result.data) {
        const allData = result.data.data || [];

        console.log(`📊 Loaded ${allData.length} inspection records`);

        const tTransform = performance.now();
        const transformedRecords: InspectionRecord[] = allData.map((item: any) => ({
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
          color: item.color, // Color Group for SIV station
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

        console.log(`⏱️ [OQA] transform ${transformedRecords.length} records: ${(performance.now() - tTransform).toFixed(0)}ms`);

        // Update state
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
  }, [config.code]); // Only recreate when station changes; date changes require manual Search

  // Fetch inspection data on initial load or when station changes
  useEffect(() => {
    setCurrentPage(1);

    const inspNo = urlInspectionNoRef.current;
    const lotNo = urlLotNoRef.current;
    if (inspNo) {
      // Resolve inspection_no from URL: fetch its date, then load data for that date
      urlInspectionNoRef.current = null; // Only once
      urlLotNoRef.current = null;
      setHighlightInspectionNo(inspNo);
      (async () => {
        try {
          const resp = await fetch(
            `${apiBaseUrl('inspectiondata')}/inspection-no/${encodeURIComponent(inspNo)}`,
            { credentials: 'include' }
          );
          const result = await resp.json();
          if (result.success && result.data) {
            // Extract date portion (YYYY-MM-DD) directly from the ISO string to avoid timezone issues
            const raw = (result.data.inspection_date ?? result.data.inspectionDate ?? '').toString();
            const dateStr = raw.substring(0, 10); // "2026-03-18"
            if (dateStr) {
              // Update filtersRef directly so loadInspectionData reads the correct date
              const updatedFilters = { ...filtersRef.current, dateStart: dateStr, dateEnd: dateStr, lotno: lotNo || '' };
              filtersRef.current = updatedFilters;
              setFilters(updatedFilters);
            }
          }
        } catch (err) {
          console.error('Error resolving inspection_no from URL:', err);
        }
        loadInspectionData();
      })();
    } else {
      loadInspectionData();
    }
  }, [loadInspectionData]);

  // Apply client-side filters (excluding date range which is now server-side)
  useEffect(() => {
    let filtered = [...records];

    // Note: Date filtering is now done server-side for better performance
    // See loadInspectionData() function which passes inspection_date_from and inspection_date_to

    // Filter by judgment
    if (filters.judgment !== 'all') {
      filtered = filtered.filter(record => {
        if (filters.judgment === 'pending') {
          return record.judgment === null;
        }
        return record.judgment?.toLowerCase() === filters.judgment;
      });
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

    // Filter by production site (partsite)
    if (filters.partsite !== 'All') {
      filtered = filtered.filter(record => record.partsite === filters.partsite);
    }

    // Live search for FVI Line No - show all if blank, filter by partial match if not
    if (filters.fvilineno && filters.fvilineno.trim() !== '') {
      filtered = filtered.filter(record =>
        (record.fvilineno || '').toLowerCase().includes(filters.fvilineno.toLowerCase().trim())
      );
    }

    // Only log significant changes (when records count changes)
    if (filtered.length !== filteredRecords.length) {
      console.log('🔍 Filtered:', records.length, '→', filtered.length, 'records');
    }

    setFilteredRecords(filtered);
  }, [filters, records]);

  const handleFilterChange = (key: keyof FilterOptions, value: string) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const getStatusColor = (judgment: string | null) => {
    return inspectionStationService.getStatusColor(judgment || '');
  };

  const getStatusIcon = (judgment: string | null) => {
    if (judgment === 'Pass') {
      return <CheckCircleIcon className="h-5 w-5 text-green-600" />;
    } else if (judgment === 'Reject') {
      return <XCircleIcon className="h-5 w-5 text-red-600" />;
    } else {
      return <ExclamationTriangleIcon className="h-5 w-5 text-gray-400" />;
    }
  };

  // Memoize statistics calculation to avoid re-computation on every render
  const stats = useMemo(() => {
    const total = filteredRecords.length;
    const passed = filteredRecords.filter(r => r.judgment === 'Pass').length;
    const rejected = filteredRecords.filter(r => r.judgment === 'Reject').length;
    const pending = filteredRecords.filter(r => r.judgment === null).length;
    const judgedTotal = passed + rejected;
    const passRate = judgedTotal > 0 ? ((passed / judgedTotal) * 100).toFixed(1) : '0';
    const totalSamplingQty = filteredRecords.reduce((sum, r) => sum + (r.generalSamplingQty || 0), 0);
    const totalNgQty = filteredRecords.reduce((sum, r) => sum + (r.ng_num || 0), 0);

    return { total, passed, rejected, pending, passRate, totalSamplingQty, totalNgQty };
  }, [filteredRecords]);

  // Memoize unique models for filter dropdown - only recalculate when records change
  const uniqueModels = useMemo(() => {
    return ['All', ...Array.from(new Set(records.map(r => r.model))).sort()];
  }, [records]);

  // Memoize unique partsites for filter dropdown
  const uniquePartsites = useMemo(() => {
    return ['All', ...Array.from(new Set(records.map(r => r.partsite).filter(Boolean))).sort()];
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
        ...(stationKey === 'SIV' ? [{ key: 'color', header: 'Color Group', width: 15 }] : []),
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
        ...(stationKey === 'SIV' ? { color: record.color || '' } : {}),
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

  const handleExportSIVFormat = async () => {
    try {
      const result = await inspectionDataService.getSIVFormat({
        inspection_date_from: filters.dateStart,
        inspection_date_to: filters.dateEnd,
        judgment: filters.judgment !== 'all' ? filters.judgment : undefined,
        model: filters.model !== 'All' ? filters.model : undefined,
        lotno: filters.lotno.trim() || undefined,
        fvilineno: filters.fvilineno.trim() || undefined,
        partsite: filters.partsite !== 'All' ? filters.partsite : undefined,
      });

      const exportData = result.data || [];
      if (!result.success || exportData.length === 0) {
        showWarning('No Data', 'No SIV format data to export. Please adjust your filters.');
        return;
      }

      // Build rows with Date objects for inspection_date (locale-safe)
      const DATE_COL = 1; // 0-based column index for "Inspection Date"
      const rows = exportData.map((row: any) => {
        const judgmentVal = row.judgment === true || row.judgment === 'true' ? 'Pass'
          : row.judgment === false || row.judgment === 'false' ? 'Reject' : '';
        const remark = [row.mclineno, row.fvilineno].filter(Boolean).join('/');

        return {
          'Work Week': row.ww ?? '',
          'Inspection Date': row.inspection_date ? parseAsLocalDate(row.inspection_date) : '',
          'Inspection': row.round ?? '',
          'Part No.': row.itemno ?? '',
          'Type': row.tab ?? '',
          'Lot No.': row.lotno ?? '',
          'Qty.': row.fvi_lot_qty ?? '',
          'Group color': row.color ?? '',
          'Group color Qty.': row.groupcolorqty ?? '',
          'SI Sampling Qty. Per': row.general_sampling_qty ?? '',
          'SI Sampling NG Qty.': row.ng_qty ?? '',
          'Tray No.': row.trayno ?? '',
          'POS on Tray': row.tray_position ?? '',
          'TNHK Inspector': row.creaete_name ?? '',
          'SI Inspector': row.modify_name ?? '',
          'Judgement': judgmentVal,
          'Defect Name': row.defect_name ?? '',
          'Defect Qty.': row.ng_qty ?? '',
          'Remark': remark,
          'Encoded and Updated by': row.modify_name ?? '',
        };
      });

      const ws = XLSX.utils.json_to_sheet(rows, { cellDates: true });

      // Apply date format to all "Inspection Date" cells (locale-independent)
      const range = XLSX.utils.decode_range(ws['!ref'] || 'A1');
      for (let r = range.s.r + 1; r <= range.e.r; r++) {
        const cellAddr = XLSX.utils.encode_cell({ r, c: DATE_COL });
        const cell = ws[cellAddr];
        if (cell && (cell.t === 'd' || cell.t === 'n')) {
          cell.z = 'dd/mm/yyyy hh:mm:ss';
        }
      }

      // Auto-fit column widths
      const keys = Object.keys(rows[0] || {});
      ws['!cols'] = keys.map(key => {
        let maxLen = key.length;
        rows.forEach((row: Record<string, any>) => {
          const val = row[key];
          const str = val instanceof Date ? formatDateTimeFull(val) : (val?.toString() || '');
          maxLen = Math.max(maxLen, str.length);
        });
        return { wch: Math.min(maxLen + 2, 30) };
      });

      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'SIV_Format_Export');
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
      XLSX.writeFile(wb, `SIV_Format_Export_${timestamp}.xlsx`);

      sound.playSuccess();
      showSuccess('Export Successful', `${exportData.length} SIV records exported.`);
    } catch (error) {
      console.error('❌ SIV Export error:', error);
      sound.playError();
      showError('Export Failed', error instanceof Error ? error.message : 'Failed to export SIV format');
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
          round: record.samplingRound,
          color: record.color // Color Group for SIV station
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
    // Open defect page in new tab to keep current page mounted (avoids slow reload)
    const url = `${config.defectRoute}?inspection_no=${encodeURIComponent(record.inspectionNo)}`;
    window.open(url, '_blank');
  };

  const handleGenerateFVI = async (record: InspectionRecord) => {
    try {
      // BUSINESS LOGIC: Only OQA station with Pass judgment can create SIV
      if (!inspectionStationService.canCreateSIV(record, config.code, sgtParts)) {
        sound.playWarning();
        if (config.code !== 'OQA') {
          showWarning('Invalid Station', `SIV inspection can only be created from OQA station.\n\nCurrent station: ${config.code}`);
        } else {
          showWarning('Invalid Judgment', 'SIV inspection can only be created from OQA inspections with Pass judgment.');
        }
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
      const result = await inspectionStationService.createSIVFromOQA(
        sivCreationRecord.id,
        config.code,
        sivCreationRecord.judgment ||''
      );

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
      const lotData = await inspectionStationService.getLotDetails(lotno);

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

  // Pagination - Memoized to avoid recalculation on every render
  const { currentItems, totalPages, indexOfFirstItem, indexOfLastItem } = useMemo(() => {
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = filteredRecords.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(filteredRecords.length / itemsPerPage);

    return { currentItems, totalPages, indexOfFirstItem, indexOfLastItem };
  }, [filteredRecords, currentPage, itemsPerPage]);

  // Debug pagination (only log when page changes, not on every render)
  useEffect(() => {
    if (filteredRecords.length > 0) {
      console.log('📄 Page', currentPage, '/', totalPages, '- Showing', currentItems.length, 'of', filteredRecords.length, 'records');
    }
  }, [currentPage, totalPages, currentItems.length, filteredRecords.length]);

  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
  };

  return (
    <div className={`flex-1 -mx-6 -my-8 bg-gradient-to-br ${theme.background} p-6`}>
      <div className="space-y-8">

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

                <div className="bg-white/10 backdrop-blur-sm rounded-xl px-4 py-3 border border-white/20 text-center min-w-[100px]">
                  <div className="text-cyan-100 font-bold text-xl">{formatNumber(stats.totalSamplingQty.toString())}</div>
                  <div className="text-white/70 text-xs">Sampling Qty</div>
                </div>

                <div className="bg-white/10 backdrop-blur-sm rounded-xl px-4 py-3 border border-white/20 text-center min-w-[100px]">
                  <div className="text-orange-100 font-bold text-xl">{formatNumber(stats.totalNgQty.toString())}</div>
                  <div className="text-white/70 text-xs">NG Qty</div>
                </div>

                {/* Action Buttons */}
                {stationKey !== 'SIV' && (
                  <button
                    onClick={handleBackToStation}
                    className="bg-white/20 backdrop-blur-sm rounded-xl px-4 py-3 hover:bg-white/30 transition-colors duration-200 flex items-center space-x-2"
                    title={`Go to ${config.name} Page`}
                  >
                    <DocumentTextIcon className="h-5 w-5 text-white" />
                    <span className="text-white font-medium">{config.newButtonLabel}</span>
                  </button>
                )}
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
                {stationKey === 'SIV' && (
                  <button
                    onClick={handleExportSIVFormat}
                    className="bg-white/20 backdrop-blur-sm rounded-xl px-3 py-2 hover:bg-white/30 transition-colors duration-200 flex items-center space-x-2"
                    title="Export SIV Format"
                  >
                    <ArrowDownTrayIcon className="h-5 w-5 text-white" />
                    <span className="text-white text-sm font-medium">SIV Format</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Compact Filters */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 px-4 py-3">
          <div className="flex flex-wrap items-center gap-3">
            {/* Date Range */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-gray-600">Date:</span>
              <input
                type="date"
                className={`px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 ${theme.focusRing}`}
                value={filters.dateStart}
                onChange={(e) => handleFilterChange('dateStart', e.target.value)}
              />
              <span className="text-gray-400">-</span>
              <input
                type="date"
                className={`px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 ${theme.focusRing}`}
                value={filters.dateEnd}
                onChange={(e) => handleFilterChange('dateEnd', e.target.value)}
              />
              <button
                onClick={() => { setCurrentPage(1); loadInspectionData(); }}
                className={`px-3 py-1 text-sm font-medium text-white ${theme.pagination} rounded hover:opacity-90 flex items-center gap-1`}
              >
                <MagnifyingGlassIcon className="h-4 w-4" />
                Search
              </button>
            </div>

            <div className="w-px h-6 bg-gray-300" />

            {/* Judgment */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-gray-600">Judgment:</span>
              <select
                className={`px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 ${theme.focusRing}`}
                value={filters.judgment}
                onChange={(e) => handleFilterChange('judgment', e.target.value)}
              >
                <option value="all">All</option>
                <option value="pass">Pass</option>
                <option value="reject">Reject</option>
                <option value="pending">Pending</option>
              </select>
            </div>

            <div className="w-px h-6 bg-gray-300" />

            {/* Production Site */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-gray-600">Site:</span>
              <select
                className={`px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 ${theme.focusRing}`}
                value={filters.partsite}
                onChange={(e) => handleFilterChange('partsite', e.target.value)}
              >
                {uniquePartsites.map(site => (
                  <option key={site} value={site}>{site}</option>
                ))}
              </select>
            </div>

            <div className="w-px h-6 bg-gray-300" />

            {/* Model */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-gray-600">Model:</span>
              <select
                className={`px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 ${theme.focusRing}`}
                value={filters.model}
                onChange={(e) => handleFilterChange('model', e.target.value)}
              >
                {uniqueModels.map(model => (
                  <option key={model} value={model}>{model}</option>
                ))}
              </select>
            </div>

            <div className="w-px h-6 bg-gray-300" />

            {/* Lot No */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-gray-600">Lot:</span>
              <input
                type="text"
                className={`px-2 py-1 text-sm border rounded focus:outline-none focus:ring-1 w-32 ${
                  filters.lotno.trim()
                    ? 'border-blue-400 bg-blue-50 text-blue-900 font-medium'
                    : 'border-gray-300 bg-white'
                } ${theme.focusRing}`}
                value={filters.lotno}
                onChange={(e) => handleFilterChange('lotno', e.target.value)}
                placeholder="Search..."
              />
            </div>

            {/* FVI Line */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-gray-600">FVI Line:</span>
              <input
                type="text"
                className={`px-2 py-1 text-sm border rounded focus:outline-none focus:ring-1 w-24 ${
                  filters.fvilineno.trim()
                    ? 'border-blue-400 bg-blue-50 text-blue-900 font-medium'
                    : 'border-gray-300 bg-white'
                } ${theme.focusRing}`}
                value={filters.fvilineno}
                onChange={(e) => handleFilterChange('fvilineno', e.target.value)}
                placeholder="Search..."
              />
            </div>

            {/* Clear Button */}
            {(filters.judgment !== 'all' || filters.model !== 'All' || filters.partsite !== 'All' || filters.lotno.trim() || filters.fvilineno.trim()) && (
              <>
                <div className="w-px h-6 bg-gray-300" />
                <button
                  onClick={() => {
                    setFilters({
                      dateStart: inspectionStationService.getTodayDate(),
                      dateEnd: inspectionStationService.getTodayDate(),
                      judgment: 'all',
                      lotno: '',
                      model: 'All',
                      fvilineno: '',
                      partsite: 'All'
                    });
                  }}
                  className="text-xs font-medium text-blue-600 hover:text-blue-800 hover:underline"
                >
                  Clear Filters
                </button>
              </>
            )}
          </div>
        </div>

        {/* Results Table */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
          <div className="bg-gradient-to-r from-slate-100 to-gray-100 px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <h3 className="text-lg font-bold text-gray-800">Inspection Records</h3>
                {records.length > 0 && (
                  <span className="text-sm text-gray-600">
                    {filteredRecords.length === records.length ? (
                      <span>
                        <span className="font-semibold text-gray-800">{records.length.toLocaleString()}</span>
                        <span className="text-gray-600"> total records</span>
                      </span>
                    ) : (
                      <span>
                        <span className="font-semibold text-blue-600">{filteredRecords.length.toLocaleString()}</span>
                        <span className="text-gray-600"> of </span>
                        <span className="font-semibold text-gray-800">{records.length.toLocaleString()}</span>
                        <span className="text-gray-600"> records (filtered)</span>
                      </span>
                    )}
                  </span>
                )}
              </div>
              {/* icon description */}
              <div className="flex items-center space-x-4 text-xs text-gray-600">
                <span className="flex items-center">
                  <PencilIcon className={`h-4 w-4 mr-1 ${theme.iconLegend}`} /> Edit
                </span>
                <span className="flex items-center">
                  <TrashIcon className="h-4 w-4 mr-1 text-red-600" /> Delete
                </span>
                <span className="flex items-center">
                  <DocumentTextIcon className="h-4 w-4 mr-1" /> Details
                </span>
                <span className="flex items-center">
                  <ExclamationTriangleIcon className="h-4 w-4 mr-1 text-orange-600" /> Input Defect
                </span>
                {/* Only show "Generate FVI" legend for OQA station */}
                {config.code === 'OQA' && (
                  <span className="flex items-center">
                    <ClipboardDocumentCheckIcon className="h-4 w-4 mr-1 text-green-600" /> Generate SIV
                  </span>
                )}
 
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
                  <tr key={record.id} className={`hover:bg-gray-50 transition-colors duration-150 ${highlightInspectionNo && record.inspectionNo === highlightInspectionNo ? 'bg-yellow-50 ring-2 ring-inset ring-yellow-300' : ''}`}>
                    <td className="px-6 py-4 text-sm text-gray-600">{indexOfFirstItem + index + 1}</td>
                    <td className="px-6 py-4 text-sm">
                      <div className="font-medium text-gray-900">{record.inspectionNo}</div>
                      {config.code === 'SIV' && (
                        <div className="text-xs text-blue-600 mt-1">{record.inspectionNoRef}</div>
                      )}
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
                        <div className="text-xs text-gray-500 mt-1">{record.partsite} | MC Line No. {record.mclineno}</div>
                      </button>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      <div>{record.itemno}</div>
                      <div className="text-xs text-gray-900 font-medium mt-1">{record.model}</div>
                      {stationKey === 'SIV' && record.color && (
                        <div className="text-xs text-purple-600 font-medium mt-1">
                          🎨 Color: {record.color}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      <div>{record.samplingRound}</div>
                      {record.fvilineno && (
                        <div className="text-xs text-gray-500 mt-1">FVI: {record.fvilineno}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      <div className="space-y-1">
                        <div>FVI: {formatNumber((record.fviLotQty ?? 0).toString())}</div>
                        <div className="flex items-center space-x-2">
                          <span>Gen: {formatNumber((record.generalSamplingQty ?? 0).toString())}</span>
 
                        </div>
                        <div>Crack: {formatNumber((record.crackSamplingQty ?? 0).toString())}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      <div className={`inline-flex items-center space-x-2 px-3 py-1 rounded-full border text-sm font-medium ${getStatusColor(record.judgment)}`}>
                        {getStatusIcon(record.judgment)}
                        <span>{record.judgment || ''}</span>
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
                          {/* Only show "Generate FVI" button for OQA station with Pass judgment */}
                          {config.code === 'OQA' && record.judgment === 'Pass' && !sgtParts.has(record.itemno) && (
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
                <div className="flex items-center space-x-4">
                  <div className="text-sm text-gray-700">
                    Showing <span className="font-medium">{indexOfFirstItem + 1}</span> to{' '}
                    <span className="font-medium">{Math.min(indexOfLastItem, filteredRecords.length)}</span> of{' '}
                    <span className="font-medium">{filteredRecords.length}</span> results
                  </div>
                  <div className="flex items-center space-x-2">
                    <label htmlFor="itemsPerPage" className="text-sm text-gray-600">
                      Per page:
                    </label>
                    <select
                      id="itemsPerPage"
                      value={itemsPerPage}
                      onChange={(e) => {
                        setItemsPerPage(Number(e.target.value));
                        setCurrentPage(1); // Reset to first page when changing items per page
                      }}
                      className="px-3 py-1 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value={25}>25</option>
                      <option value={50}>50</option>
                      <option value={100}>100</option>
                      <option value={200}>200</option>
                      <option value={500}>500</option>
                    </select>
                  </div>
                </div>
                <div className="flex items-center space-x-1">
                  {/* First */}
                  <button
                    onClick={() => handlePageChange(1)}
                    disabled={currentPage === 1}
                    className={`px-3 py-1.5 rounded text-sm font-medium ${
                      currentPage === 1
                        ? 'text-gray-400 cursor-not-allowed'
                        : 'text-gray-700 hover:bg-gray-200 transition-colors duration-200'
                    }`}
                  >
                    First
                  </button>

                  {/* Previous */}
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className={`px-3 py-1.5 rounded text-sm font-medium ${
                      currentPage === 1
                        ? 'text-gray-400 cursor-not-allowed'
                        : 'text-gray-700 hover:bg-gray-200 transition-colors duration-200'
                    }`}
                  >
                    Prev
                  </button>

                  <div className="w-px h-6 bg-gray-300 mx-1" />

                  {/* Page Numbers */}
                  {(() => {
                    const pages: (number | string)[] = [];
                    const maxVisible = 12;

                    if (totalPages <= maxVisible) {
                      // Show all pages
                      for (let i = 1; i <= totalPages; i++) pages.push(i);
                    } else {
                      // Always show first page
                      pages.push(1);

                      if (currentPage > 6) {
                        pages.push('...');
                      }

                      // Pages around current (5 on each side)
                      const start = Math.max(2, currentPage - 4);
                      const end = Math.min(totalPages - 1, currentPage + 4);

                      for (let i = start; i <= end; i++) {
                        if (!pages.includes(i)) pages.push(i);
                      }

                      if (currentPage < totalPages - 5) {
                        pages.push('...');
                      }

                      // Always show last page
                      if (!pages.includes(totalPages)) pages.push(totalPages);
                    }

                    return pages.map((page, idx) => (
                      page === '...' ? (
                        <span key={`ellipsis-${idx}`} className="px-2 py-1.5 text-gray-500">...</span>
                      ) : (
                        <button
                          key={page}
                          onClick={() => handlePageChange(page as number)}
                          className={`px-3 py-1.5 rounded text-sm font-medium transition-colors duration-200 ${
                            currentPage === page
                              ? `${theme.pagination} text-white`
                              : 'text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          {page}
                        </button>
                      )
                    ));
                  })()}

                  <div className="w-px h-6 bg-gray-300 mx-1" />

                  {/* Next */}
                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages || totalPages === 0}
                    className={`px-3 py-1.5 rounded text-sm font-medium ${
                      currentPage === totalPages || totalPages === 0
                        ? 'text-gray-400 cursor-not-allowed'
                        : 'text-gray-700 hover:bg-gray-200 transition-colors duration-200'
                    }`}
                  >
                    Next
                  </button>

                  {/* Last */}
                  <button
                    onClick={() => handlePageChange(totalPages)}
                    disabled={currentPage === totalPages || totalPages === 0}
                    className={`px-3 py-1.5 rounded text-sm font-medium ${
                      currentPage === totalPages || totalPages === 0
                        ? 'text-gray-400 cursor-not-allowed'
                        : 'text-gray-700 hover:bg-gray-200 transition-colors duration-200'
                    }`}
                  >
                    Last
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
                    <span className={`font-semibold ${sivCreationRecord.judgment === 'Pass' ? 'text-green-600' : sivCreationRecord.judgment === 'Reject' ? 'text-red-600' : 'text-gray-600'}`}>
                      {sivCreationRecord.judgment || 'Pending'}
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

export default InspectionStationPage;
