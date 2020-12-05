import { AsyncIterator } from "asynciterator";
import LDFetch from "ldfetch";
import TravelMode from "../../../enums/TravelMode";
import IConnection from "../IConnection";
import IConnectionsFetcher from "../IConnectionsFetcher";
import IConnectionsIteratorOptions from "../IConnectionsIteratorOptions";
/**
 * Wraps the [[ConnectionsIteratorLazy]]
 * @implements IConnectionsFetcher
 */
export default class ConnectionsFetcherLazy implements IConnectionsFetcher {
    protected readonly ldFetch: LDFetch;
    protected options: IConnectionsIteratorOptions;
    private travelMode;
    private accessUrl;
    constructor(ldFetch: LDFetch);
    setTravelMode(travelMode: TravelMode): void;
    setAccessUrl(accessUrl: string): void;
    prefetchConnections(): void;
    createIterator(): AsyncIterator<IConnection>;
    setIteratorOptions(options: IConnectionsIteratorOptions): void;
}
