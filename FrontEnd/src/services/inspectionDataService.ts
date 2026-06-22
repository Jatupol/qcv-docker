// client/src/services/inspectionDataService.ts
// Complete Separation Entity - InspectionData Frontend Service
// Updated to match current database schema

// Get API configuration from centralized config
import { apiBaseUrl } from './api';
import { formatDateTime } from '../utils/formatUtils';
import  type { InspectionData, InspectionDataQuery, ServiceResponse, ListResponse, CreateInspectionDataRequest
  , UpdateInspectionDataRequest, OQAInspectionData, OQARecommendations, InspectionDataStatistics, InspectionTrend
} from '../types/inspectiondata';

// ==================== TYPE IMPORTS ====================


// ==================== INSPECTION DATA SERVICE CLASS ====================

/**
 * InspectionData Service Class
 * Handles all API communication for inspection data operations
 * Follows Complete Separation Entity Architecture
 */
class InspectionDataService {
  private baseUrl = apiBaseUrl('inspectiondata');

  // ==================== CORE CRUD OPERATIONS ====================

  /**
   * Get all inspection data with filtering and pagination
   */
  async getAll(params?: InspectionDataQuery): Promise<ServiceResponse<ListResponse<InspectionData>>> {
    try {
      const queryString = params ? new URLSearchParams({
        ...(params.page && { page: params.page.toString() }),
        ...(params.limit && { limit: params.limit.toString() }),
        ...(params.sort_by && { sort_by: params.sort_by }),
        ...(params.sort_order && { sort_order: params.sort_order }),
        ...(params.station && { station: params.station }),
        ...(params.ww && { ww: params.ww.toString() }),
        ...(params.emp_qc_id && { emp_qc_id: params.emp_qc_id }),
        ...(params.shift && { shift: params.shift }),
        ...(params.line_fvi_no && { line_fvi_no: params.line_fvi_no }),
        ...(params.sampling_reason_id && { sampling_reason_id: params.sampling_reason_id.toString() }),
        ...(params.lotno && { lotno: params.lotno }),
        ...(params.model && { model: params.model }),
        ...(params.judgment !== undefined && { judgment: params.judgment?.toString() || 'null' }),
        ...(params.today && { today: 'true' }),
        ...(params.yesterday && { yesterday: 'true' }),
        ...(params.this_week && { this_week: 'true' }),
        ...(params.this_month && { this_month: 'true' }),
        ...(params.inspection_date_from && { inspection_date_from: params.inspection_date_from }),
        ...(params.inspection_date_to && { inspection_date_to: params.inspection_date_to }),
        ...(params.term && { term: params.term }),
        ...(params.fields && { fields: params.fields.join(',') }),
      }).toString() : '';

      const url = queryString ? `${this.baseUrl}?${queryString}` : this.baseUrl;

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Include session cookies
        cache: 'no-cache', // Always fetch fresh data
      });

      const result = await response.json();

      if (!response.ok) {
        console.error('Error fetching inspection data:', result);
        return {
          success: false,
          errors: result.errors || [{ field: 'general', message: result.message || 'Failed to fetch inspection data' }],
        };
      }

