"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("jest");
const ldfetch_1 = __importDefault(require("ldfetch"));
const ReachableStopsFinderMode_1 = __importDefault(require("../../enums/ReachableStopsFinderMode"));
const StopsFetcherLDFetch_1 = __importDefault(require("../../fetcher/stops/ld-fetch/StopsFetcherLDFetch"));
const Units_1 = __importDefault(require("../../util/Units"));
const RoadPlannerBirdsEye_1 = __importDefault(require("../road/RoadPlannerBirdsEye"));
const ReachableStopsFinderRoadPlanner_1 = __importDefault(require("./ReachableStopsFinderRoadPlanner"));
const ldFetch = new ldfetch_1.default({ headers: { Accept: "application/ld+json" } });
const stopsFetcher = new StopsFetcherLDFetch_1.default(ldFetch);
stopsFetcher.setAccessUrl("https://irail.be/stations/NMBS");
const roadPlanner = new RoadPlannerBirdsEye_1.default();
const reachableStopsFinder = new ReachableStopsFinderRoadPlanner_1.default(stopsFetcher, roadPlanner);
test("[ReachableStopsFinderRoadPlanner] reachable stops", async () => {
    const sourceStop = await stopsFetcher.getStopById("http://irail.be/stations/NMBS/008896008");
    expect(sourceStop).toBeDefined();
    // Get reachable stops in 5 km (1h at 5km/h)
    const reachableStops = await reachableStopsFinder.findReachableStops(sourceStop, ReachableStopsFinderMode_1.default.Source, Units_1.default.fromHours(1), 5, "PEDESTRIAN");
    expect(reachableStops.length).toBeGreaterThan(1);
});
//# sourceMappingURL=ReachableStopsFinderRoadPlanner.test.js.map