// server/src/entities/defectdata-customer/index.ts
/**
 * Defect Data Customer Entity - Auto-Discovery Export
 * Complete Separation Entity Architecture
 */

import { Pool } from 'pg';
import { Router } from 'express';
import { createDefectDataRoutes } from './routes';

/**
 * Default export for auto-discovery
 * This function is called by EntityAutoDiscoveryFactory
 */
export default function createDefectDataCustomerRouter(db: Pool): Router {
  return createDefectDataRoutes(db);
}

/**
 * Named exports for manual imports if needed
 */
export { createDefectDataRoutes } from './routes';
export { DefectDataCustomerModel, createDefectDataCustomerModel } from './model';
export { DefectDataService, createDefectDataService } from './service';
export { DefectDataController, createDefectDataController } from './controller';
export * from './types';
