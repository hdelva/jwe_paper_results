import { AsyncIterator } from "asynciterator";
import Catalog from "../../Catalog";
import IConnection from "../../entities/connections/connections";
import { LinkedConnectionsPage } from "../../entities/connections/page";
import { ConnectionsFetcherFactory } from "../../types";
import IConnectionsIteratorOptions from "./IConnectionsIteratorOptions";
import IConnectionsProvider from "./IConnectionsProvider";
import IHydraTemplateFetcher from "../hydra/IHydraTemplateFetcher";
export default class ConnectionsProviderMerge implements IConnectionsProvider {
    private static forwardsConnectionSelector;
    private static backwardsConnectionsSelector;
    private defaultProviders;
    constructor(connectionsFetcherFactory: ConnectionsFetcherFactory, catalog: Catalog, templateFetcher: IHydraTemplateFetcher);
    prefetchConnections(lowerBound: Date, upperBound: Date): void;
    createIterator(options: IConnectionsIteratorOptions): Promise<AsyncIterator<IConnection>>;
    getByUrl(url: string): Promise<LinkedConnectionsPage>;
    getByTime(date: Date): Promise<LinkedConnectionsPage>;
}
