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
var _a;
const inversify_1 = require("inversify");
const ldfetch_1 = __importDefault(require("ldfetch"));
const types_1 = __importDefault(require("../../../types"));
const Rdf_1 = __importDefault(require("../../../util/Rdf"));
let RoutableTileFetcherLDFetch = class RoutableTileFetcherLDFetch {
    constructor(ldFetch) {
        this.ldFetch = ldFetch;
    }
    setAccessUrl(accessUrl) {
        this.accessUrl = accessUrl;
    }
    prefetchTiles() {
        this.ensureTilesLoaded();
    }
    async getNodeById(stopId) {
        await this.ensureTilesLoaded();
        return this.nodes[stopId];
    }
    async getAllNodes() {
        await this.ensureTilesLoaded();
        return Object.values(this.nodes);
    }
    async getWayById(wayId) {
        await this.ensureTilesLoaded();
        return this.ways[wayId];
    }
    async getAllWays() {
        await this.ensureTilesLoaded();
        return Object.values(this.ways);
    }
    async ensureTilesLoaded() {
        if (!this.loadPromise && !this.nodes) {
            this.loadTiles();
        }
        if (this.loadPromise) {
            await this.loadPromise;
        }
    }
    loadTiles() {
        if (this.accessUrl) {
            this.loadPromise = this.ldFetch
                .get(this.accessUrl)
                .then((response) => {
                const entities = this.parseTriples(response.triples);
                this.nodes = this.filterNodesFromEntities(entities);
                const ways = this.filterWaysFromEntities(entities);
                this._assembleNodeLists(entities, ways);
                this.ways = ways;
                this.loadPromise = null;
            })
                .catch((reason) => {
                console.log(reason);
            });
        }
    }
    _assembleNodeLists(entities, ways) {
        const nodesPredicate = "nodes";
        const firstPredicate = "http://www.w3.org/1999/02/22-rdf-syntax-ns#first";
        const restPredicate = "http://www.w3.org/1999/02/22-rdf-syntax-ns#rest";
        for (const way of Object.values(ways)) {
            const nodeList = [];
            let current = entities[way[nodesPredicate]];
            while (current && current[firstPredicate]) {
                nodeList.push(current[firstPredicate]);
                current = entities[current[restPredicate]];
            }
            way[nodesPredicate] = nodeList;
        }
    }
    filterWaysFromEntities(entities) {
        const typePredicate = "http://www.w3.org/1999/02/22-rdf-syntax-ns#type";
        const wayTypeValue = "https://w3id.org/openstreetmap/terms#Way";
        return Object.values(entities)
            .filter((entity) => entity[typePredicate] && entity[typePredicate] === wayTypeValue)
            .reduce((obj, entity) => {
            const way = entity;
            obj[way.id] = way;
            return obj;
        }, {});
    }
    filterNodesFromEntities(entities) {
        const latitudePredicate = "latitude";
        const longitudePredicate = "longitude";
        return Object.values(entities)
            .filter((entity) => entity[latitudePredicate] && entity[longitudePredicate])
            .reduce((obj, entity) => {
            const node = entity;
            obj[node.id] = node;
            return obj;
        }, {});
    }
    transformPredicate(triple) {
        return Rdf_1.default.transformPredicate({
            "http://www.w3.org/2003/01/geo/wgs84_pos#lat": "latitude",
            "http://www.w3.org/2003/01/geo/wgs84_pos#long": "longitude",
            "https://w3id.org/openstreetmap/terms#nodes": "nodes",
        }, triple);
    }
    parseTriples(triples) {
        const transformedTriples = triples.map((triple) => this.transformPredicate(triple));
        return transformedTriples.reduce((entityMap, triple) => {
            const { subject: { value: subject }, predicate: { value: predicate }, object: { value: object } } = triple;
            if (!(subject in entityMap)) {
                entityMap[subject] = {
                    id: subject,
                };
            }
            if (predicate === "longitude" || predicate === "latitude") {
                entityMap[subject][predicate] = parseFloat(object);
            }
            else {
                entityMap[subject][predicate] = object;
            }
            return entityMap;
        }, {});
    }
};
RoutableTileFetcherLDFetch = __decorate([
    inversify_1.injectable(),
    __param(0, inversify_1.inject(types_1.default.LDFetch)),
    __metadata("design:paramtypes", [typeof (_a = typeof ldfetch_1.default !== "undefined" && ldfetch_1.default) === "function" ? _a : Object])
], RoutableTileFetcherLDFetch);
exports.default = RoutableTileFetcherLDFetch;
//# sourceMappingURL=RoutableTilesLDFetch.js.map