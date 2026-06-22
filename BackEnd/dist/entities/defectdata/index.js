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
exports.createDefectDataController = exports.DefectDataController = exports.createDefectDataService = exports.DefectDataService = exports.createDefectDataModel = exports.DefectDataModel = exports.createDefectDataRoutes = void 0;
exports.default = createDefectDataRouter;
const routes_1 = require("./routes");
function createDefectDataRouter(db) {
    return (0, routes_1.createDefectDataRoutes)(db);
}
var routes_2 = require("./routes");
Object.defineProperty(exports, "createDefectDataRoutes", { enumerable: true, get: function () { return routes_2.createDefectDataRoutes; } });
var model_1 = require("./model");
Object.defineProperty(exports, "DefectDataModel", { enumerable: true, get: function () { return model_1.DefectDataModel; } });
Object.defineProperty(exports, "createDefectDataModel", { enumerable: true, get: function () { return model_1.createDefectDataModel; } });
var service_1 = require("./service");
Object.defineProperty(exports, "DefectDataService", { enumerable: true, get: function () { return service_1.DefectDataService; } });
Object.defineProperty(exports, "createDefectDataService", { enumerable: true, get: function () { return service_1.createDefectDataService; } });
var controller_1 = require("./controller");
Object.defineProperty(exports, "DefectDataController", { enumerable: true, get: function () { return controller_1.DefectDataController; } });
Object.defineProperty(exports, "createDefectDataController", { enumerable: true, get: function () { return controller_1.createDefectDataController; } });
__exportStar(require("./types"), exports);
