// server/src/entities/defect-customer-image/index.ts
/**
 * Defect Customer Image Entity - Auto-Discovery Export
 * Complete Separation Entity Architecture
 */

import { Pool } from 'pg';
import { Router } from 'express';
import { createDefectImageRoutes } from './routes';

/**
 * Default export for auto-discovery
 * This function is called by EntityAutoDiscoveryFactory
 */
export default function createDefectCustomerImageRouter(db: Pool): Router {
  return createDefectImageRoutes(db);
}

/**
 * Named exports for manual imports if needed
 */
export { createDefectImageRoutes } from './routes';
export { DefectCustomerImageModel, createDefectCustomerImageModel } from './model';
export { DefectImageService, createDefectImageService } from './service';
export { DefectImageController, createDefectImageController } from './controller';
export * from './types';
