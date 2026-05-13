"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DefectController = void 0;
exports.createDefectController = createDefectController;
const generic_controller_1 = require("../../generic/entities/serial-id-entity/generic-controller");
const types_1 = require("./types");
class DefectController extends generic_controller_1.GenericSerialIdController {
    constructor(defectService) {
        super(defectService, types_1.DEFAULT_DEFECT_CONFIG);
        this.defectService = defectService;
    }
    async getAll(req, res, next) {
        try {
            const defectGroup = req.query.defect_group ? String(req.query.defect_group).trim() : undefined;
            console.log('🔧 DefectController.getAll - req.query:', req.query);
            console.log('🔧 DefectController.getAll - defect_group:', defectGroup);
            if (defectGroup) {
                const options = this.buildQueryOptions(req);
                console.log('🔧 DefectController.getAll - Using getByDefectGroup with options:', options);
                const result = await this.defectService.getByDefectGroup(defectGroup, options);
                if (!result.success) {
                    res.status(400).json({
                        success: false,
                        message: 'Failed to get defects by group',
                        error: result.error
                    });
                    return;
                }
                res.status(200).json({
                    success: true,
                    data: result.data?.data,
                    pagination: result.data?.pagination
                });
                return;
            }
            console.log('🔧 DefectController.getAll - Using standard getAll');
            await super.getAll(req, res, next);
        }
        catch (error) {
            next(error);
        }
    }
    buildQueryOptions(req) {
        const baseOptions = super.buildQueryOptions(req);
        console.log('🔧 DefectController.buildQueryOptions - req.query:', req.query);
        console.log('🔧 DefectController.buildQueryOptions - defect_group from query:', req.query.defect_group);
        const defectOptions = {
            ...baseOptions,
            defect_group: req.query.defect_group ? String(req.query.defect_group).trim() : undefined
        };
        console.log('🔧 DefectController.buildQueryOptions - final options:', defectOptions);
        return defectOptions;
    }
    async validateNameUnique(req, res, next) {
        try {
            const name = req.params.name;
            const excludeIdParam = req.params.excludeId;
            const excludeId = excludeIdParam ? parseInt(excludeIdParam) : undefined;
            const userId = req.user?.id || 0;
            if (!name || name.trim().length === 0) {
                res.status(400).json({
                    success: false,
                    error: 'Defect name is required'
                });
                return;
            }
            if (excludeIdParam && (isNaN(excludeId) || excludeId <= 0)) {
                res.status(400).json({
                    success: false,
                    error: 'Invalid exclude ID'
                });
                return;
            }
            const result = await this.defectService.validateNameUnique(name, excludeId, userId);
            if (!result.success) {
                res.status(400).json({
                    success: false,
                    error: result.error || 'Failed to validate defect name'
                });
                return;
            }
            res.status(200).json({
                success: true,
                data: {
                    isUnique: result.data,
                    name: name
                }
            });
        }
        catch (error) {
            next(error);
        }
    }
}
exports.DefectController = DefectController;
function createDefectController(defectService) {
    return new DefectController(defectService);
}
exports.default = DefectController;
