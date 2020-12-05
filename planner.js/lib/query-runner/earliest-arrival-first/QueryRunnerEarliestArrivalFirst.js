"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const asynciterator_promiseproxy_1 = require("asynciterator-promiseproxy");
const inversify_1 = require("inversify");
const Defaults_1 = __importDefault(require("../../Defaults"));
const ReachableStopsSearchPhase_1 = __importDefault(require("../../enums/ReachableStopsSearchPhase"));
const InvalidQueryError_1 = __importDefault(require("../../errors/InvalidQueryError"));
const EventBus_1 = __importDefault(require("../../events/EventBus"));
const EventType_1 = __importDefault(require("../../events/EventType"));
const Path_1 = __importDefault(require("../../planner/Path"));
const CSAEarliestArrival_1 = __importDefault(require("../../planner/public-transport/CSAEarliestArrival"));
const types_1 = __importDefault(require("../../types"));
const FilterUniqueIterator_1 = __importDefault(require("../../util/iterators/FilterUniqueIterator"));
const FlatMapIterator_1 = __importDefault(require("../../util/iterators/FlatMapIterator"));
const Units_1 = __importDefault(require("../../util/Units"));
const LinearQueryIterator_1 = __importDefault(require("./LinearQueryIterator"));
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
let QueryRunnerEarliestArrivalFirst = class QueryRunnerEarliestArrivalFirst {
    constructor(connectionsProvider, locationResolver, publicTransportPlannerFactory, initialReachableStopsFinder, transferReachableStopsFinder, finalReachableStopsFinder, roadPlanner) {
        this.eventBus = EventBus_1.default.getInstance();
        this.connectionsProvider = connectionsProvider;
        this.locationResolver = locationResolver;
        this.publicTransportPlannerFactory = publicTransportPlannerFactory;
        this.initialReachableStopsFinder = initialReachableStopsFinder;
        this.transferReachableStopsFinder = transferReachableStopsFinder;
        this.finalReachableStopsFinder = finalReachableStopsFinder;
        this.roadPlanner = roadPlanner;
    }
    async run(query) {
        const baseQuery = await this.resolveBaseQuery(query);
        if (baseQuery.roadNetworkOnly) {
            return this.roadPlanner.plan(baseQuery);
        }
        else {
            const earliestArrivalPlanner = new CSAEarliestArrival_1.default(this.connectionsProvider, this.locationResolver, this.initialReachableStopsFinder, this.transferReachableStopsFinder, this.finalReachableStopsFinder);
            const earliestArrivalIterator = await earliestArrivalPlanner.plan(baseQuery);
            const path = await new Promise((resolve) => {
                earliestArrivalIterator
                    .take(1)
                    .on("data", (result) => {
                    resolve(result);
                })
                    .on("end", () => {
                    resolve(null);
                });
            });
            if (path === null && this.eventBus) {
                this.eventBus.emit(EventType_1.default.AbortQuery, "This query has no results");
            }
            let initialTimeSpan = Units_1.default.fromHours(1);
            let travelDuration;
            if (path && path.legs && path.legs.length > 0) {
                const firstLeg = path.legs[0];
                const lastLeg = path.legs[path.legs.length - 1];
                initialTimeSpan = lastLeg.getStopTime().getTime() - baseQuery.minimumDepartureTime.getTime();
                travelDuration = lastLeg.getStopTime().getTime() - firstLeg.getStartTime().getTime();
            }
            baseQuery.maximumTravelDuration = travelDuration * 2;
            const queryIterator = new LinearQueryIterator_1.default(baseQuery, Units_1.default.fromHours(1.5), initialTimeSpan);
            const subQueryIterator = new FlatMapIterator_1.default(queryIterator, this.runSubquery.bind(this));
            const prependedIterator = subQueryIterator.prepend([path]);
            return new FilterUniqueIterator_1.default(prependedIterator, Path_1.default.compareEquals);
        }
    }
    runSubquery(query) {
        this.eventBus.emit(EventType_1.default.SubQuery, query);
        const planner = this.publicTransportPlannerFactory();
        return new asynciterator_promiseproxy_1.PromiseProxyIterator(() => planner.plan(query));
    }
    async resolveEndpoint(endpoint) {
        if (Array.isArray(endpoint)) {
            const promises = endpoint
                .map((singleEndpoint) => this.locationResolver.resolve(singleEndpoint));
            return await Promise.all(promises);
        }
        else {
            return [await this.locationResolver.resolve(endpoint)];
        }
    }
    async resolveBaseQuery(query) {
        // tslint:disable:trailing-comma
        const { from, to, minimumWalkingSpeed, maximumWalkingSpeed, walkingSpeed, maximumWalkingDuration, maximumWalkingDistance, minimumTransferDuration, maximumTransferDuration, maximumTransferDistance, maximumTransfers, minimumDepartureTime } = query, other = __rest(query, ["from", "to", "minimumWalkingSpeed", "maximumWalkingSpeed", "walkingSpeed", "maximumWalkingDuration", "maximumWalkingDistance", "minimumTransferDuration", "maximumTransferDuration", "maximumTransferDistance", "maximumTransfers", "minimumDepartureTime"]);
        // tslint:enable:trailing-comma
        const resolvedQuery = Object.assign({}, other);
        resolvedQuery.minimumDepartureTime = minimumDepartureTime || new Date();
        try {
            resolvedQuery.from = await this.resolveEndpoint(from);
            resolvedQuery.to = await this.resolveEndpoint(to);
        }
        catch (e) {
            return Promise.reject(new InvalidQueryError_1.default(e));
        }
        resolvedQuery.minimumWalkingSpeed = minimumWalkingSpeed || walkingSpeed || Defaults_1.default.defaultMinimumWalkingSpeed;
        resolvedQuery.maximumWalkingSpeed = maximumWalkingSpeed || walkingSpeed || Defaults_1.default.defaultMaximumWalkingSpeed;
        resolvedQuery.maximumWalkingDuration = maximumWalkingDuration ||
            Units_1.default.toDuration(maximumWalkingDistance, resolvedQuery.minimumWalkingSpeed) || Defaults_1.default.defaultWalkingDuration;
        resolvedQuery.minimumTransferDuration = minimumTransferDuration || Defaults_1.default.defaultMinimumTransferDuration;
        resolvedQuery.maximumTransferDuration = maximumTransferDuration ||
            Units_1.default.toDuration(maximumTransferDistance, resolvedQuery.minimumWalkingSpeed) ||
            Defaults_1.default.defaultMaximumTransferDuration;
        resolvedQuery.maximumTransfers = maximumTransfers || Defaults_1.default.defaultMaximumTransfers;
        return resolvedQuery;
    }
};
QueryRunnerEarliestArrivalFirst = __decorate([
    inversify_1.injectable(),
    __param(0, inversify_1.inject(types_1.default.ConnectionsProvider)),
    __param(1, inversify_1.inject(types_1.default.LocationResolver)),
    __param(2, inversify_1.inject(types_1.default.PublicTransportPlannerFactory)),
    __param(3, inversify_1.inject(types_1.default.ReachableStopsFinder)),
    __param(3, inversify_1.tagged("phase", ReachableStopsSearchPhase_1.default.Initial)),
    __param(4, inversify_1.inject(types_1.default.ReachableStopsFinder)),
    __param(4, inversify_1.tagged("phase", ReachableStopsSearchPhase_1.default.Transfer)),
    __param(5, inversify_1.inject(types_1.default.ReachableStopsFinder)),
    __param(5, inversify_1.tagged("phase", ReachableStopsSearchPhase_1.default.Final)),
    __param(6, inversify_1.inject(types_1.default.RoadPlanner)),
    __metadata("design:paramtypes", [Object, Object, Function, Object, Object, Object, Object])
], QueryRunnerEarliestArrivalFirst);
exports.default = QueryRunnerEarliestArrivalFirst;
//# sourceMappingURL=QueryRunnerEarliestArrivalFirst.js.map