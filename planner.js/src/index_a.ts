import "isomorphic-fetch";
import "reflect-metadata";

import IsochroneGenerator from "./analytics/isochrones/main";
import TrafficEstimator from "./analytics/traffic/main";
import RoutableTileRegistry_ from "./entities/tiles/RoutableTileRegistry";
import TravelMode from "./enums/TravelMode";
import EventBus_ from "./events/EventBus";
import EventType from "./events/EventType";
import DissectPlanner from "./planner/configurations/DissectPlanner";
import FlexibleTransitPlanner from "./planner/configurations/FlexibleTransitPlanner";
import TransitCarPlanner from "./planner/configurations/ReducedCarPlanner";
import TriangleDemoPlanner from "./planner/configurations/TriangleTransitPlanner";
import Units from "./util/Units";

import IPath from "./interfaces/IPath";
import TYPES from "./types";

export { default as EventType } from "./events/EventType";
export { default as IsochroneGenerator } from "./analytics/isochrones/main";
export { default as TrafficEstimator } from "./analytics/traffic/main";
export { default as Units } from "./util/Units";
export { default as DissectPlanner } from "./planner/configurations/DissectPlanner";
export { default as TransitCarPlanner } from "./planner/configurations/ReducedCarPlanner";
export { default as FlexibleTransitPlanner } from "./planner/configurations/FlexibleTransitPlanner";
export { default as TriangleDemoPlanner } from "./planner/configurations/TriangleTransitPlanner";
export { default as TravelMode } from "./enums/TravelMode";

export const EventBus = EventBus_.getInstance();
export const RoutableTileRegistry = RoutableTileRegistry_.getInstance();

export default {
    TravelMode,
    EventType,
    IsochroneGenerator,
    TrafficEstimator,
    Units,
    EventBus,
    DissectPlanner,
    TransitCarPlanner,
    TriangleDemoPlanner,
    RoutableTileRegistry,
    FlexibleTransitPlanner,
};

const [_, __, view, from, to, depart] = process.argv;

const planner = new FlexibleTransitPlanner();
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
