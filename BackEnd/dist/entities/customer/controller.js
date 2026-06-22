"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CustomerController = void 0;
exports.createCustomerController = createCustomerController;
exports.createCustomerControllerGeneric = createCustomerControllerGeneric;
const generic_controller_1 = require("../../generic/entities/varchar-code-entity/generic-controller");
const types_1 = require("./types");
class CustomerController extends generic_controller_1.GenericVarcharCodeController {
    constructor(service) {
        super(service, types_1.CustomerEntityConfig);
        this.checkCodeAvailability = async (req, res, next) => {
            try {
                const userId = req.user.id;
                const { code } = req.body;
                if (!code) {
                    res.status(400).json({
                        success: false,
                        error: 'Code is required'
                    });
                    return;
                }
                const result = await this.service.checkCodeAvailability(code, userId);
                if (result.success && result.data) {
                    res.status(200).json({
                        success: true,
                        data: result.data,
                        message: 'Code availability checked successfully'
                    });
                }
                else {
                    res.status(400).json({
                        success: false,
                        error: result.error || 'Failed to check code availability'
                    });
                }
            }
            catch (error) {
                next(error);
            }
        };
        this.checkOperationalStatus = async (req, res, next) => {
            try {
                const code = req.params.code;
                const result = await this.service.isCustomerOperational(code);
                if (result.success && result.data) {
                    res.status(200).json({
                        success: true,
                        data: result.data,
                        message: 'Operational status checked successfully'
                    });
                }
                else {
                    res.status(400).json({
                        success: false,
                        error: result.error || 'Failed to check operational status'
                    });
                }
            }
            catch (error) {
                next(error);
            }
        };
        this.checkDeletionEligibility = async (req, res, next) => {
            try {
                const code = req.params.code;
                const result = await this.service.canDelete(code);
                if (result.success && result.data) {
                    res.status(200).json({
                        success: true,
                        data: result.data,
                        message: 'Deletion eligibility checked successfully'
                    });
                }
                else {
                    res.status(400).json({
                        success: false,
                        error: result.error || 'Failed to check deletion eligibility'
                    });
                }
            }
            catch (error) {
                next(error);
            }
        };
        this.service = service;
    }
}
exports.CustomerController = CustomerController;
function createCustomerController(service) {
    return new CustomerController(service);
}
function createCustomerControllerGeneric(service) {
    return (0, generic_controller_1.createGenericVarcharCodeController)(service, types_1.CustomerEntityConfig);
}
exports.default = CustomerController;
