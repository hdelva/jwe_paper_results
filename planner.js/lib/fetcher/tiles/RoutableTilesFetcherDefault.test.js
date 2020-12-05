"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("jest");
const ldfetch_1 = __importDefault(require("ldfetch"));
const RoutableTilesFetcherDefault_1 = __importDefault(require("./RoutableTilesFetcherDefault"));
const fetcher = new RoutableTilesFetcherDefault_1.default(new ldfetch_1.default({ headers: { Accept: "application/ld+json" } }));
test("[RoutableTileLDFetch] data completeness", async () => {
    jest.setTimeout(15000);
    const expectedNodes = new Set();
    const tile = await fetcher.get("https://tiles.openplanner.team/planet/14/8361/5482/");
    for (const way of Object.values(tile.ways)) {
        for (const segment of way.segments) {
            for (const node of segment) {
                expectedNodes.add(node);
            }
        }
    }
    for (const id of expectedNodes) {
        expect(tile.nodes[id]).toBeDefined();
    }
});
//# sourceMappingURL=RoutableTilesFetcherDefault.test.js.map