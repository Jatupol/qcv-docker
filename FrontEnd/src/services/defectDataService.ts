// client/src/services/defectDataService.ts
// Complete Separation Entity - DefectData Frontend Service
// Manufacturing Quality Control System

// Get API configuration from centralized config
import { apiBaseUrl } from './api';
import { formatDateTime } from '../utils/formatUtils';

// ==================== TYPE IMPORTS ====================

interface DefectData {
  id?: number;
  inspection_no: string;
  defect_date: Date;
  qc_name: string;
  qclead_name: string;
  mbr_name: string;
  linevi: string;
  groupvi: string;
  station: string;
  inspector: string;
  defect_id: number;
  ng_qty: number;
  trayno?: string;
  tray_position?: string;
  color?: string;
  defect_detail?: string;
  defect_type?: string;
  created_by?: number;
  updated_by?: number;
  created_at?: Date;
  updated_at?: Date;
}

interface CreateDefectDataRequest {
  inspection_no: string;
  defect_date?: Date;
  qc_name: string;
  qclead_name: string;
  mbr_name: string;
  linevi: string;
  groupvi: string;
  station: string;
  inspector: string;
  defect_id: number;
  ng_qty?: number;
  trayno?: string;
  tray_position?: string;
  color?: string;
  defect_detail?: string;
  defect_type?: string;
}

interface UpdateDefectDataRequest {
  inspection_no?: string;
  defect_date?: Date;
  qc_name?: string;
  qclead_name?: string;
  mbr_name?: string;
  linevi?: string;
  groupvi?: string;
  station?: string;
  inspector?: string;
  defect_id?: number;
  ng_qty?: number;
  trayno?: string;
  tray_position?: string;
  color?: string;
  defect_detail?: string;
  defect_type?: string;
  updated_by?: number;
}

interface DefectDataQuery {
  // Pagination
  page?: number;
  limit?: number;

  // Sorting
  sort_by?: string;
  sort_order?: 'ASC' | 'DESC';

  // Filters
  inspection_no?: string;
  qc_name?: string;
  qclead_name?: string;
  mbr_name?: string;
  linevi?: string;
  groupvi?: string;
  station?: string;
  inspector?: string;
  defect_id?: number;

  // Date range filters
  defect_date_from?: Date;
  defect_date_to?: Date;

  // Quantity filters
  ng_qty_min?: number;
  ng_qty_max?: number;

  // Optional field filters
  trayno?: string;
  tray_position?: string;
  color?: string;

  // Date shortcuts
  today?: boolean;
  yesterday?: boolean;
  this_week?: boolean;
  this_month?: boolean;

  // Search
  term?: string;
  fields?: string[];

  // Text contains searches
  inspection_no_contains?: string;
  qc_name_contains?: string;
  inspector_contains?: string;

  // Has optional field filters
  has_trayno?: boolean;
  has_tray_position?: boolean;
  has_color?: boolean;
}

interface ServiceResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: Array<{ field: string; message: string }>;
}

interface ListResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
  message?: string;
  errors?: string[];
}

interface DefectDataSummary {
  total_records: number;
  today_records: number;
  this_week_records: number;
  this_month_records: number;
  total_ng_qty: number;
  by_station: {
    [station: string]: {
      count: number;
      total_ng_qty: number;
      defect_types: string[];
    };
  };
  by_linevi: {
    [linevi: string]: {
      count: number;
      total_ng_qty: number;
    };
  };
  by_defect_type: {
    [defect_id: number]: {
      count: number;
      total_ng_qty: number;
      defect_name?: string;
    };
  };
  top_inspectors: Array<{
    inspector: string;
    count: number;
    total_ng_qty: number;
  }>;
  latest_record_at: Date | null;
}

interface DefectDataProfile extends DefectData {
  defect_name?: string;
  defect_description?: string;
  related_records?: DefectData[];
  summary_stats?: {
    same_inspection_count: number;
    same_station_count: number;
    same_defect_count: number;
  };
}

interface DefectDataTrend {
  date: Date;
  count: number;
  total_ng_qty: number;
  unique_inspections: number;
  unique_defect_types: number;
}

interface InspectorPerformance {
  inspector: string;
  total_records: number;
  total_ng_qty: number;
  unique_defects_found: number;
  stations_covered: string[];
  lines_covered: string[];
  avg_ng_per_record: number;
  latest_record_at: Date;
}
// ==================== TYPE IMAGE DEFINITIONS ====================
 
