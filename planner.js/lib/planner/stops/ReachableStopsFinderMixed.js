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
const d3_delaunay_1 = require("d3-delaunay");
const inversify_1 = require("inversify");
const types_1 = __importDefault(require("../../types"));
const Units_1 = __importDefault(require("../../util/Units"));
const Iterators_1 = __importDefault(require("../../util/Iterators"));
const EventBus_1 = __importDefault(require("../../events/EventBus"));
const __1 = require("../..");
let ReachableStopsFinderMixed = class ReachableStopsFinderMixed {
    constructor(stopsProvider, footpathsProvider, roadplanner) {
        this.stopsProvider = stopsProvider;
        this.footpathsProvider = footpathsProvider;
        this.roadPlanner = roadplanner;
    }
    async findReachableStops(sourceOrTargetStop, mode, maximumDuration, minimumSpeed, profileID) {
        if (!this.triangles) {
            this.prepare();
        }
        const reachableStops = [{ stop: sourceOrTargetStop, duration: 0 }];
        const [footpaths, neighbors] = await Promise.all([
            this.footpathsProvider.get(sourceOrTargetStop), this.getConnectedStops(sourceOrTargetStop),
        ]);
        const precomputed = {};
        for (const footpath of Object.values(footpaths)) {
            let otherStop;
            if (sourceOrTargetStop.id === footpath.from) {
                otherStop = await this.stopsProvider.getStopById(footpath.to);
            }
            else if (sourceOrTargetStop.id === footpath.to) {
                otherStop = await this.stopsProvider.getStopById(footpath.from);
            }
            if (otherStop) {
                const duration = Units_1.default.toDuration(footpath.distance, minimumSpeed);
                precomputed[otherStop.id] = { stop: otherStop, duration, id: footpath.id };
            }
        }
        for (const neighbor of neighbors) {
            if (precomputed[neighbor.id]) {
                reachableStops.push(precomputed[neighbor.id]);
                EventBus_1.default.getInstance().emit(__1.EventType.ReachableStop, sourceOrTargetStop, neighbor);
            }
            else {
                const query = {
                    from: [sourceOrTargetStop],
                    to: [neighbor],
                    profileID,
                };
                const pathIterator = await this.roadPlanner.plan(query);
                const durationIterator = pathIterator.map((path) => 
                // Minimum speed is passed so sum max duration over all steps
                path.legs.reduce((totalDuration, leg) => totalDuration + leg.getMaximumDuration(), 0));
                const durations = await Iterators_1.default.toArray(durationIterator);
                if (durations.length) {
                    const shortestDuration = Math.min(...durations);
                    reachableStops.push({ stop: neighbor, duration: shortestDuration });
                }
                EventBus_1.default.getInstance().emit(__1.EventType.ReachableStop, sourceOrTargetStop, neighbor, true);
            }
        }
        return reachableStops;
    }
    async getConnectedStops(start) {
        const triangles = await this.triangles;
        const index = this.triangleIndices[start.id];
        const neighbors = triangles.neighbors(index);
        return neighbors.map((neighborIndex) => this.trianglePoints[neighborIndex]);
    }
    async prepare() {
        this.triangles = this.stopsProvider.getAllStops().then((stops) => {
            this.trianglePoints = stops;
            function getX(p) {
                return p.longitude;
            }
            function getY(p) {
                return p.latitude;
            }
            let i = 0;
            for (const stop of stops) {
                this.triangleIndices[stop.id] = i;
                i++;
            }
            return d3_delaunay_1.Delaunay.from(stops, getX, getY);
        });
    }
};
ReachableStopsFinderMixed = __decorate([
    inversify_1.injectable(),
    __param(0, inversify_1.inject(types_1.default.StopsProvider)),
    __param(1, inversify_1.inject(types_1.default.FootpathsProvider)),
    __param(2, inversify_1.inject(types_1.default.RoadPlanner)),
    __metadata("design:paramtypes", [Object, Object, Object])
], ReachableStopsFinderMixed);
exports.default = ReachableStopsFinderMixed;
//# sourceMappingURL=ReachableStopsFinderMixed.js.map