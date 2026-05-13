// server/src/entities/defectdata/index.ts
/**
 * DefectData Entity - Main Export File
 * Complete Separation Entity Architecture
 *
 * This file serves as the entry point for the defectdata entity,
 * enabling auto-discovery to automatically register routes.
 */

import { Pool } from 'pg';
import { Router } from 'express';
import { createDefectDataRoutes } from './routes';

/**
 * Default export function for auto-discovery
 *
 * This function is called by the entity auto-discovery system
 * to create and register the defectdata router
 *
 * @param db - PostgreSQL connection pool
 * @returns Express router configured with all defectdata routes
 */
export default function createDefectDataRouter(db: Pool): Router {
  return createDefectDataRoutes(db);
}

// Named exports for advanced usage
export { createDefectDataRoutes } from './routes';
export { DefectDataModel, createDefectDataModel } from './model';
export { DefectDataService, createDefectDataService } from './service';
export { DefectDataController, createDefectDataController } from './controller';
export * from './types';
