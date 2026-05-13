// server/src/entities/parts/types.ts
/**
 * SIMPLIFIED: Parts Entity Types - Special Pattern Implementation
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

// ==================== CORE PARTS ENTITY INTERFACE ====================

/**
 * Parts entity interface - Simple special pattern with partno as primary key
 */
export interface Parts extends BaseSpecialEntity {
  // Primary Key Field
  partno: string;                    // VARCHAR(25) PRIMARY KEY
  partno_customer?: string;          // VARCHAR(50) Customer part number

  // Required Fields
  product_families: string;          // VARCHAR(10) NOT NULL
  versions: string;                  // VARCHAR(10) NOT NULL
  customers_site: string;            // VARCHAR(10) NOT NULL - FK to customers_site.code
  tab: string;                       // VARCHAR(5) NOT NULL
  product_type: string;              // VARCHAR(5) NOT NULL
  customer_driver: string;           // VARCHAR(200) NOT NULL

  // LAR Threshold Fields
  lar_achieve_threshold?: number;    // DECIMAL(5,2) DEFAULT 97.00
  lar_accept_min_threshold?: number; // DECIMAL(5,2) DEFAULT 88.00
  lar_accept_max_threshold?: number; // DECIMAL(5,2) DEFAULT 97.00
  lar_abnormal_threshold?: number;   // DECIMAL(5,2) DEFAULT 88.00

  // DPPM Threshold Fields
  dppm_achieve_threshold?: number;    // DECIMAL(8,2) DEFAULT 300.00
  dppm_accept_min_threshold?: number; // DECIMAL(8,2) DEFAULT 300.00
  dppm_accept_max_threshold?: number; // DECIMAL(8,2) DEFAULT 1000.00
  dppm_abnormal_threshold?: number;   // DECIMAL(8,2) DEFAULT 1000.00

  // Underkill Threshold Fields
  underkill_achieve_threshold?: number;    // DECIMAL(5,2) DEFAULT 0.02
  underkill_accept_min_threshold?: number; // DECIMAL(5,2) DEFAULT 0.02
  underkill_accept_max_threshold?: number; // DECIMAL(5,2) DEFAULT 0.01
  underkill_abnormal_threshold?: number;   // DECIMAL(5,2) DEFAULT 0.01

  // Standard Entity Fields (inherited from BaseSpecialEntity)
  is_active: boolean;
  created_by: number;
  updated_by: number;
  created_at: Date;
  updated_at: Date;

  // Additional fields from JOINs (optional)
  customer_site_code?: string;       // From customer-site relationship
  customer_name?: string;            // From customers table

  // Search highlighting (optional)
  highlight?: Record<string, string>; // Highlighted search results
}

// ==================== REQUEST/RESPONSE INTERFACES ====================

/**
 * Create Parts Request
 */
export interface CreatePartsRequest {
  partno: string;
  partno_customer?: string;          // Customer part number
  product_families: string;
  versions: string;
  customers_site: string;            // FK to customers_site.code
  tab: string;
  product_type: string;
  customer_driver: string;
  is_active?: boolean;

  // LAR Threshold Fields
  lar_achieve_threshold?: number;
  lar_accept_min_threshold?: number;
  lar_accept_max_threshold?: number;
  lar_abnormal_threshold?: number;

  // DPPM Threshold Fields
  dppm_achieve_threshold?: number;
  dppm_accept_min_threshold?: number;
  dppm_accept_max_threshold?: number;
  dppm_abnormal_threshold?: number;

  // Underkill Threshold Fields
  underkill_achieve_threshold?: number;
  underkill_accept_min_threshold?: number;
  underkill_accept_max_threshold?: number;
  underkill_abnormal_threshold?: number;
}

/**
 * Update Parts Request
 */
export interface UpdatePartsRequest {
  partno_customer?: string;          // Customer part number
  product_families?: string;
  versions?: string;
  customers_site?: string;           // FK to customers_site.code
  tab?: string;
  product_type?: string;
  customer_driver?: string;
  is_active?: boolean;

  // LAR Threshold Fields
  lar_achieve_threshold?: number;
  lar_accept_min_threshold?: number;
  lar_accept_max_threshold?: number;
  lar_abnormal_threshold?: number;

  // DPPM Threshold Fields
  dppm_achieve_threshold?: number;
  dppm_accept_min_threshold?: number;
  dppm_accept_max_threshold?: number;
  dppm_abnormal_threshold?: number;

  // Underkill Threshold Fields
  underkill_achieve_threshold?: number;
  underkill_accept_min_threshold?: number;
  underkill_accept_max_threshold?: number;
  underkill_abnormal_threshold?: number;
}

/**
 * Parts Query Parameters
 */
export interface PartsQueryParams extends SpecialQueryOptions {
  // Parts-specific filters
  customers_site?: string;
  product_type?: string;
}

// ==================== ENTITY CONFIGURATION ====================

/**
 * Parts Primary Key Configuration
 */
export const PARTS_PRIMARY_KEY_CONFIG: PrimaryKeyConfig = {
  fields: ['partno'],
  routes: [':partno'],
  routePattern: '/:partno'
};

/**
 * Parts Entity Configuration for Special Pattern
 */
export const PARTS_ENTITY_CONFIG: SpecialEntityConfig = {
  entityName: 'parts',
  tableName: 'parts',
  apiPath: '/api/parts',
  primaryKey: PARTS_PRIMARY_KEY_CONFIG,
  searchableFields: [
    'partno',
    'product_families',
    'versions',
    'customers_site',
    'tab',
    'product_type',
    'customer_driver'
  ],
  requiredFields: [
    'partno',
    'product_families',
    'versions',
    'customers_site',
    'tab',
    'product_type',
    'customer_driver'
  ],
  defaultLimit: 20,
  maxLimit: 100
};

// ==================== SERVICE RESULT TYPES ====================

export type PartsServiceResult<T = Parts> = SpecialApiResponse<T>;
export type PartsListResult = SpecialApiResponse<Parts[]>;
export type PartsCreateResult = SpecialApiResponse<Parts>;
export type PartsUpdateResult = SpecialApiResponse<Parts>;
export type PartsDeleteResult = SpecialApiResponse<boolean>;

// ==================== REQUEST INTERFACE ====================

export interface PartsEntityRequest extends SpecialEntityRequest {
  params: {
    partno?: string;
    [key: string]: string | undefined;
  };
}

export default Parts;