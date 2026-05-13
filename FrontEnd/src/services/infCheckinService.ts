// client/src/services/infCheckinService.ts
// INF CheckIn Service - Frontend API service for FVI Line Mapping
 
// Get API configuration from centralized config
import { apiBaseUrl, BaseService  } from './api';
import { formatDate, formatTime, getTodayDateString } from '../utils/formatUtils';
 
import type {
  InfCheckInRecord,
  DataFilters,
  ApiResponse,
  PaginationInfo
} from '../types/inf-checkin';

export interface FVIStationMapping {
  gr_code: string;
  group_code: string;
  username: string;
  oprname?: string;  // Operator name
}

export interface FVILineMappingResponse {
  success: boolean;
  data?: FVIStationMapping[];
  message?: string;
  errors?: string[];
}

export interface FVILineInfo {
  line_no_id: string;
}

export interface FVILinesByDateResponse {
  success: boolean;
  data?: FVILineInfo[];
  message?: string;
  errors?: string[];
}

export interface DistinctFVILineInfo {
  line_no_id: string;
  line_name: string;
}

export interface DistinctFVILinesResponse {
  success: boolean;
  data?: DistinctFVILineInfo[];
  message?: string;
  errors?: string[];
}

export interface OperatorInfo {
  username: string;
  oprname: string;
}

export interface OperatorsResponse {
  success: boolean;
  data?: OperatorInfo[];
  message?: string;
  errors?: string[];
}

// ==================== SYNC INTERFACES ====================

export interface CheckInImportRecord {
  id: string;
  line_no_id?: string;
  username?: string;
  created_on?: string;
  checked_out?: string;
  group_code?: string;
  date_time_start_work?: string;
  date_time_off_work?: string;
  imported_at: string;
  status: 'imported' | 'updated' | 'error';
}

export interface SyncOptions {
  batchSize?: number;
  maxRecords?: number;
  dateFrom?: string;
  dateTo?: string;
  lineNoId?: string;
  dryRun?: boolean;
  forceSync?: boolean;
}

export interface SyncStats {
  totalRecords: number;
  newRecords: number;
  updatedRecords: number;
  skippedRecords: number;
  errorRecords: number;
  startTime: string;
  endTime?: string;
  duration?: number;
  errors: string[];
}

export interface ImportFilters {
  page?: number;
  limit?: number;
  lineNoId?: string;
  createdFrom?: string;
  createdTo?: string;
  checkedOutFrom?: string;
  checkedOutTo?: string;
  username?: string;
  groupCode?: string;
  importedFrom?: string;
  importedTo?: string;
  search?: string;
}

 
export interface SyncStatistics {
  totalImported: number;
  lastSyncTime?: Date;
  recordsByLine: { line: string; count: number }[];
  recordsByDate: { date: string; count: number }[];
}

 

class InfCheckinService extends BaseService {
  constructor() {
    super(apiBaseUrl('inf-checkin'));
  }

  /**
   * Get FVI line mapping for production line visualization
   * @param line Line ID (e.g., "A", "B")
   * @param date Date in YYYY-MM-DD format
   * @param shift Shift ID (e.g., "D", "N")
   */
  async getFVILineMapping(
    line: string,
    date: string,
    shift: string
  ): Promise<FVILineMappingResponse> {
    console.log('📡 InfCheckinService - getFVILineMapping called:', { line, date, shift });

    const queryString = this.buildQueryString({ line, date, shift });
    const result = await this.apiFetch<FVIStationMapping[]>(`/fvi-line-mapping${queryString}`);

    return {
      success: result.success,
      data: result.data,
      message: result.message,
      errors: result.errors
    };
  }

