"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createDefectImageRoutes = createDefectImageRoutes;
exports.default = createDefectImageRouter;
const express_1 = require("express");
const multer_1 = __importDefault(require("multer"));
const model_1 = require("./model");
const service_1 = require("./service");
const controller_1 = require("./controller");
const types_1 = require("./types");
const database_1 = require("../../config/database");
const storage = multer_1.default.memoryStorage();
const fileFilter = (req, file, cb) => {
    if (types_1.DEFAULT_DEFECT_IMAGE_CONFIG.allowedMimeTypes.includes(file.mimetype)) {
        cb(null, true);
    }
    else {
        cb(new Error(`Invalid file type. Allowed types: ${types_1.DEFAULT_DEFECT_IMAGE_CONFIG.allowedMimeTypes.join(', ')}`));
    }
};
const upload = (0, multer_1.default)({
    storage,
    fileFilter,
    limits: {
        fileSize: types_1.DEFAULT_DEFECT_IMAGE_CONFIG.maxImageSize,
        files: 10
    }
});
function createDefectImageRoutes(_db) {
    const router = (0, express_1.Router)();
    const model = (0, model_1.createDefectImageModel)((0, database_1.getDrizzle)());
    const service = (0, service_1.createDefectImageService)(model);
    const controller = (0, controller_1.createDefectImageController)(service);
    router.post('/', upload.single('image'), controller.create);
    router.post('/bulk', upload.array('images', 10), controller.bulkCreate);
    router.get('/all', controller.getAll);
    router.get('/:id', controller.getById);
    router.get('/defect/:defectId', controller.getByDefectId);
    router.put('/:id', upload.single('image'), controller.update);
    router.delete('/:id', controller.delete);
    router.delete('/defect/:defectId', controller.deleteByDefectId);
    router.get('/health', controller.healthCheck);
    return router;
}
function createDefectImageRouter(_db) {
    return createDefectImageRoutes((0, database_1.getDrizzle)());
}
