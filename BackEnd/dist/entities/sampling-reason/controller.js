"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SamplingReasonController = void 0;
exports.createSamplingReasonController = createSamplingReasonController;
const generic_controller_1 = require("../../generic/entities/serial-id-entity/generic-controller");
const types_1 = require("./types");
class SamplingReasonController extends generic_controller_1.GenericSerialIdController {
    constructor(service) {
        super(service, types_1.DEFAULT_SAMPLING_REASON_CONFIG);
        this.checkNameUniqueness = async (req, res, next) => {
            try {
                const name = req.params.name?.trim();
                if (!name || name.length === 0) {
                    res.status(400).json({
                        success: false,
                        error: 'Invalid name parameter',
                        message: 'Name parameter is required and cannot be empty',
                        meta: {
                            requestId: req.requestId,
                            timestamp: new Date().toISOString(),
                            provided: req.params.name
                        }
                    });
                    return;
                }
                const excludeId = req.query.excludeId ? parseInt(req.query.excludeId) : undefined;
                const result = await this.samplingReasonService.checkNameUniqueness(name, excludeId);
                if (result.success) {
                    res.status(200).json({
                        success: true,
                        data: { isUnique: result.data },
                        message: 'Name uniqueness check completed successfully',
                        meta: {
                            requestId: req.requestId,
                            timestamp: new Date().toISOString(),
                            operation: 'checkNameUniqueness',
                            name: name,
                            excludeId: excludeId
                        }
                    });
                }
                else {
                    res.status(400).json({
                        success: false,
                        error: result.error,
                        message: 'Failed to check name uniqueness',
                        meta: {
                            requestId: req.requestId,
                            timestamp: new Date().toISOString(),
                            operation: 'checkNameUniqueness',
                            name: name
                        }
                    });
                }
            }
            catch (error) {
                console.error('Name uniqueness check error:', error);
                res.status(500).json({
                    success: false,
                    error: 'Internal server error',
                    message: 'An unexpected error occurred while checking name uniqueness',
                    meta: {
                        requestId: req.requestId,
                        timestamp: new Date().toISOString(),
                        operation: 'checkNameUniqueness',
                        name: req.params.name
                    }
                });
            }
        };
        this.samplingReasonService = service;
    }
}
exports.SamplingReasonController = SamplingReasonController;
function createSamplingReasonController(service) {
    return new SamplingReasonController(service);
}
exports.default = SamplingReasonController;
