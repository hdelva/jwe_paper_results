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
const node_1 = require("../../entities/tiles/node");
const tile_1 = require("../../entities/tiles/tile");
const way_1 = require("../../entities/tiles/way");
const ldloader_1 = require("../../loader/ldloader");
const views_1 = require("../../loader/views");
const types_1 = __importDefault(require("../../types"));
const constants_1 = require("../../uri/constants");
const uri_1 = __importDefault(require("../../uri/uri"));
let RoutableTileFetcherDefault = class RoutableTileFetcherDefault {
    constructor(ldFetch) {
        this.ldFetch = ldFetch;
        this.ldLoader = new ldloader_1.LDLoader();
        this.ldLoader.defineCollection(uri_1.default.inNS(constants_1.OSM, "nodes")); // unordered collection
    }
    fetchByCoords(zoom, latitude, longitude) {
        const latitudeTile = this.lat2tile(latitude, zoom);
        const longitudeTile = this.long2tile(longitude, zoom);
        return this.fetchByTileCoords(zoom, latitudeTile, longitudeTile);
    }
    async fetchByTileCoords(zoom, latitudeTile, longitudeTile) {
        const url = `https://tiles.openplanner.team/planet/${zoom}/${latitudeTile}/${longitudeTile}`;
        const tile = await this.get(url);
        tile.latitude = latitudeTile; // todo, move these
        tile.longitude = longitudeTile;
        return tile;
    }
    async get(url) {
        const rdfThing = await this.ldFetch.get(url);
        const triples = rdfThing.triples;
        let nodes;
        let ways;
        [nodes, ways] = this.ldLoader.process(triples, [
            this.getNodesView(),
            this.getWaysView(),
        ]);
        return new tile_1.RoutableTile(url, nodes, ways);
    }
    getNodesView() {
        const nodesView = new views_1.IndexThingView(node_1.RoutableTileNode.create);
        nodesView.addFilter((entity) => entity[uri_1.default.inNS(constants_1.GEO, "lat")] !== undefined && entity[uri_1.default.inNS(constants_1.GEO, "long")] !== undefined);
        nodesView.addMapping(uri_1.default.inNS(constants_1.GEO, "lat"), "latitude");
        nodesView.addMapping(uri_1.default.inNS(constants_1.GEO, "long"), "longitude");
        return nodesView;
    }
    getWaysView() {
        const waysView = new views_1.IndexThingView(way_1.RoutableTileWay.create);
        waysView.addFilter((entity) => entity[uri_1.default.inNS(constants_1.RDF, "type")] === uri_1.default.inNS(constants_1.OSM, "Way"));
        waysView.addMapping(uri_1.default.inNS(constants_1.OSM, "nodes"), "segments"); // todo mapping to segments
        waysView.addMapping(uri_1.default.inNS(constants_1.RDFS, "label"), "label");
        return waysView;
    }
    long2tile(lon, zoom) {
        return (Math.floor((lon + 180) / 360 * Math.pow(2, zoom)));
    }
    lat2tile(lat, zoom) {
        return (Math.floor((1 - Math.log(Math.tan(lat * Math.PI / 180) + 1
            / Math.cos(lat * Math.PI / 180)) / Math.PI) / 2 * Math.pow(2, zoom)));
    }
};
RoutableTileFetcherDefault = __decorate([
    inversify_1.injectable(),
    __param(0, inversify_1.inject(types_1.default.LDFetch)),
    __metadata("design:paramtypes", [typeof (_a = typeof ldfetch_1.default !== "undefined" && ldfetch_1.default) === "function" ? _a : Object])
], RoutableTileFetcherDefault);
exports.default = RoutableTileFetcherDefault;
//# sourceMappingURL=RoutableTilesFetcherDefault.js.map