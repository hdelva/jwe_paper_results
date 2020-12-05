"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("isomorphic-fetch");
require("reflect-metadata");
const Planner_1 = __importDefault(require("./Planner"));
exports.default = Planner_1.default;
const EventType_1 = __importDefault(require("./events/EventType"));
const util_1 = __importDefault(require("./events/util"));
const Units_1 = __importDefault(require("./util/Units"));
const planner = new Planner_1.default();
planner.prefetchStops();
planner.prefetchConnections();
let scannedPages = 0;
let scannedConnections = 0;
// let logFetch = true;
console.log(`${new Date()} Start prefetch`);
const eventBus = util_1.default();
eventBus
    .on(EventType_1.default.InvalidQuery, (error) => {
    console.log("InvalidQuery", error);
})
    .on(EventType_1.default.AbortQuery, (reason) => {
    console.log("AbortQuery", reason);
})
    .on(EventType_1.default.Query, (Query) => {
    console.log("Query", Query);
})
    .on(EventType_1.default.SubQuery, (query) => {
    const { minimumDepartureTime, maximumArrivalTime } = query;
    // logFetch = true;
    console.log("Total scanned pages", scannedPages);
    console.log("Total scanned connections", scannedConnections);
    console.log("[Subquery]", minimumDepartureTime, maximumArrivalTime, maximumArrivalTime - minimumDepartureTime);
})
    .on(EventType_1.default.LDFetchGet, (url, duration) => {
    scannedPages++;
    console.log(`[GET] ${url} (${duration}ms)`);
    // if (logFetch) {
    //   console.log(`[GET] ${url} (${duration}ms)`);
    //   logFetch = false;
    // }
})
    .on(EventType_1.default.ConnectionScan, (connection) => {
    scannedConnections++;
})
    .on(EventType_1.default.Warning, (e) => {
    console.warn(e);
});
const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
wait(5000)
    .then(() => new Promise((resolve, reject) => {
    console.log(`${new Date()} Start query`);
    const amount = 3;
    let i = 0;
    planner.query({
        publicTransportOnly: true,
        // from: "https://data.delijn.be/stops/201657",
        // to: "https://data.delijn.be/stops/205910",
        // from: "https://data.delijn.be/stops/200455", // Deinze weg op Grammene +456
        // to: "https://data.delijn.be/stops/502481", // Tielt Metaalconstructie Goossens
        // from: "https://data.delijn.be/stops/509927", // Tield Rameplein perron 1
        // to: "https://data.delijn.be/stops/200455", // Deinze weg op Grammene +456
        from: "Hasselt",
        to: "Kortrijk",
        minimumDepartureTime: new Date(),
        maximumTransferDuration: Units_1.default.fromMinutes(30),
    })
        .take(amount)
        .on("error", (error) => {
        console.log(error);
    })
        .on("data", (path) => {
        ++i;
        console.log(new Date());
        console.log(i);
        console.log(JSON.stringify(path, null, " "));
        console.log("\n");
    });
}));
//# sourceMappingURL=index_2.js.map