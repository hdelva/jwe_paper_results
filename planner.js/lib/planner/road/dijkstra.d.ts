import { RoutableTileSet } from "../../entities/tiles/set";
import IPath from "../../interfaces/IPath";
import { RoutableTileNode } from "../../entities/tiles/node";
export default class Dijkstra {
    private edgeGraph;
    private tileset;
    private minSpeed;
    private maxSpeed;
    constructor(tileset: RoutableTileSet, minspeed: number, maxSpeed: number);
    path(start: RoutableTileNode, stop: RoutableTileNode): IPath;
}
