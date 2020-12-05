import "isomorphic-fetch";
import "reflect-metadata";

// classes
import IsochroneGenerator from "./analytics/isochrones/main";
import TrafficEstimator from "./analytics/traffic/main";

// functions
import createPlanner from "./create";
import classifyDataSource from "./data/classify";

// instances
import RoutableTileRegistry_ from "./entities/tiles/RoutableTileRegistry";
import EventBus_ from "./events/EventBus";

// enums
import DataType from "./data/Datatypes";
import TravelMode from "./enums/TravelMode";
import EventType from "./events/EventType";
import QueryMode from "./QueryMode";
import Units from "./util/Units";

//
// EXPORTS
//

// planners
import DissectPlanner from "./planner/configurations/DissectPlanner";
import FlexibleProfileTransitPlanner from "./planner/configurations/FlexibleProfileTransitPlanner";
import FlexibleRoadPlanner from "./planner/configurations/FlexibleRoadPlanner";
import FlexibleTransitPlanner from "./planner/configurations/FlexibleTransitPlanner";
import GeospatialFragmentedPlanner from "./planner/configurations/GeospatialFragmentedPlanner";
import ReducedCarPlanner from "./planner/configurations/ReducedCarPlanner";
import TriangleTransitPlanner from "./planner/configurations/TriangleTransitPlanner";
import ZoiDemoPlanner from "./planner/configurations/ZoiDemoPlanner";
import Path from "./planner/Path";
import { on } from "process";

// classes
export { default as IsochroneGenerator } from "./analytics/isochrones/main";
export { default as TrafficEstimator } from "./analytics/traffic/main";

// functions
export { default as createPlanner } from "./create";
export { default as classifyDataSource } from "./data/classify";

// instances
export const EventBus = EventBus_.getInstance();
export const RoutableTileRegistry = RoutableTileRegistry_.getInstance();

// enums
export { default as DataType } from "./data/Datatypes";
export { default as TravelMode } from "./enums/TravelMode";
export { default as EventType } from "./events/EventType";
export { default as QueryMode } from "./QueryMode";
export { default as Units } from "./util/Units";

// planners
export { default as DissectPlanner } from "./planner/configurations/DissectPlanner";
export { default as FlexibleProfileTransitPlanner } from "./planner/configurations/FlexibleProfileTransitPlanner";
export { default as FlexibleRoadPlanner } from "./planner/configurations/FlexibleRoadPlanner";
export { default as FlexibleTransitPlanner } from "./planner/configurations/FlexibleTransitPlanner";
export { default as GeospatialFragmentedPlanner } from "./planner/configurations/GeospatialFragmentedPlanner";
export { default as ReducedCarPlanner } from "./planner/configurations/ReducedCarPlanner";
export { default as TriangleTransitPlanner } from "./planner/configurations/TriangleTransitPlanner";
export { default as ZoiDemoPlanner } from "./planner/configurations/ZoiDemoPlanner";

export default {
    // classes
    IsochroneGenerator,
    TrafficEstimator,

    // functions
    classifyDataSource,
    createPlanner,

    // instances
    RoutableTileRegistry,
    EventBus,

    // enums
    TravelMode,
    EventType,
    Units,
    QueryMode,
    DataType,

    // planners
    DissectPlanner,
    FlexibleProfileTransitPlanner,
    FlexibleRoadPlanner,
    FlexibleTransitPlanner,
    GeospatialFragmentedPlanner, // experimental
    ReducedCarPlanner,
    TriangleTransitPlanner,
    ZoiDemoPlanner, // experimental
};

const [_, __, view, stops, from, to, date] = process.argv;

//const view = "http://127.0.0.1:8000/connections?view=https://hdelva.be/shapes/regional/hub_32";
//const stops = "https://openplanner.ilabt.imec.be/delijn/stops";
//const from = "https://data.delijn.be/stops/302457";
//const to = "https://data.delijn.be/stops/302560";
//const date = "2020-11-03T08:09:26.979000+00:00";

const planner = new GeospatialFragmentedPlanner();
planner.addConnectionSource(view);
planner.addStopSource(stops);
planner.prefetchStops();

const eventBus = EventBus;
const resources = [];
const partitions = [];
let downloaded = 0;
let downloadTime = 0;
let startTime;
let stopsReached = 0;

eventBus
    .on(EventType.AbortQuery, (reason) => {
        // console.log("AbortQuery", reason);
    })
    .on(EventType.Query, (Query) => {
        // console.log("Query", Query);
    })
    .on(EventType.SubQuery, (query) => {
        const { minimumDepartureTime, maximumArrivalTime } = query;
    })
    .on(EventType.ResourceFetch, (resource) => {
        if (!startTime) {
            startTime = new Date();
        }
        if (resource.size) {
            downloaded += resource.size;
        }
        if (resource.duration) {
            downloadTime += resource.duration;
        }
        if (resource.datatype === DataType.Connections) {
            resources.push(resource.url);
        }
    })
    .on(EventType.Partition, (resource) => {
        partitions.push(resource);
    })
    .on(EventType.ReachableID, (_) => {
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
    .on("data", (path: Path) => {
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
