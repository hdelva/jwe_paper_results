import { AsyncIterator } from "asynciterator";
import Catalog from "../../../Catalog";
import { ConnectionsFetcherFactory } from "../../../types";
import IConnection from "../IConnection";
import IConnectionsIteratorOptions from "../IConnectionsIteratorOptions";
import IConnectionsProvider from "../IConnectionsProvider";
/**
 * This connections provider implements the [[IConnectionsProvider.prefetchConnections]] method.
 * When called, it asks an AsyncIterator from the instantiated [[IConnectionsFetcher]].
 * All items from that iterator get appended to a [[ConnectionsStore]]
 *
 * When [[IConnectionsProvider.createIterator]] is called, it returns an iterator *view* from the [[ConnectionsStore]]
 */
export default class ConnectionsProviderPrefetch implements IConnectionsProvider {
    private static MAX_CONNECTIONS;
    private readonly connectionsFetcher;
    private readonly connectionsStore;
    private startedPrefetching;
    private connectionsIterator;
    private connectionsIteratorOptions;
    constructor(connectionsFetcherFactory: ConnectionsFetcherFactory, catalog: Catalog);
    prefetchConnections(lowerBoundDate?: Date): void;
    createIterator(): AsyncIterator<IConnection>;
    setIteratorOptions(options: IConnectionsIteratorOptions): void;
}
