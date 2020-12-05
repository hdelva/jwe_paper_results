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
const tiles_in_bbox_1 = __importDefault(require("tiles-in-bbox"));
const RoutableTileRegistry_1 = __importDefault(require("../../entities/tiles/RoutableTileRegistry"));
const TileCoordinate_1 = __importDefault(require("../../entities/tiles/TileCoordinate"));
const RoutingPhase_1 = __importDefault(require("../../enums/RoutingPhase"));
const TravelMode_1 = __importDefault(require("../../enums/TravelMode"));
const EventBus_1 = __importDefault(require("../../events/EventBus"));
const EventType_1 = __importDefault(require("../../events/EventType"));
const PathfinderProvider_1 = __importDefault(require("../../pathfinding/PathfinderProvider"));
const types_1 = __importDefault(require("../../types"));
const Geo_1 = __importDefault(require("../../util/Geo"));
const Tiles_1 = require("../../util/Tiles");
const Leg_1 = __importDefault(require("../Leg"));
const Path_1 = __importDefault(require("../Path"));
let RoadPlannerPathfindingExperimental = class RoadPlannerPathfindingExperimental {
    constructor(baseTileProvider, transitTileProvider, pathfinderProvider, profileProvider, locationResolver) {
        this.baseTileProvider = baseTileProvider;
        this.transitTileProvider = transitTileProvider;
        this.pathfinderProvider = pathfinderProvider;
        this.profileProvider = profileProvider;
        this.locationResolver = locationResolver;
        this.registry = RoutableTileRegistry_1.default.getInstance();
        this.eventBus = EventBus_1.default.getInstance();
        this.reachedTiles = new Set();
    }
    async plan(query) {
        const { from: fromLocations, to: toLocations, profileID, } = query;
        const paths = [];
        const profile = await this.profileProvider.getProfile(profileID);
        if (fromLocations && toLocations && fromLocations.length && toLocations.length) {
            for (const from of fromLocations) {
                for (const to of toLocations) {
                    const newPath = await this.getPathBetweenLocations(from, to, profile);
                    if (newPath) {
                        paths.push(newPath);
                    }
                }
            }
        }
        return new asynciterator_1.ArrayIterator(paths);
    }
    async getPathBetweenLocations(from, to, profile) {
        this.localTiles = [
            Tiles_1.toTileCoordinate(from.latitude, from.longitude),
            Tiles_1.toTileCoordinate(to.latitude, to.longitude),
        ];
        await Promise.all([
            this.embedLocation(from),
            this.embedLocation(to, true),
        ]);
        return this._innerPath(from, to, profile);
    }
    async _innerPath(start, stop, profile) {
        const pathfinder = await this.pathfinderProvider.getShortestPathAlgorithm(profile);
        const maxDistance = Geo_1.default.getDistanceBetweenLocations(start, stop) * 5;
        const path = await pathfinder.queryPath(Geo_1.default.getId(start), Geo_1.default.getId(stop), maxDistance);
        const steps = [];
        for (const step of path) {
            const to = await this.locationResolver.resolve(step.to);
            const from = await this.locationResolver.resolve(step.from);
            steps.push({
                startLocation: from,
                stopLocation: to,
                duration: { average: step.duration },
                distance: step.distance,
            });
        }
        const leg = new Leg_1.default(TravelMode_1.default.Profile, steps);
        return new Path_1.default([leg]);
    }
    pickTile(node) {
        let coordinate;
        for (let zoom = 8; zoom < 15; zoom++) {
            coordinate = Tiles_1.toTileCoordinate(node.latitude, node.longitude, zoom);
            let ok = true;
            for (const localTile of this.localTiles) {
                if (coordinate.contains(localTile)) {
                    ok = false;
                    break;
                }
            }
            if (ok) {
                return coordinate;
            }
        }
        return coordinate;
    }
    async fetchTile(coordinate) {
        let local = false;
        for (const localTile of this.localTiles) {
            if (coordinate.x === localTile.x && coordinate.y === localTile.y && coordinate.zoom === localTile.zoom) {
                local = true;
                break;
            }
        }
        const baseTileId = this.baseTileProvider.getIdForTileCoords(coordinate);
        const transitTileId = this.transitTileProvider.getIdForTileCoords(coordinate);
        if (!this.reachedTiles.has(transitTileId) && !this.reachedTiles.has(baseTileId)) {
            this.eventBus.emit(EventType_1.default.ReachableTile, coordinate);
            let tile;
            if (local) {
                tile = await this.baseTileProvider.getByTileCoords(coordinate);
                this.reachedTiles.add(baseTileId);
                this.reachedTiles.add(transitTileId);
            }
            else {
                tile = await this.transitTileProvider.getByTileCoords(coordinate);
                this.reachedTiles.add(transitTileId);
            }
            const boundaryNodes = new Set();
            for (const nodeId of tile.getNodes()) {
                const node = this.registry.getNode(nodeId);
                if (!tile.contains(node)) {
                    boundaryNodes.add(nodeId);
                }
            }
            const self = this;
            for (const profile of await this.profileProvider.getProfiles()) {
                const graph = this.pathfinderProvider.getGraphForProfile(profile);
                for (const nodeId of boundaryNodes) {
                    graph.setBreakPoint(nodeId, async (on) => {
                        const node = self.registry.getNode(on);
                        const boundaryTileCoordinate = this.pickTile(node);
                        await self.fetchTile(boundaryTileCoordinate);
                    });
                }
            }
        }
    }
    async embedLocation(from, invert = false) {
        const zoom = 14;
        const padding = 0.005;
        const fromBBox = {
            top: from.latitude + padding,
            bottom: from.latitude - padding,
            left: from.longitude - padding,
            right: from.longitude + padding,
        };
        const fromTileCoords = tiles_in_bbox_1.default.tilesInBbox(fromBBox, zoom).map((obj) => {
            const coordinate = new TileCoordinate_1.default(zoom, obj.x, obj.y);
            this.fetchTile(coordinate);
            return coordinate;
        });
        // this won't download anything new
        // but we need the tile data to embed the starting location
        const fromTileset = await this.baseTileProvider.getMultipleByTileCoords(fromTileCoords);
        await this.pathfinderProvider.embedLocation(from, fromTileset, invert);
    }
};
RoadPlannerPathfindingExperimental = __decorate([
    inversify_1.injectable(),
    __param(0, inversify_1.inject(types_1.default.RoutableTileProvider)),
    __param(0, inversify_1.tagged("phase", RoutingPhase_1.default.Base)),
    __param(1, inversify_1.inject(types_1.default.RoutableTileProvider)),
    __param(1, inversify_1.tagged("phase", RoutingPhase_1.default.Transit)),
    __param(2, inversify_1.inject(types_1.default.PathfinderProvider)),
    __param(3, inversify_1.inject(types_1.default.ProfileProvider)),
    __param(4, inversify_1.inject(types_1.default.LocationResolver)),
    __metadata("design:paramtypes", [Object, Object, PathfinderProvider_1.default, Object, Object])
], RoadPlannerPathfindingExperimental);
exports.default = RoadPlannerPathfindingExperimental;
//# sourceMappingURL=RoadPlannerPathfindingExperimental.js.map