  /**
   * Get list of FVI lines by date
   * @param date Date in YYYY-MM-DD format
   */
  async getFVILinesByDate(date: string): Promise<FVILinesByDateResponse> {
    try {
      console.log('📡 InfCheckinService - getFVILinesByDate called:', { date });

      const params = new URLSearchParams({ date });

      const response = await fetch(`${this.baseUrl}/fvi-lines-by-date?${params}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include'
      });

      console.log('📡 InfCheckinService - Response status:', response.status);

      if (!response.ok) {
        return {
          success: false,
          message: `HTTP ${response.status}: ${response.statusText}`
        };
      }

      const data = await response.json();
      console.log('📡 InfCheckinService - Response data:', data);

      return data;
    } catch (error) {
      console.error('❌ InfCheckinService - Error:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Network error occurred',
        errors: [error instanceof Error ? error.message : 'Unknown error']
      };
    }
  }

  /**
   * Get distinct FVI lines (all lines with line_no_id length between 1 and 5)
   * Returns lines with line_no_id and line_name (e.g., "Line 1", "Line 2")
   */
  async getDistinctFVILines(): Promise<DistinctFVILinesResponse> {
    try {
      console.log('📡 InfCheckinService - getDistinctFVILines called');

      const response = await fetch(`${this.baseUrl}/distinct-lines`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include'
      });

      console.log('📡 InfCheckinService - Response status:', response.status);

      if (!response.ok) {
        return {
          success: false,
          message: `HTTP ${response.status}: ${response.statusText}`
        };
      }

      const data = await response.json();
      console.log('📡 InfCheckinService - Distinct lines data:', data);

      return data;
    } catch (error) {
      console.error('❌ InfCheckinService - Error:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Network error occurred',
        errors: [error instanceof Error ? error.message : 'Unknown error']
      };
    }
  }

  /**
   * Get list of unique operators (username and oprname) from inf_checkin
   * Returns distinct username/oprname pairs for autocomplete
   * @param gr_code - Optional group code filter (e.g., 'QC', 'MRB'). If blank, returns all operators.
   */
  async getOperators(gr_code?: string): Promise<OperatorsResponse> {
    try {
      console.log('📡 InfCheckinService - getOperators called with gr_code:', gr_code);

      // Build URL with optional gr_code parameter
      let url = `${this.baseUrl}/operators`;
      if (gr_code && gr_code.trim() !== '') {
        const params = new URLSearchParams({ gr_code: gr_code.trim() });
        url = `${url}?${params.toString()}`;
      }

      console.log('📡 InfCheckinService - Request URL:', url);

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include'
      });

      console.log('📡 InfCheckinService - Response status:', response.status);

      if (!response.ok) {
        return {
          success: false,
          message: `HTTP ${response.status}: ${response.statusText}`
        };
      }

      const data = await response.json();
      console.log('📡 InfCheckinService - Operators data:', data);

      return data;
    } catch (error) {
      console.error('❌ InfCheckinService - Error:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Network error occurred',
        errors: [error instanceof Error ? error.message : 'Unknown error']
      };
    }
  }

  /**
   * Get list of FVI leader operators (username and oprname) from v_fvilead
   * Returns FVI leaders for QC Leader/FVI Leader Confirm Name autocomplete field
   */
  async getFVILeaderOperators(): Promise<OperatorsResponse> {
    try {
      console.log('📡 InfCheckinService - getFVILeaderOperators called');

      const url = `${this.baseUrl}/fvi-leaders`;
      console.log('📡 InfCheckinService - Request URL:', url);

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include'
      });

      console.log('📡 InfCheckinService - Response status:', response.status);

      if (!response.ok) {
        return {
          success: false,
          message: `HTTP ${response.status}: ${response.statusText}`
        };
      }

      const data = await response.json();
      console.log('📡 InfCheckinService - FVI Leaders data:', data);

      return data;
    } catch (error) {
      console.error('❌ InfCheckinService - Error:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Network error occurred',
        errors: [error instanceof Error ? error.message : 'Unknown error']
      };
    }
  }

  /**
   * Get statistics for check-in data
   */
  async getStatistics(): Promise<{
    success: boolean;
    data?: {
      totalRecords: number;
      totalToday: number;
      totalMonth: number;
      totalYear: number;
      lastSync?: string;
    };
    message?: string;
    error?: string;
  }> {
    try {
      console.log('📊 Fetching check-in statistics...');

      const response = await fetch(`${this.baseUrl}/statistics`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include'
      });

      const result = await response.json();
      console.log('📊 Statistics Response:', result);

      if (!response.ok) {
        return {
          success: false,
          error: result.message || `HTTP ${response.status}: Failed to fetch statistics`
        };
      }

      return {
        success: result.success || true,
        data: result.data,
        message: result.message
      };

    } catch (error) {
      console.error('💥 Statistics fetch error:', error);
      return {
        success: false,
        error: `Statistics fetch error: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  /**
   * Sync/Import check-in data from interface source with options
   */
  async syncData(options: SyncOptions = {}): Promise<ApiResponse<SyncStats>> {
    try {
      console.log('🔄 Starting check-in data sync with options:', options);

      // Automatically set forceSync to true if dateFrom or dateTo are provided (manual import)
      const syncOptions = {
        ...options,
        forceSync: !!(options.dateFrom || options.dateTo || options.forceSync)
      };

      console.log('🔄 Sync options with forceSync:', syncOptions);

      const response = await fetch(`${this.baseUrl}/sync`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify(syncOptions)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || `HTTP ${response.status}: ${response.statusText}`);
      }

      console.log('✅ Sync completed:', data);
      return data;
    } catch (error) {
      console.error('❌ Sync API error:', error);
      throw error;
    }
  }

  /**
   * Fetch imported data with filters and pagination
   */
  async fetchImportedData(filters: ImportFilters = {}): Promise<ApiResponse<CheckInImportRecord[]>> {
    try {
      const queryParams = new URLSearchParams();

      // Add all filters as query parameters
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          queryParams.append(key, value.toString());
        }
      });

      console.log('📊 Fetching imported data with filters:', filters);

      const response = await fetch(`${this.baseUrl}/imported?${queryParams.toString()}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include'
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || `HTTP ${response.status}: ${response.statusText}`);
      }

      console.log(`✅ Fetched ${data.data?.length || 0} imported records`);
      return data;
    } catch (error) {
      console.error('❌ Fetch imported data API error:', error);
      throw error;
    }
  }

  /**
   * Fetch sync statistics
   */
  async fetchSyncStatistics(): Promise<ApiResponse<SyncStatistics>> {
    try {
      console.log('📈 Fetching sync statistics...');

      const response = await fetch(`${this.baseUrl}/sync/statistics`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include'
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || `HTTP ${response.status}: ${response.statusText}`);
      }

      console.log('✅ Statistics fetched successfully:', data);
      return data;
    } catch (error) {
      console.error('❌ Fetch statistics API error:', error);
      throw error;
    }
  }

  /**
   * Check health status of the check-in service
   */
  async checkHealth(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/health`, {
        method: 'GET',
        cache: 'no-cache',
        credentials: 'include'
      });

      return response.ok;
    } catch {
      return false;
    }
  }

  /**
   * Test if the inf-checkin API is reachable
   * @returns Response status code
   */
  async testConnection(): Promise<number> {
    try {
      const response = await fetch(this.baseUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include'
      });

      return response.status;
    } catch (error) {
      console.error('inf-checkin API test connection error:', error);
      return 0; // Return 0 to indicate network error
    }
  }

  /**
   * Test if the debug endpoint is reachable
   * @returns Response status code
   */
  async testDebugConnection(): Promise<number> {
    try {
      const response = await fetch(`${this.baseUrl}-debug`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include'
      });

      return response.status;
    } catch (error) {
      console.error('inf-checkin debug API test connection error:', error);
      return 0; // Return 0 to indicate network error
    }
  }

 /**
   * Fetch CheckIn data with filters and pagination
   *
   * @param page - Page number
   * @param limit - Records per page
   * @param filters - Data filters
   * @returns API response with CheckIn records
   */
  async fetchData(
    page: number,
    limit: number,
    filters: DataFilters
  ): Promise<ApiResponse<InfCheckInRecord[]>> {
    try {
      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString()
      });

      // Add all filters (server-side filtering)
      // Date filters
      if (filters.createdOnFrom && filters.createdOnFrom.trim()) {
        queryParams.append('createdOnFrom', filters.createdOnFrom.trim());
      }
      if (filters.createdOnTo && filters.createdOnTo.trim()) {
        queryParams.append('createdOnTo', filters.createdOnTo.trim());
      }

      // Search filters
      if (filters.usernameSearch && filters.usernameSearch.trim()) {
        queryParams.append('usernameSearch', filters.usernameSearch.trim());
      }
      if (filters.oprnameSearch && filters.oprnameSearch.trim()) {
        queryParams.append('oprnameSearch', filters.oprnameSearch.trim());
      }
      if (filters.lineNoSearch && filters.lineNoSearch.trim()) {
        queryParams.append('lineNoSearch', filters.lineNoSearch.trim());
      }

      // Category filters
      if (filters.groupCode && filters.groupCode.trim()) {
        queryParams.append('groupCode', filters.groupCode.trim());
      }
      if (filters.team && filters.team.trim()) {
        queryParams.append('team', filters.team.trim());
      }
      if (filters.workShiftId && filters.workShiftId.trim()) {
        queryParams.append('workShiftId', filters.workShiftId.trim());
      }

      // Work status filter
      if (filters.workStatus && filters.workStatus !== 'all') {
        queryParams.append('workStatus', filters.workStatus);
      }

      console.log('🔍 Fetching CheckIn data with filters:', queryParams.toString());

      const apiUrl = `${apiBaseUrl('inf-checkin')}?${queryParams.toString()}`;
      console.log('🔗 Making request to:', apiUrl);

      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include'
      });

      console.log('📡 Response status:', response.status);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result: ApiResponse<InfCheckInRecord[]> = await response.json();

      if (result.success && result.data) {
        console.log('✅ CheckIn data fetched successfully:', result.data.length, 'records');
      } else {
        console.error('❌ Failed to fetch CheckIn data:', result.message);
      }

      return result;
    } catch (error) {
      console.error('❌ Fetch error:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to fetch CheckIn data',
        data: []
      };
    }
  }

  /**
   * Search CheckIn records by username
   *
   * @param username - Username to search for
   * @returns API response with matching CheckIn records
   */
  async searchByUsername(username: string): Promise<ApiResponse<InfCheckInRecord[]>> {
    try {
      if (!username.trim()) {
        return {
          success: false,
          message: 'Please enter a username to search',
          data: []
        };
      }

      console.log('🔍 Searching by username:', username);

      const apiUrl = `${apiBaseUrl('inf-checkin')}/user/${encodeURIComponent(username)}`;

      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include'
      });

      const result: ApiResponse<InfCheckInRecord[]> = await response.json();

      if (result.success && result.data && result.data.length > 0) {
        console.log('✅ Username search successful:', result.data.length, 'records');
      } else {
        console.log('ℹ️ No records found for user:', username);
      }

      return result;
    } catch (error) {
      console.error('❌ Username search error:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Search failed',
        data: []
      };
    }
  }

  /**
   * Apply client-side filters to CheckIn records
   *
   * @param data - CheckIn records to filter
   * @param filters - Filters to apply
   * @returns Filtered CheckIn records
   */
  applyClientFilters(data: InfCheckInRecord[], filters: DataFilters): InfCheckInRecord[] {
    // Start with data and filter out any undefined/invalid records
    let filtered = [...data].filter(record =>
      record &&
      record.id &&
      typeof record === 'object'
    );

    // Apply text search filters (date filtering is done server-side)
    if (filters.usernameSearch.trim()) {
      filtered = filtered.filter(record =>
        record && record.username && record.username.toLowerCase().includes(filters.usernameSearch.toLowerCase())
      );
    }

    if (filters.oprnameSearch.trim()) {
      filtered = filtered.filter(record =>
        record && record.oprname && record.oprname.toLowerCase().includes(filters.oprnameSearch.toLowerCase())
      );
    }

    if (filters.lineNoSearch.trim()) {
      filtered = filtered.filter(record =>
        record && record.line_no_id && record.line_no_id.toLowerCase().includes(filters.lineNoSearch.toLowerCase())
      );
    }

    // Apply work status filter
    if (filters.workStatus && filters.workStatus !== 'all') {
      if (filters.workStatus === 'working') {
        filtered = filtered.filter(record =>
          record && !record.date_time_off_work // Still working if no check-out time
        );
      } else if (filters.workStatus === 'checked_out') {
        filtered = filtered.filter(record =>
          record && record.date_time_off_work // Checked out if has check-out time
        );
      }
    }

    // Apply additional filters
    if (filters.groupCode.trim()) {
      filtered = filtered.filter(record =>
        record && record.group_code && record.group_code.toLowerCase().includes(filters.groupCode.toLowerCase())
      );
    }

    if (filters.team.trim()) {
      filtered = filtered.filter(record =>
        record && record.team && record.team.toLowerCase().includes(filters.team.toLowerCase())
      );
    }

    if (filters.workShiftId.trim()) {
      filtered = filtered.filter(record =>
        record && record.work_shift_id && record.work_shift_id.toLowerCase().includes(filters.workShiftId.toLowerCase())
      );
    }

    console.log(`🔍 Applied client-side filters: ${filtered.length} of ${data.length} records match`);
    return filtered;
  }

  /**
   * Get today's date in YYYY-MM-DD format
   */
  getTodayDate(): string {
    return getTodayDateString();
  }

  /**
   * Format date string for display
   *
   * @param dateString - Date string to format
   * @returns Formatted date string
   */
  formatDate(dateString?: string | null): string {
    return formatDate(dateString);
  }

  /**
   * Format time string for display
   *
   * @param dateString - Date string to format
   * @returns Formatted time string
   */
  formatTime(dateString?: string | null): string {
    return formatTime(dateString);
  }

  /**
   * Calculate work duration
   *
   * @param checkIn - Check-in time
   * @param checkOut - Check-out time (optional, defaults to now)
   * @returns Formatted duration string or null
   */
  calculateWorkDuration(checkIn?: string | null, checkOut?: string | null): string | null {
    if (!checkIn) return null;

    const checkInTime = new Date(checkIn);
    const checkOutTime = checkOut ? new Date(checkOut) : new Date();

    const durationMs = checkOutTime.getTime() - checkInTime.getTime();
    const durationHours = Math.floor(durationMs / (1000 * 60 * 60));
    const durationMinutes = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60));

    if (durationHours > 0) {
      return `${durationHours}h ${durationMinutes}m`;
    } else {
      return `${durationMinutes}m`;
    }
  }

  /**
   * Get search terms from filters
   *
   * @param filters - Data filters
   * @returns Array of search terms
   */
  getSearchTerms(filters: DataFilters): string[] {
    const terms = [];
    if (filters.usernameSearch.trim()) terms.push(filters.usernameSearch.trim());
    if (filters.oprnameSearch.trim()) terms.push(filters.oprnameSearch.trim());
    if (filters.lineNoSearch.trim()) terms.push(filters.lineNoSearch.trim());
    if (filters.groupCode.trim()) terms.push(filters.groupCode.trim());
    if (filters.team.trim()) terms.push(filters.team.trim());
    if (filters.workShiftId.trim()) terms.push(filters.workShiftId.trim());
    return terms;
  }

  /**
   * Check if auto-import should run for inf-checkin
   * @returns Response indicating whether import should run
   */
  async shouldAutoImport(): Promise<{ success: boolean; shouldImport?: boolean; message?: string }> {
    try {
      console.log('🔍 Checking if auto-import should run for inf-checkin...');

      const response = await fetch(`${this.baseUrl}/sync`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include'
      });

      const result = await response.json();

      if (!response.ok) {
        return {
          success: false,
          message: result.message || `HTTP ${response.status}: ${response.statusText}`
        };
      }

      console.log('✅ Auto-import check result:', result);
      return result;
    } catch (error) {
      console.error('❌ Auto-import check error:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Network error occurred'
      };
    }
  }

  /**
   * Trigger auto-import for inf-checkin
   * @returns Response with number of records imported
   */
  async triggerAutoImport(): Promise<{ success: boolean; imported?: number; message?: string }> {
    try {
      console.log('🔄 Triggering auto-import for inf-checkin...');

      const response = await fetch(`${this.baseUrl}/import/auto`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include'
      });

      const result = await response.json();

      if (!response.ok) {
        return {
          success: false,
          message: result.message || `HTTP ${response.status}: ${response.statusText}`
        };
      }

      console.log('✅ Auto-import completed:', result);
      return result;
    } catch (error) {
      console.error('❌ Auto-import error:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Network error occurred'
      };
    }
  }

  /**
   * Trigger user check-in by username
   * Updates user's check-in status in the system
   * @param username - Username to check in
   * @returns Response indicating success or failure
   */
  async triggerUserCheckin(username: string): Promise<{ success: boolean; data?: boolean; message?: string }> {
    try {
      console.log('👤 Triggering user check-in for username:', username);

      const response = await fetch(apiBaseUrl('users/checkin'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({ username })
      });

      const result = await response.json();

      if (!response.ok) {
        console.warn(`⚠️ User check-in failed`);
        console.warn(`   Message: ${result.message || 'No message'}`);
        console.warn(`   This may happen if no check-in data exists for this user in inf_checkin table`);

        return {
          success: false,
          message: result.message || `HTTP ${response.status}: ${response.statusText}`
        };
      }

      console.log(`✅ User check-in completed successfully`);
      console.log(`   Message: ${result.message || 'No message'}`);
      console.log(`   Data:`, result.data);

      return result;
    } catch (error) {
      console.error('❌ User check-in error:', {
        message: error instanceof Error ? error.message : 'Unknown error'
      });
      console.error('   Check-in will be skipped, but login will continue');

      return {
        success: false,
        message: error instanceof Error ? error.message : 'Network error occurred'
      };
    }
  }

}

export const infCheckinService = new InfCheckinService();
export default infCheckinService;