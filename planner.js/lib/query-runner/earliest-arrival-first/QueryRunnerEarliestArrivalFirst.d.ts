import { AsyncIterator } from "asynciterator";
import { interfaces } from "inversify";
import IConnectionsProvider from "../../fetcher/connections/IConnectionsProvider";
import IPath from "../../interfaces/IPath";
import IQuery from "../../interfaces/IQuery";
import IPublicTransportPlanner from "../../planner/public-transport/IPublicTransportPlanner";
import IRoadPlanner from "../../planner/road/IRoadPlanner";
import IReachableStopsFinder from "../../planner/stops/IReachableStopsFinder";
import ILocationResolver from "../ILocationResolver";
import IQueryRunner from "../IQueryRunner";
/**
 * An earliest Arrival first connection scan is started to determine the maximumTravelDuration and the scanned period
 * needed to get at least one result.
 *
 * The registered [[IPublicTransportPlanner]] is used to execute the sub queries.
 * The maximumTravelDuration is set to the earliest arrival travel duration multiplied by 2.
 * The scanned period is set by a [[LinearQueryIterator]]. Where parameter a is set to 1.5 hours and b
 * is the initially the scanned period.
 *
 * In the current implementation, the `maximumArrivalTime` is ignored
 */
export default class QueryRunnerEarliestArrivalFirst implements IQueryRunner {
    private readonly eventBus;
    private readonly connectionsProvider;
    private readonly locationResolver;
    private readonly publicTransportPlannerFactory;
    private readonly roadPlanner;
    private readonly initialReachableStopsFinder;
    private readonly transferReachableStopsFinder;
    private readonly finalReachableStopsFinder;
    constructor(connectionsProvider: IConnectionsProvider, locationResolver: ILocationResolver, publicTransportPlannerFactory: interfaces.Factory<IPublicTransportPlanner>, initialReachableStopsFinder: IReachableStopsFinder, transferReachableStopsFinder: IReachableStopsFinder, finalReachableStopsFinder: IReachableStopsFinder, roadPlanner: IRoadPlanner);
    run(query: IQuery): Promise<AsyncIterator<IPath>>;
    private runSubquery;
    private resolveEndpoint;
    private resolveBaseQuery;
}
