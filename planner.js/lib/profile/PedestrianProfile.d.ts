import { RoutableTileNode } from "../entities/tiles/node";
import { RoutableTileWay } from "../entities/tiles/way";
import { DistanceM, DurationMs } from "../interfaces/units";
import Profile from "./Profile";
export default class PedestrianProfile extends Profile {
    getID(): string;
    isOneWay(way: RoutableTileWay): boolean;
    hasAccess(way: RoutableTileWay): boolean;
    getDefaultSpeed(): number;
    getMaxSpeed(): number;
    getSpeed(way: RoutableTileWay): number;
    getDistance(from: RoutableTileNode, to: RoutableTileNode, way: RoutableTileWay): DistanceM;
    getDuration(from: RoutableTileNode, to: RoutableTileNode, way: RoutableTileWay): DurationMs;
    getMultiplier(way: RoutableTileWay): number;
    getCost(from: RoutableTileNode, to: RoutableTileNode, way: RoutableTileWay): number;
    isObstacle(node: RoutableTileNode): boolean;
}
