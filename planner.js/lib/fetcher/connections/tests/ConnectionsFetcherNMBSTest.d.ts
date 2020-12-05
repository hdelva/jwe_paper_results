import { AsyncIterator } from "asynciterator";
import IConnection from "../IConnection";
import IConnectionsFetcher from "../IConnectionsFetcher";
import IConnectionsIteratorOptions from "../IConnectionsIteratorOptions";
export default class ConnectionsFetcherNMBSTest implements IConnectionsFetcher {
    private connections;
    private options;
    constructor(connections: Array<IteratorResult<IConnection>>);
    prefetchConnections(): void;
    setIteratorOptions(options: IConnectionsIteratorOptions): void;
    createIterator(): AsyncIterator<IConnection>;
}
