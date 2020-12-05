import { AsyncIterator } from "asynciterator";
import IConnection from "../IConnection";
import IConnectionsIteratorOptions from "../IConnectionsIteratorOptions";
/**
 * Class used while prefetching [[IConnection]] instances. It allows appending connections
 * and creating iterator *views*. Iterator *views* are AsyncIterators that emit references to connections in the store.
 *
 * It is assumed that all connections are appended in ascending order by `departureTime`.
 *
 * Consequently this connections store serves as an in-memory cache for connections
 */
export default class ConnectionsStore {
    private static REPORTING_THRESHOLD;
    private readonly eventBus;
    private readonly store;
    private readonly binarySearch;
    private sourceIterator;
    private deferredBackwardViews;
    private expandingForwardViews;
    private hasFinishedPrimary;
    private isContinuing;
    private lastReportedDepartureTime;
    constructor();
    setSourceIterator(iterator: AsyncIterator<IConnection>): void;
    startPrimaryPush(maxConnections: number): void;
    getIterator(iteratorOptions: IConnectionsIteratorOptions): AsyncIterator<IConnection>;
    /**
     * Add a new [[IConnection]] to the store.
     *
     * Additionally, this method checks if any forward iterator views can be expanded or if any backward iterator can be
     * resolved
     *
     * @returns the number of unsatisfied views
     */
    private append;
    /**
     * Signals that the store will no longer be appended.
     * [[getIterator]] never returns a deferred backward view after this, because those would never get resolved
     */
    private finishPrimaryPush;
    private finishSecondaryPush;
    private continueAfterFinishing;
    private startSecondaryPush;
    private createDeferredBackwardView;
    private createExpandingForwardView;
    private getIteratorView;
    private getLowerBoundIndex;
    private getUpperBoundIndex;
    private emitConnectionViewEvent;
    private maybeEmitPrefetchEvent;
}
