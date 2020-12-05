"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const asynciterator_1 = require("asynciterator");
const asynciterator_promiseproxy_1 = require("asynciterator-promiseproxy");
const EventBus_1 = __importDefault(require("../../../events/EventBus"));
const EventType_1 = __importDefault(require("../../../events/EventType"));
const BinarySearch_1 = __importDefault(require("../../../util/BinarySearch"));
const ArrayViewIterator_1 = __importDefault(require("../../../util/iterators/ArrayViewIterator"));
const ExpandingIterator_1 = __importDefault(require("../../../util/iterators/ExpandingIterator"));
const Units_1 = __importDefault(require("../../../util/Units"));
/**
 * Class used while prefetching [[IConnection]] instances. It allows appending connections
 * and creating iterator *views*. Iterator *views* are AsyncIterators that emit references to connections in the store.
 *
 * It is assumed that all connections are appended in ascending order by `departureTime`.
 *
 * Consequently this connections store serves as an in-memory cache for connections
 */
class ConnectionsStore {
    constructor() {
        this.eventBus = EventBus_1.default.getInstance();
        this.store = [];
        this.binarySearch = new BinarySearch_1.default(this.store, (connection) => connection.departureTime.valueOf());
        this.deferredBackwardViews = [];
        this.expandingForwardViews = [];
        this.hasFinishedPrimary = false;
        this.isContinuing = false;
    }
    setSourceIterator(iterator) {
        this.sourceIterator = iterator;
    }
    startPrimaryPush(maxConnections) {
        this.sourceIterator
            .transform({
            limit: maxConnections,
            destroySource: false,
        })
            .on("end", () => this.finishPrimaryPush())
            .each((connection) => {
            if (this.eventBus) {
                this.maybeEmitPrefetchEvent(connection);
            }
            this.append(connection);
        });
    }
    getIterator(iteratorOptions) {
        const { backward } = iteratorOptions;
        let { lowerBoundDate, upperBoundDate } = iteratorOptions;
        if (this.hasFinishedPrimary && this.store.length === 0) {
            return new asynciterator_1.EmptyIterator();
        }
        const firstConnection = this.store[0];
        const firstDepartureTime = firstConnection && firstConnection.departureTime;
        const lastConnection = this.store[this.store.length - 1];
        const lastDepartureTime = lastConnection && lastConnection.departureTime;
        if (lowerBoundDate && lowerBoundDate < firstDepartureTime) {
            throw new Error("Must supply a lowerBoundDate after the first prefetched connection");
        }
        if (backward) {
            if (!upperBoundDate) {
                throw new Error("Must supply upperBoundDate when iterating backward");
            }
            if (!lowerBoundDate) {
                lowerBoundDate = firstDepartureTime;
            }
            this.emitConnectionViewEvent(lowerBoundDate, upperBoundDate, false);
            // If the store is still empty or the latest departure time isn't later than the upperBoundDate,
            // then return a promise proxy iterator
            const notFinishedScenario = !this.hasFinishedPrimary
                && (!lastDepartureTime || lastDepartureTime <= upperBoundDate);
            const finishedScenario = this.hasFinishedPrimary
                && lastDepartureTime < upperBoundDate;
            if (notFinishedScenario || finishedScenario) {
                const { deferred, promise } = this.createDeferredBackwardView(lowerBoundDate, upperBoundDate);
                this.deferredBackwardViews.push(deferred);
                if (this.hasFinishedPrimary) {
                    this.continueAfterFinishing();
                }
                return new asynciterator_promiseproxy_1.PromiseProxyIterator(() => promise);
            }
        }
        else {
            if (!lowerBoundDate) {
                throw new Error("Must supply lowerBoundDate when iterating forward");
            }
            if (!upperBoundDate) {
                // Mock +infinity
                upperBoundDate = new Date(lowerBoundDate.valueOf() + Units_1.default.fromHours(24));
            }
            this.emitConnectionViewEvent(lowerBoundDate, upperBoundDate, false);
            // If the store is still empty or the latest departure time isn't later than the upperBoundDate,
            // then return a an expanding iterator view
            const notFinishedScenario = !this.hasFinishedPrimary
                && (!lastDepartureTime || lastDepartureTime <= upperBoundDate);
            const finishedScenario = this.hasFinishedPrimary
                && lastDepartureTime < upperBoundDate;
            if (notFinishedScenario || finishedScenario) {
                const { view, iterator } = this.createExpandingForwardView(lowerBoundDate, upperBoundDate);
                this.expandingForwardViews.push(view);
                if (this.hasFinishedPrimary) {
                    this.continueAfterFinishing();
                }
                return iterator;
            }
        }
        // If the whole interval fits inside the prefetched window, return an iterator view
        if (lowerBoundDate >= firstDepartureTime && upperBoundDate < lastDepartureTime) {
            const { iterator } = this.getIteratorView(backward, lowerBoundDate, upperBoundDate);
            this.emitConnectionViewEvent(lowerBoundDate, upperBoundDate, true);
            return iterator;
        }
        throw new Error("This shouldn\'t happen");
    }
    /**
     * Add a new [[IConnection]] to the store.
     *
     * Additionally, this method checks if any forward iterator views can be expanded or if any backward iterator can be
     * resolved
     *
     * @returns the number of unsatisfied views
     */
    append(connection) {
        this.store.push(connection);
        // Check if any deferred backward views are satisfied
        if (this.deferredBackwardViews.length) {
            this.deferredBackwardViews = this.deferredBackwardViews
                .filter(({ lowerBoundDate, upperBoundDate, resolve }) => {
                if (connection.departureTime > upperBoundDate) {
                    const { iterator } = this.getIteratorView(true, lowerBoundDate, upperBoundDate);
                    this.emitConnectionViewEvent(lowerBoundDate, upperBoundDate, true);
                    resolve(iterator);
                    return false;
                }
                return true;
            });
        }
        // Check if any forward views can be expanded
        if (this.expandingForwardViews.length) {
            this.expandingForwardViews = this.expandingForwardViews
                .filter(({ tryExpand }) => tryExpand(connection, this.store.length - 1));
        }
        return this.deferredBackwardViews.length + this.expandingForwardViews.length;
    }
    /**
     * Signals that the store will no longer be appended.
     * [[getIterator]] never returns a deferred backward view after this, because those would never get resolved
     */
    finishPrimaryPush() {
        this.hasFinishedPrimary = true;
        if (this.deferredBackwardViews.length || this.expandingForwardViews.length) {
            this.continueAfterFinishing();
        }
    }
    finishSecondaryPush() {
        this.isContinuing = false;
    }
    continueAfterFinishing() {
        if (!this.isContinuing) {
            this.isContinuing = true;
            setTimeout(() => this.startSecondaryPush(), 0);
        }
    }
    startSecondaryPush() {
        const secondaryPushIterator = this.sourceIterator
            .transform({ destroySource: false })
            .on("end", () => this.finishSecondaryPush());
        secondaryPushIterator.each((connection) => {
            if (this.eventBus) {
                this.maybeEmitPrefetchEvent(connection);
            }
            const unsatisfiedViewCount = this.append(connection);
            if (unsatisfiedViewCount === 0) {
                secondaryPushIterator.close();
            }
        });
    }
    createDeferredBackwardView(lowerBoundDate, upperBoundDate) {
        const deferred = {
            lowerBoundDate,
            upperBoundDate,
        };
        const promise = new Promise((resolve) => {
            deferred.resolve = resolve;
        });
        return {
            deferred: deferred,
            promise,
        };
    }
    createExpandingForwardView(lowerBoundDate, upperBoundDate) {
        const { iterator: existingIterator, upperBoundIndex } = this.getIteratorView(false, lowerBoundDate, upperBoundDate);
        const expandingIterator = new ExpandingIterator_1.default();
        const iterator = this.store.length ? expandingIterator.prepend(existingIterator) : expandingIterator;
        let lastStoreIndex = upperBoundIndex;
        const view = {
            lowerBoundDate,
            upperBoundDate,
            tryExpand: (connection, storeIndex) => {
                if (storeIndex - lastStoreIndex > 1) {
                    // No idea if this can happen
                    console.warn("Skipped", storeIndex - lastStoreIndex);
                }
                lastStoreIndex = storeIndex;
                // No need to keep trying to expand if the consumer has closed it
                if (iterator.closed) {
                    expandingIterator.close();
                    return false; // Remove from expanding forward views
                }
                if (connection.departureTime <= upperBoundDate) {
                    expandingIterator.write(connection);
                    return true; // Keep in expanding forward views
                }
                else {
                    expandingIterator.closeAfterFlush();
                    // iterator.close();
                    this.emitConnectionViewEvent(lowerBoundDate, upperBoundDate, true);
                    return false; // Remove from expanding forward views
                }
            },
        };
        return { view, iterator };
    }
    getIteratorView(backward, lowerBoundDate, upperBoundDate) {
        const lowerBoundIndex = this.getLowerBoundIndex(lowerBoundDate);
        const upperBoundIndex = this.getUpperBoundIndex(upperBoundDate);
        const start = backward ? upperBoundIndex : lowerBoundIndex;
        const stop = backward ? lowerBoundIndex : upperBoundIndex;
        const step = backward ? -1 : 1;
        const iterator = new ArrayViewIterator_1.default(this.store, start, stop, step);
        return { iterator, lowerBoundIndex, upperBoundIndex };
    }
    getLowerBoundIndex(date) {
        return this.binarySearch.findFirstIndex(date.valueOf(), 0, this.store.length - 1);
    }
    getUpperBoundIndex(date) {
        return this.binarySearch.findLastIndex(date.valueOf(), 0, this.store.length - 1);
    }
    emitConnectionViewEvent(lowerBoundDate, upperBoundDate, completed) {
        if (this.eventBus) {
            this.eventBus.emit(EventType_1.default.ConnectionIteratorView, lowerBoundDate, upperBoundDate, completed);
        }
    }
    maybeEmitPrefetchEvent(connection) {
        if (!this.lastReportedDepartureTime) {
            this.lastReportedDepartureTime = connection.departureTime;
            this.eventBus.emit(EventType_1.default.ConnectionPrefetch, this.lastReportedDepartureTime);
            return;
        }
        const timeSinceLastEvent = connection.departureTime.valueOf() - this.lastReportedDepartureTime.valueOf();
        if (timeSinceLastEvent > ConnectionsStore.REPORTING_THRESHOLD) {
            this.lastReportedDepartureTime = connection.departureTime;
            this.eventBus.emit(EventType_1.default.ConnectionPrefetch, this.lastReportedDepartureTime);
        }
    }
}
exports.default = ConnectionsStore;
ConnectionsStore.REPORTING_THRESHOLD = Units_1.default.fromMinutes(6);
//# sourceMappingURL=ConnectionsStore.js.map