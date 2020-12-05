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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const asynciterator_1 = require("asynciterator");
const inversify_1 = require("inversify");
const Context_1 = __importDefault(require("../../Context"));
const DropOffType_1 = __importDefault(require("../../enums/DropOffType"));
const EventType_1 = __importDefault(require("../../enums/EventType"));
const PickupType_1 = __importDefault(require("../../enums/PickupType"));
const ReachableStopsFinderMode_1 = __importDefault(require("../../enums/ReachableStopsFinderMode"));
const ReachableStopsSearchPhase_1 = __importDefault(require("../../enums/ReachableStopsSearchPhase"));
const TravelMode_1 = __importDefault(require("../../enums/TravelMode"));
const types_1 = __importDefault(require("../../types"));
const Geo_1 = __importDefault(require("../../util/Geo"));
const MultiConnectionQueue_1 = __importDefault(require("./CSA/data-structure/MultiConnectionQueue"));
const JourneyExtractor2_1 = __importDefault(require("./JourneyExtractor2"));
let CSAEarliestArrival2 = class CSAEarliestArrival2 {
    constructor(connectionsProvider, locationResolver, transferReachableStopsFinder, initialReachableStopsFinder, finalReachableStopsFinder, context) {
        this.finalReachableStops = {};
        this.profilesByStop = {}; // S
        this.enterConnectionByTrip = {}; // T
        this.connectionsProvider = connectionsProvider;
        this.locationResolver = locationResolver;
        this.transferReachableStopsFinder = transferReachableStopsFinder;
        this.initialReachableStopsFinder = initialReachableStopsFinder;
        this.finalReachableStopsFinder = finalReachableStopsFinder;
        this.context = context;
        this.journeyExtractor = new JourneyExtractor2_1.default(locationResolver);
    }
    async plan(query) {
        this.setBounds(query);
        return this.calculateJourneys(query);
    }
    setBounds(query) {
        const { minimumDepartureTime: lowerBoundDate, maximumArrivalTime: upperBoundDate, } = query;
        this.connectionsProvider.setIteratorOptions({
            upperBoundDate,
            lowerBoundDate,
        });
    }
    async calculateJourneys(query) {
        const connectionsIterator = this.connectionsProvider.createIterator();
        this.connectionsQueue = new MultiConnectionQueue_1.default(connectionsIterator);
        const [hasInitialReachableStops, hasFinalReachableStops] = await Promise.all([
            this.initInitialReachableStops(query),
            this.initFinalReachableStops(query),
        ]);
        if (!hasInitialReachableStops || !hasFinalReachableStops) {
            return Promise.resolve(new asynciterator_1.ArrayIterator([]));
        }
        const self = this;
        return new Promise((resolve, reject) => {
            let isDone = false;
            const done = () => {
                if (!isDone) {
                    self.connectionsQueue.close();
                    self.extractJourneys(query)
                        .then((resultIterator) => {
                        resolve(resultIterator);
                    });
                    isDone = true;
                }
            };
            connectionsIterator.on("readable", () => self.processConnections(query, done));
            connectionsIterator.on("end", () => done());
            // iterator may have become readable before the listener was attached
            self.processConnections(query, done);
        });
    }
    async extractJourneys(query) {
        return this.journeyExtractor.extractJourneys(this.profilesByStop, query);
    }
    async processConnections(query, resolve) {
        const { from, to, minimumDepartureTime } = query;
        const departureStopId = from[0].id;
        const arrivalStopId = to[0].id;
        let connection = this.connectionsQueue.pop();
        while (connection && !this.connectionsQueue.isClosed()) {
            if (connection.departureTime < minimumDepartureTime && !this.connectionsQueue.isClosed()) {
                // starting criterion
                // skip connections before the minimum departure time
                connection = this.connectionsQueue.pop();
                continue;
            }
            if (this.getProfile(arrivalStopId).arrivalTime <= connection.departureTime.getTime()) {
                // stopping criterion
                // we cannot improve the tentative arrival time anymore
                return resolve();
            }
            const tripId = connection.tripId;
            const departureTime = connection.departureTime.getTime();
            const canRemainSeated = this.enterConnectionByTrip[tripId];
            const canTakeTransfer = ((connection.departureStop === departureStopId ||
                this.getProfile(connection.departureStop).arrivalTime <= departureTime) &&
                connection["gtfs:pickupType"] !== PickupType_1.default.NotAvailable);
            if (canRemainSeated || canTakeTransfer) {
                // enterConnectionByTrip should point to the first reachable connection
                if (!this.enterConnectionByTrip[tripId]) {
                    this.enterConnectionByTrip[tripId] = connection;
                }
                // limited walking optimization
                const canImprove = connection.arrivalTime.getTime() < this.getProfile(connection.arrivalStop).arrivalTime;
                const canLeave = connection["gtfs:dropOffType"] !== DropOffType_1.default.NotAvailable;
                if (canLeave && canImprove) {
                    this.updateProfile(query, connection);
                    await this.scheduleExtraConnections(query, connection);
                }
            }
            if (!this.connectionsQueue.isClosed()) {
                connection = this.connectionsQueue.pop();
                continue;
            }
            connection = undefined;
        }
    }
    getProfile(stopId) {
        if (!this.profilesByStop[stopId]) {
            this.profilesByStop[stopId] = {
                departureTime: Infinity,
                arrivalTime: Infinity,
            };
        }
        return this.profilesByStop[stopId];
    }
    updateProfile(query, connection) {
        /*
        Call this ONLY if the given connection is known to improve the arrival stop's profile
        */
        const tripId = connection.tripId;
        const departureTime = connection.departureTime.getTime();
        const arrivalTime = connection.arrivalTime.getTime();
        // update profile of arrival stop
        const arrivalProfile = {
            departureTime,
            arrivalTime,
            exitConnection: connection,
            enterConnection: this.enterConnectionByTrip[tripId],
        };
        this.profilesByStop[connection.arrivalStop] = arrivalProfile;
    }
    async scheduleExtraConnections(query, sourceConnection) {
        try {
            const arrivalStop = await this.locationResolver.resolve(sourceConnection.arrivalStop);
            const reachableStops = await this.transferReachableStopsFinder.findReachableStops(arrivalStop, ReachableStopsFinderMode_1.default.Source, query.maximumTransferDuration, query.minimumWalkingSpeed);
            if (this.finalReachableStops[arrivalStop.id]) {
                reachableStops.push(this.finalReachableStops[arrivalStop.id]);
            }
            for (const reachableStop of reachableStops) {
                const { stop: stop, duration: duration } = reachableStop;
                const transferTentativeArrival = this.getProfile(stop.id).arrivalTime;
                if (duration && transferTentativeArrival > sourceConnection.arrivalTime.getTime() && stop.id) {
                    // create a connection that resembles a footpath
                    // TODO, ditch the IReachbleStop and IConnection interfaces and make these proper objects
                    const transferConnection = {
                        id: `TRANSFER_TO:${stop.id}`,
                        tripId: `TRANSFER_TO:${stop.id}`,
                        travelMode: TravelMode_1.default.Walking,
                        departureTime: sourceConnection.arrivalTime,
                        departureStop: sourceConnection.arrivalStop,
                        arrivalTime: new Date(sourceConnection.arrivalTime.getTime() + duration),
                        arrivalStop: stop.id,
                    };
                    this.connectionsQueue.push(transferConnection);
                }
            }
        }
        catch (e) {
            if (this.context) {
                this.context.emitWarning(e);
            }
        }
    }
    async initInitialReachableStops(query) {
        const fromLocation = query.from[0];
        // Making sure the departure location has an id
        const geoId = Geo_1.default.getId(fromLocation);
        if (!fromLocation.id) {
            query.from[0].id = geoId;
            query.from[0].name = "Departure location";
        }
        const reachableStops = await this.initialReachableStopsFinder.findReachableStops(fromLocation, ReachableStopsFinderMode_1.default.Source, query.maximumWalkingDuration, query.minimumWalkingSpeed);
        // Abort when we can't reach a single stop.
        if (reachableStops.length === 0) {
            this.context.emit(EventType_1.default.AbortQuery, "No reachable stops at departure location");
            return false;
        }
        if (this.context) {
            this.context.emit(EventType_1.default.InitialReachableStops, reachableStops);
        }
        for (const reachableStop of reachableStops) {
            const { stop: stop, duration: duration } = reachableStop;
            if (duration) {
                // create a connection that resembles a footpath
                // TODO, ditch the IReachbleStop and IConnection interfaces and make these proper objects
                const transferConnection = {
                    id: `MOVE_TO:${stop.id}`,
                    tripId: `MOVE_TO:${stop.id}`,
                    travelMode: TravelMode_1.default.Walking,
                    departureTime: query.minimumDepartureTime,
                    departureStop: fromLocation.id,
                    arrivalTime: new Date(query.minimumDepartureTime.getTime() + duration),
                    arrivalStop: stop.id,
                };
                this.connectionsQueue.push(transferConnection);
            }
        }
        return true;
    }
    async initFinalReachableStops(query) {
        const toLocation = query.to[0];
        // Making sure the departure location has an id
        const geoId = Geo_1.default.getId(toLocation);
        if (!toLocation.id) {
            query.to[0].id = geoId;
            query.to[0].name = "Arrival location";
        }
        const reachableStops = await this.finalReachableStopsFinder.findReachableStops(toLocation, ReachableStopsFinderMode_1.default.Target, query.maximumWalkingDuration, query.minimumWalkingSpeed);
        // Abort when we can't reach a single stop.
        if (reachableStops.length === 0) {
            this.context.emit(EventType_1.default.AbortQuery, "No reachable stops at arrival location");
            return false;
        }
        if (this.context) {
            this.context.emit(EventType_1.default.FinalReachableStops, reachableStops);
        }
        for (const reachableStop of reachableStops) {
            if (reachableStop.duration > 0) {
                this.finalReachableStops[reachableStop.stop.id] = {
                    stop: toLocation,
                    duration: reachableStop.duration,
                };
            }
        }
        return true;
    }
};
CSAEarliestArrival2 = __decorate([
    inversify_1.injectable(),
    __param(0, inversify_1.inject(types_1.default.ConnectionsProvider)),
    __param(1, inversify_1.inject(types_1.default.LocationResolver)),
    __param(2, inversify_1.inject(types_1.default.ReachableStopsFinder)),
    __param(2, inversify_1.tagged("phase", ReachableStopsSearchPhase_1.default.Transfer)),
    __param(3, inversify_1.inject(types_1.default.ReachableStopsFinder)),
    __param(3, inversify_1.tagged("phase", ReachableStopsSearchPhase_1.default.Initial)),
    __param(4, inversify_1.inject(types_1.default.ReachableStopsFinder)),
    __param(4, inversify_1.tagged("phase", ReachableStopsSearchPhase_1.default.Final)),
    __param(5, inversify_1.inject(types_1.default.Context)),
    __metadata("design:paramtypes", [Object, Object, Object, Object, Object, Context_1.default])
], CSAEarliestArrival2);
exports.default = CSAEarliestArrival2;
//# sourceMappingURL=CSAEarliestArrival2.js.map