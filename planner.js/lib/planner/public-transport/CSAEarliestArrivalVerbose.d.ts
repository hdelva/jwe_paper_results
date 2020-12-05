import IConnection from "../../entities/connections/connections";
import IConnectionsProvider from "../../fetcher/connections/IConnectionsProvider";
import ILocationResolver from "../../query-runner/ILocationResolver";
import IResolvedQuery from "../../query-runner/IResolvedQuery";
import IReachableStopsFinder from "../stops/IReachableStopsFinder";
import CSAEarliestArrival from "./CSAEarliestArrival";
export default class CSAEarliestArrivalVerbose extends CSAEarliestArrival {
    constructor(connectionsProvider: IConnectionsProvider, locationResolver: ILocationResolver, transferReachableStopsFinder: IReachableStopsFinder, initialReachableStopsFinder: IReachableStopsFinder, finalReachableStopsFinder: IReachableStopsFinder);
    protected updateProfile(state: any, query: IResolvedQuery, connection: IConnection): void;
}
