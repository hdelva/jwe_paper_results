import LDFetch from "ldfetch";
import IRoutableTilesFetcher from "../IRoutableTilesFetcher";
import IRoutableTilesNode from "../IRoutableTilesNode";
import IRoutableTilesWay from "../IRoutableTilesWay";
export default class RoutableTileFetcherLDFetch implements IRoutableTilesFetcher {
    private accessUrl;
    private ldFetch;
    private loadPromise;
    private nodes;
    private ways;
    constructor(ldFetch: LDFetch);
    setAccessUrl(accessUrl: string): void;
    prefetchTiles(): void;
    getNodeById(stopId: string): Promise<IRoutableTilesNode>;
    getAllNodes(): Promise<IRoutableTilesNode[]>;
    getWayById(wayId: string): Promise<IRoutableTilesWay>;
    getAllWays(): Promise<IRoutableTilesWay[]>;
    private ensureTilesLoaded;
    private loadTiles;
    private _assembleNodeLists;
    private filterWaysFromEntities;
    private filterNodesFromEntities;
    private transformPredicate;
    private parseTriples;
}
