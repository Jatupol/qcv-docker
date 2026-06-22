"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SamplingReasonService = void 0;
exports.createSamplingReasonService = createSamplingReasonService;
const generic_service_1 = require("../../generic/entities/serial-id-entity/generic-service");
const types_1 = require("./types");
class SamplingReasonService extends generic_service_1.GenericSerialIdService {
    constructor(model) {
        super(model, types_1.DEFAULT_SAMPLING_REASON_CONFIG);
        this.samplingReasonModel = model;
    }
    validate(data, operation) {
        return (0, types_1.validateSamplingReasonData)(data, operation);
    }
    async checkNameUniqueness(name, excludeId) {
        try {
            if (!name || name.trim().length === 0) {
                return {
                    success: false,
                    error: 'Name is required for uniqueness check'
                };
            }
            const isUnique = await this.samplingReasonModel.isNameUnique(name.trim(), excludeId);
            return {
                success: true,
                data: isUnique
            };
        }
        catch (error) {
            return {
                success: false,
                error: `Failed to check name uniqueness: ${error instanceof Error ? error.message : 'Unknown error'}`
            };
        }
    }
}
exports.SamplingReasonService = SamplingReasonService;
function createSamplingReasonService(model) {
    return new SamplingReasonService(model);
}
exports.default = SamplingReasonService;
