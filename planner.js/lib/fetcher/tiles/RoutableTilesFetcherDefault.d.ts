import LDFetch from "ldfetch";
import { RoutableTile } from "../../entities/tiles/tile";
import IRoutableTilesFetcher from "./IRoutableTilesFetcher";
export default class RoutableTileFetcherDefault implements IRoutableTilesFetcher {
    private ldFetch;
    private ldLoader;
    constructor(ldFetch: LDFetch);
    fetchByCoords(zoom: number, latitude: number, longitude: number): Promise<RoutableTile>;
    fetchByTileCoords(zoom: number, latitudeTile: number, longitudeTile: number): Promise<RoutableTile>;
    get(url: string): Promise<RoutableTile>;
    private getNodesView;
    private getWaysView;
    private long2tile;
    private lat2tile;
}
