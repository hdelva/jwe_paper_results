"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Catalog_1 = __importDefault(require("./Catalog"));
const TravelMode_1 = __importDefault(require("./enums/TravelMode"));
const catalogMivb = new Catalog_1.default();
catalogMivb.addStopsSource("https://openplanner.ilabt.imec.be/mivb/stops");
catalogMivb.addConnectionsSource("https://openplanner.ilabt.imec.be/mivb/connections", TravelMode_1.default.Bus);
exports.default = catalogMivb;
//# sourceMappingURL=catalog.mivb.js.map