"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("jest");
const ldfetch_1 = __importDefault(require("ldfetch"));
const TravelMode_1 = __importDefault(require("../../../enums/TravelMode"));
const ConnectionsIteratorLazy_1 = __importDefault(require("./ConnectionsIteratorLazy"));
const CONNECTIONS_TO_LOAD = 500; // Should be more than contained on first page
test("[ConnectionsIteratorLazy] iterate forwards", (done) => {
    jest.setTimeout(90000);
    const options = {
        backward: false,
        lowerBoundDate: new Date(2018, 10, 22, 10),
    };
    const iterator = new ConnectionsIteratorLazy_1.default("https://graph.irail.be/sncb/connections", TravelMode_1.default.Train, new ldfetch_1.default(), options);
    let i = 0;
    let lastConnection;
    iterator.on("readable", () => {
        lastConnection = iterator.read();
        let connection = iterator.read();
        while (connection && i++ < CONNECTIONS_TO_LOAD) {
            expect(connection.departureTime.valueOf()).toBeGreaterThanOrEqual(lastConnection.departureTime.valueOf());
            lastConnection = connection;
            connection = iterator.read();
        }
        if (i >= CONNECTIONS_TO_LOAD) {
            iterator.close();
            done();
        }
    });
});
//# sourceMappingURL=ConnectionsIteratorLazy.test.js.map