"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RoutableTileRegistry = exports.EventBus = exports.TravelMode = exports.TriangleDemoPlanner = exports.FlexibleTransitPlanner = exports.TransitCarPlanner = exports.DissectPlanner = exports.Units = exports.TrafficEstimator = exports.IsochroneGenerator = exports.EventType = void 0;
require("isomorphic-fetch");
require("reflect-metadata");
const main_1 = __importDefault(require("./analytics/isochrones/main"));
const main_2 = __importDefault(require("./analytics/traffic/main"));
const RoutableTileRegistry_1 = __importDefault(require("./entities/tiles/RoutableTileRegistry"));
const TravelMode_1 = __importDefault(require("./enums/TravelMode"));
const EventBus_1 = __importDefault(require("./events/EventBus"));
const EventType_1 = __importDefault(require("./events/EventType"));
const DissectPlanner_1 = __importDefault(require("./planner/configurations/DissectPlanner"));
const FlexibleTransitPlanner_1 = __importDefault(require("./planner/configurations/FlexibleTransitPlanner"));
const ReducedCarPlanner_1 = __importDefault(require("./planner/configurations/ReducedCarPlanner"));
const TriangleTransitPlanner_1 = __importDefault(require("./planner/configurations/TriangleTransitPlanner"));
const Units_1 = __importDefault(require("./util/Units"));
const types_1 = __importDefault(require("./types"));
var EventType_2 = require("./events/EventType");
Object.defineProperty(exports, "EventType", { enumerable: true, get: function () { return __importDefault(EventType_2).default; } });
var main_3 = require("./analytics/isochrones/main");
Object.defineProperty(exports, "IsochroneGenerator", { enumerable: true, get: function () { return __importDefault(main_3).default; } });
var main_4 = require("./analytics/traffic/main");
Object.defineProperty(exports, "TrafficEstimator", { enumerable: true, get: function () { return __importDefault(main_4).default; } });
var Units_2 = require("./util/Units");
Object.defineProperty(exports, "Units", { enumerable: true, get: function () { return __importDefault(Units_2).default; } });
var DissectPlanner_2 = require("./planner/configurations/DissectPlanner");
Object.defineProperty(exports, "DissectPlanner", { enumerable: true, get: function () { return __importDefault(DissectPlanner_2).default; } });
var ReducedCarPlanner_2 = require("./planner/configurations/ReducedCarPlanner");
Object.defineProperty(exports, "TransitCarPlanner", { enumerable: true, get: function () { return __importDefault(ReducedCarPlanner_2).default; } });
var FlexibleTransitPlanner_2 = require("./planner/configurations/FlexibleTransitPlanner");
Object.defineProperty(exports, "FlexibleTransitPlanner", { enumerable: true, get: function () { return __importDefault(FlexibleTransitPlanner_2).default; } });
var TriangleTransitPlanner_2 = require("./planner/configurations/TriangleTransitPlanner");
Object.defineProperty(exports, "TriangleDemoPlanner", { enumerable: true, get: function () { return __importDefault(TriangleTransitPlanner_2).default; } });
var TravelMode_2 = require("./enums/TravelMode");
Object.defineProperty(exports, "TravelMode", { enumerable: true, get: function () { return __importDefault(TravelMode_2).default; } });
exports.EventBus = EventBus_1.default.getInstance();
exports.RoutableTileRegistry = RoutableTileRegistry_1.default.getInstance();
exports.default = {
    TravelMode: TravelMode_1.default,
    EventType: EventType_1.default,
    IsochroneGenerator: main_1.default,
    TrafficEstimator: main_2.default,
    Units: Units_1.default,
    EventBus: exports.EventBus,
    DissectPlanner: DissectPlanner_1.default,
    TransitCarPlanner: ReducedCarPlanner_1.default,
    TriangleDemoPlanner: TriangleTransitPlanner_1.default,
    RoutableTileRegistry: exports.RoutableTileRegistry,
    FlexibleTransitPlanner: FlexibleTransitPlanner_1.default,
};
const [_, __, view, from, to, depart] = process.argv;
const planner = new FlexibleTransitPlanner_1.default();
planner.addConnectionSource(view);
planner.addStopSource("https://openplanner.ilabt.imec.be/delijn/Antwerpen/stops");
planner.addStopSource("https://openplanner.ilabt.imec.be/delijn/Limburg/stops");
planner.addStopSource("https://openplanner.ilabt.imec.be/delijn/Oost-Vlaanderen/stops");
planner.addStopSource("https://openplanner.ilabt.imec.be/delijn/Vlaams-Brabant/stops");
planner.addStopSource("https://openplanner.ilabt.imec.be/delijn/West-Vlaanderen/stops");
planner.prefetchStops();
let downloaded = 0;
let downloadTime = 0;
const resources = [];
const eventBus = exports.EventBus;
eventBus
    .on(EventType_1.default.AbortQuery, (reason) => {
    // console.log("AbortQuery", reason);
})
    .on(EventType_1.default.Query, (Query) => {
    // console.log("Query", Query);
})
    .on(EventType_1.default.SubQuery, (query) => {
    const { minimumDepartureTime, maximumArrivalTime } = query;
    // logFetch = true;
    // console.log("Total scanned pages", scannedPages);
    // console.log("Total scanned connections", scannedConnections);
    // console.log("[Subquery]", minimumDepartureTime, maximumArrivalTime,
    // maximumArrivalTime - minimumDepartureTime);
})
    .on(EventType_1.default.ResourceFetch, (source, url, duration, size) => {
    if (source === types_1.default.ConnectionsFetcher) {
        downloaded += size;
        downloadTime += duration;
        resources.push(url);
    }
});
const amount = 1;
const start = new Date();
const query = {
    from,
    to,
    minimumDepartureTime: new Date(depart),
    maximumTransferDuration: Units_1.default.fromMinutes(30),
};
planner
    .setProfileID("https://hdelva.be/profile/pedestrian")
    .query(query)
    .take(amount)
    .on("data", (path) => {
    console.log(JSON.stringify({
        elapsed: new Date().getTime() - start.getTime(),
        downloaded: downloaded / 1000,
        travelTime: path.getTravelTime(query),
        downloadTime,
        resources,
    }));
});
/*
const [_, __, view, from, to, depart] = process.argv;

// const from = "https://data.delijn.be/stops/204746";
// const to = "https://data.delijn.be/stops/307006";
// const depart = "2019-12-11T08:00:36.572000+00:00";
// const view = "http://0.0.0.0:8000/connections?view=https%3A//hdelva.be/shapes/merged_8";

const planner = new GeospatialFragmentedPlanner();
planner.addConnectionSource(view);
planner.addStopSource("https://openplanner.ilabt.imec.be/delijn/Antwerpen/stops");
planner.addStopSource("https://openplanner.ilabt.imec.be/delijn/Limburg/stops");
planner.addStopSource("https://openplanner.ilabt.imec.be/delijn/Oost-Vlaanderen/stops");
planner.addStopSource("https://openplanner.ilabt.imec.be/delijn/Vlaams-Brabant/stops");
planner.addStopSource("https://openplanner.ilabt.imec.be/delijn/West-Vlaanderen/stops");
planner.prefetchStops();

let downloaded = 0;
let downloadTime = 0;
const resources = [];

const eventBus = EventBus;

eventBus
.on(EventType.AbortQuery, (reason) => {
    // console.log("AbortQuery", reason);
})
.on(EventType.Query, (Query) => {
    // console.log("Query", Query);
})
.on(EventType.SubQuery, (query) => {
    const { minimumDepartureTime, maximumArrivalTime } = query;

    // logFetch = true;

    // console.log("Total scanned pages", scannedPages);
    // console.log("Total scanned connections", scannedConnections);
    // console.log("[Subquery]", minimumDepartureTime, maximumArrivalTime,
    // maximumArrivalTime - minimumDepartureTime);
})
.on(EventType.ResourceFetch, (source, url, duration, size) => {
    if (source === TYPES.ConnectionsFetcher) {
        downloaded += size;
        downloadTime += duration;
        resources.push(url);
    }
});

const amount = 1;

const start = new Date();
const query = {
from, // Deinze weg op Grammene +456
to, // Tielt Metaalconstructie Goossens
minimumDepartureTime: new Date(depart),
maximumTransferDuration: Units.fromMinutes(30),
};

planner
.setProfileID("https://hdelva.be/profile/pedestrian")
.query(query)
.take(amount)
.on("data", (path) => {
    console.log(JSON.stringify(
        {
            elapsed: new Date().getTime() - start.getTime(),
            downloaded: downloaded / 1000,
            travelTime: path.getTravelTime(query),
            downloadTime,
            resources,
        },
    ));
});
*/
//# sourceMappingURL=index_a.js.map