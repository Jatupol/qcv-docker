"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DefectDataService = void 0;
exports.createDefectDataService = createDefectDataService;
const generic_service_1 = require("../../generic/entities/special-entity/generic-service");
const types_1 = require("./types");
class DefectDataService extends generic_service_1.GenericSpecialService {
    constructor(defectDataModel, defectImageModel) {
        super(defectDataModel, types_1.DEFAULT_DEFECTDATA_CONFIG);
        this.defectDataModel = defectDataModel;
        this.defectImageModel = defectImageModel;
    }
    async create(data, userId) {
        try {
            const validation = this.validateDefectDataCreate(data);
            if (!validation.isValid) {
                return {
                    success: false,
                    error: `Validation failed: ${validation.errors.join(', ')}`
                };
            }
            const businessValidation = await this.validateBusinessRules(data);
            if (!businessValidation.isValid) {
                return {
                    success: false,
                    error: `Business rule validation failed: ${businessValidation.errors.join(', ')}`
                };
            }
            const createdData = await this.defectDataModel.create(data, userId);
            return {
                success: true,
                data: createdData
            };
        }
        catch (error) {
            console.error('Error creating defect data:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Failed to create defect data'
            };
        }
    }
    async update(id, data, userId) {
        try {
            if (!this.validateIdFormat(id)) {
                return {
                    success: false,
                    error: 'Invalid defect data ID'
                };
            }
            const validation = this.validateDefectDataUpdate(data);
            if (!validation.isValid) {
                return {
                    success: false,
                    error: `Validation failed: ${validation.errors.join(', ')}`
                };
            }
            const businessValidation = await this.validateBusinessRules(data);
            if (!businessValidation.isValid) {
                return {
                    success: false,
                    error: `Business rule validation failed: ${businessValidation.errors.join(', ')}`
                };
            }
            const updatedData = await this.defectDataModel.update(id, data, userId);
            if (!updatedData) {
                return {
                    success: false,
                    error: 'Defect data not found'
                };
            }
            return {
                success: true,
                data: updatedData
            };
        }
        catch (error) {
            console.error('Error updating defect data:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Failed to update defect data'
            };
        }
    }
    async delete(id, actor, req) {
        try {
            console.log('🔧 DefectdataService.delete called:', { id });
            if (!id) {
                return {
                    success: false
                };
            }
            const result = await this.defectDataModel.delete(id, actor ?? null, req);
            if (result.success) {
                return {
                    success: true,
                    data: true
                };
            }
            else {
                return {
                    success: false
                };
            }
        }
        catch (error) {
            console.error('❌ Error deleting defectdata:', error);
            return {
                success: false
            };
        }
    }
    async getByInspectionNo(inspectionNo, userId) {
        try {
            if (!inspectionNo || typeof inspectionNo !== 'string' || inspectionNo.trim().length === 0) {
                return {
                    success: false,
                    error: 'Inspection number is required'
                };
            }
            if (inspectionNo.length > 20) {
                return {
                    success: false,
                    error: 'Inspection number cannot exceed 20 characters'
                };
            }
            const data = await this.defectDataModel.getByInspectionNo(inspectionNo.trim());
            return {
                success: true,
                data
            };
        }
        catch (error) {
            return {
                success: false,
                error: `Failed to get defect data by inspection number: ${error instanceof Error ? error.message : 'Unknown error'}`
            };
        }
    }
    async getDetailByInspectionNo(inspectionNo) {
        try {
            if (!inspectionNo || typeof inspectionNo !== 'string' || inspectionNo.trim().length === 0) {
                return {
                    success: false,
                    error: 'Inspection number is required'
                };
            }
            if (inspectionNo.length > 20) {
                return {
                    success: false,
                    error: 'Inspection number cannot exceed 20 characters'
                };
            }
            const data = await this.defectDataModel.getDetailByInspectionNo(inspectionNo.trim());
            return {
                success: true,
                data
            };
        }
        catch (error) {
            return {
                success: false,
                error: `Failed to get defect data by inspection number: ${error instanceof Error ? error.message : 'Unknown error'}`
            };
        }
    }
    async getEmailDetailById(defectId) {
        try {
            const data = await this.defectDataModel.getEmailById(defectId);
            console.log(`📧 getEmailDetailById for defect ID ${defectId}: found ${data.length} records`);
            return {
                success: true,
                data
            };
        }
        catch (error) {
            console.error(`❌ getEmailDetailById failed for defect ID ${defectId}:`, error);
            return {
                success: false,
                error: `Failed to get defect data by defect ID: ${error instanceof Error ? error.message : 'Unknown error'}`
            };
        }
    }
    async getByStationAndDateRange(station, startDate, endDate, limit = 100, userId) {
        try {
            if (!station || !types_1.DEFECTDATA_BUSINESS_RULES.valid_stations.includes(station)) {
                return {
                    success: false,
                    error: `Invalid station. Must be one of: ${types_1.DEFECTDATA_BUSINESS_RULES.valid_stations.join(', ')}`
                };
            }
            if (!startDate || !endDate) {
                return {
                    success: false,
                    error: 'Start date and end date are required'
                };
            }
            if (startDate > endDate) {
                return {
                    success: false,
                    error: 'Start date cannot be after end date'
                };
            }
            const oneYear = 365 * 24 * 60 * 60 * 1000;
            if (endDate.getTime() - startDate.getTime() > oneYear) {
                return {
                    success: false,
                    error: 'Date range cannot exceed one year'
                };
            }
            if (limit <= 0 || limit > 1000) {
                return {
                    success: false,
                    error: 'Limit must be between 1 and 1000'
                };
            }
            const data = await this.defectDataModel.getByStationAndDateRange(station, startDate, endDate, limit);
            return {
                success: true,
                data
            };
        }
        catch (error) {
            return {
                success: false,
                error: `Failed to get defect data by station and date range: ${error instanceof Error ? error.message : 'Unknown error'}`
            };
        }
    }
    async getByInspector(inspector, limit = 100, userId) {
        try {
            if (!inspector || typeof inspector !== 'string' || inspector.trim().length === 0) {
                return {
                    success: false,
                    error: 'Inspector name is required'
                };
            }
            if (inspector.length > 20) {
                return {
                    success: false,
                    error: 'Inspector name cannot exceed 20 characters'
                };
            }
            if (!types_1.DEFECTDATA_BUSINESS_RULES.inspector_name_pattern.test(inspector)) {
                return {
                    success: false,
                    error: 'Inspector name contains invalid characters'
                };
            }
            if (limit <= 0 || limit > 1000) {
                return {
                    success: false,
                    error: 'Limit must be between 1 and 1000'
                };
            }
            const data = await this.defectDataModel.getByInspector(inspector.trim(), limit);
            return {
                success: true,
                data
            };
        }
        catch (error) {
            return {
                success: false,
                error: `Failed to get defect data by inspector: ${error instanceof Error ? error.message : 'Unknown error'}`
            };
        }
    }
    async getProfile(id, userId) {
        try {
            if (!this.validateIdFormat(id)) {
                return {
                    success: false,
                    error: 'Invalid defect data ID'
                };
            }
            const profile = await this.defectDataModel.getProfile(id);
            if (!profile) {
                return {
                    success: false,
                    error: 'Defect data not found'
                };
            }
            return {
                success: true,
                data: profile
            };
        }
        catch (error) {
            return {
                success: false,
                error: `Failed to get defect data profile: ${error instanceof Error ? error.message : 'Unknown error'}`
            };
        }
    }
    async getSummary(startDate, endDate, userId) {
        try {
            if (startDate && endDate) {
                if (startDate > endDate) {
                    return {
                        success: false,
                        error: 'Start date cannot be after end date'
                    };
                }
                const twoYears = 2 * 365 * 24 * 60 * 60 * 1000;
                if (endDate.getTime() - startDate.getTime() > twoYears) {
                    return {
                        success: false,
                        error: 'Date range for summary cannot exceed two years'
                    };
                }
            }
            const summary = await this.defectDataModel.getSummary(startDate, endDate);
            return {
                success: true,
                data: summary
            };
        }
        catch (error) {
            return {
                success: false,
                error: `Failed to get defect data summary: ${error instanceof Error ? error.message : 'Unknown error'}`
            };
        }
    }
    async getTrends(days = 7, userId) {
        try {
            if (days <= 0 || days > 365) {
                return {
                    success: false,
                    error: 'Days must be between 1 and 365'
                };
            }
            const trends = await this.defectDataModel.getTrends(days);
            return {
                success: true,
                data: trends
            };
        }
        catch (error) {
            return {
                success: false,
                error: `Failed to get defect data trends: ${error instanceof Error ? error.message : 'Unknown error'}`
            };
        }
    }
    async getInspectorPerformance(inspector, userId) {
        try {
            if (!inspector || typeof inspector !== 'string' || inspector.trim().length === 0) {
                return {
                    success: false,
                    error: 'Inspector name is required'
                };
            }
            if (inspector.length > 20) {
                return {
                    success: false,
                    error: 'Inspector name cannot exceed 20 characters'
                };
            }
            const performance = await this.defectDataModel.getInspectorPerformance(inspector.trim());
            if (!performance) {
                return {
                    success: false,
                    error: 'No performance data found for this inspector'
                };
            }
            return {
                success: true,
                data: performance
            };
        }
        catch (error) {
            return {
                success: false,
                error: `Failed to get inspector performance: ${error instanceof Error ? error.message : 'Unknown error'}`
            };
        }
    }
    async createDefectData(data, userId) {
        try {
            const validation = this.validateDefectDataCreate(data);
            if (!validation.isValid) {
                return {
                    success: false,
                    error: `Validation failed: ${validation.errors.join(', ')}`
                };
            }
            const businessValidation = await this.validateBusinessRules(data);
            if (!businessValidation.isValid) {
                return {
                    success: false,
                    error: `Business rule validation failed: ${businessValidation.errors.join(', ')}`
                };
            }
            return await this.create(data, userId);
        }
        catch (error) {
            return {
                success: false,
                error: `Failed to create defect data: ${error instanceof Error ? error.message : 'Unknown error'}`
            };
        }
    }
    async updateDefectData(id, data, userId) {
        try {
            const validation = this.validateDefectDataUpdate(data);
            if (!validation.isValid) {
                return {
                    success: false,
                    error: `Validation failed: ${validation.errors.join(', ')}`
                };
            }
            const businessValidation = await this.validateBusinessRules(data);
            if (!businessValidation.isValid) {
                return {
                    success: false,
                    error: `Business rule validation failed: ${businessValidation.errors.join(', ')}`
                };
            }
            return await this.update(id, data, userId);
        }
        catch (error) {
            return {
                success: false,
                error: `Failed to update defect data: ${error instanceof Error ? error.message : 'Unknown error'}`
            };
        }
    }
    async searchDefectData(options, userId) {
        try {
            const validation = this.validateSearchOptions(options);
            if (!validation.isValid) {
                return {
                    success: false,
                    error: `Search validation failed: ${validation.errors.join(', ')}`
                };
            }
            const { data, total } = await this.defectDataModel.getByFilters?.(options) || { data: [], total: 0 };
            const pagination = {
                currentPage: options.page || 1,
                totalPages: Math.ceil(total / (options.limit || 50)),
                totalCount: total,
                hasNextPage: (options.page || 1) < Math.ceil(total / (options.limit || 50)),
                hasPreviousPage: (options.page || 1) > 1
            };
            return {
                success: true,
                data: { data, pagination }
            };
        }
        catch (error) {
            return {
                success: false,
                error: `Failed to search defect data: ${error instanceof Error ? error.message : 'Unknown error'}`
            };
        }
    }
    validateDefectDataCreate(data) {
        const errors = [];
        const rules = types_1.DEFECTDATA_VALIDATION_RULES;
        if (!data.inspection_no || data.inspection_no.trim().length === 0) {
            errors.push('Inspection number is required');
        }
        else if (data.inspection_no.length > rules.inspection_no.max_length) {
            errors.push(`Inspection number cannot exceed ${rules.inspection_no.max_length} characters`);
        }
        else if (rules.inspection_no.pattern && !rules.inspection_no.pattern.test(data.inspection_no)) {
            errors.push('Inspection number format is invalid');
        }
        if (!data.qc_name || data.qc_name.trim().length === 0) {
            errors.push('QC name is required');
        }
        else if (data.qc_name.length > rules.qc_name.max_length) {
            errors.push(`QC name cannot exceed ${rules.qc_name.max_length} characters`);
        }
        if (!data.qclead_name || data.qclead_name.trim().length === 0) {
            errors.push('QC lead name is required');
        }
        else if (data.qclead_name.length > rules.qclead_name.max_length) {
            errors.push(`QC lead name cannot exceed ${rules.qclead_name.max_length} characters`);
        }
        if (!data.mbr_name || data.mbr_name.trim().length === 0) {
            errors.push('MBR name is required');
        }
        else if (data.mbr_name.length > rules.mbr_name.max_length) {
            errors.push(`MBR name cannot exceed ${rules.mbr_name.max_length} characters`);
        }
        if (!data.inspector || data.inspector.trim().length === 0) {
            errors.push('Inspector is required');
        }
        else if (data.inspector.length > rules.inspector.max_length) {
            errors.push(`Inspector name cannot exceed ${rules.inspector.max_length} characters`);
        }
        if (data.defect_id === undefined || data.defect_id === null) {
            errors.push('Defect ID is required');
        }
        else if (!Number.isInteger(data.defect_id) || data.defect_id <= 0) {
            errors.push('Defect ID must be a positive integer');
        }
        if (data.ng_qty !== undefined) {
            if (data.ng_qty < rules.ng_qty.min_value || data.ng_qty > rules.ng_qty.max_value) {
                errors.push(`NG quantity must be between ${rules.ng_qty.min_value} and ${rules.ng_qty.max_value}`);
            }
        }
        if (data.trayno && data.trayno.length > rules.trayno.max_length) {
            errors.push(`Tray number cannot exceed ${rules.trayno.max_length} characters`);
        }
        if (data.tray_position && data.tray_position.length > rules.tray_position.max_length) {
            errors.push(`Tray position cannot exceed ${rules.tray_position.max_length} characters`);
        }
        if (data.color && data.color.length > rules.color.max_length) {
            errors.push(`Color cannot exceed ${rules.color.max_length} characters`);
        }
        return {
            isValid: errors.length === 0,
            errors
        };
    }
    validateDefectDataUpdate(data) {
        const errors = [];
        const rules = types_1.DEFECTDATA_VALIDATION_RULES;
        if (data.inspection_no !== undefined) {
            if (!data.inspection_no || data.inspection_no.trim().length === 0) {
                errors.push('Inspection number cannot be empty');
            }
            else if (data.inspection_no.length > rules.inspection_no.max_length) {
                errors.push(`Inspection number cannot exceed ${rules.inspection_no.max_length} characters`);
            }
            else if (rules.inspection_no.pattern && !rules.inspection_no.pattern.test(data.inspection_no)) {
                errors.push('Inspection number format is invalid');
            }
        }
        if (data.qc_name !== undefined) {
            if (!data.qc_name || data.qc_name.trim().length === 0) {
                errors.push('QC name cannot be empty');
            }
            else if (data.qc_name.length > rules.qc_name.max_length) {
                errors.push(`QC name cannot exceed ${rules.qc_name.max_length} characters`);
            }
        }
        if (data.defect_id !== undefined) {
            if (!Number.isInteger(data.defect_id) || data.defect_id <= 0) {
                errors.push('Defect ID must be a positive integer');
            }
        }
        if (data.ng_qty !== undefined) {
            if (data.ng_qty < rules.ng_qty.min_value || data.ng_qty > rules.ng_qty.max_value) {
                errors.push(`NG quantity must be between ${rules.ng_qty.min_value} and ${rules.ng_qty.max_value}`);
            }
        }
        return {
            isValid: errors.length === 0,
            errors
        };
    }
    async validateBusinessRules(data) {
        const errors = [];
        try {
            if (data.defect_id !== undefined) {
                const defectExists = await this.defectDataModel.validateDefectId?.(data.defect_id) ?? true;
                if (!defectExists) {
                    errors.push('Referenced defect does not exist');
                }
            }
            if (data.trayno && !data.tray_position) {
                errors.push('Tray position is required when tray number is provided');
            }
            if (data.tray_position && !data.trayno) {
                errors.push('Tray number is required when tray position is provided');
            }
            if (data.ng_qty !== undefined && data.ng_qty > types_1.DEFECTDATA_BUSINESS_RULES.max_ng_qty_per_record) {
                errors.push(`NG quantity cannot exceed ${types_1.DEFECTDATA_BUSINESS_RULES.max_ng_qty_per_record}`);
            }
        }
        catch (error) {
            errors.push('Failed to validate business rules');
        }
        return {
            isValid: errors.length === 0,
            errors
        };
    }
    validateSearchOptions(options) {
        const errors = [];
        if (options.page !== undefined && (options.page < 1 || !Number.isInteger(options.page))) {
            errors.push('Page must be a positive integer');
        }
        if (options.limit !== undefined && (options.limit < 1 || options.limit > 1000 || !Number.isInteger(options.limit))) {
            errors.push('Limit must be between 1 and 1000');
        }
        if (options.defect_date_from && options.defect_date_to) {
            if (options.defect_date_from > options.defect_date_to) {
                errors.push('Start date cannot be after end date');
            }
        }
        if (options.ng_qty_min !== undefined && options.ng_qty_max !== undefined) {
            if (options.ng_qty_min > options.ng_qty_max) {
                errors.push('Minimum NG quantity cannot be greater than maximum');
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
exports.DefectDataService = DefectDataService;
function createDefectDataService(defectDataModel, defectImageModel) {
    return new DefectDataService(defectDataModel, defectImageModel);
}
exports.default = DefectDataService;
