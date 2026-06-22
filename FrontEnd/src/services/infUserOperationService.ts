// client/src/services/infUserOperationService.ts
// Service for UserOperation Interface API calls

import type {
  InfUserOperationRecord,
  ApiResponse,
  ImportStats,
  SyncStats,
  FilterOptionsData
} from '../types/inf-useroperation';
import { apiBaseUrl } from './api';

/**
 * INF User Operation Service - API communication for user operation data
 */
class InfUserOperationService {
  private readonly baseUrl = apiBaseUrl('inf-useroperation');

  /**
   * Fetch all user operation records with optional filters
   */
  async fetchUserOperationData(params?: {
    page?: number;
    limit?: number;
    usernameSearch?: string;
    operatorNameSearch?: string;
    globalSearch?: string;
    roleCode?: string;
    lineNoId?: string;
    workShiftId?: string;
    isActive?: boolean;
    isSuperAdmin?: boolean;
    isMrb?: boolean;
  }): Promise<ApiResponse<InfUserOperationRecord[]>> {
    try {
      const queryString = this.buildQueryString(params || {});
      const url = queryString ? `${this.baseUrl}?${queryString}` : this.baseUrl;

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include'
      });

      if (!response.ok) {
        // Try to get error details from response
        let errorMessage = `HTTP error! status: ${response.status}`;
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorData.error || errorMessage;
          console.error('❌ API Error Details:', errorData);
        } catch (e) {
          // Response is not JSON
        }
        throw new Error(errorMessage);
      }

      const data = await response.json();
      return data;

    } catch (error) {
      console.error('Error fetching user operation data:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to fetch user operation data',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Get statistics for dashboard
   */
  async getStatistics(): Promise<ApiResponse<ImportStats>> {
    try {
      const response = await fetch(`${this.baseUrl}/statistics`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;

    } catch (error) {
      console.error('Error fetching statistics:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to fetch statistics',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Get filter options (unique values for dropdowns)
   */
  async getFilterOptions(): Promise<ApiResponse<FilterOptionsData>> {
    try {
      const response = await fetch(`${this.baseUrl}/filter-options`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;

    } catch (error) {
      console.error('Error fetching filter options:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to fetch filter options',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Sync data from MSSQL database
   */
  async syncData(params?: {
    tableName?: string;
    dateFrom?: string;
    dateTo?: string;
  }): Promise<ApiResponse<SyncStats>> {
    try {
      const response = await fetch(`${this.baseUrl}/sync`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify(params || {})
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;

    } catch (error) {
      console.error('Error syncing data from MSSQL:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to sync data from MSSQL',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Search by username
   */
  async searchByUsername(username: string): Promise<ApiResponse<InfUserOperationRecord[]>> {
    try {
      const response = await fetch(`${this.baseUrl}/${encodeURIComponent(username)}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;

    } catch (error) {
      console.error('Error searching by username:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to search by username',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Health check
   */
  async healthCheck(): Promise<ApiResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/health`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;

    } catch (error) {
      console.error('Error checking health:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Health check failed',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  // ==================== HELPER METHODS ====================

  /**
   * Build query string from parameters
   */
  private buildQueryString(params: Record<string, any>): string {
    const queryParams = new URLSearchParams();

    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        queryParams.append(key, String(value));
      }
    });

    return queryParams.toString();
  }

  /**
   * Format date to display format (YYYY-MM-DD -> DD/MM/YYYY)
   */
  formatDate(dateString: string | null): string {
    if (!dateString) return '-';

    try {
      const date = new Date(dateString);
      const day = date.getDate().toString().padStart(2, '0');
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      const year = date.getFullYear();
      return `${day}/${month}/${year}`;
    } catch (error) {
      return dateString;
    }
  }

  /**
   * Format datetime to display format with time
   */
  formatDateTime(dateString: string | null): string {
    if (!dateString) return '-';

    try {
      const date = new Date(dateString);
      const day = date.getDate().toString().padStart(2, '0');
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      const year = date.getFullYear();
      const hours = date.getHours().toString().padStart(2, '0');
      const minutes = date.getMinutes().toString().padStart(2, '0');
      return `${day}/${month}/${year} ${hours}:${minutes}`;
    } catch (error) {
      return dateString;
    }
  }

  /**
   * Get today's date in YYYY-MM-DD format
   */
  getTodayDate(): string {
    const today = new Date();
    const year = today.getFullYear();
    const month = (today.getMonth() + 1).toString().padStart(2, '0');
    const day = today.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
}

// Export singleton instance
export const infUserOperationService = new InfUserOperationService();
export default infUserOperationService;
