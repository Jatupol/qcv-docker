// client/src/pages/interface/ImportInspectionPage.tsx

import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ChevronLeftIcon, CheckCircleIcon, XCircleIcon, DocumentTextIcon, PhotoIcon, PrinterIcon, ArrowDownTrayIcon, FunnelIcon, CalendarIcon, UserIcon, PencilIcon, TrashIcon, ExclamationTriangleIcon, ChevronRightIcon, ChevronLeftIcon as ChevronLeftIconSolid, ClipboardDocumentCheckIcon, HomeIcon, ArrowUpTrayIcon } from '@heroicons/react/24/outline';
import { inspectionDataService } from '../../services/inspectionDataService';
import { importInspectionService } from '../../services/importInspectionService';
import { formatNumber } from '../../utils';
import { formatDateTime, formatDate } from '../../utils/formatUtils';
import * as XLSX from 'xlsx';
import RecordDetailModal from '../../components/inspection/RecordDetailModal';
import type {
  InspectionRecord,
  FilterOptions,
  ImportProgress
} from '../../types/import-inspection';
import { IMPORT_STATION_CONFIGS } from '../../types/import-inspection';
import { getFiscalYear } from '@qcv/shared';

const inspectorOptions = [''];
const modelOptions = [''];

// ==================== MAIN COMPONENT ====================

const ImportInspectionPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Detect station from URL path using service
  const stationKey = importInspectionService.detectStationFromPath(location.pathname);
  const config = IMPORT_STATION_CONFIGS[stationKey] || IMPORT_STATION_CONFIGS.OQA;
  const theme = config.theme;

  const [records, setRecords] = useState<InspectionRecord[]>([]);
  const [filteredRecords, setFilteredRecords] = useState<InspectionRecord[]>([]);
  const [filters, setFilters] = useState<FilterOptions>({
    dateRange: 'all',
    judgment: 'all',
    inspector: 'All',
    model: 'All'
  });
  const [selectedRecord, setSelectedRecord] = useState<InspectionRecord | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [recordToDelete, setRecordToDelete] = useState<InspectionRecord | null>(null);
  const [importing, setImporting] = useState(false);
  const [importErrors, setImportErrors] = useState<string[]>([]);
  const [showImportModal, setShowImportModal] = useState(false);
  const [importProgress, setImportProgress] = useState<ImportProgress>({ current: 0, total: 0, status: '' });
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch inspection data from API
  useEffect(() => {
    loadInspectionData();
  }, [config.code]);

  const loadInspectionData = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log(`🔄 Fetching ${config.code} inspection data...`);
      const result = await inspectionDataService.getAll({ station: config.code });

      console.log('📋 API Response:', result);

      if (result.success && result.data) {
        const allData = result.data.data || [];
        console.log('📊 All inspection data count:', allData.length);
        console.log('📊 First 3 records:', allData.slice(0, 3));

        const stationData = allData.filter((item: any) => item.station === config.code);
        console.log(`📊 Filtered ${config.code} records:`, stationData.length);

        // Use service to transform data
        const transformedRecords: InspectionRecord[] = stationData.map((item: any) =>
          importInspectionService.transformInspectionData(item)
        );

        console.log('✅ Transformed records:', transformedRecords.length);
        console.log('✅ First transformed record:', transformedRecords[0]);
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
    // Use service to apply filters
    const filtered = importInspectionService.applyFilters(records, filters);
    setFilteredRecords(filtered);
  }, [filters, records]);

  const handleFilterChange = (key: keyof FilterOptions, value: string) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const getStatusColor = (judgment: string) => {
    return importInspectionService.getStatusColor(judgment);
  };

  const getStatusIcon = (judgment: string) => {
    return judgment === 'Pass'
      ? <CheckCircleIcon className="h-5 w-5 text-green-600" />
      : <XCircleIcon className="h-5 w-5 text-red-600" />;
  };

  // Use service to calculate statistics
  const stats = importInspectionService.calculateStatistics(filteredRecords);

  const handleExport = () => {
    console.log('Exporting results:', filteredRecords);
    alert('Export functionality would be implemented here');
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
        alert('Inspection record deleted successfully');
      } else {
        alert('Failed to delete inspection record');
      }
    } catch (err) {
      console.error('Error deleting record:', err);
      alert('Error deleting inspection record');
    }
  };

  const handleInputDefect = (record: InspectionRecord) => {
    console.log('Input defect for record:', record);
    navigate('/inspection/defect/new', {
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
          station: record.station || 'OQA'
        }
      }
    });
  };

  const handleGenerateFVI = async (record: InspectionRecord) => {
    try {
      console.log('🔧 Generating SIV from inspection:', record.id);

      // Show confirmation
      const confirmed = window.confirm(
        `Create SIV inspection from ${config.name} inspection ${record.inspectionNo}?\n\n` +
        `Lot No: ${record.lotno}\n` +
        `Model: ${record.model}\n` +
        `Judgment: ${record.judgment}`
      );

      if (!confirmed) {
        return;
      }

      // Use service to create SIV
      const result = await importInspectionService.createSIV(record.id);

      if (result.success) {
        alert(`✅ SIV Sampling created successfully!\n\nSIV Sampling No: ${result.data?.inspection_no || 'N/A'}`);
      } else {
        alert(`❌ Failed to create SIV inspection:\n${result.message || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('❌ Error creating SIV:', error);
      alert(`❌ Network error: ${error instanceof Error ? error.message : 'Failed to create SIV'}`);
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

  const handleImportClick = () => {
    setShowImportModal(true);
  };

  const handleFileSelect = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setImporting(true);
    setImportErrors([]);
    setImportProgress({ current: 0, total: 0, status: 'Reading file...' });

    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data);
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet);

      console.log('📊 Imported Excel data:', jsonData);

      setImportProgress({ current: 0, total: jsonData.length, status: 'Validating data...' });

      // Helper function to safely convert value to string
      const toString = (value: any): string => {
        if (value === null || value === undefined) return '';
        return String(value).trim();
      };

      // Validate and transform the data
      const errors: string[] = [];
      const validRecords: any[] = [];

      jsonData.forEach((row: any, index: number) => {
        const rowNum = index + 2; // Account for header row

        // Validate required fields
        if (!row.station) {
          errors.push(`Row ${rowNum}: Missing station`);
          return;
        }
        if (!row.inspection_date) {
          errors.push(`Row ${rowNum}: Missing inspection_date`);
          return;
        }
        if (!row.lotno) {
          errors.push(`Row ${rowNum}: Missing lotno`);
          return;
        }

        // Parse date
        let inspectionDate: Date;
        if (typeof row.inspection_date === 'number') {
          // Excel date serial number - convert to JS date
          const excelEpoch = new Date(1899, 11, 30);
          inspectionDate = new Date(excelEpoch.getTime() + row.inspection_date * 86400000);
        } else {
          inspectionDate = new Date(row.inspection_date);
        }

        if (isNaN(inspectionDate.getTime())) {
          errors.push(`Row ${rowNum}: Invalid inspection_date`);
          return;
        }

        // Parse judgment (accept various formats)
        let judgment = false;
        if (typeof row.judgment === 'boolean') {
          judgment = row.judgment;
        } else if (typeof row.judgment === 'string') {
          judgment = row.judgment.toLowerCase() === 'pass' || row.judgment.toLowerCase() === 'true' || row.judgment === '1';
        } else if (typeof row.judgment === 'number') {
          judgment = row.judgment === 1;
        }

        // Generate month_year from inspection_date (YYYYMM format)
        const monthYear = `${inspectionDate.getFullYear()}${(inspectionDate.getMonth() + 1).toString().padStart(2, '0')}`;

        // Calculate fiscal year from inspection date
        const fiscalYear = getFiscalYear(inspectionDate);

        validRecords.push({
          station: toString(row.station).toUpperCase() || config.code,
          inspection_no: '', // Will be auto-generated by backend
          inspection_date: inspectionDate,
          fy: fiscalYear.toString(),
          ww: toString(row.ww),
          month_year: monthYear,
          shift: toString(row.shift),
          lotno: toString(row.lotno),
          partsite: toString(row.partsite),
          mclineno: toString(row.mclineno),
          itemno: toString(row.itemno),
          model: toString(row.model),
          version: toString(row.version),
          fvilineno: toString(row.fvilineno),
          round: parseInt(toString(row.round)) || 1,
          qc_id: parseInt(toString(row.qc_id)) || 1,
          fvi_lot_qty: parseInt(toString(row.fvi_lot_qty)) || 0,
          general_sampling_qty: parseInt(toString(row.general_sampling_qty)) || 0,
          crack_sampling_qty: parseInt(toString(row.crack_sampling_qty)) || 0,
          judgment: judgment,
          grps: toString(row.grps),
          zones: toString(row.zones),
          sampling_reason_id: parseInt(toString(row.sampling_reason_id)) || 0
        });
      });

      if (errors.length > 0) {
        setImportErrors(errors);
        setImporting(false);
        setImportProgress({ current: 0, total: 0, status: '' });
        return;
      }

      // Import the valid records
      console.log('✅ Valid records to import:', validRecords);

      setImportProgress({ current: 0, total: validRecords.length, status: 'Generating inspection numbers...' });

      // Generate unique inspection numbers client-side
      const recordsWithInspectionNo: any[] = [];
      const usedInspectionNos = new Set<string>(); // Track used numbers to prevent duplicates

      for (let i = 0; i < validRecords.length; i++) {
        const record = validRecords[i];

        // Generate unique inspection number
        // Format: Station+YY+MM+WW-DD+UniqueNumber
        const inspDate = record.inspection_date;
        const yy = inspDate.getFullYear().toString().slice(-2);
        const mm = (inspDate.getMonth() + 1).toString().padStart(2, '0');
        const dd = inspDate.getDate().toString().padStart(2, '0');
        const ww = record.ww.toString().padStart(2, '0');

        // Generate unique number - keep trying until we get a unique one
        let inspectionNo = '';
        let attempts = 0;
        do {
          // Use milliseconds since epoch + random + attempt counter for uniqueness
          const now = Date.now();
          const random = Math.floor(Math.random() * 10000);
          const uniqueNum = ((now + random + i + attempts) % 1000000).toString().padStart(6, '0');
          inspectionNo = `${record.station}${yy}${mm}W${ww}-${dd}${uniqueNum}`;
          attempts++;
        } while (usedInspectionNos.has(inspectionNo) && attempts < 10);

        usedInspectionNos.add(inspectionNo);

        recordsWithInspectionNo.push({
          ...record,
          inspection_no: inspectionNo
        });

        // Log less frequently for large imports
        if (i < 10 || (i + 1) % 1000 === 0 || i === validRecords.length - 1) {
          console.log(`✅ Generated inspection_no for record ${i + 1}: ${inspectionNo}`);
        }

        // Update progress
        if ((i + 1) % 100 === 0 || i === validRecords.length - 1) {
          setImportProgress({
            current: i + 1,
            total: validRecords.length,
            status: `Generating numbers... ${i + 1}/${validRecords.length}`
          });
        }
      }

      setImportProgress({ current: 0, total: recordsWithInspectionNo.length, status: 'Importing records...' });

      // Batch import with progress tracking (process in chunks)
      const BATCH_SIZE = 100; // Smaller batch size for stability with large imports
      let successCount = 0;
      let failCount = 0;
      const failedRecords: Array<{ rowNumber: number; record: any; error: string }> = [];

      for (let i = 0; i < recordsWithInspectionNo.length; i += BATCH_SIZE) {
        const batch = recordsWithInspectionNo.slice(i, i + BATCH_SIZE);
        const batchNum = Math.floor(i / BATCH_SIZE) + 1;
        const totalBatches = Math.ceil(recordsWithInspectionNo.length / BATCH_SIZE);
        console.log(`📤 Importing batch ${batchNum}/${totalBatches} (${batch.length} records)`);

        // Add retry logic for the entire batch
        type BatchResult = {
          success: boolean;
          index: number;
          record: any;
          error?: string;
          response?: any;
        };
        let batchResults: BatchResult[] = [];
        let retryCount = 0;
        const maxRetries = 3;

        while (retryCount <= maxRetries) {
          try {
            const batchPromises = batch.map((record, index) =>
              inspectionDataService.create(record)
                .then((response) => {
                  // Check if response actually succeeded
                  if (response.success) {
                    if ((i + index + 1) <= 10 || (i + index + 1) % 1000 === 0) {
                      console.log(`✅ Record ${i + index + 1} saved successfully`);
                    }
                    return { success: true, index: i + index, response, record };
                  } else {
                    // API returned success:false
                    const errorMsg = response.errors?.map(e => e.message).join(', ') || response.message || 'Unknown error';
                    console.error(`❌ Record ${i + index + 1} failed (API error): ${errorMsg}`);
                    return {
                      success: false,
                      index: i + index,
                      record,
                      error: errorMsg
                    };
                  }
                })
                .catch((err) => {
                  console.error(`❌ Record ${i + index + 1} failed (Exception):`, err);
                  const errorMsg = err?.response?.data?.message || err?.message || 'Network or server error';
                  return {
                    success: false,
                    index: i + index,
                    record,
                    error: errorMsg
                  };
                })
            );

            batchResults = await Promise.all(batchPromises);
            break; // Success, exit retry loop

          } catch (batchError) {
            retryCount++;
            if (retryCount > maxRetries) {
              console.error(`❌ Batch ${batchNum} failed after ${maxRetries} retries:`, batchError);
              // Mark all records in this batch as failed
              batchResults = batch.map((record, index) => ({
                success: false,
                index: i + index,
                record,
                error: `Batch failed: ${batchError instanceof Error ? batchError.message : 'Server timeout or network error'}`
              }));
            } else {
              console.warn(`⚠️ Batch ${batchNum} failed, retrying (${retryCount}/${maxRetries})...`);
              await new Promise(resolve => setTimeout(resolve, 1000 * retryCount)); // Progressive delay
            }
          }
        }

        batchResults.forEach((result) => {
          if (result.success) {
            successCount++;
          } else {
            failCount++;
            const rowNumber = result.index + 2; // +2 for Excel row (1 for header, 1 for 0-index)
            errors.push(`Row ${rowNumber}: Failed to import - ${result.error}`);
            failedRecords.push({
              rowNumber,
              record: result.record,
              error: result.error?? '' 
            });
          }
        });

        setImportProgress({
          current: Math.min(i + BATCH_SIZE, recordsWithInspectionNo.length),
          total: recordsWithInspectionNo.length,
          status: `Importing... ${Math.min(i + BATCH_SIZE, recordsWithInspectionNo.length)}/${recordsWithInspectionNo.length}`
        });
      }

      // Generate error log file if there are failed records
      if (failedRecords.length > 0) {
        generateErrorLogFile(failedRecords);
      }

      if (failCount > 0) {
        setImportErrors(errors);
        alert(`⚠️ Imported ${successCount} records with ${failCount} failures. Check errors below.`);
        if (successCount > 0) {
          // Reload data even if some failed
          await loadInspectionData();
        }
      } else {
        alert(`✅ Successfully imported ${successCount} records`);
        setShowImportModal(false);
        setImportProgress({ current: 0, total: 0, status: '' });
        await loadInspectionData();
      }

    } catch (err) {
      console.error('❌ Import error:', err);
      setImportErrors([`Import failed: ${err instanceof Error ? err.message : 'Unknown error'}`]);
    } finally {
      setImporting(false);
      setImportProgress({ current: 0, total: 0, status: '' });
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const downloadTemplate = () => {
    const template = [
      {
        station: config.code,
        inspection_date: '2025-01-15',
        fy: '2025',
        ww: '03',
        shift: 'A',
        lotno: 'LOT001',
        fvilineno: 'FVI001',
        round: 1,
        fvi_lot_qty: 1000,
        general_sampling_qty: 50,
        crack_sampling_qty: 25,
        judgment: '',
        itemno: 'ITEM001',
        model: 'MODEL-X',
        version: 'V1',
        partsite: 'SITE-A',
        mclineno: 'MC001',
        qc_id: 1,
        sampling_reason_id: 0
      }
    ];

    const worksheet = XLSX.utils.json_to_sheet(template);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Template');
    XLSX.writeFile(workbook, `${config.code}_Import_Template.xlsx`);
  };

  const generateErrorLogFile = (failedRecords: Array<{ rowNumber: number; record: any; error: string }>) => {
    try {
      // Create error log content
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const logFileName = `${config.code}_Import_Errors_${timestamp}.txt`;

      let logContent = `Import Error Log\n`;
      logContent += `=================\n`;
      logContent += `Station: ${config.code}\n`;
      logContent += `Date: ${formatDateTime(new Date())}\n`;
      logContent += `Total Failed Records: ${failedRecords.length}\n`;
      logContent += `=================\n\n`;

      failedRecords.forEach((failed, index) => {
        logContent += `\n--- Failed Record ${index + 1} ---\n`;
        logContent += `Excel Row Number: ${failed.rowNumber}\n`;
        logContent += `Error: ${failed.error}\n`;
        logContent += `\nRecord Data:\n`;
        logContent += `  Station: ${failed.record.station}\n`;
        logContent += `  Sampling No: ${failed.record.inspection_no}\n`;
        logContent += `  Sampling Date: ${failed.record.inspection_date}\n`;
        logContent += `  Lot No: ${failed.record.lotno}\n`;
        logContent += `  WW: ${failed.record.ww}\n`;
        logContent += `  Shift: ${failed.record.shift}\n`;
        logContent += `  FVI Line No: ${failed.record.fvilineno}\n`;
        logContent += `  Round: ${failed.record.round}\n`;
        logContent += `  Item No: ${failed.record.itemno}\n`;
        logContent += `  Model: ${failed.record.model}\n`;
        logContent += `  Version: ${failed.record.version}\n`;
        logContent += `  Part Site: ${failed.record.partsite}\n`;
        logContent += `  MC Line No: ${failed.record.mclineno}\n`;
        logContent += `  FVI Lot Qty: ${failed.record.fvi_lot_qty}\n`;
        logContent += `  General Sampling Qty: ${failed.record.general_sampling_qty}\n`;
        logContent += `  Crack Sampling Qty: ${failed.record.crack_sampling_qty}\n`;
        logContent += `  Judgment: ${failed.record.judgment}\n`;
        logContent += `  QC ID: ${failed.record.qc_id}\n`;
        logContent += `\n`;
      });

      // Create and download the log file
      const blob = new Blob([logContent], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = logFileName;
      link.style.display = 'none';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      console.log(`📄 Error log file created: ${logFileName}`);
    } catch (err) {
      console.error('❌ Error creating log file:', err);
    }
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

        {/* Page Header */}
        <div className={`bg-white rounded-2xl shadow-xl border ${theme.headerBorder} overflow-hidden`}>
          <div className={`bg-gradient-to-r ${theme.header} p-6`}>
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
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-white">{config.title}</h1>
                <p className={`${theme.subtitle} mt-1`}>{config.subtitle}</p>
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={handleImportClick}
                  className="bg-white/20 backdrop-blur-sm rounded-xl px-4 py-3 hover:bg-white/30 transition-colors duration-200 flex items-center space-x-2"
                  title="Import from Excel"
                >
                  <ArrowUpTrayIcon className="h-5 w-5 text-white" />
                  <span className="text-white font-medium">Import Excel</span>
                </button>
                <button
                  onClick={handleBackToStation}
                  className="bg-white/20 backdrop-blur-sm rounded-xl px-4 py-3 hover:bg-white/30 transition-colors duration-200 flex items-center space-x-2"
                  title={`Go to ${config.name} Page`}
                >
                  <DocumentTextIcon className="h-5 w-5 text-white" />
                  <span className="text-white font-medium">{config.newButtonLabel}</span>
                </button>
                <button
                  onClick={handlePrint}
                  className="bg-white/20 backdrop-blur-sm rounded-xl p-3 hover:bg-white/30 transition-colors duration-200"
                  title="Print Results"
                >
                  <PrinterIcon className="h-6 w-6 text-white" />
                </button>
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

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
            <div className="bg-gradient-to-r from-gray-100 to-slate-100 px-6 py-4">
              <h3 className="text-lg font-bold text-gray-800">Total Inspections</h3>
            </div>
            <div className="p-6">
              <div className="text-3xl font-bold text-gray-900">{formatNumber(stats.total.toString())}</div>
              <p className="text-sm text-gray-600 mt-1">Records found</p>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
            <div className="bg-gradient-to-r from-green-100 to-emerald-100 px-6 py-4">
              <h3 className="text-lg font-bold text-green-800">Passed</h3>
            </div>
            <div className="p-6">
              <div className="text-3xl font-bold text-green-600">{formatNumber(stats.passed.toString())}</div>
              <p className="text-sm text-gray-600 mt-1">Successful inspections</p>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
            <div className="bg-gradient-to-r from-red-100 to-rose-100 px-6 py-4">
              <h3 className="text-lg font-bold text-red-800">Rejected</h3>
            </div>
            <div className="p-6">
              <div className="text-3xl font-bold text-red-600">{formatNumber(stats.rejected.toString())}</div>
              <p className="text-sm text-gray-600 mt-1">Failed inspections</p>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
            <div className={`bg-gradient-to-r ${theme.passRate} px-6 py-4`}>
              <h3 className={`text-lg font-bold ${theme.passRateHeader}`}>Pass Rate</h3>
            </div>
            <div className="p-6">
              <div className={`text-3xl font-bold ${theme.passRateText}`}>{formatNumber(stats.passRate, 2)}%</div>
              <p className="text-sm text-gray-600 mt-1">Success rate</p>
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
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Date Range
                  </label>
                  <select
                    className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 ${theme.focusRing}`}
                    value={filters.dateRange}
                    onChange={(e) => handleFilterChange('dateRange', e.target.value)}
                  >
                    <option value="today">Today</option>
                    <option value="week">Last 7 Days</option>
                    <option value="month">Last 30 Days</option>
                    <option value="all">All Time</option>
                  </select>
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
                    Inspector
                  </label>
                  <select
                    className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 ${theme.focusRing}`}
                    value={filters.inspector}
                    onChange={(e) => handleFilterChange('inspector', e.target.value)}
                  >
                    {inspectorOptions.map(inspector => (
                      <option key={inspector} value={inspector}>{inspector}</option>
                    ))}
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
                    {modelOptions.map(model => (
                      <option key={model} value={model}>{model}</option>
                    ))}
                  </select>
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
                <span className="flex items-center">
                  <ClipboardDocumentCheckIcon className="h-4 w-4 mr-1 text-green-600" /> Generate FVI
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
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      <div>{record.lotno}</div>
                      <div className="text-xs text-gray-500 mt-1">MC Line No. {record.mclineno}</div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      <div>{record.itemno}</div>
                      <div className="text-xs text-gray-900 font-medium mt-1">{record.model}</div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{record.samplingRound}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      <div className="space-y-1">
                        <div>FVI: {record.fviLotQty.toLocaleString()}</div>
                        <div>Gen: {record.generalSamplingQty}</div>
                        <div>Crack: {record.crackSamplingQty}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className={`inline-flex items-center space-x-2 px-3 py-1 rounded-full border text-sm font-medium ${getStatusColor(record.judgment)}`}>
                        {getStatusIcon(record.judgment)}
                        <span>{record.judgment}</span>
                      </div>
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
                          {record.judgment === 'Pass' && (
                            <button
                              onClick={() => handleGenerateFVI(record)}
                              className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors duration-200"
                              title="Generate FVI"
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
          record={selectedRecord ? {
            id: selectedRecord.id,
            station: selectedRecord.station,
            inspection_no: selectedRecord.inspectionNo,
            inspection_no_ref: selectedRecord.inspectionNoRef,
            inspection_date: selectedRecord.inspectionDate,
            fy: selectedRecord.fy,
            ww: selectedRecord.ww,
            month_year: selectedRecord.month_year,
            shift: selectedRecord.shift,
            lotno: selectedRecord.lotno,
            partsite: selectedRecord.partsite,
            itemno: selectedRecord.itemno,
            model: selectedRecord.model.split(' ')[0] || selectedRecord.model, // Extract model without version
            version: selectedRecord.version,
            fvilineno: selectedRecord.fvilineno,
            mclineno: selectedRecord.mclineno,
            round: selectedRecord.samplingRound,
            qc_id: selectedRecord.qc_id,
            fvi_lot_qty: selectedRecord.fviLotQty,
            general_sampling_qty: selectedRecord.generalSamplingQty,
            crack_sampling_qty: selectedRecord.crackSamplingQty,
            judgment: selectedRecord.judgment === 'Pass',
            created_at: selectedRecord.created_at,
            updated_at: selectedRecord.updated_at,
            created_by: selectedRecord.created_by,
            updated_by: selectedRecord.updated_by
          } : null}
          isOpen={!!selectedRecord}
          onClose={() => setSelectedRecord(null)}
          onPrint={handlePrint}
          theme={theme}
          stationCode={config.code}
        />

        {/* Import Modal */}
        {showImportModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
              <div className={`px-6 py-4 bg-gradient-to-r ${theme.header} rounded-t-2xl`}>
                <div className="flex items-center justify-between">
                  <h3 className="text-2xl font-bold text-white">Import Inspection Data</h3>
                  <button
                    onClick={() => {
                      setShowImportModal(false);
                      setImportErrors([]);
                    }}
                    className="text-white hover:text-gray-200 transition-colors duration-200"
                  >
                    <XCircleIcon className="h-8 w-8" />
                  </button>
                </div>
              </div>

              <div className="p-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Left Column */}


                    {/* Template Download */}
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                      <DocumentTextIcon className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                      <h4 className="font-semibold text-gray-900 mb-2">Step 1: Download Template</h4>
                      <p className="text-sm text-gray-600 mb-4">Get the Excel template with all required columns</p>
                      <button
                        onClick={downloadTemplate}
                        className={`px-6 py-3 bg-gradient-to-r ${theme.modalButton} text-white rounded-lg font-semibold ${theme.modalButtonHover} transition-all duration-200`}
                      >
                        Download Template
                      </button>
                    </div>

                    {/* File Upload */}
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                      <ArrowUpTrayIcon className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                      <h4 className="font-semibold text-gray-900 mb-2">Step 2: Upload Filled Template</h4>
                      <p className="text-sm text-gray-600 mb-4">Select your Excel file to import</p>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept=".xlsx,.xls"
                        onChange={handleFileChange}
                        className="hidden"
                      />
                      <button
                        onClick={handleFileSelect}
                        disabled={importing}
                        className={`px-6 py-3 bg-gradient-to-r ${theme.modalButton} text-white rounded-lg font-semibold ${theme.modalButtonHover} transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed`}
                      >
                        {importing ? 'Importing...' : 'Select File'}
                      </button>

                      {/* Progress Bar */}
                      {importing && importProgress.total > 0 && (
                        <div className="mt-6">
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-sm font-medium text-gray-700">{importProgress.status}</span>
                            <span className="text-sm font-medium text-gray-700">
                              {importProgress.current} / {importProgress.total}
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                            <div
                              className={`bg-gradient-to-r ${theme.modalButton} h-3 rounded-full transition-all duration-300`}
                              style={{
                                width: `${(importProgress.current / importProgress.total) * 100}%`
                              }}
                            />
                          </div>
                          <p className="text-xs text-gray-500 mt-2">
                            {Math.round((importProgress.current / importProgress.total) * 100)}% Complete
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Right Column */}
                  <div className="space-y-6">
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <h4 className="font-semibold text-blue-900 mb-2">Import Instructions</h4>
                      <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
                        <li>Download the template to see the required format</li>
                        <li>Fill in all required fields: station, inspection_date, lotno, fy, ww</li>
                        <li>Use date format YYYY-MM-DD for inspection_date</li>
                        <li>fy (Fiscal Year) will be auto-calculated if left blank</li>
                        <li>Judgment can be: Pass, Reject, true, false, 1, or 0</li>
                        <li>Ensure all numeric fields contain valid numbers</li>
                      </ul>
                    </div>

                  <div className="space-y-6">
                    {/* Column Reference */}
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                      <h4 className="font-semibold text-gray-900 mb-3">Template Columns</h4>
                      <div className="mb-3">
                        <p className="text-xs font-semibold text-gray-600 mb-1">Required:</p>
                        <div className="grid grid-cols-2 gap-1 text-sm text-gray-700">
                          <div>• station</div>
                          <div>• inspection_date</div>
                          <div>• lotno</div>
                        </div>
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-gray-600 mb-1">Optional:</p>
                        <div className="grid grid-cols-2 gap-1 text-sm text-gray-700">
                          <div>• ww</div>
                          <div>• shift</div>
                          <div>• fvilineno</div>
                          <div>• round</div>
                          <div>• fvi_lot_qty</div>
                          <div>• general_sampling_qty</div>
                          <div>• crack_sampling_qty</div>
                          <div>• judgment</div>
                          <div>• itemno</div>
                          <div>• model</div>
                          <div>• version</div>
                          <div>• partsite</div>
                          <div>• mclineno</div>
                          <div>• qc_id</div>
                        </div>
                      </div>
                      <p className="text-xs text-gray-500 mt-3 italic">
                        Note: inspection_no will be automatically generated during import
                      </p>
                    </div>

                    {/* Import Errors */}
                    {importErrors.length > 0 && (
                      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                        <h4 className="font-semibold text-red-900 mb-2 flex items-center">
                          <ExclamationTriangleIcon className="h-5 w-5 mr-2" />
                          Import Errors
                        </h4>
                        <ul className="text-sm text-red-800 space-y-1 max-h-64 overflow-y-auto">
                          {importErrors.map((error, index) => (
                            <li key={index} className="flex items-start">
                              <span className="mr-2">•</span>
                              <span>{error}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

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
        </>
        )}
      </div>
    </div>
  );
};

export default ImportInspectionPage;
