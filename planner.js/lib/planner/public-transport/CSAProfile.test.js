"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("jest");
const ldfetch_1 = __importDefault(require("ldfetch"));
const Defaults_1 = __importDefault(require("../../Defaults"));
const registry_1 = __importDefault(require("../../entities/tiles/registry"));
const TravelMode_1 = __importDefault(require("../../enums/TravelMode"));
const ConnectionsFetcherLazy_1 = __importDefault(require("../../fetcher/connections/lazy/ConnectionsFetcherLazy"));
const ConnectionsFetcherNMBSTest_1 = __importDefault(require("../../fetcher/connections/tests/ConnectionsFetcherNMBSTest"));
const ingelmunster_ghent_1 = __importDefault(require("../../fetcher/connections/tests/data/ingelmunster-ghent"));
const joining_1 = __importDefault(require("../../fetcher/connections/tests/data/joining"));
const splitting_1 = __importDefault(require("../../fetcher/connections/tests/data/splitting"));
const StopsFetcherLDFetch_1 = __importDefault(require("../../fetcher/stops/ld-fetch/StopsFetcherLDFetch"));
const LocationResolverDefault_1 = __importDefault(require("../../query-runner/LocationResolverDefault"));
const QueryRunnerDefault_1 = __importDefault(require("../../query-runner/QueryRunnerDefault"));
const Iterators_1 = __importDefault(require("../../util/Iterators"));
const ReachableStopsFinderBirdsEyeCached_1 = __importDefault(require("../stops/ReachableStopsFinderBirdsEyeCached"));
const CSAProfile_1 = __importDefault(require("./CSAProfile"));
const JourneyExtractorProfile_1 = __importDefault(require("./JourneyExtractorProfile"));
describe("[PublicTransportPlannerCSAProfile]", () => {
    describe("mock data", () => {
        jest.setTimeout(100000);
        const createCSA = (connections) => {
            const ldFetch = new ldfetch_1.default({ headers: { Accept: "application/ld+json" } });
            const connectionFetcher = new ConnectionsFetcherNMBSTest_1.default(connections);
            connectionFetcher.setIteratorOptions({ backward: true });
            const stopsFetcher = new StopsFetcherLDFetch_1.default(ldFetch);
            stopsFetcher.setAccessUrl("https://irail.be/stations/NMBS");
            const locationResolver = new LocationResolverDefault_1.default(stopsFetcher, new registry_1.default());
            const reachableStopsFinder = new ReachableStopsFinderBirdsEyeCached_1.default(stopsFetcher);
            const journeyExtractor = new JourneyExtractorProfile_1.default(locationResolver);
            return new CSAProfile_1.default(connectionFetcher, locationResolver, reachableStopsFinder, reachableStopsFinder, reachableStopsFinder, journeyExtractor);
        };
        describe("basic test", () => {
            let result;
            const query = {
                publicTransportOnly: true,
                from: [{ latitude: 50.914326, longitude: 3.255415 }],
                to: [{ latitude: 51.035896, longitude: 3.710875 }],
                profileID: "PEDESTRIAN",
                minimumDepartureTime: new Date("2018-11-06T09:00:00.000Z"),
                maximumArrivalTime: new Date("2018-11-06T19:00:00.000Z"),
                maximumTransfers: 8,
                minimumWalkingSpeed: Defaults_1.default.defaultMinimumWalkingSpeed,
                maximumWalkingSpeed: Defaults_1.default.defaultMaximumWalkingSpeed,
                maximumTransferDuration: Defaults_1.default.defaultMaximumTransferDuration,
            };
            beforeAll(async () => {
                const CSA = createCSA(ingelmunster_ghent_1.default);
                const iterator = await CSA.plan(query);
                result = await Iterators_1.default.toArray(iterator);
            });
            it("Correct departure and arrival stop", () => {
                expect(result).toBeDefined();
                for (const path of result) {
                    expect(path.steps).toBeDefined();
                    expect(path.steps[0]).toBeDefined();
                    expect(query.from.map((from) => from.id)).toContain(path.steps[0].startLocation.id);
                    expect(query.to.map((to) => to.id)).toContain(path.steps[path.steps.length - 1].stopLocation.id);
                }
            });
        });
        describe("splitting", () => {
            let result;
            const query = {
                publicTransportOnly: true,
                from: [{
                        id: "http://irail.be/stations/NMBS/008821006",
                        latitude: 51.2172,
                        longitude: 4.421101,
                    }],
                to: [{
                        id: "http://irail.be/stations/NMBS/008812005",
                        latitude: 50.859663,
                        longitude: 4.360846,
                    }],
                profileID: "PEDESTRIAN",
                minimumDepartureTime: new Date("2017-12-19T15:50:00.000Z"),
                maximumArrivalTime: new Date("2017-12-19T16:50:00.000Z"),
                maximumTransfers: 1,
                minimumWalkingSpeed: Defaults_1.default.defaultMinimumWalkingSpeed,
                maximumWalkingSpeed: Defaults_1.default.defaultMaximumWalkingSpeed,
                maximumTransferDuration: Defaults_1.default.defaultMaximumTransferDuration,
            };
            beforeAll(async () => {
                const CSA = createCSA(splitting_1.default);
                const iterator = await CSA.plan(query);
                result = await Iterators_1.default.toArray(iterator);
            });
            it("Correct departure and arrival stop", () => {
                expect(result).toBeDefined();
                expect(result.length).toBeGreaterThanOrEqual(1);
                for (const path of result) {
                    expect(path.steps).toBeDefined();
                    expect(path.steps.length).toEqual(1);
                    expect(path.steps[0]).toBeDefined();
                    expect(query.from.map((from) => from.id)).toContain(path.steps[0].startLocation.id);
                    expect(query.to.map((to) => to.id)).toContain(path.steps[0].stopLocation.id);
                }
            });
        });
        describe("joining", () => {
            let result;
            const query = {
                publicTransportOnly: true,
                from: [{
                        id: "http://irail.be/stations/NMBS/008812005",
                        latitude: 50.859663,
                        longitude: 4.360846,
                    }],
                to: [{
                        id: "http://irail.be/stations/NMBS/008821006",
                        latitude: 51.2172,
                        longitude: 4.421101,
                    }],
                profileID: "PEDESTRIAN",
                minimumDepartureTime: new Date("2017-12-19T16:20:00.000Z"),
                maximumArrivalTime: new Date("2017-12-19T16:50:00.000Z"),
                maximumTransfers: 1,
                minimumWalkingSpeed: Defaults_1.default.defaultMinimumWalkingSpeed,
                maximumWalkingSpeed: Defaults_1.default.defaultMaximumWalkingSpeed,
                maximumTransferDuration: Defaults_1.default.defaultMaximumTransferDuration,
            };
            beforeAll(async () => {
                const CSA = createCSA(joining_1.default);
                const iterator = await CSA.plan(query);
                result = await Iterators_1.default.toArray(iterator);
            });
            it("Correct departure and arrival stop", () => {
                expect(result).toBeDefined();
                expect(result.length).toBeGreaterThanOrEqual(1);
                for (const path of result) {
                    expect(path.steps).toBeDefined();
                    expect(path.steps.length).toEqual(1);
                    expect(path.steps[0]).toBeDefined();
                    expect(query.from.map((from) => from.id)).toContain(path.steps[0].startLocation.id);
                    expect(query.to.map((to) => to.id)).toContain(path.steps[0].stopLocation.id);
                }
            });
        });
    });
    describe("real-time data", () => {
        const createQueryRunner = () => {
            const ldFetch = new ldfetch_1.default({ headers: { Accept: "application/ld+json" } });
            const connectionFetcher = new ConnectionsFetcherLazy_1.default(ldFetch);
            connectionFetcher.setTravelMode(TravelMode_1.default.Train);
            connectionFetcher.setAccessUrl("https://graph.irail.be/sncb/connections");
            const stopsFetcher = new StopsFetcherLDFetch_1.default(ldFetch);
            stopsFetcher.setAccessUrl("https://irail.be/stations/NMBS");
            const locationResolver = new LocationResolverDefault_1.default(stopsFetcher, new registry_1.default());
            const reachableStopsFinder = new ReachableStopsFinderBirdsEyeCached_1.default(stopsFetcher);
            const journeyExtractor = new JourneyExtractorProfile_1.default(locationResolver);
            const CSA = new CSAProfile_1.default(connectionFetcher, locationResolver, reachableStopsFinder, reachableStopsFinder, reachableStopsFinder, journeyExtractor);
            return new QueryRunnerDefault_1.default(locationResolver, CSA, undefined);
        };
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
        const checkTimes = (result, minimumDepartureTime, maximumArrivalTime) => {
            expect(result).toBeDefined();
            expect(result.length).toBeGreaterThanOrEqual(1);
            for (const path of result) {
                expect(path.steps).toBeDefined();
                expect(path.steps.length).toBeGreaterThanOrEqual(1);
                expect(path.steps[0]).toBeDefined();
                expect(path.steps[path.steps.length - 1]).toBeDefined();
                let currentTime = minimumDepartureTime.getTime();
                path.steps.forEach((step) => {
                    expect(step).toBeDefined();
                    if (step.travelMode === TravelMode_1.default.Walking) {
                        currentTime += step.duration.minimum;
                    }
                    else {
                        expect(currentTime).toBeLessThanOrEqual(step.startTime.getTime());
                        currentTime = step.stopTime.getTime();
                    }
                });
                expect(path.steps[0].startTime.getTime()).toBeGreaterThanOrEqual(minimumDepartureTime.getTime());
                expect(currentTime).toBeLessThanOrEqual(maximumArrivalTime.getTime());
            }
        };
        describe("Arrival Thu Nov 29 2018 20:01:27 GMT+0100", () => {
            jest.setTimeout(100000);
            const minimumDepartureTime = new Date(1543518087748);
            minimumDepartureTime.setHours(minimumDepartureTime.getHours() - 2);
            const maximumArrivalTime = new Date(1543518087748);
            const query = {
                publicTransportOnly: true,
                from: "http://irail.be/stations/NMBS/008896925",
                to: "http://irail.be/stations/NMBS/008892007",
                maximumArrivalTime,
                minimumDepartureTime,
            };
            let result;
            beforeAll(async () => {
                const queryRunner = createQueryRunner();
                const iterator = await queryRunner.run(query);
                result = await Iterators_1.default.toArray(iterator);
            });
            it("Correct departure and arrival stop", () => {
                checkStops(result, query);
            });
            it("Correct departure and arrival time", () => {
                checkTimes(result, minimumDepartureTime, maximumArrivalTime);
            });
        });
        describe("Departure Time now - Arrival Time now+2h", () => {
            jest.setTimeout(100000);
            const minimumDepartureTime = new Date();
            const maximumArrivalTime = new Date();
            maximumArrivalTime.setHours(maximumArrivalTime.getHours() + 2);
            const query = {
                publicTransportOnly: true,
                from: "http://irail.be/stations/NMBS/008896925",
                to: "http://irail.be/stations/NMBS/008892007",
                maximumArrivalTime,
                minimumDepartureTime,
            };
            let result;
            beforeAll(async () => {
                const queryRunner = createQueryRunner();
                const iterator = await queryRunner.run(query);
                result = await Iterators_1.default.toArray(iterator);
            });
            it("Correct departure and arrival stop", () => {
                checkStops(result, query);
            });
            it("Correct departure and arrival time", () => {
                checkTimes(result, minimumDepartureTime, maximumArrivalTime);
            });
        });
        describe("Initial walking possibilities in Brussels", () => {
            jest.setTimeout(100000);
            const minimumDepartureTime = new Date();
            const maximumArrivalTime = new Date();
            maximumArrivalTime.setHours(maximumArrivalTime.getHours() + 3);
            const query = {
                publicTransportOnly: true,
                from: "http://irail.be/stations/NMBS/008812005",
                to: "http://irail.be/stations/NMBS/008892007",
                maximumArrivalTime,
                minimumDepartureTime,
            };
            let result;
            beforeAll(async () => {
                const queryRunner = createQueryRunner();
                const iterator = await queryRunner.run(query);
                result = await Iterators_1.default.toArray(iterator);
            });
            it("Correct departure and arrival stop", () => {
                checkStops(result, query);
            });
            it("Correct departure and arrival time", () => {
                checkTimes(result, minimumDepartureTime, maximumArrivalTime);
            });
        });
    });
});
//# sourceMappingURL=CSAProfile.test.js.map