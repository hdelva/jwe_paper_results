import { AsyncIterator } from "asynciterator";
import IPath from "../../interfaces/IPath";
import IResolvedQuery from "../../query-runner/IResolvedQuery";
import IRoadPlanner from "./IRoadPlanner";
import Context from "../../Context";
import IRoutableTileProvider from "../../fetcher/tiles/IRoutableTileProvider";
export default class RoadPlannerDijkstra implements IRoadPlanner {
    private tileProvider;
    private context;
    constructor(tileProvider: IRoutableTileProvider, context?: Context);
    plan(query: IResolvedQuery): Promise<AsyncIterator<IPath>>;
    private getPathBetweenLocations;
    private createStep;
    private embedLocation;
    private segmentDistToPoint;
}
