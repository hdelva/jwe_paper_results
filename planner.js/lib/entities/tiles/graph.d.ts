import { IRoutableTileNodeIndex } from "./node";
export declare class RoutableTileEdgeGraph {
    contents: {};
    constructor(nodes: IRoutableTileNodeIndex);
    addEdge(from: string, to: string, weight: number): void;
    addGraph(other: RoutableTileEdgeGraph): void;
}
