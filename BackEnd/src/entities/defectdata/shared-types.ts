// server/src/entities/defectdata/shared-types.ts
/**
 * Shared DefectData Types - Centralized Type Definitions
 *
 * This file contains the base type definitions shared between:
 * - defectdata (regular defect data)
 * - defectdata_customer (customer defect data)
 *
 * When you need to change the table structure, update these types once
 * and both entities will automatically inherit the changes.
 */

import {
  BaseSpecialEntity,
  CreateSpecialData,
  UpdateSpecialData,
  SpecialQueryOptions,
  SpecialPaginatedResponse,
  SpecialServiceResult,
  SpecialEntityConfig,
  PrimaryKeyConfig
} from '../../generic/entities/special-entity/generic-types';

// ==================== CORE ENTITY INTERFACE ====================

/**
 * Base DefectData Entity Interface
 *
 * This interface defines the common structure for defect data records
 * in the Manufacturing Quality Control system.
 *
 * Database Schema Compliance:
 * - Primary Key: id SERIAL PRIMARY KEY
 * - Pattern: SPECIAL Entity (SERIAL ID pattern)
 */
export interface BaseDefectDataEntity extends BaseSpecialEntity {
  id?: number;                          // SERIAL PRIMARY KEY
  inspection_no: string;                // VARCHAR(20) NOT NULL
  defect_date: Date;                    // TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
  qc_name: string;                      // VARCHAR(30) NOT NULL
  qclead_name: string;                  // VARCHAR(30) NOT NULL
  mbr_name: string;                     // VARCHAR(30) NOT NULL
  linevi: string;                       // VARCHAR(100) NOT NULL
  groupvi: string;                      // VARCHAR(5) NOT NULL
  station: string;                      // VARCHAR(5) NOT NULL
  inspector: string;                    // VARCHAR(20) NOT NULL
  defect_id: number;                    // integer NOT NULL (foreign key to defects.id)
  ng_qty: number;                       // integer DEFAULT 0
  trayno?: string;                      // VARCHAR(5)
  tray_position?: string;               // VARCHAR(5)
  color?: string;                       // VARCHAR(20)
  defect_detail?: string;               // VARCHAR(200) - detail description for defects
  defect_type?: string;                 // VARCHAR(200) - defect type information

  // Inherited from BaseSpecialEntity:
  // is_active: boolean;
  // created_by: number;
  // updated_by: number;
  // created_at: Date;
  // updated_at: Date;
}

// ==================== DATA TRANSFER OBJECTS ====================

/**
 * Base Create DefectData Request Interface
 *
 * Data required to create a new defect data record
 */
export interface BaseCreateDefectDataRequest extends CreateSpecialData {
  inspection_no: string;
  defect_date?: Date;                   // Optional, defaults to current timestamp
  qc_name: string;
  qclead_name: string;
  mbr_name: string;
  linevi: string;
  groupvi: string;
  station: string;
  inspector: string;
  defect_id: number;
  ng_qty?: number;                      // Optional, defaults to 0
  trayno?: string;
  tray_position?: string;
  color?: string;
  defect_detail?: string;               // Optional, detail description for defects
  defect_type?: string;                 // Optional, defect type information
}

/**
 * Base Update DefectData Request Interface
 *
 * Data that can be updated in a defect data record
 */
export interface BaseUpdateDefectDataRequest extends UpdateSpecialData {
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
}

// ==================== QUERY OPTIONS ====================

/**
 * Base DefectData Query Options
 *
 * Options for filtering and paginating defect data queries
 */
export interface BaseDefectDataQueryOptions extends SpecialQueryOptions {
  // Specific filters
  inspection_no?: string;
  station?: string;
  linevi?: string;
  inspector?: string;
  defect_id?: number;

  // Date filters
  defect_date_from?: Date;
  defect_date_to?: Date;

  // Quantity filters
  ng_qty_min?: number;
  ng_qty_max?: number;

  // Date shortcuts
  today?: boolean;
  yesterday?: boolean;
  this_week?: boolean;
  this_month?: boolean;
}

// ==================== ANALYTICS & REPORTING TYPES ====================

/**
 * Base DefectData Profile - Detailed record with related information
 */
export interface BaseDefectDataProfile extends BaseDefectDataEntity {
  defect_name?: string;
  defect_description?: string;
  related_records?: BaseDefectDataEntity[];
  summary_stats?: {
    same_inspection_count: number;
    same_station_count: number;
    same_defect_count: number;
  };
}

/**
 * Base DefectData Summary - Analytics summary
 */
export interface BaseDefectDataSummary {
  total_records: number;
  today_records: number;
  this_week_records: number;
  this_month_records: number;
  total_ng_qty: number;
  latest_record_at: Date | null;
  by_station: Record<string, {
    count: number;
    total_ng_qty: number;
    defect_types: string[];
  }>;
  by_linevi: Record<string, {
    count: number;
    total_ng_qty: number;
  }>;
  by_defect_type: Record<number, {
    count: number;
    total_ng_qty: number;
    defect_name?: string;
  }>;
  top_inspectors: Array<{
    inspector: string;
    count: number;
    total_ng_qty: number;
  }>;
}

/**
 * Base DefectData Trend - Time-based trend data
 */
export interface BaseDefectDataTrend {
  date: Date;
  count: number;
  total_ng_qty: number;
  unique_inspections: number;
  unique_defect_types: number;
}

/**
 * Base Inspector Performance
 */
export interface BaseInspectorPerformance {
  inspector: string;
  total_records: number;
  total_ng_qty: number;
  unique_defects_found: number;
  stations_covered: string[];
  lines_covered: string[];
  avg_ng_per_record: number;
  latest_record_at: Date;
}

// ==================== SERVICE RESULT TYPES ====================

/**
 * Base DefectData Service Result
 */
export type BaseDefectDataResult = SpecialServiceResult<BaseDefectDataEntity>;

/**
 * Base DefectData Paginated Response
 */
export type BaseDefectDataPaginatedResponse = SpecialPaginatedResponse<BaseDefectDataEntity>;

// ==================== ENTITY CONFIG ====================

/**
 * Base DefectData Entity Configuration
 */
export interface BaseDefectDataConfig extends SpecialEntityConfig {
  tableName: string;
  entityName: string;
  primaryKey: PrimaryKeyConfig;
}
