"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("jest");
const ldfetch_1 = __importDefault(require("ldfetch"));
const Context_1 = __importDefault(require("../../Context"));
const registry_1 = __importDefault(require("../../entities/tiles/registry"));
const TravelMode_1 = __importDefault(require("../../enums/TravelMode"));
const ConnectionsFetcherLazy_1 = __importDefault(require("../../fetcher/connections/lazy/ConnectionsFetcherLazy"));
const StopsFetcherLDFetch_1 = __importDefault(require("../../fetcher/stops/ld-fetch/StopsFetcherLDFetch"));
const CSAProfile_1 = __importDefault(require("../../planner/public-transport/CSAProfile"));
const JourneyExtractorProfile_1 = __importDefault(require("../../planner/public-transport/JourneyExtractorProfile"));
const ReachableStopsFinderBirdsEyeCached_1 = __importDefault(require("../../planner/stops/ReachableStopsFinderBirdsEyeCached"));
const Units_1 = __importDefault(require("../../util/Units"));
const LocationResolverDefault_1 = __importDefault(require("../LocationResolverDefault"));
const QueryRunnerExponential_1 = __importDefault(require("./QueryRunnerExponential"));
describe("[QueryRunnerExponential]", () => {
    jest.setTimeout(100000);
    let publicTransportResult;
    const query = {
        publicTransportOnly: true,
        from: "http://irail.be/stations/NMBS/008896925",
        to: "http://irail.be/stations/NMBS/008892007",
        minimumDepartureTime: new Date(),
        maximumTransferDuration: Units_1.default.fromMinutes(30),
    };
    const createExponentialQueryRunner = () => {
        const ldFetch = new ldfetch_1.default({ headers: { Accept: "application/ld+json" } });
        const connectionFetcher = new ConnectionsFetcherLazy_1.default(ldFetch);
        connectionFetcher.setTravelMode(TravelMode_1.default.Train);
        connectionFetcher.setAccessUrl("https://graph.irail.be/sncb/connections");
        const stopsFetcher = new StopsFetcherLDFetch_1.default(ldFetch);
        stopsFetcher.setAccessUrl("https://irail.be/stations/NMBS");
        const locationResolver = new LocationResolverDefault_1.default(stopsFetcher, new registry_1.default());
        const reachableStopsFinder = new ReachableStopsFinderBirdsEyeCached_1.default(stopsFetcher);
        const context = new Context_1.default();
        const createJourneyExtractor = () => {
            return new JourneyExtractorProfile_1.default(locationResolver);
        };
        const createPlanner = () => {
            return new CSAProfile_1.default(connectionFetcher, locationResolver, reachableStopsFinder, reachableStopsFinder, reachableStopsFinder, createJourneyExtractor());
        };
        return new QueryRunnerExponential_1.default(context, locationResolver, createPlanner, undefined);
    };
    const result = [];
    beforeAll(async (done) => {
        const queryRunner = createExponentialQueryRunner();
        publicTransportResult = await queryRunner.run(query);
        await publicTransportResult.take(3)
            .on("data", (path) => {
            result.push(path);
        })
            .on("end", () => {
            done();
        });
    });
    it("Correct departure and arrival stop", () => {
        checkStops(result, query);
    });
});
const checkStops = (result, query) => {
    expect(result).toBeDefined();
    expect(result.length).toBeGreaterThanOrEqual(1);
    for (const path of result) {
        expect(path.steps).toBeDefined();
        expect(path.steps.length).toBeGreaterThanOrEqual(1);
        let currentLocation = query.from;
        path.steps.forEach((step) => {
            expect(step).toBeDefined();
            expect(currentLocation).toEqual(step.startLocation.id);
            currentLocation = step.stopLocation.id;
        });
        expect(query.to).toEqual(currentLocation);
    }
};
//# sourceMappingURL=QueryRunnerExponential.test.js.map