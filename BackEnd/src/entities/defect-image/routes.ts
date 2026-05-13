// server/src/entities/defect-image/routes.ts
/**
 * Defect Image Entity Routes
 * Complete Separation Entity Architecture
 */

import { Router } from 'express';

import multer from 'multer';
import { createDefectImageModel } from './model';
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
  const model = createDefectImageModel(getDrizzle());
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
   * GET /api/defect-image/all
   * Get all images (admin only)
   * IMPORTANT: Must come BEFORE /:id to avoid route conflict
   */
  router.get('/all',
    controller.getAll
  );

  /**
   * GET /api/defect-image/:id
   * Get image by ID (returns binary data)
   */
  router.get('/:id',
    controller.getById
  );

  /**
   * GET /api/defect-image/defect/:defectId
   * Get all images metadata for a defect
   */
  router.get('/defect/:defectId',
    controller.getByDefectId
  );

  /**
   * PUT /api/defect-image/:id
   * Update image by ID
   */
  router.put('/:id',
    upload.single('image'),
    controller.update
  );

  /**
   * DELETE /api/defect-image/:id
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

// ==================== ROUTE DOCUMENTATION ====================

/*
=== DEFECT IMAGE ROUTES ===

BASE PATH: /api/defect-image

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