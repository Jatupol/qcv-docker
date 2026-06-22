// client/src/services/infLotInputService.ts
// CLIENT-SIDE API SERVICE - UPDATED WITH FINISH DATE FILTERS
// Complete Separation Entity Architecture - API service for lot data operations

// Get API configuration from centralized config
import { apiBaseUrl, BaseService } from './api';
import { formatDate, formatTime, getTodayDateString } from '../utils/formatUtils';
 

import type { 
  LotData, 
  LotFilters, 
  LotSearchResponse, 
  RecentLotsResponse,  
  InfLotInputRecord,
  DataFilters,
  FilterOptionsData} from '../types/inf-lotinput';
 
// Transform server response to frontend format
const transformLotData = (serverData: any): LotData => {
  return {
    id: serverData.id,
    lotno: serverData.LotNo || serverData.lotno || '',
    partsite: serverData.PartSite || serverData.partsite || '',
    lineno: serverData.LineNo || serverData.lineno || '',
    itemno: serverData.ItemNo || serverData.itemno || '',
    model: serverData.Model || serverData.model || '',
    version: serverData.Version || serverData.version || '',
    inputdate: serverData.InputDate || serverData.inputdate || new Date().toISOString(),
    finish_on: serverData.FinishOn || serverData.finish_on || new Date().toISOString()
  };
};

class InfLotInputService extends BaseService {
  constructor() {
    super(apiBaseUrl('inf-lotinput'));
  }