export interface DefectImage {
  id: number;
  defect_id: number;
  image_url: string;
}

export interface DefectImageResponse {
  success: boolean;
  data?: DefectImage;
  message?: string;
  errors?: string[];
}

export interface DefectImageListResponse {
  success: boolean;
  data?: DefectImage[];
  message?: string;
  errors?: string[];
}

export interface BulkUploadResponse {
  success: boolean;
  data?: Array<{ id: number; defect_id: number }>;
  message?: string;
  errors?: string[];
}
// ==================== DEFECTDATA SERVICE CLASS ====================

/**
 * DefectData Service Class
 * Handles all API communication for defect data operations
 * Follows Complete Separation Entity Architecture
 */
class DefectDataService {
  private baseUrl = apiBaseUrl('defectdata');
  private readonly baseImageUrl = apiBaseUrl('defect-image');

  // ==================== CORE CRUD OPERATIONS ====================

  /**
   * Get all defect data with filtering and pagination
   */
  async getAll(params?: DefectDataQuery): Promise<ServiceResponse<ListResponse<DefectData>>> {
    try {
      const queryString = params ? new URLSearchParams({
        ...(params.page && { page: params.page.toString() }),
        ...(params.limit && { limit: params.limit.toString() }),
        ...(params.sort_by && { sort_by: params.sort_by }),
        ...(params.sort_order && { sort_order: params.sort_order }),
        ...(params.inspection_no && { inspection_no: params.inspection_no }),
        ...(params.qc_name && { qc_name: params.qc_name }),
        ...(params.qclead_name && { qclead_name: params.qclead_name }),
        ...(params.mbr_name && { mbr_name: params.mbr_name }),
        ...(params.linevi && { linevi: params.linevi }),
        ...(params.groupvi && { groupvi: params.groupvi }),
        ...(params.station && { station: params.station }),
        ...(params.inspector && { inspector: params.inspector }),
        ...(params.defect_id && { defect_id: params.defect_id.toString() }),
        ...(params.ng_qty_min !== undefined && { ng_qty_min: params.ng_qty_min.toString() }),
        ...(params.ng_qty_max !== undefined && { ng_qty_max: params.ng_qty_max.toString() }),
        ...(params.trayno && { trayno: params.trayno }),
        ...(params.tray_position && { tray_position: params.tray_position }),
        ...(params.color && { color: params.color }),
        ...(params.today && { today: 'true' }),
        ...(params.yesterday && { yesterday: 'true' }),
        ...(params.this_week && { this_week: 'true' }),
        ...(params.this_month && { this_month: 'true' }),
        ...(params.defect_date_from && { defect_date_from: params.defect_date_from.toISOString() }),
        ...(params.defect_date_to && { defect_date_to: params.defect_date_to.toISOString() }),
        ...(params.term && { term: params.term }),
        ...(params.fields && { fields: params.fields.join(',') }),
      }).toString() : '';

      const url = queryString ? `${this.baseUrl}?${queryString}` : this.baseUrl;

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });

      const result = await response.json();

      if (!response.ok) {
        console.error('Error fetching defect data:', result);
        return {
          success: false,
          errors: result.errors || [{ field: 'general', message: result.message || 'Failed to fetch defect data' }],
        };
      }

