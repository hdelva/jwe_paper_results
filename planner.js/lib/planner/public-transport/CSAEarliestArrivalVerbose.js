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
const inversify_1 = require("inversify");
const ReachableStopsSearchPhase_1 = __importDefault(require("../../enums/ReachableStopsSearchPhase"));
const EventBus_1 = __importDefault(require("../../events/EventBus"));
const EventType_1 = __importDefault(require("../../events/EventType"));
const types_1 = __importDefault(require("../../types"));
const CSAEarliestArrival_1 = __importDefault(require("./CSAEarliestArrival"));
let CSAEarliestArrivalVerbose = class CSAEarliestArrivalVerbose extends CSAEarliestArrival_1.default {
    constructor(connectionsProvider, locationResolver, transferReachableStopsFinder, initialReachableStopsFinder, finalReachableStopsFinder) {
        super(connectionsProvider, locationResolver, transferReachableStopsFinder, initialReachableStopsFinder, finalReachableStopsFinder);
    }
    updateProfile(state, query, connection) {
        super.updateProfile(state, query, connection);
        EventBus_1.default.getInstance().emit(EventType_1.default.ReachableLocation, this.locationResolver.resolve(connection.arrivalStop));
    }
};
CSAEarliestArrivalVerbose = __decorate([
    inversify_1.injectable(),
    __param(0, inversify_1.inject(types_1.default.ConnectionsProvider)),
    __param(1, inversify_1.inject(types_1.default.LocationResolver)),
    __param(2, inversify_1.inject(types_1.default.ReachableStopsFinder)),
    __param(2, inversify_1.tagged("phase", ReachableStopsSearchPhase_1.default.Transfer)),
    __param(3, inversify_1.inject(types_1.default.ReachableStopsFinder)),
    __param(3, inversify_1.tagged("phase", ReachableStopsSearchPhase_1.default.Initial)),
    __param(4, inversify_1.inject(types_1.default.ReachableStopsFinder)),
    __param(4, inversify_1.tagged("phase", ReachableStopsSearchPhase_1.default.Final)),
    __metadata("design:paramtypes", [Object, Object, Object, Object, Object])
], CSAEarliestArrivalVerbose);
exports.default = CSAEarliestArrivalVerbose;
//# sourceMappingURL=CSAEarliestArrivalVerbose.js.map