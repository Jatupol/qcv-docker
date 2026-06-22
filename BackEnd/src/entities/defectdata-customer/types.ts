// server/src/entities/defectdata-customer/types.ts
/**
 * DefectDataCustomer Entity Types - Complete Separation Entity Architecture
 * SPECIAL Pattern Implementation
 *
 * REFACTORED: Now uses shared base types from ../defectdata/shared-types.ts
 * When you change the table structure, update shared-types.ts once
 * and both defectdata and defectdata_customer will inherit the changes.
 *
 * Complete Separation Entity Architecture:
 * ✅ Self-contained defectdata_customer type definitions
 * ✅ No cross-entity dependencies
 * ✅ Manufacturing Quality Control domain optimized
 * ✅ Follows SPECIAL entity pattern with SERIAL ID primary key
 *
 * Database Schema Compliance:
 * - Table: defectdata_customer
 * - Primary Key: id SERIAL PRIMARY KEY
 * - Pattern: SPECIAL Entity (SERIAL ID pattern)
 * - API Routes: /api/defectdata-customer/:id
 */
import {
  SpecialQueryOptions,
  SpecialPaginatedResponse,
  SpecialServiceResult,
  SpecialEntityConfig,
  PrimaryKeyConfig
} from '../../generic/entities/special-entity/generic-types';

// Import shared base types
import {
  BaseDefectDataEntity,
  BaseCreateDefectDataRequest,
  BaseUpdateDefectDataRequest,
  BaseDefectDataQueryOptions,
  BaseDefectDataProfile,
  BaseDefectDataSummary,
  BaseDefectDataTrend,
  BaseInspectorPerformance,
  BaseDefectDataResult,
  BaseDefectDataPaginatedResponse,
  BaseDefectDataConfig
} from '../defectdata/shared-types';

// ==================== CORE ENTITY INTERFACE ====================

/**
 * DefectData Entity Interface
 *
 * Represents defect data records in the Manufacturing Quality Control system.
 * Extends the base defect data entity from shared-types.ts
 */
export interface DefectData extends BaseDefectDataEntity {
  // Inherits all fields from BaseDefectDataEntity
  // Add defectdata-specific fields here if needed in the future
  defect_detail?: string;               // VARCHAR(200) - specific to defectdata table
}




// ==================== DATA TRANSFER OBJECTS ====================

/**
 * Create DefectData Request Interface
 *
 * Extends the base create request from shared-types.ts
 */
export interface CreateDefectDataRequest extends BaseCreateDefectDataRequest {
  // Inherits all fields from BaseCreateDefectDataRequest
  // Add defectdata-specific create fields here if needed
}

/**
 * Update DefectData Request Interface
 *
 * Extends the base update request from shared-types.ts
 */
export interface UpdateDefectDataRequest extends BaseUpdateDefectDataRequest {
  // Inherits all fields from BaseUpdateDefectDataRequest
  // Add defectdata-specific update fields here if needed
}

// ==================== QUERY OPTIONS ====================

/**
 * DefectData Query Options Interface
 *
 * Extends the base query options from shared-types.ts
 * Add defectdata-specific query options here if needed
 */
export interface DefectDataQueryOptions extends BaseDefectDataQueryOptions {
  // Inherits all fields from BaseDefectDataQueryOptions
  // Add defectdata-specific query options here if needed
  qc_name?: string;
  qclead_name?: string;
  mbr_name?: string;
  groupvi?: string;
  trayno?: string;
  tray_position?: string;
  color?: string;

  // Defect-specific searches
  inspection_no_contains?: string;
  qc_name_contains?: string;
  inspector_contains?: string;

  // Has optional field filters
  has_trayno?: boolean;
  has_tray_position?: boolean;
  has_color?: boolean;
}


export interface DefectDetail {
  id: number;
  inspection_no: string;
  defect_date: Date;
  qc_name: string;
  qc_fullname: string;
  qclead_name: string;
  qclead_fullname: string;
  mbr_name: string;
  mbr_fullname: string;
  linevi: string;
  groupvi: string;
  station: string;
  inspector: string;
  inspector_fullname: string;
  defect_id: number;
  defect_group: string;
  defect_name: string;
  defect_type?: string;
  defect_description: string;
  defect_detail?: string;
  ng_qty: number;
  trayno: string;
  tray_position: string;
  color?: string;
  created_at?: Date;
  created_by?:string;
  image_urls?: string[]; // Optional: array of image URLs
}

export interface DefectEmail extends DefectDetail {
  tab: string;
  lotno: string;
  model: string;
  version: string;
  itemno: string;
  shift: string;
  fvilineno: string;
  fy:string;
  ww:string;
  month_year:string;
  qc_id: string;
  sampling_reason_description: string;
  sampling_reason_name?: string;
  fvi_lot_qty: number;
  fvi_inspected_qty: number;
  general_sampling_qty: number;
  crack_sampling_qty?: number;
  judgment: string;
  partsite: string;
  mclineno: string;
  round: string;
}
 


// ==================== RESPONSE INTERFACES ====================

/**
 * DefectData Paginated Response
 */
export interface DefectDataPaginatedResponse extends SpecialPaginatedResponse<DefectData> {}

/**
 * DefectData Service Result
 */
export interface DefectDataServiceResult<T> extends SpecialServiceResult<T> {}

// ==================== SUMMARY AND ANALYTICS INTERFACES ====================

/**
 * DefectData Summary Interface
 * Extends the base summary from shared-types.ts
 */
