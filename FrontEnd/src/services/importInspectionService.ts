// client/src/services/importInspectionService.ts
// Service for Import Inspection Operations
// Manufacturing Quality Control System - Inspection Data Import

import { apiBaseUrl } from './api';
import { toLocalDate } from '../utils';
import type {
  InspectionRecord,
  FilterOptions,
  InspectionStatistics
} from '../types/import-inspection';
import type { StationType } from '../types/inspection-station';

/**
 * Import Inspection Service Class
 * Handles filtering, statistics, and SIV creation for inspection import pages
 */
class ImportInspectionService {
  /**
   * Apply filters to inspection records
   *
   * @param records - Inspection records to filter
   * @param filters - Filter options
   * @returns Filtered inspection records
   */
  applyFilters(records: InspectionRecord[], filters: FilterOptions): InspectionRecord[] {
    let filtered = [...records];

    // Apply date range filter
    const now = new Date();
    switch (filters.dateRange) {
      case 'today':
        filtered = filtered.filter(record => {
          const recordDate = new Date(record.timestamp);
          return recordDate.toDateString() === now.toDateString();
        });
        break;
      case 'week':
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        filtered = filtered.filter(record => new Date(record.timestamp) >= weekAgo);
        break;
      case 'month':
        const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        filtered = filtered.filter(record => new Date(record.timestamp) >= monthAgo);
        break;
    }

    // Apply judgment filter
    if (filters.judgment !== 'all') {
      filtered = filtered.filter(record =>
        record.judgment.toLowerCase() === filters.judgment
      );
    }

    // Apply inspector filter
    if (filters.inspector !== 'All') {
      filtered = filtered.filter(record => record.inspector === filters.inspector);
    }

    // Apply model filter
    if (filters.model !== 'All') {
      filtered = filtered.filter(record => record.model === filters.model);
    }

    return filtered;
  }

  /**
   * Calculate statistics from filtered records
   *
   * @param records - Filtered inspection records
   * @returns Statistics object
   */
  calculateStatistics(records: InspectionRecord[]): InspectionStatistics {
    const total = records.length;
    const passed = records.filter(r => r.judgment === 'Pass').length;
    const rejected = records.filter(r => r.judgment === 'Reject').length;
    const passRate = total > 0 ? ((passed / total) * 100).toFixed(1) : '0';

    return { total, passed, rejected, passRate };
  }

  /**
   * Get status color class based on judgment
   *
   * @param judgment - Pass or Reject
   * @returns Tailwind CSS classes for styling
   */
  getStatusColor(judgment: string): string {
    return judgment === 'Pass'
      ? 'bg-green-100 text-green-800 border-green-200'
      : 'bg-red-100 text-red-800 border-red-200';
  }

  /**
   * Detect station type from URL path
   *
   * @param pathname - The current URL pathname
   * @returns The detected station type
   */
  detectStationFromPath(pathname: string): StationType {
    const path = pathname.toLowerCase();
    if (path.includes('oqa')) return 'OQA';
    if (path.includes('oba')) return 'OBA';
    if (path.includes('siv')) return 'SIV';
    return 'OQA'; // default
  }

  /**
   * Transform API inspection data to InspectionRecord format
   *
   * @param item - Raw API data
   * @returns Transformed InspectionRecord
   */
  transformInspectionData(item: any): InspectionRecord {
    return {
      id: item.id.toString(),
      timestamp: toLocalDate(item.inspection_date).toISOString(),
      inspectionDate: toLocalDate(item.inspection_date),
      inspector: `QC${item.qc_id || 1}`,
      model: item.model && item.version ? `${item.model} ${item.version}` : (item.model || 'N/A'),
      samplingRound: item.round || 1,
      fviLotQty: item.fvi_lot_qty || 0,
      generalSamplingQty: item.general_sampling_qty || 0,
      crackSamplingQty: item.crack_sampling_qty || 0,
      judgment: item.judgment === null ? null : (item.judgment ? 'Pass' : 'Reject'),
      lotno: item.lotno || '',
      itemno: item.itemno || '',
      inspectionNo: item.inspection_no || '',
      inspectionNoRef: item.inspection_no_ref || '',
      ww: item.ww || '',
      mclineno: item.mclineno || '',
      shift: item.shift || '',
      station: item.station || '',
      fy: item.fy || '',
      month_year: item.month_year || '',
      partsite: item.partsite || '',
      version: item.version || '',
      fvilineno: item.fvilineno || '',
      qc_id: item.qc_id || 1,
      created_at: item.created_at ? toLocalDate(item.created_at) : undefined,
      updated_at: item.updated_at ? toLocalDate(item.updated_at) : undefined,
      created_by: item.created_by,
      updated_by: item.updated_by
    };
  }

  /**
   * Create SIV inspection from OQA/OBA inspection
   *
   * @param inspectionId - ID of the inspection to create SIV from
   * @returns API response
   */
  async createSIV(inspectionId: string): Promise<{
    success: boolean;
    message?: string;
    data?: { inspection_no: string; [key: string]: any };
  }> {
    try {
      console.log('🔧 Creating SIV from inspection:', inspectionId);

      const response = await fetch(`${apiBaseUrl('inspectiondata')}/${inspectionId}/create-siv`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });

      const result = await response.json();

      if (response.ok && result.success) {
        console.log('✅ SIV created:', result.data);
        return {
          success: true,
          message: 'SIV inspection created successfully!',
          data: result.data
        };
      } else {
        console.error('❌ SIV creation failed:', result);
        return {
          success: false,
          message: result.message || 'Unknown error occurred'
        };
      }
    } catch (error) {
      console.error('❌ Error creating SIV:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to create SIV'
      };
    }
  }
}

// Export singleton instance
export const importInspectionService = new ImportInspectionService();

// Export class for testing
export default ImportInspectionService;

/*
=== IMPORT INSPECTION SERVICE FEATURES ===

FILTERING:
✅ Date range filtering (today, week, month, all)
✅ Judgment filtering (pass/reject)
✅ Inspector filtering
✅ Model filtering

STATISTICS:
✅ Total records count
✅ Passed/rejected counts
✅ Pass rate calculation

DATA TRANSFORMATION:
✅ Transform API data to display format
✅ Handle missing/null values
✅ Type-safe transformations

SIV CREATION:
✅ Create SIV from inspection
✅ Proper error handling
✅ Uses centralized API config

UTILITIES:
✅ Status color helpers
✅ Station detection from path
✅ Reusable service methods

ARCHITECTURE:
✅ Centralized API configuration
✅ Singleton service pattern
✅ Separation of concerns
✅ Type safety throughout
✅ Multi-station support (OQA, OBA, SIV)
*/
