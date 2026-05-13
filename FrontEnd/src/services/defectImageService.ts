// client/src/services/defectImageService.ts
/**
 * Defect Image Service
 * Handles API calls for defect_image and defect_customer_image tables
 */

import axios from 'axios';
import { getRuntimeEnv } from '../config/runtimeConfig';

// Ensure we always have the /api prefix
const getApiBaseUrl = () => {
  const baseUrl = getRuntimeEnv('VITE_API_BASE_URL') || 'http://localhost:8080/api';
  // Make sure it ends with /api
  return baseUrl.endsWith('/api') ? baseUrl : `${baseUrl}/api`;
};

const API_BASE_URL = getApiBaseUrl();

// ==================== TYPES ====================

export interface DefectImageRecord {
  id: number;
  defect_id: number;
  image_url?: string;
  image_size?: number;
  image_dimensions?: string;
}

export interface ImageUploadResponse {
  success: boolean;
  message: string;
  data?: DefectImageRecord;
}

// ==================== SERVICE CLASS ====================

class DefectImageService {
  /**
   * Get all regular defect images
   */
  async getDefectImages(): Promise<DefectImageRecord[]> {
    try {
      const url = `${API_BASE_URL}/defect-image/all`;
      console.log('Fetching regular defect images from:', url);
      const response = await axios.get(url, {
        withCredentials: true
      });
      return response.data.data || [];
    } catch (error) {
      console.error('Failed to fetch regular defect images:', error);
      throw error;
    }
  }

  /**
   * Get all customer defect images
   */
  async getCustomerDefectImages(): Promise<DefectImageRecord[]> {
    try {
      const url = `${API_BASE_URL}/defect-customer-image/all`;
      console.log('Fetching customer defect images from:', url);
      const response = await axios.get(url, {
        withCredentials: true
      });
      return response.data.data || [];
    } catch (error) {
      console.error('Failed to fetch customer defect images:', error);
      throw error;
    }
  }

  /**
   * Update an existing image record with optimized image
   */
  async updateImage(
    imageId: number,
    imageFile: File,
    type: 'regular' | 'customer'
  ): Promise<ImageUploadResponse> {
    try {
      const formData = new FormData();
      formData.append('image', imageFile);

      const endpoint = type === 'regular' ? 'defect-image' : 'defect-customer-image';
      const url = `${API_BASE_URL}/${endpoint}/${imageId}`;
      console.log('Updating image:', url);

      const response = await axios.put(
        url,
        formData,
        {
          withCredentials: true,
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      return response.data;
    } catch (error) {
      console.error('Failed to update image:', error);
      throw error;
    }
  }

  /**
   * Delete an image
   */
  async deleteImage(id: number, type: 'regular' | 'customer'): Promise<void> {
    try {
      const endpoint = type === 'regular' ? 'defect-image' : 'defect-customer-image';
      await axios.delete(`${API_BASE_URL}/${endpoint}/${id}`, {
        withCredentials: true
      });
    } catch (error) {
      console.error('Failed to delete image:', error);
      throw error;
    }
  }

  /**
   * Batch optimize images (client-side only, no server call)
   * This is a helper function to optimize multiple images at once
   */
  async batchOptimizeImages(files: File[]): Promise<File[]> {
    const { batchOptimizeImages } = await import('../utils/imageOptimizer');
    const results = await batchOptimizeImages(files);
    return results.map(result => result.file);
  }
}

// Export singleton instance
const defectImageService = new DefectImageService();
export default defectImageService;
