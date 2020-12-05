import PathfindingGraph from "../graph";
import { IShortestPathInstance } from "../pathfinder";
export declare class DijkstraInstance implements IShortestPathInstance {
    private graph;
    private useWeightedCost;
    private costs;
    private previousNodes;
    private context;
    constructor(graph: PathfindingGraph);
    setUseWeightedCost(useWeightedCost: boolean): void;
    setBreakPoint(on: string, callback: (on: string) => Promise<void>): void;
    removeBreakPoint(on: string): void;
    getContext(): object;
    queryPath(from: string, to: string, maxDistance?: number): Promise<any[]>;
    private setCost;
    private getCost;
}