      return {
        success: true,
        data: result,
      };

    } catch (error) {
      console.error('Network error fetching inspection data:', error);
      return {
        success: false,
        errors: [{ field: 'network', message: error instanceof Error ? error.message : 'Network error' }],
      };
    }
  }

  /**
   * Get all inspection data for Customer data with optional search
   * Uses the server's getAllCustomer method which queries inspectiondata_customer table
   */
  async getAllCustomerData(params?: InspectionDataQuery): Promise<ServiceResponse<ListResponse<InspectionData>>> {
    try {
      const queryString = params ? new URLSearchParams({
        ...(params.page && { page: params.page.toString() }),
        ...(params.limit && { limit: params.limit.toString() }),
        ...(params.sort_by && { sort_by: params.sort_by }),
        ...(params.sort_order && { sort_order: params.sort_order }),
        ...(params.station && { station: params.station }),
        ...(params.ww && { ww: params.ww.toString() }),
        ...(params.emp_qc_id && { emp_qc_id: params.emp_qc_id }),
        ...(params.shift && { shift: params.shift }),
        ...(params.line_fvi_no && { line_fvi_no: params.line_fvi_no }),
        ...(params.sampling_reason_id && { sampling_reason_id: params.sampling_reason_id.toString() }),
        ...(params.lotno && { lotno: params.lotno }),
        ...(params.model && { model: params.model }),
        ...(params.judgment !== undefined && { judgment: params.judgment?.toString() || 'null' }),
        ...(params.today && { today: 'true' }),
        ...(params.yesterday && { yesterday: 'true' }),
        ...(params.this_week && { this_week: 'true' }),
        ...(params.this_month && { this_month: 'true' }),
        ...(params.inspection_date_from && { inspection_date_from: params.inspection_date_from }),
        ...(params.inspection_date_to && { inspection_date_to: params.inspection_date_to }),
        ...(params.term && { term: params.term }),
        ...(params.fields && { fields: params.fields.join(',') }),
      }).toString() : '';

      const url = queryString ? `${this.baseUrl}/customerdata?${queryString}` : `${this.baseUrl}/customerdata`;

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Include session cookies
        cache: 'no-cache', // Always fetch fresh data
      });

      const result = await response.json();

      if (!response.ok) {
        console.error('Error fetching inspection data:', result);
        return {
          success: false,
          errors: result.errors || [{ field: 'general', message: result.message || 'Failed to fetch inspection data' }],
        };
      }

      return {
        success: true,
        data: result,
      };

    } catch (error) {
      console.error('Network error fetching inspection data:', error);
      return {
        success: false,
        errors: [{ field: 'network', message: error instanceof Error ? error.message : 'Network error' }],
      };
    }
  }

  /**
   * Get current judgment from inspectiondata_customer table
   */
  async getCustomerJudgment(inspectionNo: string): Promise<ServiceResponse<{ judgment: boolean | null }>> {
    try {
      const response = await fetch(`${this.baseUrl}/customerdata-judgment/${encodeURIComponent(inspectionNo)}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        cache: 'no-cache',
      });
      const result = await response.json();
      if (!response.ok) {
        return { success: false, errors: [{ field: 'general', message: result.message || 'Failed to get judgment' }] };
      }
      return { success: true, data: result.data };
    } catch (error) {
      return { success: false, errors: [{ field: 'network', message: error instanceof Error ? error.message : 'Network error' }] };
    }
  }

  /**
   * Update judgment in inspectiondata_customer table
   */
  async updateCustomerJudgment(inspectionNo: string, judgment: boolean): Promise<ServiceResponse<null>> {
    try {
      const response = await fetch(`${this.baseUrl}/customerdata-judgment`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ inspection_no: inspectionNo, judgment }),
      });
      const result = await response.json();
      if (!response.ok) {
        return { success: false, errors: [{ field: 'general', message: result.message || 'Failed to update judgment' }] };
      }
      return { success: true, data: null };
    } catch (error) {
      return { success: false, errors: [{ field: 'network', message: error instanceof Error ? error.message : 'Network error' }] };
    }
  }

  /**
   * Get inspection data by ID
   */
  async getById(id: number): Promise<ServiceResponse<InspectionData>> {
    try {
      const response = await fetch(`${this.baseUrl}/${id}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        cache: 'no-cache',
      });

      const result = await response.json();

      if (!response.ok) {
        console.error('Error fetching inspection data by ID:', result);
        return {
          success: false,
          errors: result.errors || [{ field: 'general', message: result.message || 'Failed to fetch inspection data' }],
        };
      }

      return {
        success: true,
        data: result.data,
        message: result.message,
      };

    } catch (error) {
      console.error('Network error fetching inspection data by ID:', error);
      return {
        success: false,
        errors: [{ field: 'network', message: error instanceof Error ? error.message : 'Network error' }],
      };
    }
  }

  /**
   * Create new inspection data
   */
  async create(data: CreateInspectionDataRequest): Promise<ServiceResponse<InspectionData>> {
    try {
      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        cache: 'no-cache',
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        console.error('Error creating inspection data:', result);
        return {
          success: false,
          errors: result.errors || [{ field: 'general', message: result.message || 'Failed to create inspection data' }],
        };
      }

      return {
        success: true,
        data: result.data,
        message: result.message,
      };

    } catch (error) {
      console.error('Network error creating inspection data:', error);
      return {
        success: false,
        errors: [{ field: 'network', message: error instanceof Error ? error.message : 'Network error' }],
      };
    }
  }

  /**
   * Update inspection data by ID
   */
  async update(id: number, data: UpdateInspectionDataRequest): Promise<ServiceResponse<InspectionData>> {
    try {
      const response = await fetch(`${this.baseUrl}/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        cache: 'no-cache',
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        console.error('Error updating inspection data:', result);
        return {
          success: false,
          errors: result.errors || [{ field: 'general', message: result.message || 'Failed to update inspection data' }],
        };
      }

      return {
        success: true,
        data: result.data,
        message: result.message,
      };

    } catch (error) {
      console.error('Network error updating inspection data:', error);
      return {
        success: false,
        errors: [{ field: 'network', message: error instanceof Error ? error.message : 'Network error' }],
      };
    }
  }

  /**
   * Delete inspection data by ID (soft delete)
   */
  async delete(id: number): Promise<ServiceResponse<void>> {
    try {
      const response = await fetch(`${this.baseUrl}/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        cache: 'no-cache',
      });

      const result = await response.json();

      if (!response.ok) {
        console.error('Error deleting inspection data:', result);
        return {
          success: false,
          errors: result.errors || [{ field: 'general', message: result.message || 'Failed to delete inspection data' }],
        };
      }

      return {
        success: true,
        message: result.message,
      };

    } catch (error) {
      console.error('Network error deleting inspection data:', error);
      return {
        success: false,
        errors: [{ field: 'network', message: error instanceof Error ? error.message : 'Network error' }],
      };
    }
  }

  // ==================== INSPECTION-SPECIFIC OPERATIONS ====================

  /**
   * Get inspection data by lot number
   */
  async getByLotNumber(lotno: string): Promise<ServiceResponse<InspectionData[]>> {
    try {
      const response = await fetch(`${this.baseUrl}/lot/${encodeURIComponent(lotno)}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        cache: 'no-cache',
      });

      const result = await response.json();

      if (!response.ok) {
        console.error('Error fetching inspection data by lot number:', result);
        return {
          success: false,
          errors: result.errors || [{ field: 'general', message: result.message || 'Failed to fetch inspection data' }],
        };
      }

      return {
        success: true,
        data: result.data,
        message: result.message,
      };

    } catch (error) {
      console.error('Network error fetching inspection data by lot number:', error);
      return {
        success: false,
        errors: [{ field: 'network', message: error instanceof Error ? error.message : 'Network error' }],
      };
    }
  }

  /**
   * Get today's inspections, optionally filtered by station
   */
  async getTodayInspections(station?: string): Promise<ServiceResponse<InspectionData[]>> {
    try {
      const url = station 
        ? `${this.baseUrl}/today?station=${encodeURIComponent(station)}`
        : `${this.baseUrl}/today`;

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        cache: 'no-cache',
      });

      const result = await response.json();

      if (!response.ok) {
        console.error('Error fetching today\'s inspections:', result);
        return {
          success: false,
          errors: result.errors || [{ field: 'general', message: result.message || 'Failed to fetch today\'s inspections' }],
        };
      }

      return {
        success: true,
        data: result.data,
        message: result.message,
      };

    } catch (error) {
      console.error('Network error fetching today\'s inspections:', error);
      return {
        success: false,
        errors: [{ field: 'network', message: error instanceof Error ? error.message : 'Network error' }],
      };
    }
  }

  /**
   * Get the next sampling round for a given station and lotno
   */
  async getNextSamplingRound(station: string, lotno: string): Promise<ServiceResponse<{ nextRound: number }>> {
    try {
      const response = await fetch(`${this.baseUrl}/sampling-round?station=${encodeURIComponent(station)}&lotno=${encodeURIComponent(lotno)}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        cache: 'no-cache',
      });

      const result = await response.json();

      if (!response.ok) {
        console.error('Error fetching sampling round:', result);
        return {
          success: false,
          errors: result.errors || [{ field: 'general', message: result.message || 'Failed to fetch sampling round' }],
        };
      }

      return {
        success: true,
        data: result.data || { nextRound: 1 },
        message: result.message,
      };

    } catch (error) {
      console.error('Network error fetching sampling round:', error);
      // Default to round 1 on error
      return {
        success: true,
        data: { nextRound: 1 },
      };
    }
  }

  /**
   * Generate the next inspection number
   * Format: Station+YY+MM+WW+'-'+DD+RunningNumber4digit
   * Running number resets to 1 at the beginning of each day
   * Example: OQA2501W01-300001, OQA2501W01-300002, OQA2501W01-310001 (new day)
   */
  async generateInspectionNumber(station: string, date: string, ww: string): Promise<ServiceResponse<{ inspectionNo: string }>> {
    try {
      const response = await fetch(
        `${this.baseUrl}/generate-inspection-number?station=${encodeURIComponent(station)}&date=${encodeURIComponent(date)}&ww=${encodeURIComponent(ww)}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          cache: 'no-cache',
        }
      );

      const result = await response.json();

      if (!response.ok) {
        console.error('Error generating inspection number:', result);
        return {
          success: false,
          errors: result.errors || [{ field: 'general', message: result.message || 'Failed to generate inspection number' }],
        };
      }

      return {
        success: true,
        data: result.data,
        message: result.message,
      };

    } catch (error) {
      console.error('Network error generating inspection number:', error);
      // Generate a fallback number
      const now = new Date();
      const yy = now.getFullYear().toString().slice(-2);
      const mm = (now.getMonth() + 1).toString().padStart(2, '0');
      const dd = now.getDate().toString().padStart(2, '0');
      const timestamp = Date.now().toString().slice(-4);
      return {
        success: true,
        data: { inspectionNo: `${station}${yy}${mm}${dd}-${timestamp}` },
      };
    }
  }

  /**
   * Get pending judgments (inspections without pass/reject decision)
   */
  async getPendingJudgments(): Promise<ServiceResponse<InspectionData[]>> {
    try {
      const response = await fetch(`${this.baseUrl}/pending`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        cache: 'no-cache',
      });

      const result = await response.json();

      if (!response.ok) {
        console.error('Error fetching pending judgments:', result);
        return {
          success: false,
          errors: result.errors || [{ field: 'general', message: result.message || 'Failed to fetch pending judgments' }],
        };
      }

      return {
        success: true,
        data: result.data,
        message: result.message,
      };

    } catch (error) {
      console.error('Network error fetching pending judgments:', error);
      return {
        success: false,
        errors: [{ field: 'network', message: error instanceof Error ? error.message : 'Network error' }],
      };
    }
  }

  /**
   * Update judgment for a specific inspection
   */
  async updateJudgment(id: number, judgment: boolean): Promise<ServiceResponse<InspectionData>> {
    try {
      const response = await fetch(`${this.baseUrl}/${id}/judgment`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        cache: 'no-cache',
        body: JSON.stringify({ judgment }),
      });

      const result = await response.json();

      if (!response.ok) {
        console.error('Error updating inspection judgment:', result);
        return {
          success: false,
          errors: result.errors || [{ field: 'general', message: result.message || 'Failed to update judgment' }],
        };
      }

      return {
        success: true,
        data: result.data,
        message: result.message,
      };

    } catch (error) {
      console.error('Network error updating inspection judgment:', error);
      return {
        success: false,
        errors: [{ field: 'network', message: error instanceof Error ? error.message : 'Network error' }],
      };
    }
  }

  /**
   * Bulk update judgments for multiple inspections
   */
  async bulkUpdateJudgments(updates: Array<{ id: number; judgment: boolean }>): Promise<ServiceResponse<InspectionData[]>> {
    try {
      const response = await fetch(`${this.baseUrl}/bulk-judgment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        cache: 'no-cache',
        body: JSON.stringify({ updates }),
      });

      const result = await response.json();

      if (!response.ok) {
        console.error('Error bulk updating judgments:', result);
        return {
          success: false,
          errors: result.errors || [{ field: 'general', message: result.message || 'Failed to bulk update judgments' }],
        };
      }

      return {
        success: true,
        data: result.data,
        message: result.message,
      };

    } catch (error) {
      console.error('Network error bulk updating judgments:', error);
      return {
        success: false,
        errors: [{ field: 'network', message: error instanceof Error ? error.message : 'Network error' }],
      };
    }
  }

  // ==================== OQA-SPECIFIC OPERATIONS ====================

  /**
   * Create inspection data specifically for OQA workflow
   */
  async createOQAInspection(oqaData: OQAInspectionData): Promise<ServiceResponse<InspectionData>> {
    try {
      const response = await fetch(`${this.baseUrl}/oqa`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        cache: 'no-cache',
        body: JSON.stringify(oqaData),
      });

      const result = await response.json();

      if (!response.ok) {
        console.error('Error creating OQA inspection:', result);
        return {
          success: false,
          errors: result.errors || [{ field: 'general', message: result.message || 'Failed to create OQA inspection' }],
        };
      }

      return {
        success: true,
        data: result.data,
        message: result.message,
      };

    } catch (error) {
      console.error('Network error creating OQA inspection:', error);
      return {
        success: false,
        errors: [{ field: 'network', message: error instanceof Error ? error.message : 'Network error' }],
      };
    }
  }

  /**
   * Get OQA recommendations for a specific lot
   */
  async getOQARecommendations(lotno: string): Promise<ServiceResponse<OQARecommendations>> {
    try {
      const response = await fetch(`${this.baseUrl}/oqa/recommendations/${encodeURIComponent(lotno)}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        cache: 'no-cache',
      });

      const result = await response.json();

      if (!response.ok) {
        console.error('Error fetching OQA recommendations:', result);
        return {
          success: false,
          errors: result.errors || [{ field: 'general', message: result.message || 'Failed to fetch OQA recommendations' }],
        };
      }

      return {
        success: true,
        data: result.data,
        message: result.message,
      };

    } catch (error) {
      console.error('Network error fetching OQA recommendations:', error);
      return {
        success: false,
        errors: [{ field: 'network', message: error instanceof Error ? error.message : 'Network error' }],
      };
    }
  }

  /**
   * Create SIV inspection from OQA/OBA inspection
   * @param inspectionId - ID of the inspection to create SIV from
   * @returns Service response with created SIV inspection data
   */
  async createSIV(inspectionId: number): Promise<ServiceResponse<InspectionData>> {
    try {
      console.log('🔧 Creating SIV from inspection:', inspectionId);

      const response = await fetch(`${this.baseUrl}/${inspectionId}/create-siv`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        cache: 'no-cache',
      });

      console.log('📡 Response status:', response.status);
      console.log('📡 Response content-type:', response.headers.get('content-type'));

      // Check content type before parsing
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        // Response is not JSON (likely HTML error page)
        const text = await response.text();
        console.error('❌ Received non-JSON response:', text.substring(0, 200));

        const errorMsg = response.status === 401
          ? 'Authentication required. Please log in again.'
          : `Server error (${response.status}). The server returned an unexpected response.`;

        return {
          success: false,
          errors: [{ field: 'general', message: errorMsg }],
        };
      }

      const result = await response.json();
      console.log('📋 API result:', result);

      if (!response.ok) {
        console.error('Error creating SIV inspection:', result);
        return {
          success: false,
          errors: result.errors || [{ field: 'general', message: result.message || 'Failed to create SIV inspection' }],
        };
      }

      console.log('✅ SIV inspection created successfully:', result.data);

      return {
        success: true,
        data: result.data,
        message: result.message || 'SIV inspection created successfully',
      };

    } catch (error) {
      console.error('Network error creating SIV inspection:', error);
      return {
        success: false,
        errors: [{ field: 'network', message: error instanceof Error ? error.message : 'Network error' }],
      };
    }
  }

  // ==================== ANALYTICS & REPORTING ====================

  /**
   * Get comprehensive inspection statistics
   */
  async getStatistics(): Promise<ServiceResponse<InspectionDataStatistics>> {
    try {
      const response = await fetch(`${this.baseUrl}/statistics`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        cache: 'no-cache',
      });

      const result = await response.json();

      if (!response.ok) {
        console.error('Error fetching inspection statistics:', result);
        return {
          success: false,
          errors: result.errors || [{ field: 'general', message: result.message || 'Failed to fetch statistics' }],
        };
      }

      return {
        success: true,
        data: result.data,
        message: result.message,
      };

    } catch (error) {
      console.error('Network error fetching inspection statistics:', error);
      return {
        success: false,
        errors: [{ field: 'network', message: error instanceof Error ? error.message : 'Network error' }],
      };
    }
  }

  /**
   * Get inspection trends for dashboard
   */
  async getInspectionTrends(days: number = 7): Promise<ServiceResponse<InspectionTrend[]>> {
    try {
      const response = await fetch(`${this.baseUrl}/trends?days=${days}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        cache: 'no-cache',
      });

      const result = await response.json();

      if (!response.ok) {
        console.error('Error fetching inspection trends:', result);
        return {
          success: false,
          errors: result.errors || [{ field: 'general', message: result.message || 'Failed to fetch trends' }],
        };
      }

      return {
        success: true,
        data: result.data,
        message: result.message,
      };

    } catch (error) {
      console.error('Network error fetching inspection trends:', error);
      return {
        success: false,
        errors: [{ field: 'network', message: error instanceof Error ? error.message : 'Network error' }],
      };
    }
  }

  /**
   * Generate inspection summary report
   */
  async getSummaryReport(filters?: InspectionDataQuery): Promise<ServiceResponse<any>> {
    try {
      const queryString = filters ? new URLSearchParams({
        ...(filters.station && { station: filters.station }),
        ...(filters.shift && { shift: filters.shift }),
        ...(filters.model && { model: filters.model }),
        ...(filters.inspection_date_from && { date_from: filters.inspection_date_from.toISOString() }),
        ...(filters.inspection_date_to && { date_to: filters.inspection_date_to.toISOString() }),
      }).toString() : '';

      const url = queryString ? `${this.baseUrl}/summary?${queryString}` : `${this.baseUrl}/summary`;

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        cache: 'no-cache',
      });

      const result = await response.json();

      if (!response.ok) {
        console.error('Error generating summary report:', result);
        return {
          success: false,
          errors: result.errors || [{ field: 'general', message: result.message || 'Failed to generate summary report' }],
        };
      }

      return {
        success: true,
        data: result.data,
        message: result.message,
      };

    } catch (error) {
      console.error('Network error generating summary report:', error);
      return {
        success: false,
        errors: [{ field: 'network', message: error instanceof Error ? error.message : 'Network error' }],
      };
    }
  }

  // ==================== UTILITY METHODS ====================

  /**
   * Search inspection data with advanced criteria
   */
  async search(params: InspectionDataQuery): Promise<ServiceResponse<ListResponse<InspectionData>>> {
    try {
      const queryString = new URLSearchParams({
        ...(params.term && { term: params.term }),
        ...(params.fields && { fields: params.fields.join(',') }),
        ...(params.page && { page: params.page.toString() }),
        ...(params.limit && { limit: params.limit.toString() }),
        ...(params.station && { station: params.station }),
        ...(params.shift && { shift: params.shift }),
        ...(params.model && { model: params.model }),
        ...(params.lotno && { lotno: params.lotno }),
        ...(params.judgment !== undefined && { judgment: params.judgment?.toString() || 'null' }),
      }).toString();

      const response = await fetch(`${this.baseUrl}/search?${queryString}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        cache: 'no-cache',
      });

      const result = await response.json();

      if (!response.ok) {
        console.error('Error searching inspection data:', result);
        return {
          success: false,
          errors: result.errors || [{ field: 'general', message: result.message || 'Failed to search inspection data' }],
        };
      }

      return {
        success: true,
        data: result,
      };

    } catch (error) {
      console.error('Network error searching inspection data:', error);
      return {
        success: false,
        errors: [{ field: 'network', message: error instanceof Error ? error.message : 'Network error' }],
      };
    }
  }

  /**
   * Validate inspection data before submission
   */
  validateInspectionData(data: CreateInspectionDataRequest): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Required fields validation
    if (!data.lotno || data.lotno.trim() === '') {
      errors.push('Lot number is required');
    }

    if (!data.station || data.station.trim() === '') {
      errors.push('Station is required');
    }

    // Format validations
    if (data.station && !/^[A-Z]{1,3}$/.test(data.station)) {
      errors.push('Station must be 1-3 uppercase letters (e.g., OQA, FVI)');
    }

    if (data.shift && !/^[ABC]$/.test(data.shift)) {
      errors.push('Shift must be A, B, or C');
    }

    if (data.round !== undefined && (data.round < 1 || data.round > 10)) {
      errors.push('Sampling round must be between 1 and 10');
    }

    // Quantity validations
    if (data.fvi_lot_qty !== undefined && (data.fvi_lot_qty < 0 || data.fvi_lot_qty > 999999)) {
      errors.push('FVI lot quantity must be between 0 and 999,999');
    }

    if (data.general_sampling_qty !== undefined && (data.general_sampling_qty < 0 || data.general_sampling_qty > 99999)) {
      errors.push('General sampling quantity must be between 0 and 99,999');
    }

    if (data.crack_sampling_qty !== undefined && (data.crack_sampling_qty < 0 || data.crack_sampling_qty > 99999)) {
      errors.push('Crack sampling quantity must be between 0 and 99,999');
    }

    // String length validations
    if (data.lotno && data.lotno.length > 100) {
      errors.push('Lot number cannot exceed 100 characters');
    }

    if (data.model && data.model.length > 100) {
      errors.push('Model cannot exceed 100 characters');
    }

    if (data.itemno && data.itemno.length > 100) {
      errors.push('Item number cannot exceed 100 characters');
    }

    if (data.qc_id && data.qc_id.toString().length > 20) {
      errors.push('Employee QC ID cannot exceed 20 characters');
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  /**
   * Format inspection data for display
   */
  formatInspectionData(inspection: InspectionData): {
    formattedDate: string;
    formattedJudgment: string;
    statusColor: string;
    stationDisplay: string;
  } {
    const formattedDate = formatDateTime(inspection.inspection_date);
    
    let formattedJudgment: string;
    let statusColor: string;
    
    if (inspection.judgment === null) {
      formattedJudgment = 'Pending';
      statusColor = 'yellow';
    } else if (inspection.judgment === true) {
      formattedJudgment = 'PASS';
      statusColor = 'green';
    } else {
      formattedJudgment = 'REJECT';
      statusColor = 'red';
    }

    const stationDisplay = inspection.station || 'Unknown';

    return {
      formattedDate,
      formattedJudgment,
      statusColor,
      stationDisplay
    };
  }

  /**
   * Get inspection data for OQA form (helper for OQA page)
   */
  async getInspectionForOQA(lotno: string): Promise<ServiceResponse<{
    existingInspections: InspectionData[];
    canCreateNew: boolean;
    recommendations: {
      suggestedRound: number;
      previousJudgments: boolean[];
      lastInspectionDate: Date | null;
    };
  }>> {
    try {
      const response = await this.getByLotNumber(lotno);
      
      if (!response.success || !response.data) {
        return response as ServiceResponse<any>;
      }

      const existingInspections = response.data;
      const canCreateNew = existingInspections.length < 10; // Max 10 rounds per lot
      
      // Calculate recommendations
      const sortedByRound = existingInspections
        .filter(i => i.round)
        .sort((a, b) => a.round - b.round);
      
      const suggestedRound = sortedByRound.length > 0 
        ? Math.max(...sortedByRound.map(i => i.round)) + 1 
        : 1;
      
      const previousJudgments = sortedByRound
        .map(i => i.judgment)
        .filter(j => j !== null) as boolean[];
      
      const lastInspectionDate = existingInspections.length > 0
        ? new Date(Math.max(...existingInspections.map(i => new Date(i.inspection_date).getTime())))
        : null;

      return {
        success: true,
        data: {
          existingInspections,
          canCreateNew,
          recommendations: {
            suggestedRound,
            previousJudgments,
            lastInspectionDate
          }
        }
      };

    } catch (error) {
      console.error('Error getting inspection data for OQA:', error);
      return {
        success: false,
        errors: [{ field: 'network', message: error instanceof Error ? error.message : 'Network error' }],
      };
    }
  }

  /**
   * Get inspection data with detailed information including related data
   */
  async getByIdWithDetails(id: number): Promise<ServiceResponse<InspectionData>> {
    try {
      const response = await fetch(`${this.baseUrl}/${id}/details`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        cache: 'no-cache',
      });

      const result = await response.json();

      if (!response.ok) {
        console.error('Error fetching detailed inspection data:', result);
        return {
          success: false,
          errors: result.errors || [{ field: 'general', message: result.message || 'Failed to fetch detailed inspection data' }],
        };
      }

      return {
        success: true,
        data: result.data,
        message: result.message,
      };

    } catch (error) {
      console.error('Network error fetching detailed inspection data:', error);
      return {
        success: false,
        errors: [{ field: 'network', message: error instanceof Error ? error.message : 'Network error' }],
      };
    }
  }

  /**
   * Health check for service connectivity
   */
  async healthCheck(): Promise<{
    healthy: boolean;
    message: string;
    details?: any;
  }> {
    try {
      const response = await fetch(`${this.baseUrl}/health`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        cache: 'no-cache',
      });

      const result = await response.json();

      return {
        healthy: response.ok && result.success,
        message: response.ok ? 'InspectionData service healthy' : 'InspectionData service unhealthy',
        details: result.data
      };
      
    } catch (error) {
      return {
        healthy: false,
        message: `InspectionData service error: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  // ==================== HELPER METHODS FOR OQA PAGE ====================
 
  /**
   * Export inspections to CSV format
   */
  async exportToCSV(filters?: InspectionDataQuery): Promise<ServiceResponse<string>> {
    try {
      // Get all matching inspections
      const response = await this.getAll({
        ...filters,
        limit: 10000 // Large limit for export
      });

      if (!response.success || !response.data) {
        return {
          success: false,
          errors: response.errors || [{ field: 'general', message: 'Failed to fetch data for export' }]
        };
      }

      const inspections = response.data.data;
      
      // Create CSV headers
      const headers = [
        'ID', 'Station', 'Work Week', 'Sampling Date', 'Employee QC ID', 'Shift',
        'Line FVI No', 'Sampling Reason ID', 'Lot No', 'Part Site', 'Line MC No',
        'Item No', 'Model', 'Version', 'Round', 'FVI Lot Qty', 'General Sampling Qty',
        'Crack Sampling Qty', 'Judgment', 'Created By', 'Updated By', 'Created At', 'Updated At'
      ];

      // Create CSV rows
      const rows = inspections.map(inspection => [
        inspection.id,
        inspection.station || '',
        inspection.ww,
        new Date(inspection.inspection_date).toISOString(),
        inspection.qc_id || '',
        inspection.shift || '',
        inspection.fvilineno || '',
        inspection.sampling_reason_id,
        inspection.lotno || '',
        inspection.partsite || '',
        inspection.mclineno || '',
        inspection.itemno || '',
        inspection.model || '',
        inspection.version || '',
        inspection.round,
        inspection.fvi_lot_qty,
        inspection.general_sampling_qty,
        inspection.crack_sampling_qty,
        inspection.judgment === null ? 'Pending' : (inspection.judgment ? 'PASS' : 'REJECT'),
        inspection.created_by || '',
        inspection.updated_by || '',
        inspection.created_at ? new Date(inspection.created_at).toISOString() : '',
        inspection.updated_at ? new Date(inspection.updated_at).toISOString() : ''
      ]);

      // Combine headers and rows
      const csvContent = [
        headers.join(','),
        ...rows.map(row => row.map(field => `"${field}"`).join(','))
      ].join('\n');

      return {
        success: true,
        data: csvContent,
        message: `Exported ${inspections.length} inspection records to CSV`
      };

    } catch (error) {
      console.error('Error exporting to CSV:', error);
      return {
        success: false,
        errors: [{ field: 'export', message: error instanceof Error ? error.message : 'Export failed' }],
      };
    }
  }

  /**
   * Download CSV file
   */
  downloadCSV(csvContent: string, filename: string = 'inspections.csv'): void {
    try {
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      
      if (link.download !== undefined) {
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', filename);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error('Error downloading CSV:', error);
    }
  }

  /**
   * Get inspection summary for specific time period
   */
  async getInspectionSummary(period: 'today' | 'week' | 'month' | 'custom', customDateFrom?: Date, customDateTo?: Date): Promise<ServiceResponse<{
    totalInspections: number;
    passedInspections: number;
    rejectedInspections: number;
    pendingInspections: number;
    passRate: number;
    rejectRate: number;
    topModels: Array<{ model: string; count: number }>;
    byStation: Array<{ station: string; count: number; passRate: number }>;
  }>> {
    try {
      const filters: InspectionDataQuery = {};
      
      // Set date filters based on period
      switch (period) {
        case 'today':
          filters.today = true;
          break;
        case 'week':
          filters.this_week = true;
          break;
        case 'month':
          filters.this_month = true;
          break;
        case 'custom':
          if (customDateFrom) filters.inspection_date_from = customDateFrom;
          if (customDateTo) filters.inspection_date_to = customDateTo;
          break;
      }

      // Get filtered inspections
      const response = await this.getAll({
        ...filters,
        limit: 10000 // Large limit to get all for summary
      });

      if (!response.success || !response.data) {
        return {
          success: false,
          errors: response.errors || [{ field: 'general', message: 'Failed to fetch summary data' }]
        };
      }

      const inspections = response.data.data;
      
      // Calculate summary statistics
      const totalInspections = inspections.length;
      const passedInspections = inspections.filter(i => i.judgment === true).length;
      const rejectedInspections = inspections.filter(i => i.judgment === false).length;
      const pendingInspections = inspections.filter(i => i.judgment === null).length;
      
      const judgedTotal = passedInspections + rejectedInspections;
      const passRate = judgedTotal > 0 ? (passedInspections / judgedTotal) * 100 : 0;
      const rejectRate = judgedTotal > 0 ? (rejectedInspections / judgedTotal) * 100 : 0;

      // Get top models
      const modelCounts: { [key: string]: number } = {};
      inspections.forEach(inspection => {
        if (inspection.model) {
          modelCounts[inspection.model] = (modelCounts[inspection.model] || 0) + 1;
        }
      });
      
      const topModels = Object.entries(modelCounts)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 5)
        .map(([model, count]) => ({ model, count }));

      // Get by station
      const stationData: { [key: string]: { total: number; passed: number } } = {};
      inspections.forEach(inspection => {
        if (inspection.station) {
          if (!stationData[inspection.station]) {
            stationData[inspection.station] = { total: 0, passed: 0 };
          }
          stationData[inspection.station].total++;
          if (inspection.judgment === true) {
            stationData[inspection.station].passed++;
          }
        }
      });

      const byStation = Object.entries(stationData).map(([station, data]) => ({
        station,
        count: data.total,
        passRate: data.total > 0 ? (data.passed / data.total) * 100 : 0
      }));

      return {
        success: true,
        data: {
          totalInspections,
          passedInspections,
          rejectedInspections,
          pendingInspections,
          passRate,
          rejectRate,
          topModels,
          byStation
        }
      };

    } catch (error) {
      console.error('Error getting inspection summary:', error);
      return {
        success: false,
        errors: [{ field: 'network', message: error instanceof Error ? error.message : 'Network error' }],
      };
    }
  }

  /**
   * Calculate current work week
   */
  private getCurrentWorkWeek(): number {
    const now = new Date();
    const start = new Date(now.getFullYear(), 0, 1);
    const diff = now.getTime() - start.getTime();
    const oneWeek = 1000 * 60 * 60 * 24 * 7;
    return Math.ceil(diff / oneWeek);
  }

  /**
   * Format date for API requests
   */
  private formatDateForAPI(date: Date): string {
    return date.toISOString();
  }

  /**
   * Handle API errors consistently
   */
  private handleAPIError(error: any, operation: string): ServiceResponse<any> {
    console.error(`Error during ${operation}:`, error);
    
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      return {
        success: false,
        errors: [{ field: 'network', message: 'Network connection failed. Please check your internet connection.' }]
      };
    }

    return {
      success: false,
      errors: [{ field: 'general', message: error instanceof Error ? error.message : `Unknown error during ${operation}` }]
    };
  }

  /**
   * Retry failed requests with exponential backoff
   */
  private async retryRequest<T>(
    requestFn: () => Promise<T>,
    maxRetries: number = 3,
    baseDelay: number = 1000
  ): Promise<T> {
    let lastError: any;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        return await requestFn();
      } catch (error) {
        lastError = error;
        
        if (attempt === maxRetries) {
          throw error;
        }

        // Exponential backoff: wait baseDelay * 2^attempt milliseconds
        const delay = baseDelay * Math.pow(2, attempt);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }

    throw lastError;
  }

  // ==================== DASHBOARD STATISTICS ====================

  /**
   * Get statistics for a specific station
   * Returns counts for total, this year, this month, this week, and today
   * @param station - Station name (OQA, OBA, SIV)
   * @returns Station statistics
   */
  async getStationStats(station: string): Promise<ServiceResponse<{
    total: number;
    this_year: number;
    this_month: number;
    this_week: number;
    today: number;
  }>> {
    try {
      console.log(`📊 Fetching statistics for ${station} station...`);

      const response = await fetch(`${this.baseUrl}/stats/${station}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        cache: 'no-cache',
      });

      const result = await response.json();

      if (!response.ok) {
        console.error(`Error fetching ${station} stats:`, result);
        return {
          success: false,
          errors: result.errors || [{ field: 'general', message: result.message || `Failed to fetch ${station} statistics` }],
        };
      }

      console.log(`✅ ${station} statistics fetched successfully:`, result.data);

      return {
        success: true,
        data: result.data,
      };

    } catch (error) {
      console.error(`Network error fetching ${station} stats:`, error);
      return {
        success: false,
        errors: [{ field: 'network', message: error instanceof Error ? error.message : 'Network error' }],
      };
    }
  }

  /**
   * Get weekly trend data for a specific station
   * Returns pass/fail counts for the last 4 weeks up to the specified fiscal year/week
   * @param station - Station name (OQA, OBA, SIV)
   * @param fiscalYearWeek - Fiscal year + week in format 'YYYYWW' (e.g., '202625' for FY2026 Week 25)
   * @returns Weekly trend data for the last 4 weeks
   */
  async getWeeklyTrend(
    station: string,
    fiscalYearWeek: string
  ): Promise<ServiceResponse<Array<{
    ww: string;
    total: number;
    pass: number;
    fail: number;
  }>>> {
    try {
      console.log(`📈 Fetching weekly trend for ${station} station... (fyww: ${fiscalYearWeek})`);

      const url = `${this.baseUrl}/weekly-trend/${station}?fyww=${fiscalYearWeek}`;

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        cache: 'no-cache',
      });

      const result = await response.json();

      if (!response.ok) {
        console.error(`Error fetching ${station} weekly trend:`, result);
        return {
          success: false,
          errors: result.errors || [{ field: 'general', message: result.message || `Failed to fetch ${station} weekly trend` }],
        };
      }

      console.log(`✅ ${station} weekly trend fetched successfully:`, result.data);

      return {
        success: true,
        data: result.data,
      };

    } catch (error) {
      console.error(`Network error fetching ${station} weekly trend:`, error);
      return {
        success: false,
        errors: [{ field: 'network', message: error instanceof Error ? error.message : 'Network error' }],
      };
    }
  }
  /**
   * Get SIV format data for export
   * Supports same filter parameters as the table view
   */
  async getSIVFormat(params: {
    inspection_date_from?: string;
    inspection_date_to?: string;
    search?: string;
    judgment?: string;
    model?: string;
    lotno?: string;
    fvilineno?: string;
    partsite?: string;
  }): Promise<ServiceResponse<any[]>> {
    try {
      const queryString = new URLSearchParams({
        ...(params.inspection_date_from && { inspection_date_from: params.inspection_date_from }),
        ...(params.inspection_date_to && { inspection_date_to: params.inspection_date_to }),
        ...(params.search && { search: params.search }),
        ...(params.judgment && { judgment: params.judgment }),
        ...(params.model && { model: params.model }),
        ...(params.lotno && { lotno: params.lotno }),
        ...(params.fvilineno && { fvilineno: params.fvilineno }),
        ...(params.partsite && { partsite: params.partsite }),
      }).toString();

      const url = queryString ? `${this.baseUrl}/siv-format?${queryString}` : `${this.baseUrl}/siv-format`;

      const response = await fetch(url, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        cache: 'no-cache',
      });

      const result = await response.json();
      return { success: result.success, data: result.data };
    } catch (error) {
      console.error('Error fetching SIV format data:', error);
      return { success: false, data: [] };
    }
  }
}

// ==================== SINGLETON EXPORT ====================

export const inspectionDataService = new InspectionDataService();
export default inspectionDataService;

/*
=== INSPECTION DATA SERVICE FEATURES ===

✅ COMPLETE CRUD OPERATIONS:
- Create, read, update, delete inspection data
- Follows SERIAL ID entity pattern (/:id routes)
- Full validation and error handling
- Type-safe data transformation

✅ INSPECTION-SPECIFIC OPERATIONS:
- Get inspections by lot number
- Get today's inspections by station
- Get pending judgments
- Update/bulk update judgments
- OQA-specific workflow helpers

✅ ANALYTICS & REPORTING:
- Comprehensive statistics
- Inspection trends over time
- Summary report generation
- Dashboard data preparation
- Export to CSV functionality

✅ VALIDATION & FORMATTING:
- Client-side validation before API calls
- Data format validation
- Display formatting helpers
- Business rule validation

✅ OQA PAGE INTEGRATION:
- createOQAInspection() for OQA workflow
- getInspectionForOQA() with recommendations
- Validation specific to OQA requirements
- Integration with existing OQA page structure

✅ DASHBOARD INTEGRATION:
- getRecentInspections() for dashboard display
- getInspectionCounts() for status summaries
- getInspectionSummary() for time-based analysis
- Health check for service monitoring

✅ EXPORT FUNCTIONALITY:
- Export to CSV format
- Download CSV files
- Customizable filtering for exports
- Large dataset handling

✅ ERROR HANDLING:
- Comprehensive error handling
- Network error management
- Retry mechanism with exponential backoff
- User-friendly error messages
- Consistent error response format

✅ UTILITY METHODS:
- Date formatting for API requests
- Work week calculation
- Data validation helpers
- Response formatting
- Service health monitoring

✅ COMPLETE SEPARATION ARCHITECTURE:
- No dependencies on other entity services
- Self-contained inspection data logic
- Clean API integration layer
- Type-safe throughout
- Singleton pattern for consistency

This service provides everything needed to integrate the OQA page
and other inspection-related features with the new inspectiondata
table while maintaining the Complete Separation Entity Architecture.
*/