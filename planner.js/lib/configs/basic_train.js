"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const inversify_1 = require("inversify");
const catalog_nmbs_1 = __importDefault(require("../catalog.nmbs"));
const Context_1 = __importDefault(require("../Context"));
const ReachableStopsSearchPhase_1 = __importDefault(require("../enums/ReachableStopsSearchPhase"));
const RoutingPhase_1 = __importDefault(require("../enums/RoutingPhase"));
const ConnectionsFetcherRaw_1 = __importDefault(require("../fetcher/connections/ConnectionsFetcherRaw"));
const ConnectionsProviderDefault_1 = __importDefault(require("../fetcher/connections/ConnectionsProviderDefault"));
const HydraTemplateFetcherDefault_1 = __importDefault(require("../fetcher/hydra/HydraTemplateFetcherDefault"));
const LDFetch_1 = __importDefault(require("../fetcher/LDFetch"));
const ProfileFetcherDefault_1 = __importDefault(require("../fetcher/profiles/ProfileFetcherDefault"));
const ProfileProviderDefault_1 = __importDefault(require("../fetcher/profiles/ProfileProviderDefault"));
const StopsFetcherRaw_1 = __importDefault(require("../fetcher/stops/StopsFetcherRaw"));
const StopsProviderDefault_1 = __importDefault(require("../fetcher/stops/StopsProviderDefault"));
const RoutableTileFetcherRaw_1 = __importDefault(require("../fetcher/tiles/RoutableTileFetcherRaw"));
const RoutableTileProviderDefault_1 = __importDefault(require("../fetcher/tiles/RoutableTileProviderDefault"));
const RoutableTileProviderTransit_1 = __importDefault(require("../fetcher/tiles/RoutableTileProviderTransit"));
const ldloader_1 = require("../loader/ldloader");
const BidirDijkstra_1 = require("../pathfinding/bidirdijkstra/BidirDijkstra");
const DijkstraTree_1 = __importDefault(require("../pathfinding/dijkstra-tree/DijkstraTree"));
const PathfinderProvider_1 = __importDefault(require("../pathfinding/PathfinderProvider"));
const CSAProfile_1 = __importDefault(require("../planner/public-transport/CSAProfile"));
const JourneyExtractorProfile_1 = __importDefault(require("../planner/public-transport/JourneyExtractorProfile"));
const RoadPlannerPathfinding_1 = __importDefault(require("../planner/road/RoadPlannerPathfinding"));
const ReachableStopsFinderDelaunay_1 = __importDefault(require("../planner/stops/ReachableStopsFinderDelaunay"));
const ReachableStopsFinderOnlySelf_1 = __importDefault(require("../planner/stops/ReachableStopsFinderOnlySelf"));
const QueryRunnerExponential_1 = __importDefault(require("../query-runner/exponential/QueryRunnerExponential"));
const LocationResolverConvenience_1 = __importDefault(require("../query-runner/LocationResolverConvenience"));
const types_1 = __importDefault(require("../types"));
const container = new inversify_1.Container();
container.bind(types_1.default.Context).to(Context_1.default).inSingletonScope();
container.bind(types_1.default.QueryRunner).to(QueryRunnerExponential_1.default);
container.bind(types_1.default.LocationResolver).to(LocationResolverConvenience_1.default);
container.bind(types_1.default.HydraTemplateFetcher).to(HydraTemplateFetcherDefault_1.default).inSingletonScope();
// TODO, make this a fixed property of the planner itself
container.bind(types_1.default.JourneyExtractor)
    .to(JourneyExtractorProfile_1.default);
container.bind(types_1.default.PublicTransportPlanner)
    .to(CSAProfile_1.default);
container.bind(types_1.default.PublicTransportPlannerFactory)
    .toAutoFactory(types_1.default.PublicTransportPlanner);
container.bind(types_1.default.RoadPlanner)
    .to(RoadPlannerPathfinding_1.default);
container.bind(types_1.default.ShortestPathTreeAlgorithm).to(DijkstraTree_1.default).inSingletonScope();
container.bind(types_1.default.ShortestPathAlgorithm).to(BidirDijkstra_1.BidirDijkstra).inSingletonScope();
container.bind(types_1.default.PathfinderProvider).to(PathfinderProvider_1.default).inSingletonScope();
container.bind(types_1.default.ProfileFetcher).to(ProfileFetcherDefault_1.default).inSingletonScope();
container.bind(types_1.default.ProfileProvider).to(ProfileProviderDefault_1.default).inSingletonScope();
container.bind(types_1.default.ReachableStopsFinder)
    .to(ReachableStopsFinderDelaunay_1.default).whenTargetTagged("phase", ReachableStopsSearchPhase_1.default.Initial);
container.bind(types_1.default.ReachableStopsFinder)
    .to(ReachableStopsFinderOnlySelf_1.default).whenTargetTagged("phase", ReachableStopsSearchPhase_1.default.Transfer);
container.bind(types_1.default.ReachableStopsFinder)
    .to(ReachableStopsFinderDelaunay_1.default).whenTargetTagged("phase", ReachableStopsSearchPhase_1.default.Final);
container.bind(types_1.default.ConnectionsProvider).to(ConnectionsProviderDefault_1.default).inSingletonScope();
container.bind(types_1.default.ConnectionsFetcher).to(ConnectionsFetcherRaw_1.default);
container.bind(types_1.default.ConnectionsFetcherFactory)
    .toFactory((context) => (travelMode) => {
    const fetcher = context.container.get(types_1.default.ConnectionsFetcher);
    fetcher.setTravelMode(travelMode);
    return fetcher;
});
container.bind(types_1.default.StopsProvider).to(StopsProviderDefault_1.default).inSingletonScope();
container.bind(types_1.default.StopsFetcher).to(StopsFetcherRaw_1.default);
container.bind(types_1.default.StopsFetcherFactory)
    .toFactory((context) => (accessUrl) => {
    const fetcher = context.container.get(types_1.default.StopsFetcher);
    fetcher.setAccessUrl(accessUrl);
    return fetcher;
});
container.bind(types_1.default.RoutableTileFetcher).to(RoutableTileFetcherRaw_1.default).inSingletonScope();
container.bind(types_1.default.RoutableTileProvider)
    .to(RoutableTileProviderDefault_1.default).inSingletonScope().whenTargetTagged("phase", RoutingPhase_1.default.Base);
container.bind(types_1.default.RoutableTileProvider)
    .to(RoutableTileProviderTransit_1.default).inSingletonScope().whenTargetTagged("phase", RoutingPhase_1.default.Transit);
// Bind catalog
container.bind(types_1.default.Catalog).toConstantValue(catalog_nmbs_1.default);
// Init LDFetch
container.bind(types_1.default.LDFetch).to(LDFetch_1.default).inSingletonScope();
container.bind(types_1.default.LDLoader).to(ldloader_1.LDLoader);
exports.default = container;
//# sourceMappingURL=basic_train.js.map