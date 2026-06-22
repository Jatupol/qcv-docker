// client/src/pages/inspection/IQAPage.tsx
// IQA Data Import and Management Page

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowUpTrayIcon,
  ArrowDownTrayIcon,
  DocumentTextIcon,
  TrashIcon,
  HomeIcon,
  ChevronRightIcon,
  ChevronLeftIcon,
  XCircleIcon,
  CheckCircleIcon,
  TableCellsIcon,
  XMarkIcon,
  ExclamationTriangleIcon,
  CameraIcon,
  PlusIcon,
  EyeIcon
} from '@heroicons/react/24/outline';
import { defectService, type Defect } from '../../services/defectService';
import { formatNumber, formatDate } from '../../utils';
import { getTodayDateString } from '../../utils/formatUtils';
import { useSound } from '../../hooks/useSoundNotification';

// Import types and services
import type { IQAData} from '../../types/iqa';
import {
  iqaService,
  parseExcelFile,
  exportToExcel,
  IQA_PRIMARY_FIELDS
} from '../../services/iqaService';
import { getRuntimeEnv } from '../../config/runtimeConfig';

const API_BASE = getRuntimeEnv('VITE_API_BASE_URL') ?? '';

// ==================== MAIN COMPONENT ====================

const IQAPage: React.FC = () => {
  const navigate = useNavigate();
  const sound = useSound();
  const [records, setRecords] = useState<IQAData[]>([]);
  const [filteredRecords, setFilteredRecords] = useState<IQAData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [importing, setImporting] = useState(false);
  // Filter mode: 'dateRange' (default) or 'fiscalWeek'
  const [filterMode, setFilterMode] = useState<'dateRange' | 'fiscalWeek'>('dateRange');
  const [filterFY, setFilterFY] = useState<string>('');
  const [filterWW, setFilterWW] = useState<string>('');
  const [filterLot, setFilterLot] = useState<string>('');
  const [filterRejStatus, setFilterRejStatus] = useState<string>('all'); // all, hasRej, noRej

  const [filterDateFrom, setFilterDateFrom] = useState<string>(getTodayDateString());
  const [filterDateTo, setFilterDateTo] = useState<string>(getTodayDateString());
  const [fyOptions, setFyOptions] = useState<string[]>([]);
  const [wwOptions, setWwOptions] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(50);
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [deleting, setDeleting] = useState(false);
  const [sortField, setSortField] = useState<keyof IQAData | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  // Defect Modal State
  const [showDefectModal, setShowDefectModal] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<IQAData | null>(null);
  const [defectDescription, setDefectDescription] = useState('');
  const [defectImages, setDefectImages] = useState<File[]>([]);
  const [defectImagePreviews, setDefectImagePreviews] = useState<string[]>([]);
  const [submittingDefect, setSubmittingDefect] = useState(false);
  const [defects, setDefects] = useState<Defect[]>([]);
  const [selectedDefectId, setSelectedDefectId] = useState<number | null>(null);
  const [loadingDefects, setLoadingDefects] = useState(false);
  const [savedDefectData, setSavedDefectData] = useState<any[]>([]);
  const [loadingSavedDefects, setLoadingSavedDefects] = useState(false);
  const [modalSuccess, setModalSuccess] = useState<string | null>(null);

  // Detail Modal State
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [detailRecord, setDetailRecord] = useState<IQAData | null>(null);

  // Confirmation Modal State
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState<number | null>(null);
  const [showBulkDeleteConfirm, setShowBulkDeleteConfirm] = useState(false);

  // Load existing data, FY and WW options
  useEffect(() => {
    loadData();
    loadFYOptions();
    loadWWOptions();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log('Fetching IQA data...');

      const result = await iqaService.getAll();
      console.log('API Response:', result);

      if (result.success && result.data) {
        console.log('Loaded records:', result.data.length);

        setRecords(result.data);
        setFilteredRecords(result.data);

        if (result.data.length === 0) {
          sound.playInfo();
          setError('No IQA records found. Import an Excel file to get started.');
        }
      } else {
        console.error('API returned error:', result.message);
        sound.playError();
        setError(result.message || 'Failed to load data');
      }
    } catch (err) {
      console.error('Error loading IQA data:', err);
      sound.playError();
      setError(`Failed to load data: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const loadFYOptions = async () => {
    try {
      const result = await iqaService.getDistinctFY();

      if (result.success && Array.isArray(result.data)) {
        console.log('🔍 FY Options loaded:', result.data);
        setFyOptions(result.data);
      }
    } catch (err) {
      console.error('Error loading FY options:', err);
    }
  };

  const loadWWOptions = async (fy?: string) => {
    try {
      const result = await iqaService.getDistinctWW(fy);

      if (result.success && Array.isArray(result.data)) {
        console.log('🔍 WW Options loaded:', result.data);
        setWwOptions(result.data);
      }
    } catch (err) {
      console.error('Error loading WW options:', err);
    }
  };

  // Load WW options when FY filter changes
  useEffect(() => {
    if (filterFY) {
      // Load WW options filtered by FY
      loadWWOptions(filterFY);
      // Reset current WW selection when FY changes
      setFilterWW('');
    } else {
      // Load all WW options when no FY is selected
      loadWWOptions();
    }
  }, [filterFY]);

  // Apply filters and sorting
  useEffect(() => {
    let filtered = [...records];

    console.log('🔍 IQA Filter Debug - Total records:', records.length);
    console.log('🔍 IQA Filter Debug - Filter Mode:', filterMode);
    console.log('🔍 IQA Filter Debug - Filters:', { filterFY, filterWW, filterLot, filterRejStatus, filterDateFrom, filterDateTo });

    // Apply FY/WW filters only when in fiscalWeek mode
    if (filterMode === 'fiscalWeek') {
      // Filter by FY if selected
      if (filterFY) {
        console.log('🔍 Filtering by FY:', filterFY);
        const beforeCount = filtered.length;
        filtered = filtered.filter(record => {
          const match = String(record.fy) === String(filterFY);
          if (!match && filtered.length < 5) {
            console.log('🔍 FY mismatch - record.fy:', record.fy, 'filterFY:', filterFY, 'types:', typeof record.fy, typeof filterFY);
          }
          return match;
        });
        console.log('🔍 After FY filter:', beforeCount, '->', filtered.length);
      }

      // Filter by WW if selected
      if (filterWW) {
        console.log('🔍 Filtering by WW:', filterWW);
        const beforeCount = filtered.length;
        filtered = filtered.filter(record => {
          const match = String(record.ww) === String(filterWW);
          if (!match && filtered.length < 5) {
            console.log('🔍 WW mismatch - record.ww:', record.ww, 'filterWW:', filterWW, 'types:', typeof record.ww, typeof filterWW);
          }
          return match;
        });
        console.log('🔍 After WW filter:', beforeCount, '->', filtered.length);
      }
    }

    // Filter by Lot Number if provided
    if (filterLot && filterLot.trim()) {
      const beforeCount = filtered.length;
      const searchLot = filterLot.trim().toLowerCase();
      filtered = filtered.filter(record => {
        return record.lotno && record.lotno.toLowerCase().includes(searchLot);
      });
      console.log('🔍 After Lot filter:', beforeCount, '->', filtered.length);
    }

    // Filter by Rej Status if selected
    if (filterRejStatus !== 'all') {
      const beforeCount = filtered.length;
      filtered = filtered.filter(record => {
        if (filterRejStatus === 'hasRej') {
          return record.rej && record.rej > 0;
        } else if (filterRejStatus === 'noRej') {
          return !record.rej || record.rej === 0;
        }
        return true;
      });
      console.log('🔍 After Rej Status filter:', beforeCount, '->', filtered.length);
    }

    // Apply Date Range filter only when in dateRange mode
    if (filterMode === 'dateRange') {
      if (filterDateFrom || filterDateTo) {
        const beforeCount = filtered.length;
        filtered = filtered.filter(record => {
          if (!record.date_iqa) return false;

          // Parse record date (YYYY-MM-DD format) directly as string comparison works for ISO dates
          const recordDateStr = record.date_iqa;

          if (filterDateFrom) {
            // String comparison works for YYYY-MM-DD format
            if (recordDateStr < filterDateFrom) return false;
          }

          if (filterDateTo) {
            // String comparison works for YYYY-MM-DD format
            if (recordDateStr > filterDateTo) return false;
          }

          return true;
        });
        console.log('🔍 After Date range filter:', beforeCount, '->', filtered.length);
      }
    }

    // Apply sorting
    if (sortField) {
      filtered.sort((a, b) => {
        const aVal = a[sortField];
        const bVal = b[sortField];

        // Handle null/undefined values
        if (aVal === null || aVal === undefined) return sortDirection === 'asc' ? 1 : -1;
        if (bVal === null || bVal === undefined) return sortDirection === 'asc' ? -1 : 1;

        // Compare values
        if (typeof aVal === 'number' && typeof bVal === 'number') {
          return sortDirection === 'asc' ? aVal - bVal : bVal - aVal;
        }

        // String comparison
        const aStr = String(aVal).toLowerCase();
        const bStr = String(bVal).toLowerCase();

        if (sortDirection === 'asc') {
          return aStr.localeCompare(bStr);
        } else {
          return bStr.localeCompare(aStr);
        }
      });
    }

    setFilteredRecords(filtered);
    setCurrentPage(1); // Reset to first page when filters change
  }, [records, filterMode, filterFY, filterWW, filterLot, filterRejStatus, filterDateFrom, filterDateTo, sortField, sortDirection]);

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredRecords.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredRecords.length / itemsPerPage);

  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const clearFilters = () => {
    setFilterMode('dateRange');
    setFilterFY('');
    setFilterWW('');
    setFilterLot('');
    setFilterRejStatus('all');
    setFilterDateFrom(getTodayDateString());
    setFilterDateTo(getTodayDateString());
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setImporting(true);
      setError(null);
      setSuccess(null);

      // Parse Excel file using service
      const parseResult = await parseExcelFile(file);
      const { validRecords, skippedRows, totalRows } = parseResult;

      console.log(`📊 Import Summary: Total=${totalRows}, Valid=${validRecords.length}, Skipped=${skippedRows.length}`);
      console.log('📝 First valid record:', validRecords[0]);
      console.log('ℹ️ Primary Fields (Unique Constraint): FY, WW, FW, Date IQA, MODEL, Lot No, LOCATIONS, SUPPLIER DO, AGE, Expense');

      // Show warning if rows were skipped
      if (skippedRows.length > 0) {
        const skippedDetails = skippedRows.slice(0, 5).map(row =>
          `Row ${row.row} (Lot: ${row.lotno}): Missing ${row.missingFields.join(', ')}`
        ).join('\n');

        const moreCount = skippedRows.length > 5 ? ` ... and ${skippedRows.length - 5} more` : '';

        console.warn(`⚠️ Skipped ${skippedRows.length} row(s):\n${skippedDetails}${moreCount}`);
      }

      // Check if there are any valid records to import
      if (validRecords.length === 0) {
        sound.playWarning();
        setError(`No valid records to import. All ${totalRows} rows are missing required fields. Check console for details.`);
        setImporting(false);
        event.target.value = '';
        return;
      }

      // Import using service
      console.log('🔄 Sending bulk import request with', validRecords.length, 'records');
      const result = await iqaService.bulkImport(validRecords);
      console.log('📥 Bulk import result:', result);

      if (result.success && result.data) {
        // Display results from upsert operation
        const total = result.data.total || validRecords.length;
        const imported = result.data.imported || 0;
        const failed = result.data.failed || 0;
        const unchanged = result.data.unchanged || 0;
        const details = result.data.details || {};
        const inserted = details.inserted || 0;
        const updated = details.updated || 0;
        const duplicates = details.duplicates || [];

        // Build detailed success message
        const parts: string[] = [];
        parts.push(`Total rows in Excel: ${totalRows}`);
        parts.push(`Valid records: ${validRecords.length}`);

        if (skippedRows.length > 0) {
          parts.push(`Skipped (missing fields): ${skippedRows.length}`);
        }

        parts.push(`\nImport Results:`);
        if (inserted > 0) {
          parts.push(`  • ${inserted} new record(s) inserted`);
        }

        if (updated > 0) {
          parts.push(`  • ${updated} record(s) updated`);
        }

        if (unchanged > 0) {
          parts.push(`  • ${unchanged} duplicate(s) (unchanged)`);
          if (duplicates.length > 0) {
            const dupDetails = duplicates.slice(0, 3).map(d =>
              `    - Lot: ${d.lotno}, Model: ${d.model}, Date: ${d.date_iqa}`
            ).join('\n');
            const moreDups = duplicates.length > 3 ? `\n    ... and ${duplicates.length - 3} more` : '';
            parts.push(`\n  Duplicate lots:\n${dupDetails}${moreDups}`);
          }
        }

        if (failed > 0) {
          parts.push(`  • ${failed} failed`);
        }

        // Show skipped rows details
        if (skippedRows.length > 0) {
          const skippedDetails = skippedRows.slice(0, 3).map(row =>
            `    - Row ${row.row}, Lot: ${row.lotno} (Missing: ${row.missingFields.join(', ')})`
          ).join('\n');
          const moreSkipped = skippedRows.length > 3 ? `\n    ... and ${skippedRows.length - 3} more` : '';
          parts.push(`\n  Skipped rows:\n${skippedDetails}${moreSkipped}`);
        }

        const successMessage = parts.join('\n');

        sound.playSuccess();
        setSuccess(successMessage);
        loadData();
        loadFYOptions(); // Reload FY options after import
        loadWWOptions(); // Reload WW options after import
      } else {
        console.error('Import failed:', result);
        sound.playError();
        setError(result.message || 'Import failed');
      }
    } catch (err) {
      console.error('Error importing file:', err);
      sound.playError();
      setError(err instanceof Error ? err.message : 'Failed to import Excel file');
    } finally {
      setImporting(false);
      event.target.value = '';
    }
  };

  const handleDeleteClick = (id: number) => {
    setDeleteTargetId(id);
    setShowDeleteConfirm(true);
  };

  const handleDelete = async () => {
    if (!deleteTargetId) return;

    try {
      const id = deleteTargetId;
      const result = await iqaService.delete(id);

      if (result.success) {
        sound.playDelete();
        setSuccess('Record deleted successfully');
        setShowDeleteConfirm(false);
        setDeleteTargetId(null);
        loadData();
        loadFYOptions();
        loadWWOptions();
      } else {
        sound.playError();
        setError(`❌ Failed to delete record: ${result.message || 'Unknown error'}`);
        console.error('Delete failed:', result.message);
        setShowDeleteConfirm(false);
        setDeleteTargetId(null);
      }
    } catch (err) {
      console.error('Error deleting record:', err);
      sound.playError();
      setError('❌ An error occurred while deleting the record. Please try again.');
      setShowDeleteConfirm(false);
      setDeleteTargetId(null);
    }
  };

  const handleBulkDeleteClick = () => {
    if (selectedIds.size === 0) {
      sound.playWarning();
      setError('Please select at least one record to delete');
      return;
    }
    setShowBulkDeleteConfirm(true);
  };

  const handleBulkDelete = async () => {
    try {
      setDeleting(true);
      setError(null);

      const ids = Array.from(selectedIds);
      const result = await iqaService.bulkDelete(ids);

      if (result.success) {
        sound.playDelete();
        setSuccess(`Successfully deleted ${ids.length} record(s)`);
        setSelectedIds(new Set());
        setShowBulkDeleteConfirm(false);
        loadData();
        loadFYOptions();
        loadWWOptions();
      } else {
        sound.playError();
        setError(result.message || 'Failed to delete selected records');
        setShowBulkDeleteConfirm(false);
      }
    } catch (err) {
      console.error('Error bulk deleting records:', err);
      sound.playError();
      setError('Failed to delete selected records');
      setShowBulkDeleteConfirm(false);
    } finally {
      setDeleting(false);
    }
  };

  const handleSelectAll = () => {
    if (selectedIds.size === currentItems.length) {
      setSelectedIds(new Set());
    } else {
      const allIds = new Set(currentItems.map(r => r.id).filter((id): id is number => id !== undefined));
      setSelectedIds(allIds);
    }
  };

  const handleSelectOne = (id: number) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
  };

  const handleSort = (field: keyof IQAData) => {
    if (sortField === field) {
      // Toggle direction if same field
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      // New field, default to ascending
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const getSortIcon = (field: keyof IQAData) => {
    if (sortField !== field) return null;
    return sortDirection === 'asc' ? ' ▲' : ' ▼';
  };

  const handleExport = () => {
    try {
      // Export data using service
      exportToExcel(filteredRecords, 'IQA_Data');

      sound.playSuccess();
      setSuccess(`Exported ${filteredRecords.length} records successfully`);
    } catch (err) {
      console.error('Error exporting data:', err);
      sound.playError();
      setError('Failed to export data');
    }
  };

  const handleGoHome = () => {
    navigate('/');
  };

  const handleDownloadTemplate = () => {
    // Download template file from public folder
    const link = document.createElement('a');
    link.href = '/documents/IQA_Template.xlsx';
    link.download = 'IQA_Template.xlsx';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    sound.playSelect();
  };

  // Load defects from API
  const loadDefects = async () => {
    try {
      setLoadingDefects(true);
      console.log('🔍 IQAPage - Loading defects...');

      const result = await defectService.get({ isActive: true });

      console.log('🔍 IQAPage - Defects result:', result);
      console.log('🔍 IQAPage - Result success:', result.success);
      console.log('🔍 IQAPage - Result data:', result.data);
      console.log('🔍 IQAPage - Data type:', typeof result.data);
      console.log('🔍 IQAPage - Data is array:', Array.isArray(result.data));

      if (result.success && result.data) {
        console.log('🔍 IQAPage - Setting defects, count:', result.data.length);
        setDefects(result.data);
      } else {
        console.error('❌ IQAPage - Failed to load defects:', result.message);
        sound.playError();
        setError('Failed to load defect types');
      }
    } catch (err) {
      console.error('❌ IQAPage - Error loading defects:', err);
      sound.playError();
      setError('Error loading defect types');
    } finally {
      setLoadingDefects(false);
    }
  };

  // Load saved defect data for the selected IQA record
  const loadSavedDefectData = async (iqaId: number) => {
    try {
      setLoadingSavedDefects(true);
      console.log('🔍 IQAPage - Loading saved defect data for IQA ID:', iqaId);

      const result = await iqaService.getSavedDefectData(iqaId);

      if (result.success && result.data) {
        console.log('🔍 IQAPage - Loaded saved defect data:', result.data);
        setSavedDefectData(result.data);
      } else {
        console.error('❌ IQAPage - Failed to load saved defect data:', result.message);
        setSavedDefectData([]);
      }
    } catch (err) {
      console.error('❌ IQAPage - Error loading saved defect data:', err);
      setSavedDefectData([]);
    } finally {
      setLoadingSavedDefects(false);
    }
  };

  // Defect Modal Handlers
  const openDefectModal = async (record: IQAData) => {
    setSelectedRecord(record);
    setShowDefectModal(true);
    setDefectDescription('');
    setDefectImages([]);
    setDefectImagePreviews([]);
    setSelectedDefectId(null);
    setSavedDefectData([]);
    setModalSuccess(null);
    setError(null);

    // Load defects when modal opens
    await loadDefects();

    // Load saved defect data if record has an ID
    if (record.id) {
      await loadSavedDefectData(record.id);
    }
  };

  const closeDefectModal = () => {
    setShowDefectModal(false);
    setSelectedRecord(null);
    setDefectDescription('');
    setDefectImages([]);
    setDefectImagePreviews([]);
    setSelectedDefectId(null);
    setDefects([]);
    setSavedDefectData([]);
    setModalSuccess(null);
    setError(null);
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    const newFiles = Array.from(files);
    const newPreviews: string[] = [];

    newFiles.forEach(file => {
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          newPreviews.push(e.target.result as string);
          if (newPreviews.length === newFiles.length) {
            setDefectImagePreviews(prev => [...prev, ...newPreviews]);
          }
        }
      };
      reader.readAsDataURL(file);
    });

    setDefectImages(prev => [...prev, ...newFiles]);
  };

  const removeImage = (index: number) => {
    setDefectImages(prev => prev.filter((_, i) => i !== index));
    setDefectImagePreviews(prev => prev.filter((_, i) => i !== index));
  };

  // Detail Modal Handlers
  const openDetailModal = (record: IQAData) => {
    setDetailRecord(record);
    setShowDetailModal(true);
  };

  const closeDetailModal = () => {
    setShowDetailModal(false);
    setDetailRecord(null);
  };

  const handleSubmitDefect = async () => {
    if (!selectedRecord?.id) {
      sound.playWarning();
      setError('No record selected');
      return;
    }

    if (!selectedDefectId) {
      sound.playWarning();
      setError('Please select a defect type');
      return;
    }

    if (defectImages.length === 0) {
      sound.playWarning();
      setError('Please upload at least one defect image');
      return;
    }

    try {
      setSubmittingDefect(true);
      setError(null);

      console.log('Submitting defect data:', {
        defect_id: selectedDefectId,
        defect_description: defectDescription,
        image_count: defectImages.length
      });

      const result = await iqaService.submitBulkDefect(
        selectedDefectId,
        defectDescription,
        selectedRecord.id,
        defectImages
      );

      if (result.success) {
        sound.playSuccess();
        // Show success message in modal
        setModalSuccess(`Successfully uploaded ${defectImages.length} defect image(s)! You can add more or close this window.`);

        // Clear error if any
        setError(null);

        // Clear form fields
        setDefectDescription('');
        setDefectImages([]);
        setDefectImagePreviews([]);
        setSelectedDefectId(null);

        // Reload saved defect data to show the newly added defects
        if (selectedRecord?.id) {
          await loadSavedDefectData(selectedRecord.id);
        }

        // Auto-hide success message after 5 seconds
        setTimeout(() => {
          setModalSuccess(null);
        }, 5000);
      } else {
        sound.playError();
        setError(result.message || 'Failed to upload defect images');
        setModalSuccess(null);
      }
    } catch (err) {
      console.error('Error submitting defect:', err);
      sound.playError();
      setError('Failed to submit defect data');
    } finally {
      setSubmittingDefect(false);
    }
  };

  return (
    <div className="flex-1 -mx-6 -my-8 bg-gradient-to-br from-purple-50 via-pink-50 to-indigo-50 p-6">
      <div className="space-y-8">

        {/* Breadcrumb */}
        <div className="bg-white rounded-xl shadow-md border border-gray-200 px-6 py-3">
          <nav className="flex items-center space-x-2 text-sm">
            <button
              onClick={handleGoHome}
              className="flex items-center text-gray-600 hover:text-purple-600 transition-colors duration-200"
            >
              <HomeIcon className="h-4 w-4 mr-1" />
              Home
            </button>
            <ChevronRightIcon className="h-4 w-4 text-gray-400" />
            <span className="text-purple-600 font-semibold">IQA Data Management</span>
          </nav>
        </div>

        {/* Page Header */}
        <div className="bg-white rounded-2xl shadow-xl border border-purple-100 overflow-hidden">
          <div className="bg-gradient-to-r from-purple-600 via-pink-600 to-indigo-600 p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="bg-white/20 backdrop-blur-sm rounded-xl p-3">
                  <TableCellsIcon className="h-10 w-10 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-white">IQA Data Management</h1>
                  <p className="text-purple-100 mt-1">Import and manage IQA inspection data</p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <div className="text-right">
                  <div className="text-white font-bold text-2xl">{formatNumber(records.length.toString())}</div>
                  <div className="text-purple-100 text-sm">Total Records</div>
                </div>
                <div className="text-right">
                  <div className="text-white font-bold text-2xl">{formatNumber(filteredRecords.length.toString())}</div>
                  <div className="text-purple-100 text-sm">Filtered Records</div>
                </div>
                <button
                  onClick={handleExport}
                  disabled={filteredRecords.length === 0}
                  className="bg-green-500/20 backdrop-blur-sm rounded-xl px-4 py-3 hover:bg-green-500/30 transition-colors duration-200 flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ArrowDownTrayIcon className="h-6 w-6 text-white" />
                  <span className="text-white font-medium">Export</span>
                </button>
                <button
                  onClick={handleDownloadTemplate}
                  className="bg-blue-500/20 backdrop-blur-sm rounded-xl px-4 py-3 hover:bg-blue-500/30 transition-colors duration-200 flex items-center space-x-2"
                  title="Download IQA Template Excel file"
                >
                  <DocumentTextIcon className="h-6 w-6 text-white" />
                  <span className="text-white font-medium">Template</span>
                </button>
                <label className="bg-white/20 backdrop-blur-sm rounded-xl px-4 py-3 hover:bg-white/30 transition-colors duration-200 flex items-center space-x-2 cursor-pointer">
                  <ArrowUpTrayIcon className="h-6 w-6 text-white" />
                  <span className="text-white font-medium">Import</span>
                  <input
                    type="file"
                    accept=".xlsx,.xls"
                    onChange={handleFileUpload}
                    className="hidden"
                    disabled={importing}
                  />
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Alerts */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start space-x-3">
            <XCircleIcon className="h-6 w-6 text-red-600 flex-shrink-0 mt-1" />
            <div className="flex-1">
              <p className="text-red-900 font-medium">Error</p>
              <pre className="text-red-700 text-sm whitespace-pre-line font-sans">{error}</pre>
            </div>
            <button onClick={() => setError(null)} className="ml-auto text-red-600 hover:text-red-800 flex-shrink-0">
              <XMarkIcon className="h-5 w-5" />
            </button>
          </div>
        )}

        {success && (
          <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-start space-x-3">
            <CheckCircleIcon className="h-6 w-6 text-green-600 flex-shrink-0 mt-1" />
            <div className="flex-1">
              <p className="text-green-900 font-medium">Success</p>
              <pre className="text-green-700 text-sm whitespace-pre-line font-sans">{success}</pre>
            </div>
            <button onClick={() => setSuccess(null)} className="ml-auto text-green-600 hover:text-green-800 flex-shrink-0">
              <XMarkIcon className="h-5 w-5" />
            </button>
          </div>
        )}

        {importing && (
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-center space-x-3">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
            <p className="text-blue-900 font-medium">Importing data...</p>
          </div>
        )}

        {/* Primary Fields Note - Compact */}
        <div className="bg-amber-50 border border-amber-200 rounded-lg px-4 py-2">
          <div className="flex items-center flex-wrap gap-x-3 gap-y-1">
            <div className="flex items-center space-x-2">
              <ExclamationTriangleIcon className="h-4 w-4 text-amber-600 flex-shrink-0" />
              <span className="text-amber-900 font-semibold text-sm">Required Fields:</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {IQA_PRIMARY_FIELDS.map((field, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-200 text-yellow-800"
                >
                  {field}
                </span>
              ))}
            </div>
            <span className="text-amber-700 text-xs">(FY/WW auto-calculated from Date)</span>
          </div>
        </div>

        {/* Filter Section - Compact */}
        <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden px-4 py-3">
          <div className="flex flex-wrap items-center gap-3">
            {/* Filter Label & Clear */}
            <div className="flex items-center space-x-2">
              <svg className="h-4 w-4 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
              </svg>
              <span className="text-sm font-semibold text-gray-800">Filters</span>
            </div>

            {/* Divider */}
            <div className="h-6 w-px bg-gray-300"></div>

            {/* Date Filter Mode Toggle - Inline */}
            <div className="flex items-center space-x-3">
              <label className="inline-flex items-center cursor-pointer">
                <input
                  type="radio"
                  name="filterMode"
                  value="dateRange"
                  checked={filterMode === 'dateRange'}
                  onChange={() => setFilterMode('dateRange')}
                  className="w-3.5 h-3.5 text-purple-600 border-gray-300 focus:ring-purple-500"
                />
                <span className={`ml-1.5 text-xs font-medium ${filterMode === 'dateRange' ? 'text-purple-700' : 'text-gray-500'}`}>
                  Date Range
                </span>
              </label>
              <label className="inline-flex items-center cursor-pointer">
                <input
                  type="radio"
                  name="filterMode"
                  value="fiscalWeek"
                  checked={filterMode === 'fiscalWeek'}
                  onChange={() => setFilterMode('fiscalWeek')}
                  className="w-3.5 h-3.5 text-purple-600 border-gray-300 focus:ring-purple-500"
                />
                <span className={`ml-1.5 text-xs font-medium ${filterMode === 'fiscalWeek' ? 'text-purple-700' : 'text-gray-500'}`}>
                  FY/WW
                </span>
              </label>
            </div>

            {/* Divider */}
            <div className="h-6 w-px bg-gray-300"></div>

            {/* Date Range Filters - shown when filterMode is 'dateRange' */}
            {filterMode === 'dateRange' && (
              <div className="flex items-center space-x-1.5">
                <span className="text-xs text-gray-600">Date:</span>
                <input
                  type="date"
                  value={filterDateFrom}
                  onChange={(e) => setFilterDateFrom(e.target.value)}
                  className={`px-2 py-1 text-sm border rounded focus:outline-none focus:ring-1 focus:ring-purple-500 ${filterDateFrom ? 'border-purple-400 bg-purple-50' : 'border-gray-300'}`}
                  style={{ width: '130px' }}
                />
                <span className="text-gray-400">-</span>
                <input
                  type="date"
                  value={filterDateTo}
                  onChange={(e) => setFilterDateTo(e.target.value)}
                  className={`px-2 py-1 text-sm border rounded focus:outline-none focus:ring-1 focus:ring-purple-500 ${filterDateTo ? 'border-purple-400 bg-purple-50' : 'border-gray-300'}`}
                  style={{ width: '130px' }}
                />
              </div>
            )}

            {/* Fiscal Year & WW Filters - shown when filterMode is 'fiscalWeek' */}
            {filterMode === 'fiscalWeek' && (
              <div className="flex items-center space-x-2">
                <select
                  value={filterFY}
                  onChange={(e) => setFilterFY(e.target.value)}
                  className={`px-2 py-1 text-sm border rounded focus:outline-none focus:ring-1 focus:ring-purple-500 ${filterFY ? 'border-purple-400 bg-purple-50' : 'border-gray-300'}`}
                  style={{ width: '100px' }}
                >
                  <option value="">All FY</option>
                  {fyOptions.map((fy) => (
                    <option key={fy} value={fy}>FY {fy}</option>
                  ))}
                </select>
                <select
                  value={filterWW}
                  onChange={(e) => setFilterWW(e.target.value)}
                  className={`px-2 py-1 text-sm border rounded focus:outline-none focus:ring-1 focus:ring-purple-500 ${filterWW ? 'border-purple-400 bg-purple-50' : 'border-gray-300'}`}
                  style={{ width: '100px' }}
                >
                  <option value="">All WW</option>
                  {wwOptions.map((ww) => (
                    <option key={ww} value={ww}>WW {ww}</option>
                  ))}
                </select>
              </div>
            )}

            {/* Divider */}
            <div className="h-6 w-px bg-gray-300"></div>

            {/* Lot Number Filter - always visible */}
            <div className="flex items-center space-x-1.5">
              <span className="text-xs text-gray-600">Lot:</span>
              <input
                type="text"
                placeholder="Search..."
                value={filterLot}
                onChange={(e) => setFilterLot(e.target.value)}
                className={`px-2 py-1 text-sm border rounded focus:outline-none focus:ring-1 focus:ring-purple-500 ${filterLot ? 'border-purple-400 bg-purple-50' : 'border-gray-300'}`}
                style={{ width: '120px' }}
              />
            </div>

            {/* Rej Status Filter - always visible */}
            <div className="flex items-center space-x-1.5">
              <span className="text-xs text-gray-600">Status:</span>
              <select
                value={filterRejStatus}
                onChange={(e) => setFilterRejStatus(e.target.value)}
                className={`px-2 py-1 text-sm border rounded focus:outline-none focus:ring-1 focus:ring-purple-500 ${filterRejStatus !== 'all' ? 'border-purple-400 bg-purple-50' : 'border-gray-300'}`}
                style={{ width: '120px' }}
              >
                <option value="all">All</option>
                <option value="hasRej">Has Rej</option>
                <option value="noRej">No Rej</option>
              </select>
            </div>

            {/* Clear Button - show only when filters are active */}
            {(filterFY || filterWW || filterLot || filterRejStatus !== 'all' || filterDateFrom !== getTodayDateString() || filterDateTo !== getTodayDateString()) && (
              <>
                <div className="h-6 w-px bg-gray-300"></div>
                <button
                  onClick={clearFilters}
                  className="px-2 py-1 text-xs font-medium text-red-600 hover:text-red-700 hover:bg-red-50 rounded transition-colors flex items-center space-x-1"
                  title="Clear all filters"
                >
                  <XMarkIcon className="h-3.5 w-3.5" />
                  <span>Clear</span>
                </button>
              </>
            )}
          </div>
        </div>

        {/* Data Table */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
          <div className="bg-gradient-to-r from-slate-100 to-gray-100 px-6 py-4 flex items-center justify-between">
            <h3 className="text-lg font-bold text-gray-800">IQA Records</h3>
            {selectedIds.size > 0 && (
              <button
                onClick={handleBulkDeleteClick}
                disabled={deleting}
                className="bg-red-500 hover:bg-red-600 text-white rounded-lg px-4 py-2 flex items-center space-x-2 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <TrashIcon className="h-5 w-5" />
                <span className="font-medium">
                  {deleting ? 'Deleting...' : `Delete ${selectedIds.size}`}
                </span>
              </button>
            )}
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
            </div>
          ) : filteredRecords.length === 0 ? (
            <div className="text-center py-12">
              <DocumentTextIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-700 mb-2">No Records Found</h3>
              <p className="text-gray-500 mb-4">
                {records.length === 0
                  ? 'Import an Excel file to get started.'
                  : 'No records match the current filter criteria.'}
              </p>
              {records.length === 0 && (
                <div className="mt-4">
                  <button
                    onClick={handleDownloadTemplate}
                    className="inline-flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors duration-200"
                  >
                    <ArrowDownTrayIcon className="h-5 w-5" />
                    <span>Download Template</span>
                  </button>
                  <p className="text-sm text-gray-400 mt-2">
                    Download the IQA template, fill in your data, and import it
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700 w-16">
                      <input
                        type="checkbox"
                        checked={selectedIds.size === currentItems.length && currentItems.length > 0}
                        onChange={handleSelectAll}
                        className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
                      />
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700 w-16">#</th>
                    <th
                      className="px-4 py-3 text-left text-xs font-semibold text-gray-700 cursor-pointer hover:bg-gray-100 select-none"
                      onClick={() => handleSort('fy')}
                    >
                      FY{getSortIcon('fy')}
                    </th>
                    <th
                      className="px-4 py-3 text-left text-xs font-semibold text-gray-700 cursor-pointer hover:bg-gray-100 select-none"
                      onClick={() => handleSort('ww')}
                    >
                      WW{getSortIcon('ww')}
                    </th>
                    <th
                      className="px-4 py-3 text-left text-xs font-semibold text-gray-700 cursor-pointer hover:bg-gray-100 select-none"
                      onClick={() => handleSort('date_iqa')}
                    >
                      Date IQA{getSortIcon('date_iqa')}
                    </th>
                    <th
                      className="px-4 py-3 text-left text-xs font-semibold text-gray-700 cursor-pointer hover:bg-gray-100 select-none"
                      onClick={() => handleSort('shift_to_shift')}
                    >
                      Shift{getSortIcon('shift_to_shift')}
                    </th>
                    <th
                      className="px-4 py-3 text-left text-xs font-semibold text-gray-700 cursor-pointer hover:bg-gray-100 select-none"
                      onClick={() => handleSort('qc_owner')}
                    >
                      QC Owner{getSortIcon('qc_owner')}
                    </th>
                    <th
                      className="px-4 py-3 text-left text-xs font-semibold text-gray-700 cursor-pointer hover:bg-gray-100 select-none"
                      onClick={() => handleSort('model')}
                    >
                      Model{getSortIcon('model')}
                    </th>
                    <th
                      className="px-4 py-3 text-left text-xs font-semibold text-gray-700 cursor-pointer hover:bg-gray-100 select-none"
                      onClick={() => handleSort('item')}
                    >
                      Item{getSortIcon('item')}
                    </th>
                    <th
                      className="px-4 py-3 text-left text-xs font-semibold text-gray-700 cursor-pointer hover:bg-gray-100 select-none"
                      onClick={() => handleSort('supplier')}
                    >
                      Supplier{getSortIcon('supplier')}
                    </th>
                    <th
                      className="px-4 py-3 text-left text-xs font-semibold text-gray-700 cursor-pointer hover:bg-gray-100 select-none"
                      onClick={() => handleSort('qty')}
                    >
                      Qty{getSortIcon('qty')}
                    </th>
                    <th
                      className="px-4 py-3 text-left text-xs font-semibold text-gray-700 cursor-pointer hover:bg-gray-100 select-none"
                      onClick={() => handleSort('lotno')}
                    >
                      Lot No{getSortIcon('lotno')}
                    </th>
                    <th
                      className="px-4 py-3 text-left text-xs font-semibold text-gray-700 cursor-pointer hover:bg-gray-100 select-none"
                      onClick={() => handleSort('inspec')}
                    >
                      Inspec{getSortIcon('inspec')}
                    </th>
                    <th
                      className="px-4 py-3 text-left text-xs font-semibold text-gray-700 cursor-pointer hover:bg-gray-100 select-none"
                      onClick={() => handleSort('rej')}
                    >
                      Rej{getSortIcon('rej')}
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {currentItems.map((record, index) => {
                    // Determine row background color
                    let rowBgColor = '';
                    if (selectedIds.has(record.id!)) {
                      rowBgColor = 'bg-orange-50'; // Selected row
                    } else if (record.rej && record.rej > 0) {
                      rowBgColor = 'bg-red-100'; // Rejected items
                    }

                    return (
                    <tr key={record.id} className={`hover:bg-gray-100 transition-colors duration-150 ${rowBgColor}`}>
                      <td className="px-4 py-3 text-center">
                        <input
                          type="checkbox"
                          checked={selectedIds.has(record.id!)}
                          onChange={() => record.id && handleSelectOne(record.id)}
                          className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
                        />
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-500 text-center">{indexOfFirstItem + index + 1}</td>
                      <td className="px-4 py-3 text-sm text-gray-900 font-medium">
                        {record.fy || '-'}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900 font-medium">
                        {record.ww || '-'}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {formatDate(record.date_iqa)}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">{record.shift_to_shift}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{record.qc_owner}</td>
                      <td className="px-4 py-3 text-sm text-gray-900 font-medium">{record.model}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{record.item}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{record.supplier}</td>
                      <td className="px-4 py-3 text-sm text-gray-900 font-medium">{formatNumber(record.qty.toString())}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{record.lotno}</td>
                      <td className="px-4 py-3 text-sm text-gray-900 font-medium">{record.inspec || 0}</td>
                      <td className={`px-4 py-3 text-sm font-medium ${record.rej && record.rej > 0 ? 'text-red-600' : 'text-gray-900'}`}>
                        {record.rej || 0}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center space-x-2">
                          {/* View Detail button */}
                          <button
                            onClick={() => openDetailModal(record)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-200"
                            title="View Details"
                          >
                            <EyeIcon className="h-5 w-5" />
                          </button>
                          {/* Show Add Defect button only when reject value > 0 */}
                          {record.rej > 0 && (
                            <button
                              onClick={() => openDefectModal(record)}
                              className="p-2 text-orange-600 hover:bg-orange-50 rounded-lg transition-colors duration-200"
                              title="Add Defect"
                            >
                              <ExclamationTriangleIcon className="h-5 w-5" />
                            </button>
                          )}
                          <button
                            onClick={() => record.id && handleDeleteClick(record.id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200"
                            title="Delete"
                          >
                            <TrashIcon className="h-5 w-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                    );
                  })}
                </tbody>
              </table>

              {/* Pagination */}
              {filteredRecords.length > 0 && (
                <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-700">
                      Showing <span className="font-semibold">{indexOfFirstItem + 1}</span> to{' '}
                      <span className="font-semibold">
                        {Math.min(indexOfLastItem, filteredRecords.length)}
                      </span>{' '}
                      of <span className="font-semibold">{filteredRecords.length}</span> records
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
                        title="Previous page"
                      >
                        <ChevronLeftIcon className="h-5 w-5" />
                      </button>

                      {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                        <button
                          key={pageNum}
                          onClick={() => handlePageChange(pageNum)}
                          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 ${
                            currentPage === pageNum
                              ? 'bg-blue-600 text-white'
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
                        title="Next page"
                      >
                        <ChevronRightIcon className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Detail Modal */}
        {showDetailModal && detailRecord && (
          <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
              {/* Background overlay */}
              <div
                className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75"
                onClick={closeDetailModal}
              ></div>

              {/* Modal panel - Compact size */}
              <div className="inline-block align-bottom bg-white rounded-2xl text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full">
                {/* Header */}
                <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <EyeIcon className="h-7 w-7 text-white" />
                      <h3 className="text-xl font-bold text-white">IQA Record Details</h3>
                    </div>
                    <button
                      onClick={closeDetailModal}
                      className="text-white hover:text-gray-200 transition-colors"
                    >
                      <XMarkIcon className="h-6 w-6" />
                    </button>
                  </div>
                </div>

                {/* Body */}
                <div className="bg-white px-6 py-6 max-h-[70vh] overflow-y-auto">
                  <div className="grid grid-cols-2 gap-4">
                    {/* General Information Section */}
                    <div className="col-span-2 bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-lg p-4">
                      <h4 className="text-sm font-bold text-purple-900 mb-3 flex items-center">
                        <DocumentTextIcon className="h-5 w-5 mr-2" />
                        General Information
                      </h4>
                      <div className="grid grid-cols-3 gap-3">
                        <div>
                          <p className="text-xs text-gray-600 mb-1">FY</p>
                          <p className="text-sm font-semibold text-gray-900">{detailRecord.fy || '-'}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-600 mb-1">WW</p>
                          <p className="text-sm font-semibold text-gray-900">{detailRecord.ww || '-'}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-600 mb-1">FW</p>
                          <p className="text-sm font-semibold text-gray-900">{detailRecord.fw || '-'}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-600 mb-1">Date IQA</p>
                          <p className="text-sm font-semibold text-gray-900">{formatDate(detailRecord.date_iqa)}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-600 mb-1">Shift to Shift</p>
                          <p className="text-sm font-semibold text-gray-900">{detailRecord.shift_to_shift || '-'}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-600 mb-1">QC Owner</p>
                          <p className="text-sm font-semibold text-gray-900">{detailRecord.qc_owner || '-'}</p>
                        </div>
                      </div>
                    </div>

                    {/* Product Information */}
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <h4 className="text-sm font-bold text-green-900 mb-3">Product Information</h4>
                      <div className="space-y-2">
                        <div>
                          <p className="text-xs text-gray-600">Model</p>
                          <p className="text-sm font-semibold text-gray-900">{detailRecord.model || '-'}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-600">Item</p>
                          <p className="text-sm font-semibold text-gray-900">{detailRecord.item || '-'}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-600">Description</p>
                          <p className="text-sm font-semibold text-gray-900">{detailRecord.descr || '-'}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-600">Telex</p>
                          <p className="text-sm font-semibold text-gray-900">{detailRecord.telex || '-'}</p>
                        </div>
                      </div>
                    </div>

                    {/* Supplier Information */}
                    <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                      <h4 className="text-sm font-bold text-orange-900 mb-3">Supplier Information</h4>
                      <div className="space-y-2">
                        <div>
                          <p className="text-xs text-gray-600">Supplier</p>
                          <p className="text-sm font-semibold text-gray-900">{detailRecord.supplier || '-'}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-600">Vender</p>
                          <p className="text-sm font-semibold text-gray-900">{detailRecord.vender || '-'}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-600">Supplier DO</p>
                          <p className="text-sm font-semibold text-gray-900">{detailRecord.supplier_do || '-'}</p>
                        </div>
                      </div>
                    </div>

                    {/* Quantity & Inspection */}
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <h4 className="text-sm font-bold text-blue-900 mb-3">Quantity & Inspection</h4>
                      <div className="space-y-2">
                        <div>
                          <p className="text-xs text-gray-600">Quantity</p>
                          <p className="text-sm font-semibold text-gray-900">{detailRecord.qty || 0}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-600">Inspected</p>
                          <p className="text-sm font-semibold text-gray-900">{detailRecord.inspec || 0}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-600">Rejected</p>
                          <p className="text-sm font-semibold text-red-600">{detailRecord.rej || 0}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-600">Defect</p>
                          <p className="text-sm font-semibold text-gray-900">{detailRecord.defect || '-'}</p>
                        </div>
                      </div>
                    </div>

                    {/* Location & Warehouse */}
                    <div className="bg-pink-50 border border-pink-200 rounded-lg p-4">
                      <h4 className="text-sm font-bold text-pink-900 mb-3">Location & Warehouse</h4>
                      <div className="space-y-2">
                        <div>
                          <p className="text-xs text-gray-600">Location</p>
                          <p className="text-sm font-semibold text-gray-900">{detailRecord.location || '-'}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-600">Warehouse</p>
                          <p className="text-sm font-semibold text-gray-900">{detailRecord.warehouse || '-'}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-600">Building</p>
                          <p className="text-sm font-semibold text-gray-900">{detailRecord.building || '-'}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-600">Business Unit</p>
                          <p className="text-sm font-semibold text-gray-900">{detailRecord.business_unit || '-'}</p>
                        </div>
                      </div>
                    </div>

                    {/* Financial Information */}
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                      <h4 className="text-sm font-bold text-yellow-900 mb-3">Financial Information</h4>
                      <div className="space-y-2">
                        <div>
                          <p className="text-xs text-gray-600">Expense</p>
                          <p className="text-sm font-semibold text-gray-900">{detailRecord.expense || '-'}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-600">Re Expense</p>
                          <p className="text-sm font-semibold text-gray-900">{detailRecord.re_expense || '-'}</p>
                        </div>
                      </div>
                    </div>

                    {/* Additional Details */}
                    <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
                      <h4 className="text-sm font-bold text-indigo-900 mb-3">Additional Details</h4>
                      <div className="space-y-2">
                        <div>
                          <p className="text-xs text-gray-600">PO</p>
                          <p className="text-sm font-semibold text-gray-900">{detailRecord.po || '-'}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-600">SBR</p>
                          <p className="text-sm font-semibold text-gray-900">{detailRecord.sbr || '-'}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-600">Disposition Code</p>
                          <p className="text-sm font-semibold text-gray-900">{detailRecord.disposition_code || '-'}</p>
                        </div>
                      </div>
                    </div>

                    {/* Lot & Tracking */}
                    <div className="col-span-2 bg-gray-50 border border-gray-200 rounded-lg p-4">
                      <h4 className="text-sm font-bold text-gray-900 mb-3">Lot & Tracking Information</h4>
                      <div className="grid grid-cols-4 gap-3">
                        <div>
                          <p className="text-xs text-gray-600">Lot No</p>
                          <p className="text-sm font-semibold text-gray-900">{detailRecord.lotno || '-'}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-600">LPN</p>
                          <p className="text-sm font-semibold text-gray-900">{detailRecord.lpn || '-'}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-600">Ref Code</p>
                          <p className="text-sm font-semibold text-gray-900">{detailRecord.ref_code || '-'}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-600">Std Case Qty</p>
                          <p className="text-sm font-semibold text-gray-900">{detailRecord.std_case_qty || '-'}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-600">Receipt Date</p>
                          <p className="text-sm font-semibold text-gray-900">{formatDate(detailRecord.receipt_date)}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-600">Age</p>
                          <p className="text-sm font-semibold text-gray-900">{detailRecord.age || '-'}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-600">Data on Web</p>
                          <p className="text-sm font-semibold text-gray-900">{detailRecord.data_on_web || '-'}</p>
                        </div>
                      </div>
                    </div>

                    {/* Remarks */}
                    {detailRecord.remark && (
                      <div className="col-span-2 bg-red-50 border border-red-200 rounded-lg p-4">
                        <h4 className="text-sm font-bold text-red-900 mb-2">Remarks</h4>
                        <p className="text-sm text-gray-900">{detailRecord.remark}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Footer */}
                <div className="bg-gray-50 px-6 py-4 flex justify-end space-x-3">
                  <button
                    onClick={closeDetailModal}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Defect Modal */}
        {showDefectModal && selectedRecord && (
          <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
              {/* Background overlay */}
              <div
                className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75"
                onClick={closeDefectModal}
              ></div>

              {/* Modal panel - Wider for split layout */}
              <div className="inline-block align-bottom bg-white rounded-2xl text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-7xl sm:w-full">
                {/* Header */}
                <div className="bg-gradient-to-r from-orange-500 to-red-600 px-6 py-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <ExclamationTriangleIcon className="h-8 w-8 text-white" />
                      <h3 className="text-2xl font-bold text-white">Add Defect Data</h3>
                    </div>
                    <button
                      onClick={closeDefectModal}
                      className="text-white hover:text-gray-200 transition-colors"
                    >
                      <XMarkIcon className="h-6 w-6" />
                    </button>
                  </div>
                </div>

                {/* Error Message in Modal */}
                {error && (
                  <div className="mx-6 mt-4 bg-red-50 border border-red-200 rounded-lg p-3 flex items-start space-x-2">
                    <XCircleIcon className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-red-900">Error</p>
                      <p className="text-sm text-red-700">{error}</p>
                    </div>
                    <button
                      onClick={() => setError(null)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <XMarkIcon className="h-4 w-4" />
                    </button>
                  </div>
                )}

                {/* Success Message in Modal */}
                {modalSuccess && (
                  <div className="mx-6 mt-4 bg-green-50 border border-green-200 rounded-lg p-3 flex items-start space-x-2 animate-pulse">
                    <CheckCircleIcon className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-green-900">Success!</p>
                      <p className="text-sm text-green-700">{modalSuccess}</p>
                    </div>
                    <button
                      onClick={() => setModalSuccess(null)}
                      className="text-green-600 hover:text-green-800"
                    >
                      <XMarkIcon className="h-4 w-4" />
                    </button>
                  </div>
                )}

                {/* Body - Split Layout */}
                <div className="bg-white px-6 py-6">
                  <div className="grid grid-cols-2 gap-6">
                    {/* LEFT SIDE - Form */}
                    <div className="space-y-6 border-r border-gray-200 pr-6">
                      {/* Record Info */}
                      <div className="bg-purple-50 border border-purple-200 rounded-xl p-4">
                        <h4 className="text-sm font-semibold text-purple-900 mb-3">Record Information</h4>
                        <div className="grid grid-cols-2 gap-3 text-sm">
                          <div>
                            <span className="text-gray-600">Model:</span>
                            <span className="ml-2 font-medium text-gray-900">{selectedRecord.model}</span>
                          </div>
                          <div>
                            <span className="text-gray-600">Item:</span>
                            <span className="ml-2 font-medium text-gray-900">{selectedRecord.item}</span>
                          </div>
                          <div>
                            <span className="text-gray-600">Lot No:</span>
                            <span className="ml-2 font-medium text-gray-900">{selectedRecord.lotno}</span>
                          </div>
                          <div>
                            <span className="text-gray-600">Supplier:</span>
                            <span className="ml-2 font-medium text-gray-900">{selectedRecord.supplier}</span>
                          </div>
                          <div>
                            <span className="text-gray-600">Qty:</span>
                            <span className="ml-2 font-medium text-gray-900">{selectedRecord.qty}</span>
                          </div>
                          <div>
                            <span className="text-gray-600">Reject:</span>
                            <span className="ml-2 font-medium text-red-600">{selectedRecord.rej || 0}</span>
                          </div>
                        </div>
                      </div>

                      {/* Defect Type Selection */}
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Defect Type *
                        </label>
                        {loadingDefects ? (
                          <div className="flex items-center justify-center py-4">
                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-orange-600"></div>
                            <span className="ml-2 text-gray-600">Loading defects...</span>
                          </div>
                        ) : (
                          <>
                            <select
                              value={selectedDefectId || ''}
                              onChange={(e) => {
                                const newValue = e.target.value ? parseInt(e.target.value) : null;
                                console.log('🔍 IQAPage - Defect selected:', newValue);
                                setSelectedDefectId(newValue);
                              }}
                              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                            >
                              <option value="">Select defect type...</option>
                              {defects.map((defect) => {
                                console.log('🔍 IQAPage - Rendering defect option:', defect);
                                return (
                                  <option key={defect.id} value={defect.id}>
                                    {defect.name}
                                  </option>
                                );
                              })}
                            </select>
                            <p className="text-xs text-gray-500 mt-1">
                              Loaded {defects.length} defect(s)
                            </p>
                          </>
                        )}
                        {selectedDefectId && (
                          <div className="mt-2 p-3 bg-orange-50 border border-orange-200 rounded-lg">
                            <p className="text-sm text-orange-900">
                              <span className="font-semibold">Selected: </span>
                              {defects.find(d => d.id === selectedDefectId)?.name}
                            </p>
                            {defects.find(d => d.id === selectedDefectId)?.description && (
                              <p className="text-xs text-orange-700 mt-1">
                                {defects.find(d => d.id === selectedDefectId)?.description}
                              </p>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Defect Description */}
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Defect Description
                        </label>
                        <textarea
                          value={defectDescription}
                          onChange={(e) => setDefectDescription(e.target.value)}
                          rows={3}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                          placeholder="Describe the defect details..."
                        />
                      </div>

                      {/* Image Upload */}
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Defect Images *
                        </label>
                        <div className="space-y-4">
                          <label className="flex items-center justify-center space-x-2 px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg hover:border-orange-500 hover:bg-orange-50 transition-colors cursor-pointer">
                            <CameraIcon className="h-6 w-6 text-gray-400" />
                            <span className="text-gray-600 font-medium">Upload Images</span>
                            <input
                              type="file"
                              accept="image/*"
                              multiple
                              onChange={handleImageUpload}
                              className="hidden"
                            />
                          </label>

                          {/* Image Previews */}
                          {defectImagePreviews.length > 0 && (
                            <div className="grid grid-cols-3 gap-3">
                              {defectImagePreviews.map((preview, index) => (
                                <div key={index} className="relative group">
                                  <img
                                    src={preview}
                                    alt={`Defect ${index + 1}`}
                                    className="w-full h-32 object-cover rounded-lg border-2 border-gray-300"
                                  />
                                  <button
                                    onClick={() => removeImage(index)}
                                    className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors shadow-lg"
                                  >
                                    <XMarkIcon className="h-4 w-4" />
                                  </button>
                                  <div className="absolute bottom-2 left-2 bg-black bg-opacity-60 text-white text-xs px-2 py-1 rounded">
                                    #{index + 1}
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Submit Button */}
                      <div className="pt-4">
                        <button
                          onClick={handleSubmitDefect}
                          disabled={submittingDefect || defectImages.length === 0 || !selectedDefectId}
                          className="w-full px-6 py-3 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-lg font-semibold hover:from-orange-600 hover:to-red-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                        >
                          {submittingDefect ? (
                            <>
                              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                              <span>Submitting...</span>
                            </>
                          ) : (
                            <>
                              <PlusIcon className="h-5 w-5" />
                              <span>Add Defect</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>

                    {/* RIGHT SIDE - Saved Defects Data Table */}
                    <div className="pl-6">
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="text-base font-semibold text-gray-900 flex items-center">
                          <DocumentTextIcon className="h-5 w-5 mr-2 text-purple-600" />
                          Previously Saved Defects
                        </h4>
                        <span className="text-sm font-medium text-purple-600 bg-purple-100 px-3 py-1 rounded-full">
                          {savedDefectData.length} records
                        </span>
                      </div>

                      {loadingSavedDefects ? (
                        <div className="flex items-center justify-center py-12">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
                          <span className="ml-2 text-gray-600">Loading saved defects...</span>
                        </div>
                      ) : savedDefectData.length > 0 ? (
                        <div className="border border-gray-200 rounded-lg overflow-hidden">
                          <div className="overflow-y-auto" style={{ maxHeight: '600px' }}>
                            <table className="w-full">
                              <thead className="bg-purple-50 sticky top-0">
                                <tr>
                                  <th className="px-4 py-3 text-left text-xs font-semibold text-purple-900">#</th>
                                  <th className="px-4 py-3 text-left text-xs font-semibold text-purple-900">Defect ID</th>
                                  <th className="px-4 py-3 text-left text-xs font-semibold text-purple-900">Description</th>
                                  <th className="px-4 py-3 text-center text-xs font-semibold text-purple-900">Image</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-gray-200 bg-white">
                                {savedDefectData.map((defectItem, index) => (
                                  <tr key={defectItem.id} className="hover:bg-purple-50 transition-colors">
                                    <td className="px-4 py-3 text-sm text-gray-900 font-medium">
                                      {index + 1}
                                    </td>
                                    <td className="px-4 py-3 text-sm text-purple-700 font-medium">
                                      {defectItem.defect_id}
                                    </td>
                                    <td className="px-4 py-3 text-sm text-gray-600">
                                      {defectItem.defect_description || '-'}
                                    </td>
                                    <td className="px-4 py-3 text-center">
                                      <img
                                        src={`${API_BASE}${defectItem.image_url}`}
                                        alt={`Defect ${index + 1}`}
                                        className="w-16 h-16 object-cover rounded border border-purple-300 cursor-pointer hover:scale-110 transition-transform mx-auto"
                                        onClick={() => window.open(`${API_BASE}${defectItem.image_url}`, '_blank')}
                                        title="Click to view full size"
                                      />
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      ) : (
                        <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
                          <DocumentTextIcon className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                          <p className="text-gray-500 text-sm">No defects saved yet</p>
                          <p className="text-gray-400 text-xs mt-1">Add your first defect using the form</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Footer */}
                <div className="bg-gray-50 px-6 py-4 flex justify-end space-x-3">
                  <button
                    onClick={closeDefectModal}
                    className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 font-semibold hover:bg-gray-100 transition-colors"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {showDeleteConfirm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 transform transition-all">
              <div className="flex items-center space-x-3 mb-4">
                <div className="bg-red-100 p-3 rounded-full">
                  <ExclamationTriangleIcon className="h-6 w-6 text-red-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900">Confirm Delete</h3>
              </div>
              <p className="text-gray-600 mb-6">
                Are you sure you want to delete this record? This action cannot be undone.
              </p>
              <div className="flex space-x-3">
                <button
                  onClick={() => {
                    setShowDeleteConfirm(false);
                    setDeleteTargetId(null);
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors duration-200"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-200"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Bulk Delete Confirmation Modal */}
        {showBulkDeleteConfirm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 transform transition-all">
              <div className="flex items-center space-x-3 mb-4">
                <div className="bg-red-100 p-3 rounded-full">
                  <ExclamationTriangleIcon className="h-6 w-6 text-red-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900">Confirm Bulk Delete</h3>
              </div>
              <p className="text-gray-600 mb-6">
                Are you sure you want to delete <span className="font-bold text-red-600">{selectedIds.size}</span> selected record(s)? This action cannot be undone.
              </p>
              <div className="flex space-x-3">
                <button
                  onClick={() => setShowBulkDeleteConfirm(false)}
                  disabled={deleting}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Cancel
                </button>
                <button
                  onClick={handleBulkDelete}
                  disabled={deleting}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                >
                  {deleting && <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>}
                  <span>{deleting ? 'Deleting...' : 'Delete All'}</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default IQAPage;
