// server/src/entities/defect-image/controller.ts
/**
 * Defect Image Entity Controller
 * Complete Separation Entity Architecture
 */

import { Request, Response, NextFunction } from 'express';
import { DefectImageService } from './service';

/**
 * Defect Image Controller - HTTP handling layer
 */
export class DefectImageController {
  private service: DefectImageService;

  constructor(service: DefectImageService) {
    this.service = service;
  }

  /**
   * Extract user ID from request session
   */
  private extractUserId(req: Request): number | undefined {
    return req.session?.user?.id;
  }

  /**
   * POST /api/defect-image
   * Create a single defect image
   */
  create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { defect_id, trayno, tray_row, tray_position, photo_magnification, stamp } = req.body;
      const userId = this.extractUserId(req);

      // Check if file was uploaded
      if (!req.file) {
        res.status(400).json({
          success: false,
          message: 'No image file provided'
        });
        return;
      }

      const result = await this.service.create({
        defect_id: parseInt(defect_id),
        imge_data: req.file.buffer,
        trayno: trayno || null,
        tray_row: tray_row || null,
        tray_position: tray_position || null,
        photo_magnification: photo_magnification || null,
        stamp: stamp || null
      }, userId);

      if (!result.success) {
        res.status(400).json({
          success: false,
          message: result.error
        });
        return;
      }

      res.status(201).json({
        success: true,
        data: {
          id: result.data?.id,
          defect_id: result.data?.defect_id
        },
        message: result.message
      });

    } catch (error) {
      console.error('Error in DefectImageController.create:', error);
      next(error);
    }
  };

  /**
   * POST /api/defect-image/bulk
   * Create multiple defect images for a single defect
   */
  bulkCreate = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { defect_id, tray_infos } = req.body;
      const userId = this.extractUserId(req);

      // Check if files were uploaded
      if (!req.files || !Array.isArray(req.files) || req.files.length === 0) {
        res.status(400).json({
          success: false,
          message: 'No image files provided'
        });
        return;
      }

      const imageBuffers = req.files.map(file => file.buffer);

      // Parse per-image tray infos from JSON string
      let trayInfos: Array<{ trayno?: string | null; tray_row?: string | null; tray_position?: string | null; photo_magnification?: string | null; stamp?: string | null }> | undefined;
      if (tray_infos) {
        try {
          trayInfos = JSON.parse(tray_infos);
        } catch {
          trayInfos = undefined;
        }
      }

      const result = await this.service.bulkCreate(
        parseInt(defect_id),
        imageBuffers,
        userId,
        trayInfos
      );

      if (!result.success) {
        res.status(400).json({
          success: false,
          message: result.error
        });
        return;
      }

      res.status(201).json({
        success: true,
        data: result.data?.map(img => ({
          id: img.id,
          defect_id: img.defect_id
        })),
        message: result.message
      });

    } catch (error) {
      console.error('Error in DefectImageController.bulkCreate:', error);
      next(error);
    }
  };

  /**
   * GET /api/defect-image/:id
   * Get image by ID
   *
   * Returns binary image data with caching headers for performance.
   * Browser will cache images for 1 hour, reducing repeated requests.
   */
  getById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = parseInt(req.params.id);
      const userId = this.extractUserId(req);

      const result = await this.service.getById(id, userId);

      if (!result.success) {
        res.status(404).json({
          success: false,
          message: result.error
        });
        return;
      }

      // Set caching headers for performance
      // Images are immutable (ID-based), safe to cache for 1 hour
      res.set('Cache-Control', 'public, max-age=3600');
      res.set('Content-Type', 'image/jpeg');
      res.send(result.data?.imge_data);

    } catch (error) {
      console.error('Error in DefectImageController.getById:', error);
      next(error);
    }
  };

  /**
   * GET /api/defect-image/defect/:defectId
   * Get all images for a defect
   */
  getByDefectId = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const defectId = parseInt(req.params.defectId);
      const userId = this.extractUserId(req);

      const result = await this.service.getByDefectId(defectId, userId);

      if (!result.success) {
        res.status(400).json({
          success: false,
          message: result.error
        });
        return;
      }

      // Return metadata only (not the binary data)
      res.status(200).json({
        success: true,
        data: result.data?.map(img => ({
          id: img.id,
          defect_id: img.defect_id,
          image_url: `/api/defect-image/${img.id}`,
          trayno: img.trayno,
          tray_row: img.tray_row,
          tray_position: img.tray_position,
          photo_magnification: img.photo_magnification,
          stamp: img.stamp
        })),
        message: result.message
      });

    } catch (error) {
      console.error('Error in DefectImageController.getByDefectId:', error);
      next(error);
    }
  };

  /**
   * DELETE /api/defect-image/:id
   * Delete image by ID
   */
  delete = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = parseInt(req.params.id);
      const userId = this.extractUserId(req);

      const result = await this.service.delete(id, userId, (req as any).user ?? null, req);

      if (!result.success) {
        res.status(404).json({
          success: false,
          message: result.error
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: result.message
      });

    } catch (error) {
      console.error('Error in DefectImageController.delete:', error);
      next(error);
    }
  };

  /**
   * DELETE /api/defect-image/defect/:defectId
   * Delete all images for a defect
   */
  deleteByDefectId = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const defectId = parseInt(req.params.defectId);
      const userId = this.extractUserId(req);

      const result = await this.service.deleteByDefectId(defectId, userId);

      if (!result.success) {
        res.status(400).json({
          success: false,
          message: result.error
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: { deletedCount: result.data },
        message: result.message
      });

    } catch (error) {
      console.error('Error in DefectImageController.deleteByDefectId:', error);
      next(error);
    }
  };

  /**
   * PUT /api/defect-image/:id
   * Update an existing image
   */
  update = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = parseInt(req.params.id);
      const userId = this.extractUserId(req);

      // Check if file was uploaded
      if (!req.file) {
        res.status(400).json({
          success: false,
          message: 'No image file provided'
        });
        return;
      }

      const result = await this.service.update(id, req.file.buffer, userId);

      if (!result.success) {
        res.status(400).json({
          success: false,
          message: result.error
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: {
          id: result.data?.id,
          defect_id: result.data?.defect_id
        },
        message: result.message
      });

    } catch (error) {
      console.error('Error in DefectImageController.update:', error);
      next(error);
    }
  };

  /**
   * GET /api/defect-image/all
   * Get all images with metadata
   */
  getAll = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = this.extractUserId(req);

      const result = await this.service.getAll(userId);

      if (!result.success) {
        res.status(400).json({
          success: false,
          message: result.error
        });
        return;
      }

      // Return metadata with image URLs
      res.status(200).json({
        success: true,
        data: result.data?.map(img => ({
          id: img.id,
          defect_id: img.defect_id,
          image_url: `/api/defect-image/${img.id}`,
          image_size: img.imge_data ? img.imge_data.length : 0
        })),
        message: result.message
      });

    } catch (error) {
      console.error('Error in DefectImageController.getAll:', error);
      next(error);
    }
  };

  /**
   * GET /api/defect-image/health
   * Health check
   */
  healthCheck = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await this.service.healthCheck();

      res.status(result.healthy ? 200 : 503).json({
        success: result.healthy,
        message: result.message,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      console.error('Error in DefectImageController.healthCheck:', error);
      next(error);
    }
  };
}

/**
 * Factory function to create controller instance
 */
export function createDefectImageController(service: DefectImageService): DefectImageController {
  return new DefectImageController(service);
}