"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DEFAULT_DEFECT_IMAGE_CONFIG = void 0;
exports.DEFAULT_DEFECT_IMAGE_CONFIG = {
    tableName: 'defectdata_iqa',
    primaryKey: 'id',
    maxImageSize: 5 * 1024 * 1024,
    allowedMimeTypes: [
        'image/jpeg',
        'image/jpg',
        'image/png',
        'image/gif',
        'image/webp'
    ]
};
