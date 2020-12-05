import { RoutableTileNode } from "../entities/tiles/node";
import { RoutableTileWay } from "../entities/tiles/way";
import ILocation from "../interfaces/ILocation";
import { DistanceM, DurationMs } from "../interfaces/units";
export default abstract class Profile {
    abstract getID(): string;
    abstract isOneWay(way: RoutableTileWay): boolean;
    abstract hasAccess(way: RoutableTileWay): boolean;
    abstract getDefaultSpeed(): number;
    abstract getMaxSpeed(): number;
    abstract getSpeed(way: RoutableTileWay): number;
    abstract getDistance(from: ILocation, to: ILocation, way: RoutableTileWay): DistanceM;
    abstract getDuration(from: ILocation, to: ILocation, way: RoutableTileWay): DurationMs;
    abstract getMultiplier(way: RoutableTileWay): number;
    abstract getCost(from: ILocation, to: ILocation, way: RoutableTileWay): number;
    abstract isObstacle(node: RoutableTileNode): boolean;
}
