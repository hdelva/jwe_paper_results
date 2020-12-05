"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const asynciterator_promiseproxy_1 = require("asynciterator-promiseproxy");
const TravelMode_1 = __importDefault(require("./enums/TravelMode"));
const EventBus_1 = __importDefault(require("./events/EventBus"));
const EventType_1 = __importDefault(require("./events/EventType"));
const inversify_config_1 = __importDefault(require("./inversify.config"));
const Path_1 = __importDefault(require("./planner/Path"));
const types_1 = __importDefault(require("./types"));
const Iterators_1 = __importDefault(require("./util/Iterators"));
const Units_1 = __importDefault(require("./util/Units"));
/**
 * Allows to ask route planning queries. Emits events defined in [[EventType]]
 */
class Planner {
    /**
     * Initializes a new Planner
     * @param container The container of dependencies we are working with
     */
    constructor(container = inversify_config_1.default) {
        // Store container on context before doing anything else
        this.context = container.get(types_1.default.Context);
        this.context.setContainer(container);
        this.queryRunner = container.get(types_1.default.QueryRunner);
        this.profileProvider = container.get(types_1.default.ProfileProvider);
        this.eventBus = EventBus_1.default.getInstance();
        this.roadPlanner = container.get(types_1.default.RoadPlanner);
        this.activeProfileID = "https://hdelva.be/profile/pedestrian";
    }
    async completePath(path) {
        const completePath = Path_1.default.create();
        let walkingDeparture;
        let walkingDestination;
        for (const leg of path.legs) {
            if (leg.getTravelMode() === TravelMode_1.default.Walking) {
                if (!walkingDeparture) {
                    walkingDeparture = leg.getStartLocation();
                }
                walkingDestination = leg.getStopLocation();
            }
            else {
                if (walkingDestination) {
                    const walkingPathIterator = await this.roadPlanner.plan({
                        from: [walkingDeparture],
                        to: [walkingDestination],
                        profileID: this.activeProfileID,
                    });
                    const walkingPaths = await Iterators_1.default.toArray(walkingPathIterator);
                    for (const walkingLeg of walkingPaths[0].legs) {
                        completePath.appendLeg(walkingLeg);
                    }
                    walkingDeparture = null;
                    walkingDestination = null;
                }
                completePath.appendLeg(leg);
            }
        }
        if (walkingDestination) {
            const walkingPathIterator = await this.roadPlanner.plan({
                from: [walkingDeparture],
                to: [walkingDestination],
                profileID: this.activeProfileID,
            });
            const walkingPaths = await Iterators_1.default.toArray(walkingPathIterator);
            for (const walkingLeg of walkingPaths[0].legs) {
                completePath.appendLeg(walkingLeg);
            }
            walkingDeparture = null;
            walkingDestination = null;
        }
        return completePath;
    }
    /**
     * Given an [[IQuery]], it will evaluate the query and return a promise for an AsyncIterator of [[IPath]] instances
     * @param query An [[IQuery]] specifying a route planning query
     * @returns An [[AsyncIterator]] of [[IPath]] instances
     */
    query(query) {
        this.eventBus.emit(EventType_1.default.Query, query);
        query.profileID = this.activeProfileID;
        const iterator = new asynciterator_promiseproxy_1.PromiseProxyIterator(() => this.queryRunner.run(query));
        this.eventBus.once(EventType_1.default.AbortQuery, () => {
            iterator.close();
        });
        iterator.on("error", (e) => {
            if (e && e.eventType) {
                this.eventBus.emit(e.eventType, e.message);
            }
        });
        return iterator;
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
        const profileID = await this.profileProvider.parseDevelopmentProfile(blob);
        return this.setProfileID(profileID);
    }
    setProfileID(profileID) {
        this.activeProfileID = profileID;
        return this;
    }
    getAllStops() {
        // fixme, why is this here?
        // is this just for visualizations?
        const container = this.context.getContainer();
        const stopsProvider = container.get(types_1.default.StopsProvider);
        if (stopsProvider) {
            return stopsProvider.getAllStops();
        }
        return Promise.reject();
    }
}
Planner.Units = Units_1.default;
exports.default = Planner;
//# sourceMappingURL=Planner.js.map