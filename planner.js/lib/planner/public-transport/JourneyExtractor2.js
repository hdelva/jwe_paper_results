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
const types_1 = __importDefault(require("../../types"));
const Path_1 = __importDefault(require("../Path"));
const Step_1 = __importDefault(require("../Step"));
let JourneyExtractor2 = class JourneyExtractor2 {
    constructor(locationResolver, context) {
        this.locationResolver = locationResolver;
        this.context = context;
    }
    async extractJourneys(profilesByStop, query) {
        const path = Path_1.default.create();
        const departureStopId = query.from[0].id;
        let currentStopId = query.to[0].id;
        while (currentStopId !== departureStopId &&
            profilesByStop[currentStopId] &&
            profilesByStop[currentStopId].exitConnection) {
            const currentProfile = profilesByStop[currentStopId];
            const { enterConnection, exitConnection } = currentProfile;
            const promises = [
                this.locationResolver.resolve(enterConnection.departureStop),
                this.locationResolver.resolve(exitConnection.arrivalStop),
            ];
            const [enterLocation, exitLocation] = await Promise.all(promises);
            const arrivalTime = exitConnection.arrivalTime;
            const departureTime = enterConnection.departureTime;
            const duration = arrivalTime.getTime() - departureTime.getTime();
            const step = new Step_1.default(enterLocation, exitLocation, exitConnection.travelMode, { average: duration }, departureTime, arrivalTime, undefined, enterConnection.id, exitConnection.id);
            path.addStep(step);
            currentStopId = enterConnection.departureStop;
        }
        if (!path.steps.length) {
            return new asynciterator_1.EmptyIterator();
        }
        path.reverse();
        return new asynciterator_1.SingletonIterator(path);
    }
};
JourneyExtractor2 = __decorate([
    inversify_1.injectable(),
    __param(0, inversify_1.inject(types_1.default.LocationResolver)),
    __param(1, inversify_1.inject(types_1.default.Context)),
    __metadata("design:paramtypes", [Object, Context_1.default])
], JourneyExtractor2);
exports.default = JourneyExtractor2;
//# sourceMappingURL=JourneyExtractor2.js.map