  /**
   * Get recent lots from database
   */
  async getRecentLots(limit: number = 50): Promise<RecentLotsResponse> {
    try {
      console.log('🔄 Fetching recent lots from database...');

      const response = await fetch(`${this.baseUrl}?limit=${Math.min(limit, 100)}`);

      const result = await response.json();
      console.log('📦 Raw API Response:', result);
      
      // Handle different response structures from your API
      let data = result.data || result;
      
      if (!Array.isArray(data)) {
        console.error('❌ Invalid response format:', typeof data);
        return { 
          success: false, 
          error: 'Invalid response format: expected array of lots' 
        };
      }

      const transformedLots = data.map(transformLotData);
      console.log('✅ Transformed lots:', transformedLots.length, 'records');
      
      return { 
        success: true, 
        data: transformedLots
      };

    } catch (error) {
      console.error('💥 Network error:', error);
      return { 
        success: false, 
        error: `Network error: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }



  
  /**
   * Search lots with filters - UPDATED with finish date support
   */
  async getAllLots(filters?: Partial<LotFilters & { 
    finishOnFrom?: string; 
    finishOnTo?: string; 
  }>): Promise<LotSearchResponse> {
    try {
      console.log('🔍 Searching lots with filters:', filters);
      
      // Build query parameters
      const params = new URLSearchParams();
      
      if (filters) {
        // Text filters
        if (filters.search?.trim()) {
          params.append('globalSearch', filters.search.trim());
        }
        
        if (filters.partsite?.trim()) {
          params.append('partSite', filters.partsite.trim());
        }

        if (filters.model?.trim()) {
          params.append('model', filters.model.trim());
        }

        if (filters.lineno?.trim()) {
          params.append('lineNo', filters.lineno.trim());
        }

        // Input date filters (legacy)
        if (filters.dateFrom?.trim()) {
          params.append('inputDateFrom', filters.dateFrom.trim());
        }
        
        if (filters.dateTo?.trim()) {
          params.append('inputDateTo', filters.dateTo.trim());
        }

        // NEW: Finish date filters
        if (filters.finishDateFrom?.trim()) {
          params.append('finishOnFrom', filters.finishDateFrom.trim());
        }
        
        if (filters.finishDateTo?.trim()) {
          params.append('finishOnTo', filters.finishDateTo.trim());
        }

        // Support direct API parameter names for compatibility
        if (filters.finishOnFrom?.trim()) {
          params.append('finishOnFrom', filters.finishOnFrom.trim());
        }
        
        if (filters.finishOnTo?.trim()) {
          params.append('finishOnTo', filters.finishOnTo.trim());
        }
      }
      
      // Always limit results and sort by most recent
      params.append('limit', '100');
      params.append('sort', 'inputdate');
      params.append('order', 'DESC');
      
      const queryString = params.toString();
      const urlSuffix = queryString ? `?${queryString}` : '';

      console.log('🌐 API Request URL suffix:', urlSuffix);

      const response = await fetch(`${this.baseUrl}${urlSuffix}`);

      const result = await response.json();
      console.log('📦 Search API Response:', result);
      
      // Handle different response structures
      let data = result.data || result;
      
      if (!Array.isArray(data)) {
        console.error('❌ Invalid search response format:', typeof data);
        return { 
          success: false, 
          error: 'Invalid search response format: expected array of lots' 
        };
      }

      const transformedLots = data.map(transformLotData);
      console.log('✅ Search completed:', transformedLots.length, 'lots found');
      
      return { 
        success: true, 
        data: transformedLots
      };

    } catch (error) {
      console.error('💥 Search network error:', error);
      return { 
        success: false, 
        error: `Search network error: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  /**
   * Search specific lot by lot number
   */
  async searchLot(lotNumber: string): Promise<LotSearchResponse> {
    try {
      console.log('🔍 Searching for specific lot:', lotNumber);
      
      if (!lotNumber.trim()) {
        return { 
          success: false, 
          error: 'Lot number is required' 
        };
      }

      const params = new URLSearchParams({
        lotNoSearch: lotNumber.trim(),
        limit: '10'
      });

      const response = await fetch(`${this.baseUrl}?${params.toString()}`);

      const result = await response.json();
      console.log('📦 Lot Search Response:', result);
      
      let data = result.data || result;
      
      if (!Array.isArray(data)) {
        console.error('❌ Invalid lot search response format:', typeof data);
        return { 
          success: false, 
          error: 'Invalid lot search response format' 
        };
      }

      const transformedLots = data.map(transformLotData);
      console.log('✅ Lot search completed:', transformedLots.length, 'lots found');
      
      return { 
        success: true, 
        data: transformedLots
      };

    } catch (error) {
      console.error('💥 Lot search network error:', error);
      return { 
        success: false, 
        error: `Lot search network error: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  /**
   * Get database statistics
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
    error?: string;
  }> {
    try {
      console.log('📊 Fetching database statistics...');

      const response = await fetch(`${this.baseUrl}/statistics`);

      if (!response.ok) {
        console.warn('⚠️ Statistics API not available:', response.status);
        return {
          success: false,
          error: 'Statistics not available'
        };
      }

      const result = await response.json();
      console.log('📊 Statistics Response:', result);

      return {
        success: true,
        data: result.data || result
      };

    } catch (error) {
      console.warn('⚠️ Statistics network error:', error);
      return {
        success: false,
        error: 'Statistics network error'
      };
    }
  }

  /**
   * Import today's data manually
   */
  async importTodayData(): Promise<{
    success: boolean;
    data?: {
      imported: number;
      skipped: number;
    };
    message?: string;
    error?: string;
  }> {
    try {
      console.log('🔄 Starting manual import of today\'s data...');

      const response = await fetch(`${this.baseUrl}/import/today`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      const result = await response.json();
      console.log('📥 Import Response:', result);

      if (!response.ok) {
        return {
          success: false,
          error: result.message || `HTTP ${response.status}: Import failed`
        };
      }

      return {
        success: result.success || true,
        data: result.data,
        message: result.message
      };

    } catch (error) {
      console.error('💥 Import network error:', error);
      return {
        success: false,
        error: `Import network error: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  /**
   * Check if auto-import should run for inf-lotinput
   * @returns Response indicating whether import should run
   */
  async shouldAutoImport(): Promise<{ success: boolean; shouldImport?: boolean; message?: string }> {
    try {
      console.log('🔍 Checking if auto-import should run for inf-lotinput...');

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
   * Trigger auto-import for inf-lotinput
   * @returns Response with number of records imported
   */
  async triggerAutoImport(): Promise<{ success: boolean; imported?: number; message?: string }> {
    try {
      console.log('🔄 Triggering auto-import for inf-lotinput...');

      const response = await fetch(`${this.baseUrl}/import`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({})
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
   * Sync/Import data from interface source
   */
  async syncData(params?: {
    dateFrom?: string;
    dateTo?: string;
  }): Promise<{
    success: boolean;
    data?: {
      imported: number;
      skipped: number;
      updated: number;
    };
    message?: string;
    error?: string;
  }> {
    try {
      console.log('🔄 Starting data sync...', this.baseUrl, params);

      const response = await fetch(`${this.baseUrl}/sync`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          dateFrom: params?.dateFrom,
          dateTo: params?.dateTo,
          forceSync: !!(params?.dateFrom || params?.dateTo) // Force sync if date parameters provided
        })
      });

      const result = await response.json();
      console.log('📥 Sync Response:', result);

      if (!response.ok) {
        return {
          success: false,
          error: result.message || `HTTP ${response.status}: Sync failed`
        };
      }

      return {
        success: result.success || true,
        data: result.data,
        message: result.message
      };

    } catch (error) {
      console.error('💥 Sync network error:', error);
      return {
        success: false,
        error: `Sync network error: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  /**
   * Fetch lot input data with filters and pagination
   */
  async fetchLotInputData(params: {
    page?: number;
    limit?: number;
    lotNoSearch?: string;
    itemNoSearch?: string;
    inputDateFrom?: string;
    inputDateTo?: string;
  }): Promise<{
    success: boolean;
    data?: any[];
    pagination?: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
      hasNext: boolean;
      hasPrev: boolean;
    };
    message?: string;
    error?: string;
  }> {
    try {
      console.log('🔍 Fetching lot input data with params:', params);

      const queryParams = new URLSearchParams();

      // Add pagination
      if (params.page) queryParams.append('page', params.page.toString());
      if (params.limit) queryParams.append('limit', params.limit.toString());

      // Add filters if they have values
      if (params.lotNoSearch?.trim()) {
        queryParams.append('lotNoSearch', params.lotNoSearch.trim());
      }
      if (params.itemNoSearch?.trim()) {
        queryParams.append('itemNoSearch', params.itemNoSearch.trim());
      }
      if (params.inputDateFrom?.trim()) {
        queryParams.append('inputDateFrom', params.inputDateFrom.trim());
      }
      if (params.inputDateTo?.trim()) {
        queryParams.append('inputDateTo', params.inputDateTo.trim());
      }

      const response = await fetch(`${this.baseUrl}?${queryParams.toString()}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      const result = await response.json();
      console.log('📦 Fetch Response:', result);

      if (!response.ok || !result.success) {
        return {
          success: false,
          error: result.message || 'Failed to fetch data'
        };
      }

      return {
        success: true,
        data: result.data,
        pagination: result.pagination
      };

    } catch (error) {
      console.error('💥 Fetch error:', error);
      return {
        success: false,
        error: `Fetch error: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  /**
   * Search specific lot by lot number (using dedicated endpoint)
   */
  async searchByLotNumber(lotNo: string): Promise<{
    success: boolean;
    data?: any[];
    message?: string;
    error?: string;
  }> {
    try {
      if (!lotNo.trim()) {
        return {
          success: false,
          error: 'Please enter a lot number to search'
        };
      }

      console.log('🔍 Searching by lot number:', lotNo);

      const response = await fetch(`${this.baseUrl}/lot/${encodeURIComponent(lotNo)}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      const result = await response.json();
      console.log('📦 Lot Search Response:', result);

      if (!response.ok || !result.success || !result.data || result.data.length === 0) {
        return {
          success: false,
          error: `No records found for lot: ${lotNo}`
        };
      }

      return {
        success: true,
        data: result.data,
        message: `Found ${result.data.length} records for lot: ${lotNo}`
      };

    } catch (error) {
      console.error('💥 Lot search error:', error);
      return {
        success: false,
        error: `Search failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  /**
   * Get lots finishing today - NEW convenience method
   */
  async getLotsFinishingToday(): Promise<LotSearchResponse> {
    const today = getTodayDateString();
    
    console.log('📅 Fetching lots finishing today:', today);
    
    return this.getAllLots({
      finishOnFrom: today,
      finishOnTo: today
    });
  }

  /**
   * Get lots finishing in date range - NEW convenience method
   */
  async getLotsFinishingInRange(fromDate: string, toDate?: string): Promise<LotSearchResponse> {
    console.log('📅 Fetching lots finishing in range:', fromDate, 'to', toDate || 'open');

    return this.getAllLots({
      finishOnFrom: fromDate,
      finishOnTo: toDate
    });
  }

  /**
   * Backward compatibility alias for searchLot
   */
  async searchLotByNumber(lotNumber: string): Promise<LotSearchResponse> {
    return this.searchLot(lotNumber);
  }


 /**
   * Apply client-side filters to lot input records
   * Note: Date filtering is handled server-side via API
   *
   * @param data - Lot input records to filter
   * @param filters - Filters to apply
   * @returns Filtered lot input records
   */
  applyClientFilters(data: InfLotInputRecord[], filters: DataFilters): InfLotInputRecord[] {
    // Start with data and filter out any undefined/invalid records
    let filtered = [...data].filter(record =>
      record &&
      record.id &&
      record.LotNo &&
      record.InputDate &&
      typeof record === 'object'
    );

    // Apply text search filters only (date filtering is done server-side)
    if (filters.lotNoSearch.trim()) {
      filtered = filtered.filter(record =>
        record && record.LotNo && record.LotNo.toLowerCase().includes(filters.lotNoSearch.toLowerCase())
      );
    }

    if (filters.itemNoSearch.trim()) {
      filtered = filtered.filter(record =>
        record && record.ItemNo && record.ItemNo.toLowerCase().includes(filters.itemNoSearch.toLowerCase())
      );
    }

    console.log(`🔍 Applied client-side filters: ${filtered.length} of ${data.length} records match`);
    return filtered;
  }

  /**
   * Extract unique filter options from lot input records
   *
   * @param records - Lot input records
   * @returns Filter options data
   */
  extractFilterOptions(records: InfLotInputRecord[]): FilterOptionsData {
    const partSites = [...new Set(records.map(r => r.PartSite).filter(Boolean))].sort();
    const lineNos = [...new Set(records.map(r => r.LineNo).filter(Boolean))].sort();
    const models = [...new Set(records.map(r => r.Model).filter(Boolean))].sort();
    const versions = [...new Set(records.map(r => r.Version).filter(Boolean))].sort();

    console.log('📋 Extracted filter options:', { partSites, lineNos, models, versions });

    return { partSites, lineNos, models, versions };
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
   * Get search terms from filters
   *
   * @param filters - Data filters
   * @returns Array of search terms
   */
  getSearchTerms(filters: DataFilters): string[] {
    const terms = [];
    if (filters.lotNoSearch.trim()) terms.push(filters.lotNoSearch.trim());
    if (filters.itemNoSearch.trim()) terms.push(filters.itemNoSearch.trim());
    return terms;
  }

  // ==================== EXCLUDE KEYWORDS & CLEANUP ====================

  /**
   * Get exclude keywords from sysconfig
   */
  async getExcludeKeywords(): Promise<{ success: boolean; data?: string; message?: string }> {
    try {
      const response = await fetch(`${this.baseUrl}/exclude-keywords`);
      const result = await response.json();
      return result;
    } catch (error) {
      console.error('❌ Error getting exclude keywords:', error);
      return { success: false, message: error instanceof Error ? error.message : 'Failed to get keywords' };
    }
  }

  /**
   * Update exclude keywords in sysconfig
   */
  async updateExcludeKeywords(keywords: string): Promise<{ success: boolean; data?: string; message?: string }> {
    try {
      const response = await fetch(`${this.baseUrl}/exclude-keywords`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ keywords })
      });
      const result = await response.json();
      return result;
    } catch (error) {
      console.error('❌ Error updating exclude keywords:', error);
      return { success: false, message: error instanceof Error ? error.message : 'Failed to update keywords' };
    }
  }

  /**
   * Items in inf_lotinput (last 2 months) not present in the parts master
   */
  async getMissingItems(): Promise<{ success: boolean; data?: string[]; message?: string }> {
    try {
      const response = await fetch(`${this.baseUrl}/missing-items`, { credentials: 'include' });
      return await response.json();
    } catch (error) {
      console.error('❌ Error fetching missing items:', error);
      return { success: false, message: error instanceof Error ? error.message : 'Failed to fetch missing items' };
    }
  }

  /**
   * Cleanup inf_lotinput by removing lots matching exclude keywords
   */
  async cleanupByKeywords(): Promise<{
    success: boolean;
    message?: string;
    removed?: number;
    lotNumbers?: string[];
  }> {
    try {
      const response = await fetch(`${this.baseUrl}/cleanup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      const result = await response.json();
      return result;
    } catch (error) {
      console.error('❌ Error running cleanup:', error);
      return { success: false, message: error instanceof Error ? error.message : 'Failed to cleanup' };
    }
  }
}

// Export singleton instance
export const infLotInputService = new InfLotInputService();

// Export class for testing
export { InfLotInputService };