// server/src/entities/defectdata-iqa/index.ts
/**
 * Defect Data IQA Entity - Auto-Discovery Export
 * Complete Separation Entity Architecture
 */

import { Pool } from 'pg';
import { Router } from 'express';
import { createDefectDataIQARoutes } from './routes';

/**
 * Default export for auto-discovery
 * This function is called by EntityAutoDiscoveryFactory
 */
export default function createDefectDataIQARouter(db: Pool): Router {
  return createDefectDataIQARoutes(db);
}

/**
 * Named exports for manual imports if needed
 */
export { createDefectDataIQARoutes } from './routes';
export { DefectDataIQAModel, createDefectDataIQAModel } from './model';
export { DefectDataIQAService, createDefectDataIQAService } from './service';
export { DefectDataIQAController, createDefectDataIQAController } from './controller';
export * from './types';
