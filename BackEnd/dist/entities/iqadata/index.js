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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createIQADataRoutesWithController = exports.createIQADataRoutes = exports.createIQADataController = exports.IQADataController = exports.createIQADataService = exports.IQADataService = exports.createIQADataModel = exports.IQADataModel = void 0;
__exportStar(require("./types"), exports);
var model_1 = require("./model");
Object.defineProperty(exports, "IQADataModel", { enumerable: true, get: function () { return model_1.IQADataModel; } });
Object.defineProperty(exports, "createIQADataModel", { enumerable: true, get: function () { return model_1.createIQADataModel; } });
var service_1 = require("./service");
Object.defineProperty(exports, "IQADataService", { enumerable: true, get: function () { return service_1.IQADataService; } });
Object.defineProperty(exports, "createIQADataService", { enumerable: true, get: function () { return service_1.createIQADataService; } });
var controller_1 = require("./controller");
Object.defineProperty(exports, "IQADataController", { enumerable: true, get: function () { return controller_1.IQADataController; } });
Object.defineProperty(exports, "createIQADataController", { enumerable: true, get: function () { return controller_1.createIQADataController; } });
var routes_1 = require("./routes");
Object.defineProperty(exports, "createIQADataRoutes", { enumerable: true, get: function () { return __importDefault(routes_1).default; } });
Object.defineProperty(exports, "createIQADataRoutesWithController", { enumerable: true, get: function () { return routes_1.createIQADataRoutesWithController; } });
