// server/src/entities/defectdata-iqa/types.ts
/**
 * Defect Image Entity Types
 * Complete Separation Entity Architecture
 *
 * Table: defect_image
 * Primary Key: id (SERIAL)
 * Purpose: Store images related to defect records
 */

// ==================== CORE ENTITY INTERFACE ====================

/**
 * Defect Image Entity
 */
export interface DefectDataIQA {
  id: number;
  defect_id: number;      // Foreign key to defect table
  iqaid?: number;         // Foreign key to iqadata table
  defect_description: string;      // Defect Description
  imge_data: Buffer;      // Image binary data (bytea in PostgreSQL)
  created_at?: Date;
}

// ==================== REQUEST/RESPONSE TYPES ====================

/**
 * Create Defect Image Request
 */
export interface CreateDefectDataIQARequest {
  defect_id: number;
  iqaid?: number;
  defect_description: string;
  imge_data: Buffer;
}

/**
 * Service Result Types
 */
export interface ServiceResult<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// ==================== CONFIGURATION ====================

/**
 * Defect Image Configuration
 */
export interface DefectDataIQAConfig {
  tableName: string;
  primaryKey: string;
  maxImageSize: number;      // Maximum image size in bytes (e.g., 5MB)
  allowedMimeTypes: string[]; // Allowed MIME types
}

/**
 * Default Configuration
 */
export const DEFAULT_DEFECT_IMAGE_CONFIG: DefectDataIQAConfig = {
  tableName: 'defectdata_iqa',
  primaryKey: 'id',
  maxImageSize: 5 * 1024 * 1024, // 5MB
  allowedMimeTypes: [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/gif',
    'image/webp'
  ]
};