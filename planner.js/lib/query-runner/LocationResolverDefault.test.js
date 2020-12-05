"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("jest");
const ldfetch_1 = __importDefault(require("ldfetch"));
const registry_1 = __importDefault(require("../entities/tiles/registry"));
const StopsFetcherLDFetch_1 = __importDefault(require("../fetcher/stops/ld-fetch/StopsFetcherLDFetch"));
const LocationResolverDefault_1 = __importDefault(require("./LocationResolverDefault"));
const ldFetch = new ldfetch_1.default({ headers: { Accept: "application/ld+json" } });
const stopsFetcher = new StopsFetcherLDFetch_1.default(ldFetch);
stopsFetcher.setAccessUrl("https://irail.be/stations/NMBS");
const locationResolver = new LocationResolverDefault_1.default(stopsFetcher, new registry_1.default());
test("[LocationResolverDefault] Input {id: 'http://...'}", async () => {
    const location = await locationResolver.resolve({ id: "http://irail.be/stations/NMBS/008896008" });
    expect(location).toBeDefined();
    expect(location.latitude).toBeCloseTo(50.82, 2);
});
test("[LocationResolverDefault] Input 'http://...'", async () => {
    const location = await locationResolver.resolve("http://irail.be/stations/NMBS/008896008");
    expect(location).toBeDefined();
    expect(location.latitude).toBeCloseTo(50.82, 2);
});
test("[LocationResolverDefault] Input '...not an ID...'", async () => {
    expect.assertions(1);
    expect(locationResolver.resolve("random string")).rejects.toBeDefined();
});
test("[LocationResolverDefault] Input {longitude: ..., latitude: ...}", async () => {
    const location = await locationResolver.resolve({ latitude: 50.824506, longitude: 3.264549 });
    expect(location).toBeDefined();
    expect(location.latitude).toBeCloseTo(50.82, 2);
});
//# sourceMappingURL=LocationResolverDefault.test.js.map