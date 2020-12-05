import { AsyncIterator } from "asynciterator";
import Catalog from "../../Catalog";
import { ConnectionsFetcherFactory } from "../../types";
import IConnection from "./IConnection";
import IConnectionsIteratorOptions from "./IConnectionsIteratorOptions";
import IConnectionsProvider from "./IConnectionsProvider";
/**
 * Passes through any method calls to a *single* [[IConnectionsFetcher]], the first if there are multiple source configs
 * This provider is most/only useful if there is only one fetcher
 */
export default class ConnectionsProviderPassthrough implements IConnectionsProvider {
    private readonly connectionsFetcher;
    constructor(connectionsFetcherFactory: ConnectionsFetcherFactory, catalog: Catalog);
    prefetchConnections(): void;
    createIterator(): AsyncIterator<IConnection>;
    setIteratorOptions(options: IConnectionsIteratorOptions): void;
}