      return {
        success: true,
        data: result,
      };

    } catch (error) {
      console.error('Network error fetching defect data:', error);
      return {
        success: false,
        errors: [{ field: 'network', message: error instanceof Error ? error.message : 'Network error' }],
      };
    }
  }

  /**
   * Get defect data by ID
   */
  async getById(id: number): Promise<ServiceResponse<DefectData>> {
    try {
      const response = await fetch(`${this.baseUrl}/${id}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });

      const result = await response.json();

      if (!response.ok) {
        console.error('Error fetching defect data by ID:', result);
        return {
          success: false,
          errors: result.errors || [{ field: 'general', message: result.message || 'Failed to fetch defect data' }],
        };
      }

      return {
        success: true,
        data: result.data,
        message: result.message,
      };

    } catch (error) {
      console.error('Network error fetching defect data by ID:', error);
      return {
        success: false,
        errors: [{ field: 'network', message: error instanceof Error ? error.message : 'Network error' }],
      };
    }
  }

  /**
   * Create new defect data
   */
  async create(data: CreateDefectDataRequest): Promise<ServiceResponse<DefectData>> {
    try {
      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        console.error('Error creating defect data:', result);
        return {
          success: false,
          errors: result.errors || [{ field: 'general', message: result.message || 'Failed to create defect data' }],
        };
      }

      return {
        success: true,
        data: result.data,
        message: result.message,
      };

    } catch (error) {
      console.error('Network error creating defect data:', error);
      return {
        success: false,
        errors: [{ field: 'network', message: error instanceof Error ? error.message : 'Network error' }],
      };
    }
  }

  /**
   * Update defect data by ID
   */
  async update(id: number, data: UpdateDefectDataRequest): Promise<ServiceResponse<DefectData>> {
    try {
      const response = await fetch(`${this.baseUrl}/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        console.error('Error updating defect data:', result);
        return {
          success: false,
          errors: result.errors || [{ field: 'general', message: result.message || 'Failed to update defect data' }],
        };
      }

      return {
        success: true,
        data: result.data,
        message: result.message,
      };

    } catch (error) {
      console.error('Network error updating defect data:', error);
      return {
        success: false,
        errors: [{ field: 'network', message: error instanceof Error ? error.message : 'Network error' }],
      };
    }
  }

  /**
   * Delete defect data by ID  
   */
  async delete(id: number): Promise<ServiceResponse<void>> {
    try {
      const response = await fetch(`${this.baseUrl}/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });

      const result = await response.json();

      if (!response.ok) {
        console.error('Error deleting defect data:', result);
        return {
          success: false,
          errors: result.errors || [{ field: 'general', message: result.message || 'Failed to delete defect data' }],
        };
      }

      return {
        success: true,
        message: result.message,
      };

    } catch (error) {
      console.error('Network error deleting defect data:', error);
      return {
        success: false,
        errors: [{ field: 'network', message: error instanceof Error ? error.message : 'Network error' }],
      };
    }
  }

  // ==================== DEFECTDATA-SPECIFIC OPERATIONS ====================

  /**
   * Get defect data by inspection number
   */
  async getByInspectionNo(inspectionNo: string): Promise<ServiceResponse<DefectData[]>> {
    try {
      const response = await fetch(`${this.baseUrl}/inspection/${encodeURIComponent(inspectionNo)}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });

      const result = await response.json();

      if (!response.ok) {
        console.error('Error fetching defect data by inspection number:', result);
        return {
          success: false,
          errors: result.errors || [{ field: 'general', message: result.message || 'Failed to fetch defect data' }],
        };
      }

      return {
        success: true,
        data: result.data,
        message: result.message,
      };

    } catch (error) {
      console.error('Network error fetching defect data by inspection number:', error);
      return {
        success: false,
        errors: [{ field: 'network', message: error instanceof Error ? error.message : 'Network error' }],
      };
    }
  }

  /**
   * Get enriched defect detail by inspection number
   * This endpoint returns defect data with fullnames for personnel and defect information
   * Includes image_urls array from v_defect_image view (aggregated by backend)
   */
  async getDetailByInspectionNo(inspectionNo: string): Promise<ServiceResponse<any[]>> {
    try {
      const response = await fetch(`${this.baseUrl}/detail/${encodeURIComponent(inspectionNo)}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });

      const result = await response.json();

      if (!response.ok) {
        console.error('Error fetching defect detail by inspection number:', result);
        return {
          success: false,
          errors: result.errors || [{ field: 'general', message: result.message || 'Failed to fetch defect detail' }],
        };
      }

      return {
        success: true,
        data: result.data,
        message: result.message,
      };

    } catch (error) {
      console.error('Network error fetching defect detail by inspection number:', error);
      return {
        success: false,
        errors: [{ field: 'network', message: error instanceof Error ? error.message : 'Network error' }],
      };
    }
  }

  /**
   * Get defect data by station and date range
   */
  async getByStationAndDateRange(
    station: string,
    startDate: Date,
    endDate: Date,
    limit?: number
  ): Promise<ServiceResponse<DefectData[]>> {
    try {
      const params = new URLSearchParams({
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        ...(limit && { limit: limit.toString() })
      });

      const response = await fetch(`${this.baseUrl}/station/${encodeURIComponent(station)}?${params}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });

      const result = await response.json();

      if (!response.ok) {
        console.error('Error fetching defect data by station and date range:', result);
        return {
          success: false,
          errors: result.errors || [{ field: 'general', message: result.message || 'Failed to fetch defect data' }],
        };
      }

      return {
        success: true,
        data: result.data,
        message: result.message,
      };

    } catch (error) {
      console.error('Network error fetching defect data by station and date range:', error);
      return {
        success: false,
        errors: [{ field: 'network', message: error instanceof Error ? error.message : 'Network error' }],
      };
    }
  }

  /**
   * Get defect data by inspector
   */
  async getByInspector(inspector: string, limit?: number): Promise<ServiceResponse<DefectData[]>> {
    try {
      const url = limit
        ? `${this.baseUrl}/inspector/${encodeURIComponent(inspector)}?limit=${limit}`
        : `${this.baseUrl}/inspector/${encodeURIComponent(inspector)}`;

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });

      const result = await response.json();

      if (!response.ok) {
        console.error('Error fetching defect data by inspector:', result);
        return {
          success: false,
          errors: result.errors || [{ field: 'general', message: result.message || 'Failed to fetch defect data' }],
        };
      }

      return {
        success: true,
        data: result.data,
        message: result.message,
      };

    } catch (error) {
      console.error('Network error fetching defect data by inspector:', error);
      return {
        success: false,
        errors: [{ field: 'network', message: error instanceof Error ? error.message : 'Network error' }],
      };
    }
  }

  /**
   * Get defect data profile with detailed information
   */
  async getProfile(id: number): Promise<ServiceResponse<DefectDataProfile>> {
    try {
      const response = await fetch(`${this.baseUrl}/${id}/profile`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });

      const result = await response.json();

      if (!response.ok) {
        console.error('Error fetching defect data profile:', result);
        return {
          success: false,
          errors: result.errors || [{ field: 'general', message: result.message || 'Failed to fetch defect data profile' }],
        };
      }

      return {
        success: true,
        data: result.data,
        message: result.message,
      };

    } catch (error) {
      console.error('Network error fetching defect data profile:', error);
      return {
        success: false,
        errors: [{ field: 'network', message: error instanceof Error ? error.message : 'Network error' }],
      };
    }
  }

  /**
   * Get today's defect data, optionally filtered by station
   */
  async getTodayDefectData(station?: string): Promise<ServiceResponse<DefectData[]>> {
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
      });

      const result = await response.json();

      if (!response.ok) {
        console.error('Error fetching today\'s defect data:', result);
        return {
          success: false,
          errors: result.errors || [{ field: 'general', message: result.message || 'Failed to fetch today\'s defect data' }],
        };
      }

      return {
        success: true,
        data: result.data,
        message: result.message,
      };

    } catch (error) {
      console.error('Network error fetching today\'s defect data:', error);
      return {
        success: false,
        errors: [{ field: 'network', message: error instanceof Error ? error.message : 'Network error' }],
      };
    }
  }

