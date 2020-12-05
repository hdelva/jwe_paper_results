"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Catalog_1 = __importDefault(require("./Catalog"));
const catalogTec = new Catalog_1.default();
catalogTec.addStopsSource("https://openplanner.ilabt.imec.be/tec/stops");
exports.default = catalogTec;
//# sourceMappingURL=catalog.tec.js.map