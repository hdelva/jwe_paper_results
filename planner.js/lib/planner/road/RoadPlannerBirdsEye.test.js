"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("jest");
const ldfetch_1 = __importDefault(require("ldfetch"));
const registry_1 = __importDefault(require("../../entities/tiles/registry"));
const StopsFetcherLDFetch_1 = __importDefault(require("../../fetcher/stops/ld-fetch/StopsFetcherLDFetch"));
const LocationResolverDefault_1 = __importDefault(require("../../query-runner/LocationResolverDefault"));
const Iterators_1 = __importDefault(require("../../util/Iterators"));
const RoadPlannerBirdsEye_1 = __importDefault(require("./RoadPlannerBirdsEye"));
const ldFetch = new ldfetch_1.default({ headers: { Accept: "application/ld+json" } });
const planner = new RoadPlannerBirdsEye_1.default();
const stopsFetcher = new StopsFetcherLDFetch_1.default(ldFetch);
stopsFetcher.setAccessUrl("https://irail.be/stations/NMBS");
const locationResolver = new LocationResolverDefault_1.default(stopsFetcher, new registry_1.default());
test("[RoadPlannerBirdsEye] distance between stops", async () => {
    const kortrijkLocation = await locationResolver.resolve({ id: "http://irail.be/stations/NMBS/008896008" });
    const ghentLocation = await locationResolver.resolve({ id: "http://irail.be/stations/NMBS/008892007" });
    const iterator = await planner.plan({
        from: [kortrijkLocation],
        to: [ghentLocation],
        profileID: "PEDESTRIAN",
        minimumWalkingSpeed: 3,
        maximumWalkingSpeed: 6,
    });
    const result = await Iterators_1.default.toArray(iterator);
    expect(result).toHaveLength(1);
    // todo test result[0].steps
});
//# sourceMappingURL=RoadPlannerBirdsEye.test.js.map