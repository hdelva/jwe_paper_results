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
const events_1 = require("events");
const inversify_1 = require("inversify");
const DropOffType_1 = __importDefault(require("../../enums/DropOffType"));
const PickupType_1 = __importDefault(require("../../enums/PickupType"));
const ReachableStopsFinderMode_1 = __importDefault(require("../../enums/ReachableStopsFinderMode"));
const ReachableStopsSearchPhase_1 = __importDefault(require("../../enums/ReachableStopsSearchPhase"));
const EventType_1 = __importDefault(require("../../events/EventType"));
const types_1 = __importDefault(require("../../types"));
const Geo_1 = __importDefault(require("../../util/Geo"));
const Vectors_1 = __importDefault(require("../../util/Vectors"));
const Profile_1 = __importDefault(require("./CSA/data-structure/stops/Profile"));
const EarliestArrivalByTransfers_1 = __importDefault(require("./CSA/data-structure/trips/EarliestArrivalByTransfers"));
const ProfileUtil_1 = __importDefault(require("./CSA/util/ProfileUtil"));
const JourneyExtractorProfile_1 = __importDefault(require("./JourneyExtractorProfile"));
/**
 * An implementation of the Profile Connection Scan Algorithm.
 * The profile connection scan algorithm takes the amount of transfers and initial, transfer and final footpaths
 * into account.
 *
 * @implements [[IPublicTransportPlanner]]
 * @property profilesByStop Describes the CSA profiles for each scanned stop.
 * @property earliestArrivalByTrip Describes the earliest arrival time for each scanned trip.
 * @property durationToTargetByStop Describes the walking duration to the target stop for a scanned stop.
 * @property gtfsTripByConnection Stores the gtfs:trip's a connection is part of. Used for splitting and joining.
 *
 * @returns multiple [[IPath]]s that consist of several [[IStep]]s.
 */
