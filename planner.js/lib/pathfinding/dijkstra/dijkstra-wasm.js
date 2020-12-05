"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
const inversify_1 = require("inversify");
const wasm_dijkstra_1 = require("wasm-dijkstra");
let DijkstraWasm = class DijkstraWasm {
    constructor() {
        // todo, reimplement this
        this.contents = wasm_dijkstra_1.Graph.new();
    }
    addEdge(from, to, weight) {
        this.contents.add_edge(from, to, weight);
    }
    queryDuration(from, to) {
        return this.contents.query_distance(from, to);
    }
};
DijkstraWasm = __decorate([
    inversify_1.injectable()
], DijkstraWasm);
exports.DijkstraWasm = DijkstraWasm;
//# sourceMappingURL=dijkstra-wasm.js.map