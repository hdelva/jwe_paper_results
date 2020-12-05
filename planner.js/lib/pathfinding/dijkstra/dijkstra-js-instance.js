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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const inversify_1 = require("inversify");
const tinyqueue_1 = __importDefault(require("tinyqueue"));
const graph_1 = __importDefault(require("../graph"));
let DijkstraInstance = class DijkstraInstance {
    constructor(graph) {
        this.useWeightedCost = true;
        this.graph = graph;
    }
    setUseWeightedCost(useWeightedCost) {
        this.useWeightedCost = useWeightedCost;
    }
    setBreakPoint(on, callback) {
        this.graph.setBreakPoint(on, callback);
    }
    removeBreakPoint(on) {
        this.graph.removeBreakPoint(on);
    }
    async queryPath(from, to, maxDistance = Infinity) {
        let queue;
        if (this.useWeightedCost) {
            queue = new tinyqueue_1.default([], (a, b) => a.cost - b.cost);
        }
        else {
            queue = new tinyqueue_1.default([], (a, b) => a.duration - b.duration);
        }
        this.costs = [...Array(this.graph.getAdjacencyList().length)].fill(Infinity);
        this.previousNodes = [...Array(this.graph.getAdjacencyList().length)].fill(undefined);
        const fromIndex = this.graph.getNodeIndex(from);
        this.setCost(fromIndex, 0);
        queue.push({ distance: 0, duration: 0, cost: 0, position: fromIndex });
        const toIndex = this.graph.getNodeIndex(to);
        while (queue.length) {
            const { duration, distance, cost, position } = queue.pop();
            if (distance > maxDistance) {
                // avoid hopeless searches
                break;
            }
            if (position === toIndex) {
                // it is done, break the loop and start reconstructing the path
                break;
            }
            if (cost > this.getCost(position)) {
                // we have already found a better way
                continue;
            }
            if (this.graph.getBreakPoint(position)) {
                await this.graph.getBreakPoint(position)(this.graph.getLabel(position));
            }
            for (const edge of this.graph.getAdjacencyList()[position]) {
                const next = {
                    distance: distance + edge.distance,
                    duration: duration + edge.duration,
                    cost: cost + edge.cost,
                    position: edge.node,
                };
                if (next.cost < this.getCost(next.position)) {
                    this.setCost(next.position, next.cost);
                    this.previousNodes[next.position] = position;
                    queue.push(next);
                }
            }
        }
        let currentPosition = toIndex;
        const steps = [];
        // reconstruct the path
        while (this.previousNodes[currentPosition]) {
            let nextEdge;
            let nextPositionCost = Infinity;
            for (const edge of this.graph.getReverseAdjacencyList()[currentPosition]) {
                if (this.getCost(edge.node) < nextPositionCost) {
                    nextPositionCost = this.getCost(edge.node);
                    nextEdge = edge;
                }
            }
            if (!nextEdge) {
                break;
            }
            steps.push({
                from: this.graph.getLabel(nextEdge.node),
                to: this.graph.getLabel(currentPosition),
                distance: nextEdge.distance,
                duration: nextEdge.duration,
            });
            currentPosition = nextEdge.node;
        }
        return steps.reverse();
    }
    setCost(position, cost) {
        if (position >= this.costs.length) {
            const missingCosts = this.graph.getAdjacencyList().length - this.costs.length;
            this.costs = this.costs.concat([...Array(missingCosts)].fill(Infinity));
            this.previousNodes = this.previousNodes.concat([...Array(missingCosts)].fill(undefined));
        }
        this.costs[position] = cost;
    }
    getCost(position) {
        if (position >= this.costs.length) {
            const missingCosts = this.graph.getAdjacencyList().length - this.costs.length;
            this.costs = this.costs.concat([...Array(missingCosts)].fill(Infinity));
            this.previousNodes = this.previousNodes.concat([...Array(missingCosts)].fill(undefined));
        }
        return this.costs[position];
    }
};
DijkstraInstance = __decorate([
    inversify_1.injectable(),
    __metadata("design:paramtypes", [graph_1.default])
], DijkstraInstance);
exports.DijkstraInstance = DijkstraInstance;
//# sourceMappingURL=dijkstra-js-instance.js.map