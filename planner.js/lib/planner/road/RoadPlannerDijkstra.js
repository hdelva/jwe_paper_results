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
const TravelMode_1 = __importDefault(require("../../enums/TravelMode"));
const Geo_1 = __importDefault(require("../../util/Geo"));
const Units_1 = __importDefault(require("../../util/Units"));
const types_1 = __importDefault(require("../../types"));
const Context_1 = __importDefault(require("../../Context"));
const tiles_in_bbox_1 = __importDefault(require("tiles-in-bbox"));
const coordinate_1 = require("../../entities/tiles/coordinate");
const dijkstra_1 = __importDefault(require("./dijkstra"));
let RoadPlannerDijkstra = class RoadPlannerDijkstra {
    constructor(tileProvider, context) {
        this.tileProvider = tileProvider;
        this.context = context;
    }
    async plan(query) {
        const { from: fromLocations, to: toLocations, minimumWalkingSpeed, maximumWalkingSpeed, } = query;
        let paths = [];
        if (fromLocations && toLocations && fromLocations.length && toLocations.length) {
            for (const from of fromLocations) {
                for (const to of toLocations) {
                    const newPaths = await this.getPathBetweenLocations(from, to, minimumWalkingSpeed, maximumWalkingSpeed);
                    if (newPaths) {
                        paths = paths.concat(newPaths);
                    }
                }
            }
        }
        return new asynciterator_1.ArrayIterator(paths);
    }
    async getPathBetweenLocations(from, to, minWalkingSpeed, maxWalkingSpeed) {
        console.log(`${from.id} --> ${to.id}`);
        const padding = 0.02;
        const zoom = 14;
        const fromBBox = {
            top: from.latitude + padding,
            bottom: from.latitude - padding,
            left: from.longitude - padding,
            right: from.longitude + padding,
        };
        const toBBox = {
            top: to.latitude + padding,
            bottom: to.latitude - padding,
            left: to.longitude - padding,
            right: to.longitude + padding,
        };
        const betweenBBox = {
            top: Math.max(fromBBox.top, toBBox.top),
            bottom: Math.min(fromBBox.bottom, toBBox.bottom),
            left: Math.min(fromBBox.left, toBBox.left),
            right: Math.max(fromBBox.right, toBBox.right),
        };
        const fromTileCoords = tiles_in_bbox_1.default.tilesInBbox(fromBBox, zoom).map((obj) => {
            return new coordinate_1.RoutableTileCoordinate(zoom, obj.x, obj.y);
        });
        const toTileCoords = tiles_in_bbox_1.default.tilesInBbox(toBBox, zoom).map((obj) => {
            return new coordinate_1.RoutableTileCoordinate(zoom, obj.x, obj.y);
        });
        const betweenTileCoords = tiles_in_bbox_1.default.tilesInBbox(betweenBBox, zoom).map((obj) => {
            return new coordinate_1.RoutableTileCoordinate(zoom, obj.x, obj.y);
        });
        const [fromTileset, toTileset, betweenTileset] = await Promise.all([
            this.tileProvider.getMultipleByTileCoords(fromTileCoords),
            this.tileProvider.getMultipleByTileCoords(toTileCoords),
            this.tileProvider.getMultipleByTileCoords(betweenTileCoords)
        ]);
        const fromPaths = this.embedLocation(from, fromTileset, minWalkingSpeed, maxWalkingSpeed);
        const toPaths = this.embedLocation(to, toTileset, minWalkingSpeed, maxWalkingSpeed, true);
        const route = new dijkstra_1.default(betweenTileset, minWalkingSpeed, maxWalkingSpeed);
        const result = [];
        for (const fromPath of fromPaths) {
            for (const toPath of toPaths) {
                const node1 = fromPath.steps[fromPath.steps.length - 1].stopLocation;
                const node2 = toPath.steps[toPath.steps.length - 2].startLocation;
                const path = route.path(node1, node2);
                if (path && path.steps.length) {
                    let totalPath = fromPath.steps.concat(path.steps);
                    totalPath = totalPath.concat(toPath.steps);
                    result.push({ steps: totalPath });
                }
            }
        }
        return result;
    }
    createStep(from, to, distance, minSpeed, maxSpeed) {
        const minDuration = Units_1.default.toDuration(distance, maxSpeed);
        const maxDuration = Units_1.default.toDuration(distance, minSpeed);
        const duration = {
            minimum: minDuration,
            maximum: maxDuration,
            average: (minDuration + maxDuration) / 2,
        };
        return {
            startLocation: from,
            stopLocation: to,
            distance,
            duration,
            travelMode: TravelMode_1.default.Walking,
        };
    }
    embedLocation(p, tileset, minSpeed, maxSpeed, invert = false) {
        let bestDistance = Infinity;
        let paths;
        for (const way of Object.values(tileset.getWays())) {
            if (way.reachable === false) {
                continue;
            }
            for (const segment of way.segments) {
                for (let i = 0; i < segment.length - 1; i++) {
                    const nodeA = segment[i];
                    const from = tileset.getNodes()[nodeA];
                    const nodeB = segment[i + 1];
                    const to = tileset.getNodes()[nodeB];
                    if (!from || !to) {
                        let x = 9;
                        continue;
                    }
                    const [distance, intersection] = this.segmentDistToPoint(from, to, p);
                    if (distance < bestDistance) {
                        bestDistance = distance;
                        if (invert) {
                            const intersectionStep = this.createStep(intersection, p, distance, minSpeed, maxSpeed);
                            const stepA = this.createStep(from, intersection, Geo_1.default.getDistanceBetweenLocations(intersection, from), minSpeed, maxSpeed);
                            const stepB = this.createStep(to, intersection, Geo_1.default.getDistanceBetweenLocations(intersection, from), minSpeed, maxSpeed);
                            paths = [
                                { steps: [stepA, intersectionStep] },
                                { steps: [stepB, intersectionStep] },
                            ];
                        }
                        else {
                            const intersectionStep = this.createStep(p, intersection, distance, minSpeed, maxSpeed);
                            const stepA = this.createStep(intersection, from, Geo_1.default.getDistanceBetweenLocations(intersection, from), minSpeed, maxSpeed);
                            const stepB = this.createStep(intersection, to, Geo_1.default.getDistanceBetweenLocations(intersection, from), minSpeed, maxSpeed);
                            paths = [
                                { steps: [intersectionStep, stepA] },
                                { steps: [intersectionStep, stepB] },
                            ];
                        }
                    }
                }
            }
        }
        return paths;
    }
    segmentDistToPoint(segA, segB, p) {
        // seems numerically unstable, see 'catastrophic cancellation'
        if (!segA) {
            let x = 9;
        }
        const sx1 = segA.longitude;
        const sx2 = segB.longitude;
        const px = p.longitude;
        const sy1 = segA.latitude;
        const sy2 = segB.latitude;
        const py = p.latitude;
        const px2 = sx2 - sx1;
        const py2 = sy2 - sy2;
        const norm = px2 * px2 + py2 * py2;
        let u = ((px - sx1) * px2 + (py - sy1) * py2) / norm;
        if (u > 1) {
            u = 1;
        }
        else if (u < 0) {
            u = 0;
        }
        const x = sx1 + u * px2;
        const y = sy1 + u * py2;
        const intersection = {
            longitude: x,
            latitude: y,
        };
        const dist = Geo_1.default.getDistanceBetweenLocations(p, intersection);
        return [dist, intersection];
    }
};
RoadPlannerDijkstra = __decorate([
    inversify_1.injectable(),
    __param(0, inversify_1.inject(types_1.default.RoutableTileProvider)),
    __param(1, inversify_1.inject(types_1.default.Context)),
    __metadata("design:paramtypes", [Object, Context_1.default])
], RoadPlannerDijkstra);
exports.default = RoadPlannerDijkstra;
//# sourceMappingURL=RoadPlannerDijkstra.js.map