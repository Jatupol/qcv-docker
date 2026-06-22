"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DefectDataIQAService = void 0;
exports.createDefectDataIQAService = createDefectDataIQAService;
const types_1 = require("./types");
class DefectDataIQAService {
    constructor(model, config = types_1.DEFAULT_DEFECT_IMAGE_CONFIG) {
        this.model = model;
        this.config = config;
    }
    validateImage(imageData) {
        if (!imageData || imageData.length === 0) {
            return { valid: false, error: 'Image data is required' };
        }
        if (imageData.length > this.config.maxImageSize) {
            const maxSizeMB = this.config.maxImageSize / (1024 * 1024);
            return { valid: false, error: `Image size exceeds maximum allowed size of ${maxSizeMB}MB` };
        }
        return { valid: true };
    }
    async create(data, userId) {
        try {
            if (!data.defect_id || !Number.isInteger(data.defect_id) || data.defect_id <= 0) {
                return {
                    success: false,
                    error: 'Invalid defect ID'
                };
            }
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
        }
        catch (error) {
            console.error('Error creating defect image:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Failed to create defect image'
            };
        }
    }
    async bulkCreate(defectId, images, userId, defectDescription, iqaid) {
        try {
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
        }
        catch (error) {
            console.error('Error bulk creating defect images:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Failed to create defect images'
            };
        }
    }
    async getById(id, userId) {
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
        }
        catch (error) {
            console.error('Error getting defect image:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Failed to get defect image'
            };
        }
    }
    async getByDefectId(defectId, userId) {
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
        }
        catch (error) {
            console.error('Error getting defect images:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Failed to get defect images'
            };
        }
    }
    async getByIQAId(iqaid, userId) {
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
        }
        catch (error) {
            console.error('Error getting IQA defect images:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Failed to get IQA defect images'
            };
        }
    }
    async delete(id, userId, actor, req) {
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
        }
        catch (error) {
            console.error('Error deleting defect image:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Failed to delete defect image'
            };
        }
    }
    async deleteByDefectId(defectId, userId) {
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
        }
        catch (error) {
            console.error('Error deleting defect images:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Failed to delete defect images'
            };
        }
    }
    async healthCheck() {
        try {
            if (!this.model) {
                return { healthy: false, message: 'Model not initialized' };
            }
            return { healthy: true, message: 'Defect Image service is healthy' };
        }
        catch (error) {
            return {
                healthy: false,
                message: error instanceof Error ? error.message : 'Health check failed'
            };
        }
    }
}
exports.DefectDataIQAService = DefectDataIQAService;
function createDefectDataIQAService(model) {
    return new DefectDataIQAService(model);
}
