/// <reference types="node" />
import { AsyncIterator } from "asynciterator";
import { EventEmitter, Listener } from "events";
import IPath from "./interfaces/IPath";
import IQuery from "./interfaces/IQuery";
/**
 * Allows to ask route planning queries. Emits events defined in [[EventType]]
 */
export default class RoadPlanner implements EventEmitter {
    private context;
    private planner;
    private profileProvider;
    /**
     * Initializes a new Planner
     * @param container The container of dependencies we are working with
     */
    constructor(container?: import("inversify/dts/container/container").Container);
    /**
     * Given an [[IQuery]], it will evaluate the query and return a promise for an AsyncIterator of [[IPath]] instances
     * @param query An [[IQuery]] specifying a route planning query
     * @returns An [[AsyncIterator]] of [[IPath]] instances
     */
    query(query: IQuery): AsyncIterator<IPath>;
    addListener(type: string | symbol, listener: Listener): this;
    emit(type: string | symbol, ...args: any[]): boolean;
    listenerCount(type: string | symbol): number;
    listeners(type: string | symbol): Listener[];
    on(type: string | symbol, listener: Listener): this;
    once(type: string | symbol, listener: Listener): this;
    removeAllListeners(type?: string | symbol): this;
    removeListener(type: string | symbol, listener: Listener): this;
    setMaxListeners(n: number): this;
    prefetchStops(): void;
    prefetchConnections(): void;
    setDevelopmentProfile(blob: object): Promise<this>;
    setProfileID(profileID: string): this;
}
