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
exports.createDefectDataIQAController = exports.DefectDataIQAController = exports.createDefectDataIQAService = exports.DefectDataIQAService = exports.createDefectDataIQAModel = exports.DefectDataIQAModel = exports.createDefectDataIQARoutes = void 0;
exports.default = createDefectDataIQARouter;
const routes_1 = require("./routes");
function createDefectDataIQARouter(db) {
    return (0, routes_1.createDefectDataIQARoutes)(db);
}
var routes_2 = require("./routes");
Object.defineProperty(exports, "createDefectDataIQARoutes", { enumerable: true, get: function () { return routes_2.createDefectDataIQARoutes; } });
var model_1 = require("./model");
Object.defineProperty(exports, "DefectDataIQAModel", { enumerable: true, get: function () { return model_1.DefectDataIQAModel; } });
Object.defineProperty(exports, "createDefectDataIQAModel", { enumerable: true, get: function () { return model_1.createDefectDataIQAModel; } });
var service_1 = require("./service");
Object.defineProperty(exports, "DefectDataIQAService", { enumerable: true, get: function () { return service_1.DefectDataIQAService; } });
Object.defineProperty(exports, "createDefectDataIQAService", { enumerable: true, get: function () { return service_1.createDefectDataIQAService; } });
var controller_1 = require("./controller");
Object.defineProperty(exports, "DefectDataIQAController", { enumerable: true, get: function () { return controller_1.DefectDataIQAController; } });
Object.defineProperty(exports, "createDefectDataIQAController", { enumerable: true, get: function () { return controller_1.createDefectDataIQAController; } });
__exportStar(require("./types"), exports);
