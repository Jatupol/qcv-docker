// server/src/entities/defectdata-iqa/controller.ts
/**
 * Defect Image Entity Controller
 * Complete Separation Entity Architecture
 */

import { Request, Response, NextFunction } from 'express';
import { DefectDataIQAService } from './service';

/**
 * Defect Image Controller - HTTP handling layer
 */
export class DefectDataIQAController {
  private service: DefectDataIQAService;

  constructor(service: DefectDataIQAService) {
    this.service = service;
  }

  /**
   * Extract user ID from request session
   */
  private extractUserId(req: Request): number | undefined {
    return req.session?.user?.id;
  }

  /**
   * POST /api/defectdata-iqa
   * Create a single defect image
   */
  create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { defect_id, defect_description } = req.body;
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
        defect_description: defect_description || '',
        imge_data: req.file.buffer
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
          defect_id: result.data?.defect_id,
          defect_description: result.data?.defect_description
        },
        message: result.message
      });

    } catch (error) {
      console.error('Error in DefectDataIQAController.create:', error);
      next(error);
    }
  };

  /**
   * POST /api/defectdata-iqa/bulk
   * Create multiple defect images for a single defect
   */
  bulkCreate = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { defect_id, defect_description, iqaid } = req.body;
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

      const result = await this.service.bulkCreate(
        parseInt(defect_id),
        imageBuffers,
        userId,
        defect_description,
        iqaid ? parseInt(iqaid) : undefined
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
          defect_id: img.defect_id,
          iqaid: img.iqaid,
          defect_description: img.defect_description
        })),
        message: result.message
      });

    } catch (error) {
      console.error('Error in DefectDataIQAController.bulkCreate:', error);
      next(error);
    }
  };

  /**
   * GET /api/defectdata-iqa/:id
   * Get image by ID
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

      // Return image as binary data
      res.set('Content-Type', 'image/jpeg');
      res.send(result.data?.imge_data);

    } catch (error) {
      console.error('Error in DefectDataIQAController.getById:', error);
      next(error);
    }
  };

  /**
   * GET /api/defectdata-iqa/defect/:defectId
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
          iqaid: img.iqaid,
          defect_description: img.defect_description,
          image_url: `/api/defectdata-iqa/${img.id}`
        })),
        message: result.message
      });

    } catch (error) {
      console.error('Error in DefectDataIQAController.getByDefectId:', error);
      next(error);
    }
  };

  /**
   * GET /api/defectdata-iqa/iqa/:iqaid
   * Get all images for an IQA record
   */
  getByIQAId = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const iqaid = parseInt(req.params.iqaid);
      const userId = this.extractUserId(req);

      const result = await this.service.getByIQAId(iqaid, userId);

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
          iqaid: img.iqaid,
          defect_description: img.defect_description,
          image_url: `/api/defectdata-iqa/${img.id}`
        })),
        message: result.message
      });

    } catch (error) {
      console.error('Error in DefectDataIQAController.getByIQAId:', error);
      next(error);
    }
  };

  /**
   * DELETE /api/defectdata-iqa/:id
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
      console.error('Error in DefectDataIQAController.delete:', error);
      next(error);
    }
  };

  /**
   * DELETE /api/defectdata-iqa/defect/:defectId
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
      console.error('Error in DefectDataIQAController.deleteByDefectId:', error);
      next(error);
    }
  };

  /**
   * GET /api/defectdata-iqa/health
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
      console.error('Error in DefectDataIQAController.healthCheck:', error);
      next(error);
    }
  };
}

/**
 * Factory function to create controller instance
 */
export function createDefectDataIQAController(service: DefectDataIQAService): DefectDataIQAController {
  return new DefectDataIQAController(service);
}