"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ZoiDemoPlanner = exports.TriangleTransitPlanner = exports.ReducedCarPlanner = exports.GeospatialFragmentedPlanner = exports.FlexibleTransitPlanner = exports.FlexibleRoadPlanner = exports.FlexibleProfileTransitPlanner = exports.DissectPlanner = exports.Units = exports.QueryMode = exports.EventType = exports.TravelMode = exports.DataType = exports.RoutableTileRegistry = exports.EventBus = exports.classifyDataSource = exports.createPlanner = exports.TrafficEstimator = exports.IsochroneGenerator = void 0;
require("isomorphic-fetch");
require("reflect-metadata");
// classes
const main_1 = __importDefault(require("./analytics/isochrones/main"));
const main_2 = __importDefault(require("./analytics/traffic/main"));
// functions
const create_1 = __importDefault(require("./create"));
const classify_1 = __importDefault(require("./data/classify"));
// instances
const RoutableTileRegistry_1 = __importDefault(require("./entities/tiles/RoutableTileRegistry"));
const EventBus_1 = __importDefault(require("./events/EventBus"));
// enums
const Datatypes_1 = __importDefault(require("./data/Datatypes"));
const TravelMode_1 = __importDefault(require("./enums/TravelMode"));
const EventType_1 = __importDefault(require("./events/EventType"));
const QueryMode_1 = __importDefault(require("./QueryMode"));
const Units_1 = __importDefault(require("./util/Units"));
//
// EXPORTS
//
// planners
const DissectPlanner_1 = __importDefault(require("./planner/configurations/DissectPlanner"));
const FlexibleProfileTransitPlanner_1 = __importDefault(require("./planner/configurations/FlexibleProfileTransitPlanner"));
const FlexibleRoadPlanner_1 = __importDefault(require("./planner/configurations/FlexibleRoadPlanner"));
const FlexibleTransitPlanner_1 = __importDefault(require("./planner/configurations/FlexibleTransitPlanner"));
const GeospatialFragmentedPlanner_1 = __importDefault(require("./planner/configurations/GeospatialFragmentedPlanner"));
const ReducedCarPlanner_1 = __importDefault(require("./planner/configurations/ReducedCarPlanner"));
const TriangleTransitPlanner_1 = __importDefault(require("./planner/configurations/TriangleTransitPlanner"));
const ZoiDemoPlanner_1 = __importDefault(require("./planner/configurations/ZoiDemoPlanner"));
// classes
var main_3 = require("./analytics/isochrones/main");
Object.defineProperty(exports, "IsochroneGenerator", { enumerable: true, get: function () { return __importDefault(main_3).default; } });
var main_4 = require("./analytics/traffic/main");
Object.defineProperty(exports, "TrafficEstimator", { enumerable: true, get: function () { return __importDefault(main_4).default; } });
// functions
var create_2 = require("./create");
Object.defineProperty(exports, "createPlanner", { enumerable: true, get: function () { return __importDefault(create_2).default; } });
var classify_2 = require("./data/classify");
Object.defineProperty(exports, "classifyDataSource", { enumerable: true, get: function () { return __importDefault(classify_2).default; } });
// instances
exports.EventBus = EventBus_1.default.getInstance();
exports.RoutableTileRegistry = RoutableTileRegistry_1.default.getInstance();
// enums
var Datatypes_2 = require("./data/Datatypes");
Object.defineProperty(exports, "DataType", { enumerable: true, get: function () { return __importDefault(Datatypes_2).default; } });
var TravelMode_2 = require("./enums/TravelMode");
Object.defineProperty(exports, "TravelMode", { enumerable: true, get: function () { return __importDefault(TravelMode_2).default; } });
var EventType_2 = require("./events/EventType");
Object.defineProperty(exports, "EventType", { enumerable: true, get: function () { return __importDefault(EventType_2).default; } });
var QueryMode_2 = require("./QueryMode");
Object.defineProperty(exports, "QueryMode", { enumerable: true, get: function () { return __importDefault(QueryMode_2).default; } });
var Units_2 = require("./util/Units");
Object.defineProperty(exports, "Units", { enumerable: true, get: function () { return __importDefault(Units_2).default; } });
// planners
var DissectPlanner_2 = require("./planner/configurations/DissectPlanner");
Object.defineProperty(exports, "DissectPlanner", { enumerable: true, get: function () { return __importDefault(DissectPlanner_2).default; } });
var FlexibleProfileTransitPlanner_2 = require("./planner/configurations/FlexibleProfileTransitPlanner");
Object.defineProperty(exports, "FlexibleProfileTransitPlanner", { enumerable: true, get: function () { return __importDefault(FlexibleProfileTransitPlanner_2).default; } });
var FlexibleRoadPlanner_2 = require("./planner/configurations/FlexibleRoadPlanner");
Object.defineProperty(exports, "FlexibleRoadPlanner", { enumerable: true, get: function () { return __importDefault(FlexibleRoadPlanner_2).default; } });
var FlexibleTransitPlanner_2 = require("./planner/configurations/FlexibleTransitPlanner");
Object.defineProperty(exports, "FlexibleTransitPlanner", { enumerable: true, get: function () { return __importDefault(FlexibleTransitPlanner_2).default; } });
var GeospatialFragmentedPlanner_2 = require("./planner/configurations/GeospatialFragmentedPlanner");
Object.defineProperty(exports, "GeospatialFragmentedPlanner", { enumerable: true, get: function () { return __importDefault(GeospatialFragmentedPlanner_2).default; } });
var ReducedCarPlanner_2 = require("./planner/configurations/ReducedCarPlanner");
Object.defineProperty(exports, "ReducedCarPlanner", { enumerable: true, get: function () { return __importDefault(ReducedCarPlanner_2).default; } });
var TriangleTransitPlanner_2 = require("./planner/configurations/TriangleTransitPlanner");
Object.defineProperty(exports, "TriangleTransitPlanner", { enumerable: true, get: function () { return __importDefault(TriangleTransitPlanner_2).default; } });
var ZoiDemoPlanner_2 = require("./planner/configurations/ZoiDemoPlanner");
Object.defineProperty(exports, "ZoiDemoPlanner", { enumerable: true, get: function () { return __importDefault(ZoiDemoPlanner_2).default; } });
exports.default = {
    // classes
    IsochroneGenerator: main_1.default,
    TrafficEstimator: main_2.default,
    // functions
    classifyDataSource: classify_1.default,
    createPlanner: create_1.default,
    // instances
    RoutableTileRegistry: exports.RoutableTileRegistry,
    EventBus: exports.EventBus,
    // enums
    TravelMode: TravelMode_1.default,
    EventType: EventType_1.default,
    Units: Units_1.default,
    QueryMode: QueryMode_1.default,
    DataType: Datatypes_1.default,
    // planners
    DissectPlanner: DissectPlanner_1.default,
    FlexibleProfileTransitPlanner: FlexibleProfileTransitPlanner_1.default,
    FlexibleRoadPlanner: FlexibleRoadPlanner_1.default,
    FlexibleTransitPlanner: FlexibleTransitPlanner_1.default,
    GeospatialFragmentedPlanner: GeospatialFragmentedPlanner_1.default,
    ReducedCarPlanner: // experimental
    ReducedCarPlanner_1.default,
    TriangleTransitPlanner: TriangleTransitPlanner_1.default,
    ZoiDemoPlanner: ZoiDemoPlanner_1.default,
};
const [_, __, view, stops, from, to, date] = process.argv;
//const view = "http://127.0.0.1:8000/connections?view=https://hdelva.be/shapes/regional/hub_32";
//const stops = "https://openplanner.ilabt.imec.be/delijn/stops";
//const from = "https://data.delijn.be/stops/302457";
//const to = "https://data.delijn.be/stops/302560";
//const date = "2020-11-03T08:09:26.979000+00:00";
const planner = new GeospatialFragmentedPlanner_1.default();
planner.addConnectionSource(view);
planner.addStopSource(stops);
planner.prefetchStops();
const eventBus = exports.EventBus;
const resources = [];
const partitions = [];
let downloaded = 0;
let downloadTime = 0;
let startTime;
let stopsReached = 0;
eventBus
    .on(EventType_1.default.AbortQuery, (reason) => {
    // console.log("AbortQuery", reason);
})
    .on(EventType_1.default.Query, (Query) => {
    // console.log("Query", Query);
})
    .on(EventType_1.default.SubQuery, (query) => {
    const { minimumDepartureTime, maximumArrivalTime } = query;
})
    .on(EventType_1.default.ResourceFetch, (resource) => {
    if (!startTime) {
        startTime = new Date();
    }
    if (resource.size) {
        downloaded += resource.size;
    }
    if (resource.duration) {
        downloadTime += resource.duration;
    }
    if (resource.datatype === Datatypes_1.default.Connections) {
        resources.push(resource.url);
    }
})
    .on(EventType_1.default.Partition, (resource) => {
    partitions.push(resource);
})
    .on(EventType_1.default.ReachableID, (_) => {
    stopsReached++;
});
const query = {
    from,
    to,
    minimumDepartureTime: new Date(date),
};
planner
    .setProfileID("https://hdelva.be/profile/pedestrian")
    .query(query)
    .take(1)
    .on("data", (path) => {
    const blob = {
        resources,
        partitions,
        stopsReached,
        travelTime: path.getTravelTime(query),
        downloaded: downloaded / 1000,
        downloadTime: downloadTime / 1000,
        elapsed: new Date().getTime() - startTime.getTime(),
    };
    console.log(JSON.stringify(blob));
});
//# sourceMappingURL=index.js.map