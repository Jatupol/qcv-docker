"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DEFAULT_SAMPLING_REASON_CONFIG = exports.DEFAULT_SAMPLING_REASON_BUSINESS_RULES = exports.DEFAULT_SAMPLING_REASON_VALIDATION = void 0;
exports.validateSamplingReasonData = validateSamplingReasonData;
exports.isSamplingReason = isSamplingReason;
exports.isCreateSamplingReasonData = isCreateSamplingReasonData;
exports.isUpdateSamplingReasonData = isUpdateSamplingReasonData;
const generic_types_1 = require("../../generic/entities/serial-id-entity/generic-types");
exports.DEFAULT_SAMPLING_REASON_VALIDATION = {
    name: {
        required: true,
        maxLength: 100,
        pattern: /^[a-zA-Z0-9\s\-_\.]+$/,
        unique: true,
        noLeadingTrailingSpaces: true
    },
    description: {
        maxLength: 5000,
        notEmptyIfProvided: true
    }
};
exports.DEFAULT_SAMPLING_REASON_BUSINESS_RULES = {
    validation: exports.DEFAULT_SAMPLING_REASON_VALIDATION,
    audit: {
        trackCreation: true,
        trackUpdates: true,
        requireUserContext: true
    },
    manufacturing: {
        allowInactiveForHistoricalData: true,
        preventDuplicationByName: true,
        requireDescriptionForCompliance: false
    }
};
exports.DEFAULT_SAMPLING_REASON_CONFIG = {
    ...generic_types_1.DEFAULT_SERIAL_ID_CONFIG,
    entityName: 'SamplingReason',
    tableName: 'sampling_reasons',
    apiPath: '/api/sampling-reasons',
    searchableFields: ['name', 'description'],
    defaultLimit: 20,
    maxLimit: 100,
    businessRules: exports.DEFAULT_SAMPLING_REASON_BUSINESS_RULES,
    manufacturing: {
        qualityControlDomain: 'inspection_sampling',
        complianceRequired: false,
        auditTrailLevel: 'standard'
    }
};
function validateSamplingReasonData(data, operation) {
    const errors = [];
    const rules = exports.DEFAULT_SAMPLING_REASON_VALIDATION;
    if (operation === 'create' || data.name !== undefined) {
        if (!data.name) {
            if (operation === 'create') {
                errors.push('Sampling reason name is required');
            }
        }
        else {
            if (data.name.length > rules.name.maxLength) {
                errors.push(`Sampling reason name cannot exceed ${rules.name.maxLength} characters`);
            }
            if (!rules.name.pattern.test(data.name)) {
                errors.push('Sampling reason name contains invalid characters. Use only letters, numbers, spaces, hyphens, underscores, and dots');
            }
            if (data.name.trim() !== data.name) {
                errors.push('Sampling reason name cannot have leading or trailing spaces');
            }
            if (data.name.trim().length === 0) {
                errors.push('Sampling reason name cannot be empty');
            }
        }
    }
    if (data.description !== undefined) {
        if (data.description !== null && data.description.length > rules.description.maxLength) {
            errors.push(`Sampling reason description cannot exceed ${rules.description.maxLength} characters`);
        }
        if (data.description === '') {
            errors.push('Sampling reason description cannot be empty if provided. Use null to remove description');
        }
    }
    if (data.is_active !== undefined && typeof data.is_active !== 'boolean') {
        errors.push('Sampling reason active status must be a boolean value');
    }
    return {
        isValid: errors.length === 0,
        errors
    };
}
function isSamplingReason(obj) {
    return (obj &&
        typeof obj === 'object' &&
        typeof obj.id === 'number' &&
        typeof obj.name === 'string' &&
        (obj.description === null || typeof obj.description === 'string') &&
        typeof obj.is_active === 'boolean' &&
        typeof obj.created_by === 'number' &&
        typeof obj.updated_by === 'number' &&
        obj.created_at instanceof Date &&
        obj.updated_at instanceof Date);
}
function isCreateSamplingReasonData(obj) {
    return (obj &&
        typeof obj === 'object' &&
        typeof obj.name === 'string' &&
        (obj.description === undefined || obj.description === null || typeof obj.description === 'string') &&
        (obj.is_active === undefined || typeof obj.is_active === 'boolean'));
}
function isUpdateSamplingReasonData(obj) {
    return (obj &&
        typeof obj === 'object' &&
        (obj.name === undefined || typeof obj.name === 'string') &&
        (obj.description === undefined || obj.description === null || typeof obj.description === 'string') &&
        (obj.is_active === undefined || typeof obj.is_active === 'boolean'));
}
