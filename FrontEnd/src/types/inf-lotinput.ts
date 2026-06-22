// client/src/types/inf-lotinput.ts
// Lot Selection Component Types - UPDATED WITH FINISH DATE FILTERS
// Complete Separation Entity Architecture - Type definitions for lot selection

import { getTodayDateString, formatDate } from '../utils/formatUtils';

/**
 * Lot Data Interface
 * Represents a production lot from the inf_lotinput table
 */
export interface LotData {
  id: string;
  lotno: string;
  partsite: string;
  lineno: string;
  itemno: string;
  model: string;
  version: string;
  inputdate: string;
  finish_on: string;
  status?: 'active' | 'completed' | 'pending';
}

/**
 * Lot Filters Interface - UPDATED with finish date filters
 * Used for filtering lots in search operations
 */
export interface LotFilters {
  search: string;
  partsite: string;
  model: string;
  lineno: string;
  dateFrom: string;
  dateTo: string;
  // NEW: Finish date filters
  finishDateFrom: string;
  finishDateTo: string;
}

/**
 * Lot Selection Component Props
 */
export interface LotSelectionProps {
  selectedLot: LotData | null;
  onLotSelect: (lot: LotData) => void;
  disabled?: boolean;
  className?: string;
  samplingRound?: number;
}

/**
 * Lot Browse Modal Props
 */
export interface LotBrowseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLotSelect: (lot: LotData) => void;
  selectedLot: LotData | null;
}

/**
 * Lot Search Input Props
 */
export interface LotSearchInputProps {
  selectedLot: LotData | null;
  onLotSelect: (lot: LotData) => void;
  disabled?: boolean;
  placeholder?: string;
  className?: string;
}

/**
 * Generic API Response Interface
 */
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

/**
 * API Service Response Types
 */
export interface LotSearchResponse extends ApiResponse<LotData[]> {}
export interface RecentLotsResponse extends ApiResponse<LotData[]> {}

/**
 * Search Component State
 */
export interface SearchState {
  input: string;
  isSearching: boolean;
  error: string | null;
  results: LotData[];
  showDropdown: boolean;
}

/**
 * Modal Component State
 */
export interface ModalState {
  lots: LotData[];
  loading: boolean;
  error: string | null;
  filters: LotFilters;
}

/**
 * Default Values and Constants - UPDATED with finish date defaults
 */
export const DEFAULT_LOT_FILTERS: LotFilters = {
  search: '',
  partsite: '',
  model: '',
  lineno: '',
  dateFrom: '',
  dateTo: '',
  // NEW: Finish date filters with today as default for "from"
  finishDateFrom: getTodayDateString(), // Today in YYYY-MM-DD format
  finishDateTo: ''
};

export const DEFAULT_SEARCH_STATE: SearchState = {
  input: '',
  isSearching: false,
  error: null,
  results: [],
  showDropdown: false
};

export const DEFAULT_MODAL_STATE: Omit<ModalState, 'filters'> = {
  lots: [],
  loading: false,
  error: null
};

/**
 * Type Guards
 */
export const isLotData = (obj: any): obj is LotData => {
  return obj && 
    typeof obj === 'object' &&
    typeof obj.id === 'string' &&
    typeof obj.lotno === 'string' &&
    typeof obj.partsite === 'string' &&
    typeof obj.lineno === 'string' &&
    typeof obj.itemno === 'string' &&
    typeof obj.model === 'string' &&
    typeof obj.version === 'string' &&
    typeof obj.inputdate === 'string' &&
    typeof obj.finish_on === 'string';
};

export const isLotDataArray = (arr: any): arr is LotData[] => {
  return Array.isArray(arr) && arr.every(isLotData);
};

/**
 * Utility Functions
 */
export const formatLotDisplayName = (lot: LotData): string => {
  return `${lot.lotno} - ${lot.model} (${lot.partsite})`;
};

export const getLotStatusColor = (status?: string): string => {
  switch (status) {
    case 'active':
      return 'bg-green-100 text-green-800';
    case 'completed':
      return 'bg-blue-100 text-blue-800';
    case 'pending':
      return 'bg-yellow-100 text-yellow-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

/**
 * Date Utility Functions for Finish Date Filtering
 */
export { getTodayDateString };

export const isDateToday = (dateString: string): boolean => {
  const date = new Date(dateString);
  const today = new Date();
  return date.toDateString() === today.toDateString();
};

export const formatFinishDate = (dateString: string): string => {
  try {
    return formatDate(dateString, 'Invalid Date');
  } catch {
    return 'Invalid Date';
  }
};

export const isFinishDateInRange = (
  finishDate: string, 
  fromDate?: string, 
  toDate?: string
): boolean => {
  const finish = new Date(finishDate);
  const from = fromDate ? new Date(fromDate) : null;
  const to = toDate ? new Date(toDate) : null;

  if (from && finish < from) return false;
  if (to && finish > to) return false;
  return true;
};

/**
 * Re-export everything to ensure proper module resolution
 */
export type {
  LotData as Lot,
  LotFilters as Filters,
  LotSelectionProps as SelectionProps,
  LotBrowseModalProps as BrowseModalProps,
  LotSearchInputProps as SearchInputProps
};

/**
 * Lot Input record from the database
 */
export interface InfLotInputRecord {
  id: string;
  LotNo: string;
  PartSite: string;
  LineNo: string;
  ItemNo: string;
  Model: string;
  Version: string;
  InputDate: string;
  imported_at: string;
}

/**
 * Data filters for Lot Input records
 */
export interface DataFilters {
  // Search fields
  lotNoSearch: string;
  itemNoSearch: string;

  // Date filters
  inputDateFrom: string;
  inputDateTo: string;
}

/**
 * Pagination information
 */
export interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

/**
 * Generic API response
 */
export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
  errors?: string[];
  pagination?: PaginationInfo;
}

/**
 * Import statistics
 */
export interface ImportStats {
  totalRecords: number;
  totalToday: number;
  totalMonth: number;
  totalYear: number;
  lastSync?: string;
}

/**
 * Sync statistics
 */
export interface SyncStats {
  imported?: number;
  updated?: number;
  skipped?: number;
}

/**
 * Sync step state
 * -1: Error
 * 0: Not started
 * 1: Connecting to source database
 * 2: Getting records from source
 * 3: Importing to destination
 * 4: Show results
 */
export type SyncStep = -1 | 0 | 1 | 2 | 3 | 4;

/**
 * Filter options extracted from data
 */
export interface FilterOptionsData {
  partSites: string[];
  lineNos: string[];
  models: string[];
  versions: string[];
}


/**
 * Default export for convenience
 */
export default {
  DEFAULT_LOT_FILTERS,
  DEFAULT_SEARCH_STATE,
  DEFAULT_MODAL_STATE,
  isLotData,
  isLotDataArray,
  formatLotDisplayName,
  getLotStatusColor,
  getTodayDateString,
  isDateToday,
  formatFinishDate,
  isFinishDateInRange
};