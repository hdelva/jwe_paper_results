"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("jest");
const ldfetch_1 = __importDefault(require("ldfetch"));
const registry_1 = __importDefault(require("../entities/tiles/registry"));
const StopsFetcherLDFetch_1 = __importDefault(require("../fetcher/stops/ld-fetch/StopsFetcherLDFetch"));
const LocationResolverConvenience_1 = __importDefault(require("./LocationResolverConvenience"));
const ldFetch = new ldfetch_1.default({ headers: { Accept: "application/ld+json" } });
const stopsFetcher = new StopsFetcherLDFetch_1.default(ldFetch);
const tileRegistry = new registry_1.default();
stopsFetcher.setAccessUrl("https://irail.be/stations/NMBS");
const locationResolver = new LocationResolverConvenience_1.default(stopsFetcher, tileRegistry);
describe("[LocationResolverConvenience]", () => {
    it("Input 'Kortrijk' (exact stop name)", async () => {
        const location = await locationResolver.resolve("Kortrijk");
        expect(location).toBeDefined();
        expect(location.latitude).toBeCloseTo(50.82, 2);
    });
    it("Input 'Narnia' (non-existent stop name)", async () => {
        expect.assertions(1);
        expect(locationResolver.resolve("Narnia")).rejects.toBeDefined();
    });
    it("Input {id: 'http://...'}", async () => {
        const location = await locationResolver.resolve({ id: "http://irail.be/stations/NMBS/008896008" });
        expect(location).toBeDefined();
        expect(location.latitude).toBeCloseTo(50.82, 2);
    });
    it("Input 'http://...'", async () => {
        const location = await locationResolver.resolve("http://irail.be/stations/NMBS/008896008");
        expect(location).toBeDefined();
        expect(location.latitude).toBeCloseTo(50.82, 2);
    });
    it("Input {longitude: ..., latitude: ...}", async () => {
        const location = await locationResolver.resolve({ latitude: 50.824506, longitude: 3.264549 });
        expect(location).toBeDefined();
        expect(location.latitude).toBeCloseTo(50.82, 2);
    });
});
//# sourceMappingURL=LocationResolverConvenience.test.js.map