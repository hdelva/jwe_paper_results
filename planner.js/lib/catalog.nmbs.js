"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Catalog_1 = __importDefault(require("./Catalog"));
const TravelMode_1 = __importDefault(require("./enums/TravelMode"));
const catalogNmbs = new Catalog_1.default();
catalogNmbs.addStopsSource("https://irail.be/stations/NMBS");
catalogNmbs.addConnectionsSource("https://graph.irail.be/sncb/connections", TravelMode_1.default.Train);
exports.default = catalogNmbs;
//# sourceMappingURL=catalog.nmbs.js.map