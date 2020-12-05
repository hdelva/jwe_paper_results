"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class RoutableTileEdgeGraph {
    constructor(nodes) {
        this.contents = {};
        for (const id of Object.keys(nodes)) {
            this.contents[id] = {};
        }
    }
    addEdge(from, to, weight) {
        if (weight === 0) {
            weight = 0.00001; // fucking duplicate nodes
        }
        this.contents[from][to] = weight;
        this.contents[to][from] = weight;
    }
    addGraph(other) {
        for (const kv1 of Object.entries(other.contents)) {
            const [from, weights] = kv1;
            for (const kv2 of Object.entries(weights)) {
                const [to, weight] = kv2;
                this.addEdge(to, from, weight);
            }
        }
    }
}
exports.RoutableTileEdgeGraph = RoutableTileEdgeGraph;
//# sourceMappingURL=graph.js.map