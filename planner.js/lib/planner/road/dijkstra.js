"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const node_dijkstra_1 = __importDefault(require("node-dijkstra"));
const TravelMode_1 = __importDefault(require("../../enums/TravelMode"));
const Geo_1 = __importDefault(require("../../util/Geo"));
const Units_1 = __importDefault(require("../../util/Units"));
const Path_1 = __importDefault(require("../Path"));
class Dijkstra {
    constructor(tileset, minspeed, maxSpeed) {
        this.edgeGraph = new node_dijkstra_1.default(tileset.getEdgeGraph().contents);
        this.tileset = tileset;
        this.minSpeed = minspeed;
        this.maxSpeed = maxSpeed;
    }
    path(start, stop) {
        const steps = [];
        const nodes = this.tileset.getNodes();
        const pathNodes = this.edgeGraph.path(start.id, stop.id);
        if (pathNodes && pathNodes.length) {
            for (let i = 0; i < pathNodes.length - 1; i++) {
                const from = nodes[pathNodes[i]];
                const to = nodes[pathNodes[i + 1]];
                const distance = Geo_1.default.getDistanceBetweenLocations(from, to);
                const minDuration = Units_1.default.toDuration(distance, this.maxSpeed);
                const maxDuration = Units_1.default.toDuration(distance, this.minSpeed);
                const duration = {
                    minimum: minDuration,
                    maximum: maxDuration,
                    average: (minDuration + maxDuration) / 2,
                };
                const step = {
                    startLocation: from,
                    stopLocation: to,
                    distance,
                    duration,
                    travelMode: TravelMode_1.default.Walking,
                };
                steps.push(step);
            }
        }
        return new Path_1.default(steps);
    }
}
exports.default = Dijkstra;
//# sourceMappingURL=dijkstra.js.map