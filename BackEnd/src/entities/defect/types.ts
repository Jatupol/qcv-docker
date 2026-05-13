// server/src/entities/defect/types.ts
/* Defect Entity Types - Complete Separation Entity Architecture
 * SERIAL ID Pattern Implementation
 * 
 * Database Schema Compliance:
 * - Table: defects
 * - Primary Key: id SERIAL PRIMARY KEY
 * - Pattern: SERIAL ID Entity
 * - API Routes: /api/defects/:id
 */

import {
  BaseSerialIdEntity,
  CreateSerialIdData,
  UpdateSerialIdData,
  SerialIdQueryOptions,
  SerialIdEntityConfig,
  SerialIdPaginatedResponse,
  DEFAULT_SERIAL_ID_CONFIG
} from '../../generic/entities/serial-id-entity/generic-types';

// ==================== CORE DEFECT INTERFACES ====================

export interface Defect extends BaseSerialIdEntity {
  defect_group?: string;  // VARCHAR(100) - Defect group/category
}

export interface CreateDefectData extends CreateSerialIdData {
  defect_group?: string;
}

export interface UpdateDefectData extends UpdateSerialIdData {
  defect_group?: string;
}

export interface DefectQueryOptions extends SerialIdQueryOptions {
  // Defect-specific filters (for future extensions)
  nameContains?: string;
  hasDescription?: boolean;
  descriptionContains?: string;
  defect_group?: string;
}

// ==================== SUMMARY AND PROFILE INTERFACES ====================

export interface DefectSummary {
  id: number;
  name: string;
  description: string;
  defect_group?: string;
  is_active: boolean;
  created_by: number;
  updated_by: number;
  created_at: Date;
  updated_at: Date;
}

export type DefectSummaryResponse = SerialIdPaginatedResponse<DefectSummary>;

export interface DefectProfile extends Defect {}

// ==================== CONFIGURATION ====================

export interface DefectEntityConfig extends SerialIdEntityConfig {}

// ==================== DEFAULT CONFIGURATIONS ====================

export const DEFAULT_DEFECT_CONFIG: DefectEntityConfig = {
  ...DEFAULT_SERIAL_ID_CONFIG,
  entityName: 'Defect',
  tableName: 'defects',
  apiPath: '/api/defects',
  searchableFields: ['name', 'description'],
  defaultLimit: 30,
  maxLimit: 200
};