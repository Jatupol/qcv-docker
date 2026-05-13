// server/src/entities/defect-customer-image/service.ts
/**
 * Defect Image Entity Service
 * Complete Separation Entity Architecture
 */

import {
  DefectImage,
  CreateDefectImageRequest,
  ServiceResult,
  DefectImageConfig,
  DEFAULT_DEFECT_IMAGE_CONFIG
} from './types';
import { DefectCustomerImageModel } from './model';

/**
 * Defect Image Service - Business logic layer
 */
export class DefectImageService {
  private model: DefectCustomerImageModel;
  private config: DefectImageConfig;

  constructor(model: DefectCustomerImageModel, config: DefectImageConfig = DEFAULT_DEFECT_IMAGE_CONFIG) {
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
  async create(data: CreateDefectImageRequest, userId?: number): Promise<ServiceResult<DefectImage>> {
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
  async bulkCreate(defectId: number, images: Buffer[], userId?: number, trayInfos?: Array<{ trayno?: string | null; tray_row?: string | null; tray_position?: string | null; photo_magnification?: string | null; stamp?: string | null }>): Promise<ServiceResult<DefectImage[]>> {
    try {
      console.log('🔧 Service.bulkCreate called');
      console.log('  - defectId:', defectId, '(type:', typeof defectId, ')');
      console.log('  - images count:', images?.length);
      console.log('  - userId:', userId);
      console.log('  - trayInfos:', trayInfos);

      // Validate defect_id
      if (!defectId || !Number.isInteger(defectId) || defectId <= 0) {
        console.error('❌ Invalid defect ID:', defectId);
        return {
          success: false,
          error: 'Invalid defect ID'
        };
      }

      if (!images || images.length === 0) {
        console.error('❌ No images provided');
        return {
          success: false,
          error: 'No images provided'
        };
      }

      // Validate each image
      console.log('  - Validating images...');
      for (let i = 0; i < images.length; i++) {
        const validation = this.validateImage(images[i]);
        if (!validation.valid) {
          console.error(`❌ Image ${i + 1} validation failed:`, validation.error);
          return {
            success: false,
            error: `Image ${i + 1}: ${validation.error}`
          };
        }
        console.log(`  - Image ${i + 1} valid (${images[i].length} bytes)`);
      }

      console.log('  - Calling model.bulkCreate...');
      const createdImages = await this.model.bulkCreate(defectId, images, trayInfos);
      console.log('✅ Model created', createdImages.length, 'images');

      return {
        success: true,
        data: createdImages,
        message: `${createdImages.length} defect images created successfully`
      };

    } catch (error) {
      console.error('❌ Error bulk creating defect images:', error);
      if (error instanceof Error) {
        console.error('  - Error message:', error.message);
        console.error('  - Error stack:', error.stack);
      }
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create defect images'
      };
    }
  }

  /**
   * Get image by ID
   */
  async getById(id: number, userId?: number): Promise<ServiceResult<DefectImage>> {
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
  async getByDefectId(defectId: number, userId?: number): Promise<ServiceResult<DefectImage[]>> {
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
   * Update an existing image
   */
  async update(id: number, imageData: Buffer, userId?: number): Promise<ServiceResult<DefectImage>> {
    try {
      // Validate ID
      if (!id || !Number.isInteger(id) || id <= 0) {
        return {
          success: false,
          error: 'Invalid image ID'
        };
      }

      // Validate image data
      const validation = this.validateImage(imageData);
      if (!validation.valid) {
        return {
          success: false,
          error: validation.error
        };
      }

      // Check if image exists
      const existing = await this.model.getById(id);
      if (!existing) {
        return {
          success: false,
          error: 'Image not found'
        };
      }

      const updated = await this.model.update(id, imageData);

      if (!updated) {
        return {
          success: false,
          error: 'Failed to update image'
        };
      }

      return {
        success: true,
        data: updated,
        message: 'Image updated successfully'
      };

    } catch (error) {
      console.error('Error updating defect customer image:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update defect customer image'
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
   * Get all defect customer images
   */
  async getAll(userId?: number): Promise<ServiceResult<DefectImage[]>> {
    try {
      const images = await this.model.getAll();

      return {
        success: true,
        data: images,
        message: `Retrieved ${images.length} defect customer images`
      };

    } catch (error) {
      console.error('Error getting all defect customer images:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get defect customer images'
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
export function createDefectImageService(model: DefectCustomerImageModel): DefectImageService {
  return new DefectImageService(model);
}