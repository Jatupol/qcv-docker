// server/src/entities/inspectiondata/types.ts
/**
 * SIMPLIFIED: InspectionData Entity Types - Special Pattern Implementation
 * Sampling Inspection Control System - Simple CRUD with Special Pattern
 */

import {
  BaseSpecialEntity,
  SpecialEntityRequest,
  SpecialQueryOptions,
  SpecialApiResponse,
  SpecialEntityConfig,
  PrimaryKeyConfig
} from '../../generic/entities/special-entity/generic-types';

// ==================== CORE INSPECTIONDATA ENTITY INTERFACE ====================

/**
 * InspectionData entity interface - Simple special pattern with id as primary key
 */
export interface InspectionData extends BaseSpecialEntity {
  // Primary Key Field
  id: number;                          // SERIAL PRIMARY KEY

  // Required Fields
  station: string;                     // VARCHAR(3) NOT NULL
  inspection_no: string;               // VARCHAR(20) NOT NULL
  inspection_no_ref: string;           // VARCHAR(20) NOT NULL - Reference to original inspection
  inspection_date: Date | string;      // TIMESTAMP - accepts both Date and string to preserve local timezone
  fy: string;                         // VARCHAR(4) NOT NULL
  ww: string;                         // VARCHAR(2) NOT NULL
  month_year: string;                  // VARCHAR(20) NOT NULL
  shift: string;                       // VARCHAR(1) NOT NULL
  lotno: string;                       // VARCHAR(30) NOT NULL
  partsite: string;                    // VARCHAR(10) NOT NULL
  itemno: string;                      // VARCHAR(30) NOT NULL
  model: string;                       // VARCHAR(100) NOT NULL
  version: string;                     // VARCHAR(100) NOT NULL
  fvilineno: string;                   // VARCHAR(5) NOT NULL
  mclineno: string;                   // VARCHAR(5) NOT NULL
  round: number;                       // INTEGER DEFAULT 0
  qc_id: number;                       // INTEGER DEFAULT 0
  fvi_lot_qty: number;                 // INTEGER DEFAULT 0
  general_sampling_qty: number;        // INTEGER DEFAULT 0
  crack_sampling_qty: number;          // INTEGER DEFAULT 0
  sampling_reason_id: number;        // INTEGER DEFAULT 0
  judgment: boolean | null;            // BOOLEAN (nullable)
  color: string | null;                // VARCHAR(20) - Color Group for SIV station

  // Standard Entity Fields (inherited from BaseSpecialEntity)
  created_by: number;
  updated_by: number;
  created_at: Date;
  updated_at: Date;

  // View-only fields (from v_inspectiondata view joins)
  sampling_reason_name?: string;      // From sampling_reasons table
  sampling_reason_description?: string; // From sampling_reasons table
  defect_num?: number;                 // Aggregate from defectdata table
  ng_num?: number;                     // Aggregate from defectdata table

  // Search highlighting (optional)
  highlight?: Record<string, string>; // Highlighted search results
}

// ==================== REQUEST/RESPONSE INTERFACES ====================

/**
 * Create InspectionData Request
 */
export interface CreateInspectionDataRequest {
  station: string;
  inspection_no: string;
  inspection_no_ref?: string;
  fy:string;
  ww:string;
  month_year: string;
  shift: string;
  lotno: string;
  partsite: string;
  itemno: string;
  model: string;
  version: string;
  fvilineno: string;
  mclineno: string;
  inspection_date?: Date | string; // Accepts both Date and string to preserve local timezone
  round?: number;
  qc_id?: number;
  fvi_lot_qty?: number;
  general_sampling_qty?: number;
  crack_sampling_qty?: number;
  sampling_reason_id: number;
  judgment?: boolean | null;
  color?: string; // Color Group for SIV station
}

/**
 * Update InspectionData Request
 */
export interface UpdateInspectionDataRequest {
  station?: string;
  inspection_no?: string;
  inspection_date?: Date | string; // Accepts both Date and string to preserve local timezone
  fy?: string;
  ww?: string;
  month_year?: string;
  shift?: string;
  lotno?: string;
  partsite?: string;
  itemno?: string;
  model?: string;
  version?: string;
  fvilineno?: string;
  mclineno?: string;
  round?: number;
  qc_id?: number;
  fvi_lot_qty?: number;
  general_sampling_qty?: number;
  crack_sampling_qty?: number;
  judgment?: boolean | null;
  color?: string; // Color Group for SIV station
  sampling_reason_id?: number;
}

/**
 * InspectionData Query Parameters
 */
export interface InspectionDataQueryParams extends SpecialQueryOptions {
  // InspectionData-specific filters
  station?: string;
  shift?: string;
  lotno?: string;
  partsite?: string;
  model?: string;
  dateFrom?: string;
  dateTo?: string;
  monthYear?: string;
}

// ==================== ENTITY CONFIGURATION ====================

/**
 * InspectionData Primary Key Configuration
 */
export const INSPECTIONDATA_PRIMARY_KEY_CONFIG: PrimaryKeyConfig = {
  fields: ['id'],
  routes: [':id'],
  routePattern: '/:id'
};

/**
 * InspectionData Entity Configuration for Special Pattern
 */
export const INSPECTIONDATA_ENTITY_CONFIG: SpecialEntityConfig = {
  entityName: 'inspectiondata',
  tableName: 'inspectiondata',
  apiPath: '/api/inspectiondata',
  primaryKey: INSPECTIONDATA_PRIMARY_KEY_CONFIG,
  searchableFields: [
    'inspection_no',
    'station',
    'shift',
    'lotno',
    'partsite',
    'itemno',
    'model',
    'version',
    'fvilineno',
    'mclineno' 
  ],
  requiredFields: [
    'station',
    'inspection_no',
    'fy',
    'ww',
    'month_year',
    'shift',
    'lotno',
    'partsite',
    'itemno',
    'model',
    'version',
    'fvilineno',
    'mclineno'
  ],
  defaultLimit: 20,
  maxLimit: 100
};

// ==================== SERVICE RESULT TYPES ====================

export type InspectionDataServiceResult<T = InspectionData> = SpecialApiResponse<T>;
export type InspectionDataListResult = SpecialApiResponse<InspectionData[]>;
export type InspectionDataCreateResult = SpecialApiResponse<InspectionData>;
export type InspectionDataUpdateResult = SpecialApiResponse<InspectionData>;
export type InspectionDataDeleteResult = SpecialApiResponse<boolean>;

// ==================== REQUEST INTERFACE ====================

export interface InspectionDataEntityRequest extends SpecialEntityRequest {
  params: {
    id?: string;
    [key: string]: string | undefined;
  };
}

export default InspectionData;