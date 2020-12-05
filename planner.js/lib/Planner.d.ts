import { AsyncIterator } from "asynciterator";
import IStop from "./fetcher/stops/IStop";
import IPath from "./interfaces/IPath";
import IQuery from "./interfaces/IQuery";
import Units from "./util/Units";
/**
 * Allows to ask route planning queries. Emits events defined in [[EventType]]
 */
export default class Planner {
    static Units: typeof Units;
    private activeProfileID;
    private context;
    private eventBus;
    private queryRunner;
    private profileProvider;
    private roadPlanner;
    /**
     * Initializes a new Planner
     * @param container The container of dependencies we are working with
     */
    constructor(container?: import("inversify/dts/container/container").Container);
    completePath(path: IPath): Promise<IPath>;
    /**
     * Given an [[IQuery]], it will evaluate the query and return a promise for an AsyncIterator of [[IPath]] instances
     * @param query An [[IQuery]] specifying a route planning query
     * @returns An [[AsyncIterator]] of [[IPath]] instances
     */
    query(query: IQuery): AsyncIterator<IPath>;
    prefetchStops(): void;
    prefetchConnections(): void;
    setDevelopmentProfile(blob: object): Promise<this>;
    setProfileID(profileID: string): this;
    getAllStops(): Promise<IStop[]>;
}
