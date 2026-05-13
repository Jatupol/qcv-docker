// server/src/entities/defect-image/types.ts
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
export interface DefectImage {
  id: number;
  defect_id: number;      // Foreign key to defectdata table
  imge_data: Buffer;      // Image binary data (bytea in PostgreSQL)
  trayno?: string | null;
  tray_row?: string | null;
  tray_position?: string | null;
  photo_magnification?: string | null;
  stamp?: string | null;
  created_at?: Date;
}

// ==================== REQUEST/RESPONSE TYPES ====================

/**
 * Create Defect Image Request
 */
export interface CreateDefectImageRequest {
  defect_id: number;
  imge_data: Buffer;
  trayno?: string | null;
  tray_row?: string | null;
  tray_position?: string | null;
  photo_magnification?: string | null;
  stamp?: string | null;
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
export interface DefectImageConfig {
  tableName: string;
  primaryKey: string;
  maxImageSize: number;      // Maximum image size in bytes (e.g., 5MB)
  allowedMimeTypes: string[]; // Allowed MIME types
}

/**
 * Default Configuration
 */
export const DEFAULT_DEFECT_IMAGE_CONFIG: DefectImageConfig = {
  tableName: 'defect_image',
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