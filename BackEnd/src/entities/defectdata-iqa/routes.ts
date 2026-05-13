// server/src/entities/defectdata-iqa/routes.ts
/**
 * Defect Image Entity Routes
 * Complete Separation Entity Architecture
 */

import { Router } from 'express';

import multer from 'multer';
import { createDefectDataIQAModel } from './model';
import { DefectDataIQAService, createDefectDataIQAService } from './service';
import { DefectDataIQAController, createDefectDataIQAController } from './controller';
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
export function createDefectDataIQARoutes(_db?: any): Router {
  const router = Router();

  // Create entity stack with Drizzle
  const model = createDefectDataIQAModel(getDrizzle());
  const service = createDefectDataIQAService(model as any);
  const controller = createDefectDataIQAController(service);

  // ==================== ROUTES ====================

  /**
   * POST /api/defectdata-iqa
   * Upload a single image for a defect
   */
  router.post('/',
    upload.single('image'),
    controller.create
  );

  /**
   * POST /api/defectdata-iqa/bulk
   * Upload multiple images for a defect
   */
  router.post('/bulk',
    upload.array('images', 10),
    controller.bulkCreate
  );

  /**
   * GET /api/defectdata-iqa/:id
   * Get image by ID (returns binary data)
   */
  router.get('/:id',
    controller.getById
  );

  /**
   * GET /api/defectdata-iqa/defect/:defectId
   * Get all images metadata for a defect
   */
  router.get('/defect/:defectId',
    controller.getByDefectId
  );

  /**
   * GET /api/defectdata-iqa/iqa/:iqaid
   * Get all images metadata for an IQA record
   */
  router.get('/iqa/:iqaid',
    controller.getByIQAId
  );

  /**
   * DELETE /api/defectdata-iqa/:id
   * Delete image by ID
   */
  router.delete('/:id',
    controller.delete
  );

  /**
   * DELETE /api/defectdata-iqa/defect/:defectId
   * Delete all images for a defect
   */
  router.delete('/defect/:defectId',
    controller.deleteByDefectId
  );

  /**
   * GET /api/defectdata-iqa/health
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
export default function createDefectDataIQARouter(_db?: any): Router {
  return createDefectDataIQARoutes(getDrizzle());
}

// ==================== ROUTE DOCUMENTATION ====================

/*
=== DEFECT IMAGE ROUTES ===

BASE PATH: /api/defectdata-iqa

ENDPOINTS:

1. POST /
   - Upload single image for a defect
   - Body: multipart/form-data
   - Fields: defect_id (number), image (file)
   - Returns: { id, defect_id }

2. POST /bulk
   - Upload multiple images for a defect
   - Body: multipart/form-data
   - Fields: defect_id (number), images[] (files)
   - Returns: [{ id, defect_id }, ...]

3. GET /:id
   - Get image by ID
   - Returns: Binary image data (image/jpeg)

4. GET /defect/:defectId
   - Get all images metadata for a defect
   - Returns: [{ id, defect_id, image_url }, ...]

5. DELETE /:id
   - Delete image by ID
   - Returns: Success message

6. DELETE /defect/:defectId
   - Delete all images for a defect
   - Returns: { deletedCount }

7. GET /health
   - Health check
   - Returns: { healthy, message }

FEATURES:
✅ Multer file upload middleware
✅ Memory storage (Buffer)
✅ File type validation (JPEG, PNG, GIF, WebP)
✅ File size limits (5MB per image)
✅ Bulk upload support (up to 10 images)
✅ Complete CRUD operations
✅ Health check endpoint
✅ Transaction support for bulk operations
*/