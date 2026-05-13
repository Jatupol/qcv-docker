// client/src/types/inf-checkin.ts
// Type definitions for Import CheckIn Page
// Manufacturing Quality Control System - CheckIn Data Management

/**
 * CheckIn record from the database
 */
export interface InfCheckInRecord {
  id: string;
  line_no_id?: string | null;
  work_shift_id?: string | null;
  gr_code?: string | null;
  username?: string | null;
  oprname?: string | null;
  created_on?: string | null;
  checked_out?: string | null;
  date_time_start_work?: string | null;
  date_time_off_work?: string | null;
  time_off_work?: string | null;
  time_start_work?: string | null;
  group_code?: string | null;
  team?: string | null;
  imported_at?: string | null;
}

/**
 * Data filters for CheckIn records
 */
export interface DataFilters {
  // Search fields
  usernameSearch: string;
  oprnameSearch: string;
  lineNoSearch: string;

  // Date filters
  createdOnFrom: string;
  createdOnTo: string;

  // Status filters
  groupCode: string;
  team: string;
  workShiftId: string;

  // Work status filter
  workStatus: 'all' | 'working' | 'checked_out';
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
