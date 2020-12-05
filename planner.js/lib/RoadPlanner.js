"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const asynciterator_promiseproxy_1 = require("asynciterator-promiseproxy");
const EventType_1 = __importDefault(require("./enums/EventType"));
const inversify_config_1 = __importDefault(require("./inversify.config"));
const types_1 = __importDefault(require("./types"));
/**
 * Allows to ask route planning queries. Emits events defined in [[EventType]]
 */
// @ts-ignore
class RoadPlanner {
    /**
     * Initializes a new Planner
     * @param container The container of dependencies we are working with
     */
    constructor(container = inversify_config_1.default) {
        // Store container on context before doing anything else
        this.context = container.get(types_1.default.Context);
        this.context.setContainer(container);
        this.planner = container.get(types_1.default.RoadPlanner);
        this.profileProvider = container.get(types_1.default.ProfileProvider);
    }
    /**
     * Given an [[IQuery]], it will evaluate the query and return a promise for an AsyncIterator of [[IPath]] instances
     * @param query An [[IQuery]] specifying a route planning query
     * @returns An [[AsyncIterator]] of [[IPath]] instances
     */
    query(query) {
        this.emit(EventType_1.default.Query, query);
        const iterator = new asynciterator_promiseproxy_1.PromiseProxyIterator(() => this.planner.plan(query));
        this.once(EventType_1.default.AbortQuery, () => {
            iterator.close();
        });
        iterator.on("error", (e) => {
            if (e && e.eventType) {
                this.emit(e.eventType, e.message);
            }
        });
        return iterator;
    }
    addListener(type, listener) {
        this.context.addListener(type, listener);
        return this;
    }
    emit(type, ...args) {
        return this.context.emit(type, ...args);
    }
    listenerCount(type) {
        return this.context.listenerCount(type);
    }
    listeners(type) {
        return this.context.listeners(type);
    }
    on(type, listener) {
        this.context.on(type, listener);
        return this;
    }
    once(type, listener) {
        this.context.once(type, listener);
        return this;
    }
    removeAllListeners(type) {
        this.context.removeAllListeners(type);
        return this;
    }
    removeListener(type, listener) {
        this.context.removeListener(type, listener);
        return this;
    }
    setMaxListeners(n) {
        this.context.setMaxListeners(n);
        return this;
    }
    prefetchStops() {
        const container = this.context.getContainer();
        const stopsProvider = container.get(types_1.default.StopsProvider);
        if (stopsProvider) {
            stopsProvider.prefetchStops();
        }
    }
    prefetchConnections() {
        const container = this.context.getContainer();
        const connectionsProvider = container.get(types_1.default.ConnectionsProvider);
        if (connectionsProvider) {
            connectionsProvider.prefetchConnections();
        }
    }
    async setDevelopmentProfile(blob) {
        const profileID = await this.profileProvider.setDevelopmentProfile(blob);
        this.profileProvider.setActiveProfileID(profileID);
        return this;
    }
    setProfileID(profileID) {
        this.profileProvider.setActiveProfileID(profileID);
        return this;
    }
}
exports.default = RoadPlanner;
//# sourceMappingURL=RoadPlanner.js.map