export interface DefectDataSummary extends BaseDefectDataSummary {
  // Inherits all fields from BaseDefectDataSummary
}

/**
 * DefectData Profile Interface
 * Extends the base profile from shared-types.ts
 */
export interface DefectDataProfile extends BaseDefectDataProfile {
  // Override related_records to use DefectData type
  related_records?: DefectData[];
}

// ==================== TREND AND ANALYTICS ====================

/**
 * DefectData Trend Interface
 * Extends the base trend from shared-types.ts
 */
export interface DefectDataTrend extends BaseDefectDataTrend {
  // Inherits all fields from BaseDefectDataTrend
}

/**
 * DefectData Inspector Performance
 * Extends the base inspector performance from shared-types.ts
 */
export interface InspectorPerformance extends BaseInspectorPerformance {
  // Inherits all fields from BaseInspectorPerformance
}

// ==================== VALIDATION INTERFACES ====================

/**
 * DefectData Validation Rules
 */
export interface DefectDataValidation {
  inspection_no: {
    required: boolean;
    max_length: number;
    pattern?: RegExp;
  };
  qc_name: {
    required: boolean;
    max_length: number;
  };
  qclead_name: {
    required: boolean;
    max_length: number;
  };
  mbr_name: {
    required: boolean;
    max_length: number;
  };
 
  inspector: {
    required: boolean;
    max_length: number;
  };
  defect_id: {
    required: boolean;
    must_exist: boolean;      // Must exist in defects table
  };
  ng_qty: {
    required: boolean;
    min_value: number;
    max_value: number;
  };
  trayno: {
    required: boolean;
    max_length: number;
  };
  tray_position: {
    required: boolean;
    max_length: number;
  };
  color: {
    required: boolean;
    max_length: number;
  };
}

// ==================== BUSINESS LOGIC INTERFACES ====================

/**
 * Defect Data Business Rules
 */
export interface DefectDataBusinessRules {
  max_ng_qty_per_record: number;
  required_fields_for_tray: string[];   // Fields required when trayno is provided
  valid_stations: string[];
  valid_line_vi_codes: string[];
  valid_group_vi_codes: string[];
  inspector_name_pattern: RegExp;
}

// ==================== CONFIGURATION ====================

/**
 * Primary Key Configuration for DefectData
 */
export const DEFECTDATA_PRIMARY_KEY_CONFIG: PrimaryKeyConfig = {
  fields: ['id'],
  routes: [':id'],
  routePattern: '/:id'
};

/**
 * Default DefectData Entity Configuration
 */
export const DEFAULT_DEFECTDATA_CONFIG: SpecialEntityConfig = {
  entityName: 'defectdata-customer',
  tableName: 'defectdata_customer',
  primaryKey: DEFECTDATA_PRIMARY_KEY_CONFIG,
  apiPath: '/api/defectdata-customer',
  searchableFields: [
    'inspection_no', 'qc_name', 'qclead_name', 'mbr_name',
    'linevi', 'groupvi', 'station', 'inspector', 'trayno', 'color'
  ],
  requiredFields: [
    'inspection_no', 'qc_name', 'qclead_name', 'mbr_name',
    'linevi', 'groupvi', 'station', 'inspector', 'defect_id'
  ],
  defaultLimit: 50,
  maxLimit: 500
};

/**
 * DefectData Validation Rules Configuration
 */
export const DEFECTDATA_VALIDATION_RULES: DefectDataValidation = {
  inspection_no: {
    required: true,
    max_length: 20,
    pattern: /^[A-Z0-9\-_]+$/
  },
  qc_name: {
    required: true,
    max_length: 30
  },
  qclead_name: {
    required: true,
    max_length: 30
  },
  mbr_name: {
    required: true,
    max_length: 30
  },
  inspector: {
    required: true,
    max_length: 20
  },
  defect_id: {
    required: true,
    must_exist: true
  },
  ng_qty: {
    required: true,
    min_value: 0,
    max_value: 999999
  },
  trayno: {
    required: false,
    max_length: 5
  },
  tray_position: {
    required: false,
    max_length: 5
  },
  color: {
    required: false,
    max_length: 20
  }
};

/**
 * DefectData Business Rules Configuration
 */
export const DEFECTDATA_BUSINESS_RULES: DefectDataBusinessRules = {
  max_ng_qty_per_record: 999999,
  required_fields_for_tray: ['trayno', 'tray_position'],
  valid_stations: ['OQA', 'FVI', 'QC', 'INS'],
  valid_line_vi_codes: ['A', 'AA', 'AB', 'AC', 'AD', 'AE', 'AF', 'AG', 'AH', 'AI', 'AJ', 'AK', 'AL', 'AM', 'AN', 'AO', 'AP', 'AQ', 'AR', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'],
  valid_group_vi_codes: ['A', 'B', 'C', 'D', 'E'],
  inspector_name_pattern: /^[a-zA-Z0-9\s\-_.]+$/
};

// ==================== EXPORT TYPES ====================

// Export validation helper types
export type DefectDataField = keyof DefectData;
export type DefectDataRequiredField = keyof Pick<DefectData, 'inspection_no' | 'qc_name' | 'qclead_name' | 'mbr_name' | 'linevi' | 'groupvi' | 'station' | 'inspector' | 'defect_id'>;
export type DefectDataOptionalField = keyof Pick<DefectData, 'ng_qty' | 'trayno' | 'tray_position' | 'color'>;
