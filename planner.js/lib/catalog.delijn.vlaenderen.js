"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Catalog_1 = __importDefault(require("./Catalog"));
const TravelMode_1 = __importDefault(require("./enums/TravelMode"));
/* tslint:disable:max-line-length */
const catalogDeLijn = new Catalog_1.default();
catalogDeLijn.addStopsSource("https://openplanner.ilabt.imec.be/delijn/Antwerpen/stops");
catalogDeLijn.addStopsSource("https://openplanner.ilabt.imec.be/delijn/Limburg/stops");
catalogDeLijn.addStopsSource("https://openplanner.ilabt.imec.be/delijn/Oost-Vlaanderen/stops");
catalogDeLijn.addStopsSource("https://openplanner.ilabt.imec.be/delijn/Vlaams-Brabant/stops");
catalogDeLijn.addStopsSource("https://openplanner.ilabt.imec.be/delijn/West-Vlaanderen/stops");
catalogDeLijn.addConnectionsSource("https://openplanner.ilabt.imec.be/delijn/Oost-Vlaanderen/connections", TravelMode_1.default.Bus);
catalogDeLijn.addConnectionsSource("https://openplanner.ilabt.imec.be/delijn/West-Vlaanderen/connections", TravelMode_1.default.Bus);
exports.default = catalogDeLijn;
//# sourceMappingURL=catalog.delijn.vlaenderen.js.map