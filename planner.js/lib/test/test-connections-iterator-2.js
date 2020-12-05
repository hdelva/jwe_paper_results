"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const ldfetch_1 = __importDefault(require("ldfetch"));
const TravelMode_1 = __importDefault(require("../enums/TravelMode"));
const ConnectionsIteratorLazy_1 = __importDefault(require("../fetcher/connections/lazy/ConnectionsIteratorLazy"));
const ldFetch = new ldfetch_1.default({ headers: { Accept: "application/ld+json" } });
const upperBoundDate = new Date();
upperBoundDate.setHours(upperBoundDate.getHours() + 2);
const config = {
    upperBoundDate,
    backward: true,
};
const iterator = new ConnectionsIteratorLazy_1.default("https://graph.irail.be/sncb/connections", TravelMode_1.default.Train, ldFetch, config);
let i = 0;
console.time("ConnectionsIterator");
iterator.on("readable", () => {
    let connection = iterator.read();
    while (connection && i++ < 4000) {
        connection = iterator.read();
    }
    if (i > 3999) {
        console.timeEnd("ConnectionsIterator");
    }
});
//# sourceMappingURL=test-connections-iterator-2.js.map