let CSAProfile2 = class CSAProfile2 {
    constructor(connectionsProvider, locationResolver, initialReachableStopsFinder, transferReachableStopsFinder, finalReachableStopsFinder, eventBus) {
        this.initialReachableStops = [];
        this.profilesByStop = {}; // S
        this.earliestArrivalByTrip = {}; // T
        this.durationToTargetByStop = {};
        this.gtfsTripByConnection = {};
        this.connectionsProvider = connectionsProvider;
        this.locationResolver = locationResolver;
        this.initialReachableStopsFinder = initialReachableStopsFinder;
        this.transferReachableStopsFinder = transferReachableStopsFinder;
        this.finalReachableStopsFinder = finalReachableStopsFinder;
        this.journeyExtractor = new JourneyExtractorProfile_1.default(locationResolver, eventBus);
        this.eventBus = eventBus;
    }
    async plan(query) {
        this.setBounds(query);
        return this.calculateJourneys(query);
    }
    setBounds(query) {
        const { minimumDepartureTime: lowerBoundDate, maximumArrivalTime: upperBoundDate, } = query;
        this.connectionsProvider.setIteratorOptions({
            backward: true,
            upperBoundDate,
            lowerBoundDate,
        });
    }
    async calculateJourneys(query) {
        const hasInitialReachableStops = await this.initDurationToTargetByStop(query);
        const hasFinalReachableStops = await this.initInitialReachableStops(query);
        if (!hasInitialReachableStops || !hasFinalReachableStops) {
            return Promise.resolve(new asynciterator_1.ArrayIterator([]));
        }
        this.connectionsIterator = this.connectionsProvider.createIterator();
        const self = this;
        return new Promise((resolve, reject) => {
            let isDone = false;
            const done = () => {
                if (!isDone) {
                    self.connectionsIterator.close();
                    self.journeyExtractor.extractJourneys(self.profilesByStop, query)
                        .then((resultIterator) => {
                        resolve(resultIterator);
                    });
                    isDone = true;
                }
            };
            this.connectionsIterator.on("readable", () => self.processNextConnection(query, done));
            this.connectionsIterator.on("end", () => done());
        });
    }
    async processNextConnection(query, done) {
        let connection = this.connectionsIterator.read();
        while (connection) {
            if (connection.arrivalTime > query.maximumArrivalTime && !this.connectionsIterator.closed) {
                connection = this.connectionsIterator.read();
                continue;
            }
            if (connection.departureTime < query.minimumDepartureTime) {
                this.connectionsIterator.close();
                done();
                break;
            }
            if (this.eventBus) {
                this.eventBus.emit(EventType_1.default.ConnectionScan, connection);
            }
            this.discoverConnection(query, connection);
            const earliestArrivalTime = this.calculateEarliestArrivalTime(query, connection);
            this.updateEarliestArrivalByTrip(connection, earliestArrivalTime);
            if (!this.isDominated(connection, earliestArrivalTime) &&
                this.hasValidRoute(query, earliestArrivalTime, connection.departureTime.getTime())) {
                await this.getFootpathsForDepartureStop(query, connection, earliestArrivalTime);
            }
            if (!this.connectionsIterator.closed) {
                connection = this.connectionsIterator.read();
                continue;
            }
            connection = undefined;
        }
    }
    hasValidRoute(query, arrivalTimeByTransfers, departureTime) {
        if (!query.maximumTravelDuration) {
            return true;
        }
        for (const arrival of arrivalTimeByTransfers) {
            const isValid = arrival.arrivalTime - departureTime <= query.maximumTravelDuration;
            if (isValid) {
                return true;
            }
        }
        return false;
    }
    discoverConnection(query, connection) {
        this.gtfsTripByConnection[connection.id] = connection["gtfs:trip"];
        if (!this.profilesByStop[connection.departureStop]) {
            this.profilesByStop[connection.departureStop] = [Profile_1.default.create(query.maximumTransfers)];
        }
        if (!this.profilesByStop[connection.arrivalStop]) {
            this.profilesByStop[connection.arrivalStop] = [Profile_1.default.create(query.maximumTransfers)];
        }
        if (!this.earliestArrivalByTrip[connection["gtfs:trip"]]) {
            this.earliestArrivalByTrip[connection["gtfs:trip"]] = EarliestArrivalByTransfers_1.default.create(query.maximumTransfers);
        }
    }
    getTripIdsFromConnection(connection) {
        const tripIds = [connection["gtfs:trip"]];
        if (!connection.nextConnection) {
            return tripIds;
        }
        for (const connectionId of connection.nextConnection) {
            const tripId = this.gtfsTripByConnection[connectionId];
            if (tripIds.indexOf(tripId) === -1 && tripId) {
                tripIds.push(tripId);
            }
        }
        return tripIds;
    }
    calculateEarliestArrivalTime(query, connection) {
        const remainSeatedTime = this.remainSeated(query, connection);
        if (connection["gtfs:dropOffType"] === DropOffType_1.default.NotAvailable) {
            return remainSeatedTime;
        }
        const walkToTargetTime = this.walkToTarget(query, connection);
        const takeTransferTime = this.takeTransfer(query, connection);
        return Vectors_1.default.minVector((c) => c.arrivalTime, walkToTargetTime, remainSeatedTime, takeTransferTime);
    }
    async initDurationToTargetByStop(query) {
        const arrivalStop = query.to[0];
        const geoId = Geo_1.default.getId(query.to[0]);
        if (!query.to[0].id) {
            query.to[0].id = geoId;
            query.to[0].name = "Arrival location";
        }
        const reachableStops = await this.finalReachableStopsFinder
            .findReachableStops(arrivalStop, ReachableStopsFinderMode_1.default.Target, query.maximumWalkingDuration, query.minimumWalkingSpeed, query.profileID);
        if (reachableStops.length < 1) {
            if (this.eventBus) {
                this.eventBus.emit(EventType_1.default.AbortQuery, "No reachable stops at arrival location");
            }
            return false;
        }
        if (this.eventBus) {
            this.eventBus.emit(EventType_1.default.FinalReachableStops, reachableStops);
        }
        for (const reachableStop of reachableStops) {
            if (reachableStop.duration === 0) {
                query.to[0] = reachableStop.stop;
            }
            this.durationToTargetByStop[reachableStop.stop.id] = reachableStop.duration;
        }
        return true;
    }
    async initInitialReachableStops(query) {
        const fromLocation = query.from[0];
        const geoId = Geo_1.default.getId(query.from[0]);
        if (!query.from[0].id) {
            query.from[0].id = geoId;
            query.from[0].name = "Departure location";
        }
        this.initialReachableStops = await this.initialReachableStopsFinder.findReachableStops(fromLocation, ReachableStopsFinderMode_1.default.Source, query.maximumWalkingDuration, query.minimumWalkingSpeed, query.profileID);
        for (const reachableStop of this.initialReachableStops) {
            if (reachableStop.duration === 0) {
                query.from[0] = reachableStop.stop;
            }
        }
        if (this.initialReachableStops.length < 1) {
            if (this.eventBus) {
                this.eventBus.emit(EventType_1.default.AbortQuery, "No reachable stops at departure location");
            }
            return false;
        }
        if (this.eventBus) {
            this.eventBus.emit(EventType_1.default.InitialReachableStops, this.initialReachableStops);
        }
        return true;
    }
    walkToTarget(query, connection) {
        const walkingTimeToTarget = this.durationToTargetByStop[connection.arrivalStop];
        if (walkingTimeToTarget === undefined || connection["gtfs:dropOfType"] === "gtfs:NotAvailable" ||
            connection.arrivalTime.getTime() + walkingTimeToTarget > query.maximumArrivalTime.getTime()) {
            return Array(query.maximumTransfers + 1).fill({
                "arrivalTime": Infinity,
                "gtfs:trip": connection["gtfs:trip"],
            });
        }
        return Array(query.maximumTransfers + 1).fill({
            "arrivalTime": connection.arrivalTime.getTime() + walkingTimeToTarget,
            "gtfs:trip": connection["gtfs:trip"],
        });
    }
    remainSeated(query, connection) {
        const tripIds = this.getTripIdsFromConnection(connection);
        const earliestArrivalTimeByTransfers = [];
        for (let amountOfTransfers = 0; amountOfTransfers < query.maximumTransfers + 1; amountOfTransfers++) {
            const earliestArrivalTime = earliestArrivalTimeByTransfers[amountOfTransfers];
            let minimumArrivalTime = earliestArrivalTime && earliestArrivalTime.arrivalTime;
            for (const tripId of tripIds) {
                const tripArrivalTime = this.earliestArrivalByTrip[tripId][amountOfTransfers].arrivalTime;
                if (!minimumArrivalTime || tripArrivalTime < minimumArrivalTime) {
                    earliestArrivalTimeByTransfers[amountOfTransfers] = {
                        arrivalTime: tripArrivalTime,
                        tripId,
                    };
                    minimumArrivalTime = tripArrivalTime;
                }
            }
        }
        return earliestArrivalTimeByTransfers;
    }
    takeTransfer(query, connection) {
        const transferTimes = ProfileUtil_1.default.getTransferTimes(this.profilesByStop, connection, query.maximumTransfers, query.minimumTransferDuration, query.maximumTransferDuration);
        return Vectors_1.default.shiftVector(transferTimes, { "arrivalTime": Infinity, "gtfs:trip": connection["gtfs:trip"] });
    }
    updateEarliestArrivalByTrip(connection, arrivalTimeByTransfers) {
        const tripIds = this.getTripIdsFromConnection(connection);
        const earliestArrivalByTransfers = arrivalTimeByTransfers.map((arrivalTime, amountOfTransfers) => {
            const tripId = arrivalTime["gtfs:trip"];
            return this.earliestArrivalByTrip[tripId][amountOfTransfers];
        });
        for (const tripId of tripIds) {
            this.earliestArrivalByTrip[tripId] = EarliestArrivalByTransfers_1.default.createByConnection(earliestArrivalByTransfers, connection, arrivalTimeByTransfers);
        }
    }
    isDominated(connection, arrivalTimeByTransfers) {
        const departureProfile = this.profilesByStop[connection.departureStop];
        const earliestProfileEntry = departureProfile[departureProfile.length - 1];
        return earliestProfileEntry.isDominated(arrivalTimeByTransfers, connection.departureTime.getTime());
    }
    async getFootpathsForDepartureStop(query, connection, currentArrivalTimeByTransfers) {
        const departureLocation = query.from[0];
        const depProfile = this.profilesByStop[connection.departureStop];
        const earliestProfileEntry = depProfile[depProfile.length - 1];
        const earliestArrivalTimeByTransfers = Vectors_1.default.minVector((c) => c.arrivalTime, currentArrivalTimeByTransfers, earliestProfileEntry.getArrivalTimeByTransfers());
        const initialReachableStop = this.initialReachableStops.find((reachable) => reachable.stop.id === connection.departureStop);
        if (initialReachableStop) {
            this.incorporateInProfile(query, connection, initialReachableStop.duration, departureLocation, earliestArrivalTimeByTransfers);
        }
        try {
            const departureStop = await this.locationResolver.resolve(connection.departureStop);
            const reachableStops = await this.transferReachableStopsFinder.findReachableStops(departureStop, ReachableStopsFinderMode_1.default.Source, query.maximumTransferDuration, query.minimumWalkingSpeed, query.profileID);
            reachableStops.forEach((reachableStop) => {
                if (reachableStop.stop.id !== departureLocation.id) {
                    this.incorporateInProfile(query, connection, reachableStop.duration, reachableStop.stop, earliestArrivalTimeByTransfers);
                }
            });
        }
        catch (e) {
            if (this.eventBus) {
                this.eventBus.emit(EventType_1.default.Warning, (e));
            }
        }
    }
    async emitTransferProfile(transferProfile, amountOfTransfers) {
        try {
            const departureStop = await this.locationResolver.resolve(transferProfile.enterConnection.departureStop);
            const arrivalStop = await this.locationResolver.resolve(transferProfile.exitConnection.arrivalStop);
            this.eventBus.emit(EventType_1.default.AddedNewTransferProfile, {
                departureStop,
                arrivalStop,
                amountOfTransfers,
            });
        }
        catch (e) {
            this.eventBus.emit(EventType_1.default.Warning, (e));
        }
    }
    incorporateInProfile(query, connection, duration, stop, arrivalTimeByTransfers) {
        const departureTime = connection.departureTime.getTime() - duration;
        const hasValidRoute = this.hasValidRoute(query, arrivalTimeByTransfers, departureTime);
        if (departureTime < query.minimumDepartureTime.getTime() || !hasValidRoute) {
            return;
        }
        let profilesByDepartureStop = this.profilesByStop[stop.id];
        if (!profilesByDepartureStop) {
            profilesByDepartureStop = this.profilesByStop[stop.id] = [Profile_1.default.create(query.maximumTransfers)];
        }
        const earliestDepTimeProfile = profilesByDepartureStop[profilesByDepartureStop.length - 1];
        // If arrival times for all numbers of legs are equal to the earliest entry, this
        // entry is redundant
        if (!earliestDepTimeProfile.isDominated(arrivalTimeByTransfers, departureTime)) {
            const currentTransferProfiles = earliestDepTimeProfile.transferProfiles;
            const transferProfiles = [];
            for (let amountOfTransfers = 0; amountOfTransfers < currentTransferProfiles.length; amountOfTransfers++) {
                const transferProfile = currentTransferProfiles[amountOfTransfers];
                const newTransferProfile = {
                    exitConnection: undefined,
                    enterConnection: undefined,
                    arrivalTime: Infinity,
                    departureTime: Infinity,
                };
                const possibleExitConnection = this.earliestArrivalByTrip[connection["gtfs:trip"]][amountOfTransfers].connection || connection;
                if (arrivalTimeByTransfers[amountOfTransfers].arrivalTime < transferProfile.arrivalTime &&
                    connection["gtfs:pickupType"] !== PickupType_1.default.NotAvailable &&
                    possibleExitConnection["gtfs:dropOfType"] !== DropOffType_1.default.NotAvailable) {
                    newTransferProfile.enterConnection = connection;
                    newTransferProfile.exitConnection = possibleExitConnection;
                    newTransferProfile.departureTime = departureTime;
                    if (this.eventBus && this.eventBus.listenerCount(EventType_1.default.AddedNewTransferProfile) > 0) {
                        this.emitTransferProfile(newTransferProfile, amountOfTransfers);
                    }
                }
                else {
                    newTransferProfile.enterConnection = transferProfile.enterConnection;
                    newTransferProfile.exitConnection = transferProfile.exitConnection;
                    newTransferProfile.departureTime = transferProfile.departureTime;
                }
                if (newTransferProfile.exitConnection && newTransferProfile.enterConnection) {
                    newTransferProfile.arrivalTime = arrivalTimeByTransfers[amountOfTransfers].arrivalTime;
                }
                transferProfiles.push(newTransferProfile);
            }
            const profileIsValid = transferProfiles.reduce((memo, { arrivalTime }) => memo || (arrivalTime && arrivalTime !== Infinity), false);
            if (!profileIsValid) {
                return;
            }
            const newProfile = Profile_1.default.createFromTransfers(departureTime, transferProfiles);
            let profileIndex = profilesByDepartureStop.length - 1;
            let earliestProfile = profilesByDepartureStop[profileIndex];
            if (earliestProfile.departureTime === Infinity) {
                profilesByDepartureStop[profileIndex] = newProfile;
            }
            else {
                while (profileIndex > 0 && earliestProfile.departureTime < departureTime) {
                    profilesByDepartureStop[profileIndex + 1] = earliestProfile;
                    profileIndex--;
                    earliestProfile = profilesByDepartureStop[profileIndex];
                }
                profilesByDepartureStop[profileIndex + 1] = newProfile;
            }
        }
    }
};
CSAProfile2 = __decorate([
    inversify_1.injectable(),
    __param(0, inversify_1.inject(types_1.default.ConnectionsProvider)),
    __param(1, inversify_1.inject(types_1.default.LocationResolver)),
    __param(2, inversify_1.inject(types_1.default.ReachableStopsFinder)),
    __param(2, inversify_1.tagged("phase", ReachableStopsSearchPhase_1.default.Initial)),
    __param(3, inversify_1.inject(types_1.default.ReachableStopsFinder)),
    __param(3, inversify_1.tagged("phase", ReachableStopsSearchPhase_1.default.Transfer)),
    __param(4, inversify_1.inject(types_1.default.ReachableStopsFinder)),
    __param(4, inversify_1.tagged("phase", ReachableStopsSearchPhase_1.default.Final)),
    __param(5, inversify_1.inject(types_1.default.EventBus)),
    __metadata("design:paramtypes", [Object, Object, Object, Object, Object, events_1.EventEmitter])
], CSAProfile2);
exports.default = CSAProfile2;
//# sourceMappingURL=CSAProfile2.js.map