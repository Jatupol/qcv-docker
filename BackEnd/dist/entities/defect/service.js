"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DefectService = void 0;
exports.createDefectService = createDefectService;
const generic_service_1 = require("../../generic/entities/serial-id-entity/generic-service");
const types_1 = require("./types");
class DefectService extends generic_service_1.GenericSerialIdService {
    constructor(defectModel) {
        super(defectModel, types_1.DEFAULT_DEFECT_CONFIG);
        this.defectModel = defectModel;
    }
    async getByDefectGroup(defectGroup, options = {}, userId) {
        try {
            console.log('🔧 DefectService.getByDefectGroup - called with:', { defectGroup, options });
            if (!defectGroup || typeof defectGroup !== 'string' || defectGroup.trim().length === 0) {
                return {
                    success: false,
                    error: 'Defect group is required'
                };
            }
            const result = await this.defectModel.getByDefectGroup(defectGroup.trim(), options);
            return {
                success: true,
                data: result
            };
        }
        catch (error) {
            console.error('❌ DefectService.getByDefectGroup - Error:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Failed to get defects by group'
            };
        }
    }
    async validateNameUnique(name, excludeId, userId) {
        try {
            if (!name || typeof name !== 'string' || name.trim().length === 0) {
                return {
                    success: false,
                    error: 'Defect name is required'
                };
            }
            if (name.trim().length > 100) {
                return {
                    success: false,
                    error: 'Defect name cannot exceed 100 characters'
                };
            }
            if (excludeId !== undefined && (!this.validateIdFormat(excludeId))) {
                return {
                    success: false,
                    error: 'Invalid exclude ID'
                };
            }
            const isUnique = await this.defectModel.isDefectNameUnique(name.trim(), excludeId);
            return {
                success: true,
                data: isUnique
            };
        }
        catch (error) {
            return {
                success: false,
                error: `Failed to validate defect name: ${error instanceof Error ? error.message : 'Unknown error'}`
            };
        }
    }
    validateDefectData(data, operation = 'create') {
        const errors = [];
        if (operation === 'create' || data.name !== undefined) {
            if (!data.name || typeof data.name !== 'string') {
                errors.push('Defect name is required');
            }
            else {
                const trimmedName = data.name.trim();
                if (trimmedName.length === 0) {
                    errors.push('Defect name cannot be empty');
                }
                else if (trimmedName.length > 100) {
                    errors.push('Defect name cannot exceed 100 characters');
                }
                else if (trimmedName.length < 2) {
                    errors.push('Defect name must be at least 2 characters long');
                }
                else if (!/^[a-zA-Z0-9\s\-_.()]+$/.test(trimmedName)) {
                    errors.push('Defect name contains invalid characters');
                }
                else if (trimmedName !== data.name.trim()) {
                    errors.push('Defect name cannot have leading or trailing spaces');
                }
                else if (/\s{2,}/.test(trimmedName)) {
                    errors.push('Defect name cannot contain multiple consecutive spaces');
                }
            }
        }
        if (data.description !== undefined) {
            if (typeof data.description !== 'string') {
                errors.push('Description must be a string');
            }
            else if (data.description.length > 0 && data.description.trim().length === 0) {
                errors.push('Description cannot be empty if provided');
            }
            else if (data.description.length > 5000) {
                errors.push('Description cannot exceed 5000 characters');
            }
        }
        return {
            isValid: errors.length === 0,
            errors
        };
    }
    validateIdFormat(id) {
        return Number.isInteger(id) && id > 0;
    }
}
exports.DefectService = DefectService;
function createDefectService(defectModel) {
    return new DefectService(defectModel);
}
exports.default = DefectService;
