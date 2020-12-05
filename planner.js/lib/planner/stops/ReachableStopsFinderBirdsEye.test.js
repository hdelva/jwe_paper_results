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
const ReachableStopsFinderBirdsEye_1 = __importDefault(require("./ReachableStopsFinderBirdsEye"));
const DE_LIJN_STOPS_URLS = [
    "http://openplanner.ilabt.imec.be/delijn/Antwerpen/stops",
    "http://openplanner.ilabt.imec.be/delijn/Oost-Vlaanderen/stops",
    "http://openplanner.ilabt.imec.be/delijn/West-Vlaanderen/stops",
    "http://openplanner.ilabt.imec.be/delijn/Vlaams-Brabant/stops",
    "http://openplanner.ilabt.imec.be/delijn/Limburg/stops",
];
const ldFetch = new ldfetch_1.default({ headers: { Accept: "application/ld+json" } });
const stopsFetcher = new StopsFetcherLDFetch_1.default(ldFetch);
stopsFetcher.setAccessUrl(DE_LIJN_STOPS_URLS[2]);
const reachableStopsFinder = new ReachableStopsFinderBirdsEye_1.default(stopsFetcher);
test("[ReachableStopsFinderBirdsEye] reachable stops", async () => {
    jest.setTimeout(15000);
    // Vierweg in West-Vlaanderen
    const sourceStop = await stopsFetcher.getStopById("https://data.delijn.be/stops/590009");
    expect(sourceStop).toBeDefined();
    // Get reachable stops in 1 km (.25h at 4km/h)
    const reachableStops = await reachableStopsFinder.findReachableStops(sourceStop, ReachableStopsFinderMode_1.default.Source, Units_1.default.fromMinutes(15), 4);
    expect(reachableStops.length).toBeGreaterThan(1);
});
//# sourceMappingURL=ReachableStopsFinderBirdsEye.test.js.map