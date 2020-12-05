import ReachableStopsFinderMode from "../../enums/ReachableStopsFinderMode";
import IFootpathsProvider from "../../fetcher/footpaths/IFootpathsProvider";
import IStop from "../../fetcher/stops/IStop";
import IStopsProvider from "../../fetcher/stops/IStopsProvider";
import { DurationMs, SpeedKmH } from "../../interfaces/units";
import IReachableStopsFinder, { IReachableStop } from "./IReachableStopsFinder";
import IRoadPlanner from "../road/IRoadPlanner";
export default class ReachableStopsFinderMixed implements IReachableStopsFinder {
    private readonly stopsProvider;
    private readonly footpathsProvider;
    private readonly roadPlanner;
    private triangles;
    private triangleIndices;
    private trianglePoints;
    constructor(stopsProvider: IStopsProvider, footpathsProvider: IFootpathsProvider, roadplanner: IRoadPlanner);
    findReachableStops(sourceOrTargetStop: IStop, mode: ReachableStopsFinderMode, maximumDuration: DurationMs, minimumSpeed: SpeedKmH, profileID: string): Promise<IReachableStop[]>;
    private getConnectedStops;
    private prepare;
}
