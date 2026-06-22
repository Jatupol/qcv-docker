"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createDefectImageController = exports.DefectImageController = exports.createDefectImageService = exports.DefectImageService = exports.createDefectCustomerImageModel = exports.DefectCustomerImageModel = exports.createDefectImageRoutes = void 0;
exports.default = createDefectCustomerImageRouter;
const routes_1 = require("./routes");
function createDefectCustomerImageRouter(db) {
    return (0, routes_1.createDefectImageRoutes)(db);
}
var routes_2 = require("./routes");
Object.defineProperty(exports, "createDefectImageRoutes", { enumerable: true, get: function () { return routes_2.createDefectImageRoutes; } });
var model_1 = require("./model");
Object.defineProperty(exports, "DefectCustomerImageModel", { enumerable: true, get: function () { return model_1.DefectCustomerImageModel; } });
Object.defineProperty(exports, "createDefectCustomerImageModel", { enumerable: true, get: function () { return model_1.createDefectCustomerImageModel; } });
var service_1 = require("./service");
Object.defineProperty(exports, "DefectImageService", { enumerable: true, get: function () { return service_1.DefectImageService; } });
Object.defineProperty(exports, "createDefectImageService", { enumerable: true, get: function () { return service_1.createDefectImageService; } });
var controller_1 = require("./controller");
Object.defineProperty(exports, "DefectImageController", { enumerable: true, get: function () { return controller_1.DefectImageController; } });
Object.defineProperty(exports, "createDefectImageController", { enumerable: true, get: function () { return controller_1.createDefectImageController; } });
__exportStar(require("./types"), exports);
