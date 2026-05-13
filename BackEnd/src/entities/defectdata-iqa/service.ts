// server/src/entities/defectdata-iqa/service.ts
/**
 * Defect Image Entity Service
 * Complete Separation Entity Architecture
 */

import {
  DefectDataIQA,
  CreateDefectDataIQARequest,
  ServiceResult,
  DefectDataIQAConfig,
  DEFAULT_DEFECT_IMAGE_CONFIG
} from './types';
import { DefectDataIQAModel } from './model';

/**
 * Defect Image Service - Business logic layer
 */
export class DefectDataIQAService {
  private model: DefectDataIQAModel;
  private config: DefectDataIQAConfig;

  constructor(model: DefectDataIQAModel, config: DefectDataIQAConfig = DEFAULT_DEFECT_IMAGE_CONFIG) {
    this.model = model;
    this.config = config;
  }

  /**
   * Validate image data
   */
  private validateImage(imageData: Buffer): { valid: boolean; error?: string } {
    if (!imageData || imageData.length === 0) {
      return { valid: false, error: 'Image data is required' };
    }

    if (imageData.length > this.config.maxImageSize) {
      const maxSizeMB = this.config.maxImageSize / (1024 * 1024);
      return { valid: false, error: `Image size exceeds maximum allowed size of ${maxSizeMB}MB` };
    }

    return { valid: true };
  }

  /**
   * Create a new defect image
   */
  async create(data: CreateDefectDataIQARequest, userId?: number): Promise<ServiceResult<DefectDataIQA>> {
    try {
      // Validate defect_id
      if (!data.defect_id || !Number.isInteger(data.defect_id) || data.defect_id <= 0) {
        return {
          success: false,
          error: 'Invalid defect ID'
        };
      }

      // Validate image data
      const validation = this.validateImage(data.imge_data);
      if (!validation.valid) {
        return {
          success: false,
          error: validation.error
        };
      }

      const image = await this.model.create(data);

      return {
        success: true,
        data: image,
        message: 'Defect image created successfully'
      };

    } catch (error) {
      console.error('Error creating defect image:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create defect image'
      };
    }
  }

  /**
   * Bulk create defect images
   */
  async bulkCreate(defectId: number, images: Buffer[], userId?: number, defectDescription?: string, iqaid?: number): Promise<ServiceResult<DefectDataIQA[]>> {
    try {
      // Validate defect_id
      if (!defectId || !Number.isInteger(defectId) || defectId <= 0) {
        return {
          success: false,
          error: 'Invalid defect ID'
        };
      }

      if (!images || images.length === 0) {
        return {
          success: false,
          error: 'No images provided'
        };
      }

      // Validate each image
      for (let i = 0; i < images.length; i++) {
        const validation = this.validateImage(images[i]);
        if (!validation.valid) {
          return {
            success: false,
            error: `Image ${i + 1}: ${validation.error}`
          };
        }
      }

      const createdImages = await this.model.bulkCreate(defectId, images, defectDescription, iqaid);

      return {
        success: true,
        data: createdImages,
        message: `${createdImages.length} defect images created successfully`
      };

    } catch (error) {
      console.error('Error bulk creating defect images:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create defect images'
      };
    }
  }

  /**
   * Get image by ID
   */
  async getById(id: number, userId?: number): Promise<ServiceResult<DefectDataIQA>> {
    try {
      if (!id || !Number.isInteger(id) || id <= 0) {
        return {
          success: false,
          error: 'Invalid image ID'
        };
      }

      const image = await this.model.getById(id);

      if (!image) {
        return {
          success: false,
          error: 'Defect image not found'
        };
      }

      return {
        success: true,
        data: image
      };

    } catch (error) {
      console.error('Error getting defect image:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get defect image'
      };
    }
  }

  /**
   * Get all images for a defect
   */
  async getByDefectId(defectId: number, userId?: number): Promise<ServiceResult<DefectDataIQA[]>> {
    try {
      if (!defectId || !Number.isInteger(defectId) || defectId <= 0) {
        return {
          success: false,
          error: 'Invalid defect ID'
        };
      }

      const images = await this.model.getByDefectId(defectId);

      return {
        success: true,
        data: images,
        message: `Found ${images.length} images for defect ${defectId}`
      };

    } catch (error) {
      console.error('Error getting defect images:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get defect images'
      };
    }
  }

  /**
   * Get all images for an IQA record
   */
  async getByIQAId(iqaid: number, userId?: number): Promise<ServiceResult<DefectDataIQA[]>> {
    try {
      if (!iqaid || !Number.isInteger(iqaid) || iqaid <= 0) {
        return {
          success: false,
          error: 'Invalid IQA ID'
        };
      }

      const images = await this.model.getByIQAId(iqaid);

      return {
        success: true,
        data: images,
        message: `Found ${images.length} images for IQA record ${iqaid}`
      };

    } catch (error) {
      console.error('Error getting IQA defect images:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get IQA defect images'
      };
    }
  }

  /**
   * Delete image by ID
   */
  async delete(id: number, userId?: number, actor?: any, req?: any): Promise<ServiceResult<void>> {
    try {
      if (!id || !Number.isInteger(id) || id <= 0) {
        return {
          success: false,
          error: 'Invalid image ID'
        };
      }

      const deleted = await this.model.delete(id, actor ?? null, req);

      if (!deleted) {
        return {
          success: false,
          error: 'Defect image not found'
        };
      }

      return {
        success: true,
        message: 'Defect image deleted successfully'
      };

    } catch (error) {
      console.error('Error deleting defect image:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to delete defect image'
      };
    }
  }

  /**
   * Delete all images for a defect
   */
  async deleteByDefectId(defectId: number, userId?: number): Promise<ServiceResult<number>> {
    try {
      if (!defectId || !Number.isInteger(defectId) || defectId <= 0) {
        return {
          success: false,
          error: 'Invalid defect ID'
        };
      }

      const count = await this.model.deleteByDefectId(defectId);

      return {
        success: true,
        data: count,
        message: `Deleted ${count} images for defect ${defectId}`
      };

    } catch (error) {
      console.error('Error deleting defect images:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to delete defect images'
      };
    }
  }

  /**
   * Health check
   */
  async healthCheck(): Promise<{ healthy: boolean; message: string }> {
    try {
      // Simple validation that model exists
      if (!this.model) {
        return { healthy: false, message: 'Model not initialized' };
      }

      return { healthy: true, message: 'Defect Image service is healthy' };
    } catch (error) {
      return {
        healthy: false,
        message: error instanceof Error ? error.message : 'Health check failed'
      };
    }
  }
}

/**
 * Factory function to create service instance
 */
export function createDefectDataIQAService(model: DefectDataIQAModel): DefectDataIQAService {
  return new DefectDataIQAService(model);
}