// ==================== SERVICE IMAGE CLASS ====================

/**
 * Defect Image Service
 * Handles image upload and retrieval for defect records
 */
    

  /**
   * Upload a single image for a defect
   * @param defectId Defect ID
   * @param imageFile Image file to upload
   */
  async uploadSingle(defectId: number, imageFile: File): Promise<DefectImageResponse> {
    try {
      console.log('📤 Uploading single image for defect:', defectId);

      const formData = new FormData();
      formData.append('defect_id', defectId.toString());
      formData.append('image', imageFile);

      const response = await fetch(this.baseImageUrl, {
        method: 'POST',
        body: formData,
        credentials: 'include'
      });

      const data = await response.json();
      console.log('📤 Upload response:', data);

      return data;
    } catch (error) {
      console.error('❌ Error uploading image:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Network error occurred',
        errors: [error instanceof Error ? error.message : 'Unknown error']
      };
    }
  }

  /**
   * Upload multiple images for a defect
   * @param defectId Defect ID
   * @param imageFiles Array of image files to upload
   */
  async uploadBulk(defectId: number, imageFiles: File[], trayInfos?: Array<{ trayno?: string; tray_row?: string; tray_position?: string; photo_magnification?: string; stamp?: string }>): Promise<BulkUploadResponse> {
    try {
      console.log('📤 Uploading', imageFiles.length, 'images for defect:', defectId);

      const formData = new FormData();
      formData.append('defect_id', defectId.toString());

      // Append per-image tray infos as JSON array
      if (trayInfos && trayInfos.length > 0) {
        formData.append('tray_infos', JSON.stringify(trayInfos));
      }

      // Append all images with the same field name 'images'
      imageFiles.forEach((file) => {
        formData.append('images', file);
      });

      const response = await fetch(`${this.baseImageUrl}/bulk`, {
        method: 'POST',
        body: formData,
        credentials: 'include'
      });

      const data = await response.json();
      console.log('📤 Bulk upload response:', data);

      return data;
    } catch (error) {
      console.error('❌ Error uploading images:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Network error occurred',
        errors: [error instanceof Error ? error.message : 'Unknown error']
      };
    }
  }

  /**
   * Get all images for a defect (metadata only)
   * @param defectId Defect ID
   */
  async getByDefectId(defectId: number): Promise<DefectImageListResponse> {
    try {
      console.log('📥 Fetching images for defect:', defectId);

      const response = await fetch(`${this.baseImageUrl}/defect/${defectId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include'
      });

      const data = await response.json();
      console.log('📥 Images retrieved:', data);

      return data;
    } catch (error) {
      console.error('❌ Error fetching images:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Network error occurred',
        errors: [error instanceof Error ? error.message : 'Unknown error']
      };
    }
  }

  /**
   * Get image URL by ID
   * @param imageId Image ID
   */
  getImageUrl(imageId: number): string {
    return `${this.baseImageUrl}/${imageId}`;
  }

  /**
   * Delete image by ID
   * @param imageId Image ID
   */
  async deleteImage(imageId: number): Promise<{ success: boolean; message?: string }> {
    try {
      console.log('🗑️ Deleting image:', imageId);

      const response = await fetch(`${this.baseImageUrl}/${imageId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include'
      });

      const data = await response.json();
      console.log('🗑️ Delete response:', data);

      return data;
    } catch (error) {
      console.error('❌ Error deleting image:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Network error occurred'
      };
    }
  }

  /**
   * Delete all images for a defect
   * @param defectId Defect ID
   */
  async deleteByDefectId(defectId: number): Promise<{ success: boolean; data?: { deletedCount: number }; message?: string }> {
    try {
      console.log('🗑️ Deleting all images for defect:', defectId);

      const response = await fetch(`${this.baseImageUrl}/defect/${defectId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include'
      });

      const data = await response.json();
      console.log('🗑️ Bulk delete response:', data);

      return data;
    } catch (error) {
      console.error('❌ Error deleting images:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Network error occurred'
      };
    }
  }

  /**
   * Validate image file before upload
   */
  validateImage(file: File): { valid: boolean; error?: string } {
    const maxSize = 5 * 1024 * 1024; // 5MB
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];

    if (!file) {
      return { valid: false, error: 'No file provided' };
    }

    if (!allowedTypes.includes(file.type)) {
      return { valid: false, error: `Invalid file type. Allowed types: ${allowedTypes.join(', ')}` };
    }

    if (file.size > maxSize) {
      return { valid: false, error: 'File size exceeds 5MB limit' };
    }

    return { valid: true };
  }

  /**
   * Validate multiple image files
   */
  validateImages(files: File[]): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!files || files.length === 0) {
      return { valid: false, errors: ['No files provided'] };
    }

    if (files.length > 10) {
      return { valid: false, errors: ['Maximum 10 images allowed per upload'] };
    }

    files.forEach((file, index) => {
      const validation = this.validateImage(file);
      if (!validation.valid) {
        errors.push(`Image ${index + 1}: ${validation.error}`);
      }
    });

    return {
      valid: errors.length === 0,
      errors
    };
  }
  // ==================== ANALYTICS & REPORTING ====================

  /**
   * Get defect data summary for analytics
   */
  async getSummary(startDate?: Date, endDate?: Date): Promise<ServiceResponse<DefectDataSummary>> {
    try {
      const params = new URLSearchParams();
      if (startDate) params.append('startDate', startDate.toISOString());
      if (endDate) params.append('endDate', endDate.toISOString());

      const url = params.toString() ? `${this.baseUrl}/summary?${params}` : `${this.baseUrl}/summary`;

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });

      const result = await response.json();

      if (!response.ok) {
        console.error('Error fetching defect data summary:', result);
        return {
          success: false,
          errors: result.errors || [{ field: 'general', message: result.message || 'Failed to fetch summary' }],
        };
      }

      return {
        success: true,
        data: result.data,
        message: result.message,
      };

    } catch (error) {
      console.error('Network error fetching defect data summary:', error);
      return {
        success: false,
        errors: [{ field: 'network', message: error instanceof Error ? error.message : 'Network error' }],
      };
    }
  }

  /**
   * Get defect data trends for charts
   */
  async getTrends(days: number = 7): Promise<ServiceResponse<DefectDataTrend[]>> {
    try {
      const response = await fetch(`${this.baseUrl}/trends?days=${days}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });

      const result = await response.json();

      if (!response.ok) {
        console.error('Error fetching defect data trends:', result);
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
      console.error('Network error fetching defect data trends:', error);
      return {
        success: false,
        errors: [{ field: 'network', message: error instanceof Error ? error.message : 'Network error' }],
      };
    }
  }

  /**
   * Get inspector performance data
   */
  async getInspectorPerformance(inspector: string): Promise<ServiceResponse<InspectorPerformance>> {
    try {
      const response = await fetch(`${this.baseUrl}/inspector/${encodeURIComponent(inspector)}/performance`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });

      const result = await response.json();

      if (!response.ok) {
        console.error('Error fetching inspector performance:', result);
        return {
          success: false,
          errors: result.errors || [{ field: 'general', message: result.message || 'Failed to fetch inspector performance' }],
        };
      }

      return {
        success: true,
        data: result.data,
        message: result.message,
      };

    } catch (error) {
      console.error('Network error fetching inspector performance:', error);
      return {
        success: false,
        errors: [{ field: 'network', message: error instanceof Error ? error.message : 'Network error' }],
      };
    }
  }

  /**
   * Advanced search
   */
  async search(searchOptions: DefectDataQuery): Promise<ServiceResponse<ListResponse<DefectData>>> {
    try {
      const response = await fetch(`${this.baseUrl}/search`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(searchOptions),
      });

      const result = await response.json();

      if (!response.ok) {
        console.error('Error searching defect data:', result);
        return {
          success: false,
          errors: result.errors || [{ field: 'general', message: result.message || 'Failed to search defect data' }],
        };
      }

      return {
        success: true,
        data: result,
      };

    } catch (error) {
      console.error('Network error searching defect data:', error);
      return {
        success: false,
        errors: [{ field: 'network', message: error instanceof Error ? error.message : 'Network error' }],
      };
    }
  }

  /**
   * Bulk create defect data
   */
  async bulkCreate(records: CreateDefectDataRequest[]): Promise<ServiceResponse<DefectData[]>> {
    try {
      const response = await fetch(`${this.baseUrl}/bulk`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ records }),
      });

      const result = await response.json();

      if (!response.ok) {
        console.error('Error bulk creating defect data:', result);
        return {
          success: false,
          errors: result.errors || [{ field: 'general', message: result.message || 'Failed to bulk create defect data' }],
        };
      }

      return {
        success: true,
        data: result.data,
        message: result.message,
      };

    } catch (error) {
      console.error('Network error bulk creating defect data:', error);
      return {
        success: false,
        errors: [{ field: 'network', message: error instanceof Error ? error.message : 'Network error' }],
      };
    }
  }

  // ==================== UTILITY METHODS ====================

  /**
   * Validate defect data before submission
   */
  validateDefectData(data: CreateDefectDataRequest): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Required fields validation
    if (!data.inspection_no || data.inspection_no.trim() === '') {
      errors.push('Inspection number is required');
    }

    if (!data.qc_name || data.qc_name.trim() === '') {
      errors.push('QC name is required');
    }

    if (!data.qclead_name || data.qclead_name.trim() === '') {
      errors.push('QC lead name is required');
    }

    if (!data.mbr_name || data.mbr_name.trim() === '') {
      errors.push('MBR name is required');
    }

    if (!data.linevi || data.linevi.trim() === '') {
      errors.push('Line VI is required');
    }

    if (!data.groupvi || data.groupvi.trim() === '') {
      errors.push('Group VI is required');
    }

    if (!data.station || data.station.trim() === '') {
      errors.push('Station is required');
    }

    if (!data.inspector || data.inspector.trim() === '') {
      errors.push('Inspector is required');
    }

    if (data.defect_id === undefined || data.defect_id === null) {
      errors.push('Defect ID is required');
    }

    // Format validations
    if (data.inspection_no && data.inspection_no.length > 20) {
      errors.push('Inspection number cannot exceed 20 characters');
    }

    if (data.qc_name && data.qc_name.length > 30) {
      errors.push('QC name cannot exceed 30 characters');
    }

    if (data.qclead_name && data.qclead_name.length > 30) {
      errors.push('QC lead name cannot exceed 30 characters');
    }

    if (data.mbr_name && data.mbr_name.length > 30) {
      errors.push('MBR name cannot exceed 30 characters');
    }

    if (data.linevi && data.linevi.length > 100) {
      errors.push('Line VI cannot exceed 100 characters');
    }

    if (data.groupvi && data.groupvi.length > 5) {
      errors.push('Group VI cannot exceed 5 characters');
    }

    if (data.station && data.station.length > 5) {
      errors.push('Station cannot exceed 5 characters');
    }

    if (data.inspector && data.inspector.length > 20) {
      errors.push('Inspector name cannot exceed 20 characters');
    }

    // Quantity validation
    if (data.ng_qty !== undefined && (data.ng_qty < 0 || data.ng_qty > 999999)) {
      errors.push('NG quantity must be between 0 and 999,999');
    }

    // Optional field validations
    if (data.trayno && data.trayno.length > 5) {
      errors.push('Tray number cannot exceed 5 characters');
    }

    if (data.tray_position && data.tray_position.length > 5) {
      errors.push('Tray position cannot exceed 5 characters');
    }

    if (data.color && data.color.length > 20) {
      errors.push('Color cannot exceed 20 characters');
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  /**
   * Format defect data for display
   */
  formatDefectData(defectData: DefectData): {
    formattedDate: string;
    formattedNgQty: string;
    stationDisplay: string;
    inspectorDisplay: string;
  } {
    const formattedDate = formatDateTime(defectData.defect_date);
    const formattedNgQty = defectData.ng_qty?.toLocaleString() || '0';
    const stationDisplay = defectData.station || 'Unknown';
    const inspectorDisplay = defectData.inspector || 'Unknown';

    return {
      formattedDate,
      formattedNgQty,
      stationDisplay,
      inspectorDisplay
    };
  }

  /**
   * Get recent defect data for dashboard
   */
  async getRecentDefectData(limit: number = 10): Promise<ServiceResponse<DefectData[]>> {
    try {
      const params: DefectDataQuery = {
        limit,
        sort_by: 'defect_date',
        sort_order: 'DESC'
      };

      const response = await this.getAll(params);

      if (response.success && response.data) {
        return {
          success: true,
          data: response.data.data,
          message: `Retrieved ${response.data.data.length} recent defect records`
        };
      }

      return {
        success: false,
        errors: response.errors || [{ field: 'general', message: 'Failed to fetch recent defect data' }]
      };

    } catch (error) {
      console.error('Error getting recent defect data:', error);
      return {
        success: false,
        errors: [{ field: 'network', message: error instanceof Error ? error.message : 'Network error' }],
      };
    }
  }

  /**
   * Get defect data count by status
   */
  async getDefectDataCounts(): Promise<ServiceResponse<{
    total: number;
    today: number;
    this_week: number;
    this_month: number;
    total_ng_qty: number;
  }>> {
    try {
      const [totalResponse, todayResponse, weekResponse, monthResponse] = await Promise.all([
        this.getAll({ limit: 1 }),
        this.getAll({ today: true, limit: 1000 }),
        this.getAll({ this_week: true, limit: 1000 }),
        this.getAll({ this_month: true, limit: 1000 })
      ]);

      if (!totalResponse.success || !todayResponse.success || !weekResponse.success || !monthResponse.success) {
        return {
          success: false,
          errors: [{ field: 'general', message: 'Failed to fetch defect data counts' }]
        };
      }

      const total = totalResponse.data?.pagination.total || 0;
      const today = todayResponse.data?.data.length || 0;
      const this_week = weekResponse.data?.data.length || 0;
      const this_month = monthResponse.data?.data.length || 0;

      // Calculate total NG quantity
      const summaryResponse = await this.getSummary();
      const total_ng_qty = summaryResponse.success && summaryResponse.data ? summaryResponse.data.total_ng_qty : 0;

      return {
        success: true,
        data: {
          total,
          today,
          this_week,
          this_month,
          total_ng_qty
        }
      };

    } catch (error) {
      console.error('Error getting defect data counts:', error);
      return {
        success: false,
        errors: [{ field: 'network', message: error instanceof Error ? error.message : 'Network error' }],
      };
    }
  }

  /**
   * Export defect data to CSV format
   */
  async exportToCSV(filters?: DefectDataQuery): Promise<ServiceResponse<string>> {
    try {
      // Get all matching defect data
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

      const defectData = response.data.data;

      // Create CSV headers
      const headers = [
        'ID', 'Sampling No', 'Defect Date', 'QC Name', 'QC Lead Name', 'MBR Name',
        'Line VI', 'Group VI', 'Station', 'Inspector', 'Defect ID', 'NG Qty',
        'Tray No', 'Tray Position', 'Color', 'Created By', 'Updated By',
        'Created At', 'Updated At'
      ];

      // Create CSV rows
      const rows = defectData.map(record => [
        record.id,
        record.inspection_no || '',
        new Date(record.defect_date).toISOString(),
        record.qc_name || '',
        record.qclead_name || '',
        record.mbr_name || '',
        record.linevi || '',
        record.groupvi || '',
        record.station || '',
        record.inspector || '',
        record.defect_id,
        record.ng_qty || 0,
        record.trayno || '',
        record.tray_position || '',
        record.color || '',
        record.created_by,
        record.updated_by,
        record.created_at ? new Date(record.created_at).toISOString() : '',
        record.updated_at ? new Date(record.updated_at).toISOString() : ''
      ]);

      // Combine headers and rows
      const csvContent = [
        headers.join(','),
        ...rows.map(row => row.map(field => `"${field}"`).join(','))
      ].join('\n');

      return {
        success: true,
        data: csvContent,
        message: `Exported ${defectData.length} defect data records to CSV`
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
  downloadCSV(csvContent: string, filename: string = 'defectdata.csv'): void {
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
   * Resend defect notification email
   */
  async resendEmail(defectId: number): Promise<ServiceResponse<void>> {
    try {
      console.error('📧 Call defect Id:', defectId);
      const response = await fetch(`${this.baseUrl}/${defectId}/resend-email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });

      const result = await response.json();

      if (!response.ok) {
        console.error('Error resending defect email:', result);
        return {
          success: false,
          errors: result.errors || [{ field: 'general', message: result.message || 'Failed to resend email' }],
        };
      }

      return {
        success: true,
        message: result.message || 'Email sent successfully',
      };

    } catch (error) {
      console.error('Network error resending defect email:', error);
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
      });

      const result = await response.json();

      return {
        healthy: response.ok && result.success,
        message: response.ok ? 'DefectData service healthy' : 'DefectData service unhealthy',
        details: result.data
      };

    } catch (error) {
      return {
        healthy: false,
        message: `DefectData service error: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }
}

// ==================== SINGLETON EXPORT ====================

export const defectDataService = new DefectDataService();
export default defectDataService;

/*
=== DEFECTDATA SERVICE FEATURES ===

✅ COMPLETE CRUD OPERATIONS:
- Create, read, update, delete defect data
- Follows SPECIAL entity pattern (/:id routes)
- Full validation and error handling
- Type-safe data transformation

✅ DEFECTDATA-SPECIFIC OPERATIONS:
- Get defect data by inspection number
- Get defect data by station and date range
- Get defect data by inspector
- Get detailed profile with related data
- Get today's defect data by station
- Inspector performance analysis

✅ ANALYTICS & REPORTING:
- Comprehensive summary statistics
- Defect data trends over time
- Inspector performance metrics
- Dashboard data preparation
- Export to CSV functionality

✅ VALIDATION & FORMATTING:
- Client-side validation before API calls
- Data format validation
- Display formatting helpers
- Business rule validation

✅ SEARCH & FILTERING:
- Advanced search with complex filters
- Multi-field text search
- Date range filtering
- Station/inspector/inspection filtering
- Pagination and sorting support

✅ BULK OPERATIONS:
- Bulk create defect data records
- CSV export functionality
- Large dataset handling

✅ ERROR HANDLING:
- Comprehensive error handling
- Network error management
- User-friendly error messages
- Consistent error response format

✅ UTILITY METHODS:
- Data validation helpers
- Response formatting
- Service health monitoring
- Dashboard integration support

✅ COMPLETE SEPARATION ARCHITECTURE:
- No dependencies on other entity services
- Self-contained defect data logic
- Clean API integration layer
- Type-safe throughout
- Singleton pattern for consistency

This service provides everything needed to integrate defect data
functionality while maintaining the Complete Separation Entity Architecture
and supporting all Manufacturing Quality Control workflows.
*/