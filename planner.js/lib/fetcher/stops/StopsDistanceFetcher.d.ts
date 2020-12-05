import LDFetch from "ldfetch";
import { LDLoader } from "../../loader/ldloader";
import { IndexThingView } from "../../loader/views";
import { IPathfinder } from "../../pathfinding/pathfinder";
import { DistanceM } from "../../interfaces/units";
export interface IStopsDistance {
    from: string;
    to: string;
    distance: DistanceM;
}
export interface IStopsDistanceIndex {
    [id: string]: IStopsDistance;
}
export default class StopsDistanceFetcher {
    protected ldFetch: LDFetch;
    protected ldLoader: LDLoader;
    protected pathfinder: IPathfinder;
    constructor();
    get(url: string): Promise<IStopsDistanceIndex>;
    protected getDistancesView(): IndexThingView<{
        id: string;
    }>;
}
