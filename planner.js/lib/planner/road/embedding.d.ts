import { RoutableTileNode } from "../../entities/tiles/node";
import ILocation from "../../interfaces/ILocation";
export default class Embedding {
    beginPoint: ILocation;
    intersectionPoint: ILocation;
    wayNode: RoutableTileNode;
    distance: number;
    constructor(begin: ILocation, intersection: ILocation, wayNode: RoutableTileNode, distance: number);
}
