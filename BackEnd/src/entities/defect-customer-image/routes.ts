// server/src/entities/defect-customer-image/routes.ts
/**
 * Defect Image Entity Routes
 * Complete Separation Entity Architecture
 */

import { Router } from 'express';

import multer from 'multer';
import { createDefectCustomerImageModel } from './model';
import { DefectImageService, createDefectImageService } from './service';
import { DefectImageController, createDefectImageController } from './controller';
import { DEFAULT_DEFECT_IMAGE_CONFIG } from './types';
import { getDrizzle } from '../../config/database';

// ==================== MULTER CONFIGURATION ====================

/**
 * Configure multer for memory storage (store in Buffer)
 */
const storage = multer.memoryStorage();

/**
 * File filter to accept only images
 */
const fileFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  if (DEFAULT_DEFECT_IMAGE_CONFIG.allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`Invalid file type. Allowed types: ${DEFAULT_DEFECT_IMAGE_CONFIG.allowedMimeTypes.join(', ')}`));
  }
};

/**
 * Multer upload middleware
 */
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: DEFAULT_DEFECT_IMAGE_CONFIG.maxImageSize,
    files: 10 // Maximum 10 files per request
  }
});

// ==================== ROUTE FACTORY ====================

/**
 * Create defect image routes
 */
export function createDefectImageRoutes(_db?: any): Router {
  const router = Router();

  // Create entity stack with Drizzle
  const model = createDefectCustomerImageModel(getDrizzle());
  const service = createDefectImageService(model as any);
  const controller = createDefectImageController(service);

  // ==================== ROUTES ====================

  /**
   * POST /api/defect-image
   * Upload a single image for a defect
   */
  router.post('/',
    upload.single('image'),
    controller.create
  );

  /**
   * POST /api/defect-image/bulk
   * Upload multiple images for a defect
   */
  router.post('/bulk',
    upload.array('images', 10),
    controller.bulkCreate
  );

  /**
   * GET /api/defect-customer-image/all
   * Get all images (admin only)
   * IMPORTANT: Must come BEFORE /:id to avoid route conflict
   */
  router.get('/all',
    controller.getAll
  );

  /**
   * GET /api/defect-customer-image/:id
   * Get image by ID (returns binary data)
   */
  router.get('/:id',
    controller.getById
  );

  /**
   * GET /api/defect-customer-image/defect/:defectId
   * Get all images metadata for a defect
   */
  router.get('/defect/:defectId',
    controller.getByDefectId
  );

  /**
   * PUT /api/defect-customer-image/:id
   * Update image by ID
   */
  router.put('/:id',
    upload.single('image'),
    controller.update
  );

  /**
   * DELETE /api/defect-customer-image/:id
   * Delete image by ID
   */
  router.delete('/:id',
    controller.delete
  );

  /**
   * DELETE /api/defect-image/defect/:defectId
   * Delete all images for a defect
   */
  router.delete('/defect/:defectId',
    controller.deleteByDefectId
  );

  /**
   * GET /api/defect-image/health
   * Health check
   */
  router.get('/health',
    controller.healthCheck
  );

  return router;
}

/**
 * Default export for auto-discovery
 */
export default function createDefectImageRouter(_db?: any): Router {
  return createDefectImageRoutes(getDrizzle());
}