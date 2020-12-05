"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("jest");
const ldfetch_1 = __importDefault(require("ldfetch"));
const registry_1 = __importDefault(require("../../entities/tiles/registry"));
const PathfinderProvider_1 = __importDefault(require("../../pathfinding/PathfinderProvider"));
const ProfileFetcherDefault_1 = __importDefault(require("../profiles/ProfileFetcherDefault"));
const ProfileProviderDefault_1 = __importDefault(require("../profiles/ProfileProviderDefault"));
const RoutableTileFetcherDefault_1 = __importDefault(require("./RoutableTileFetcherDefault"));
const ldfetch = new ldfetch_1.default({ headers: { Accept: "application/ld+json" } });
const registry = new registry_1.default();
const profileProvider = new ProfileProviderDefault_1.default(new ProfileFetcherDefault_1.default(ldfetch));
const fetcher = new RoutableTileFetcherDefault_1.default(ldfetch, new PathfinderProvider_1.default(undefined, undefined, registry, profileProvider), registry);
test("[RoutableTileFetcherDefault] data completeness", async () => {
    jest.setTimeout(15000);
    const expectedNodes = new Set();
    const tile = await fetcher.get("https://tiles.openplanner.team/planet/14/8361/5482/");
    for (const wayId of tile.getWays()) {
        const way = registry.getWay(wayId);
        for (const segment of way.segments) {
            for (const node of segment) {
                expectedNodes.add(node);
            }
        }
    }
    for (const id of expectedNodes) {
        expect(tile.getNodes().has(id));
    }
});
//# sourceMappingURL=RoutableTileFetcherDefault.test.js.map