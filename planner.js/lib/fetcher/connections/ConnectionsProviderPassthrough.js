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
const inversify_1 = require("inversify");
const Catalog_1 = __importDefault(require("../../Catalog"));
const types_1 = __importDefault(require("../../types"));
/**
 * Passes through any method calls to a *single* [[IConnectionsFetcher]], the first if there are multiple source configs
 * This provider is most/only useful if there is only one fetcher
 */
let ConnectionsProviderPassthrough = class ConnectionsProviderPassthrough {
    constructor(connectionsFetcherFactory, catalog) {
        const { accessUrl, travelMode } = catalog.connectionsSourceConfigs[0];
        this.connectionsFetcher = connectionsFetcherFactory(accessUrl, travelMode);
    }
    prefetchConnections() {
        this.connectionsFetcher.prefetchConnections();
    }
    createIterator() {
        return this.connectionsFetcher.createIterator();
    }
    setIteratorOptions(options) {
        this.connectionsFetcher.setIteratorOptions(options);
    }
};
ConnectionsProviderPassthrough = __decorate([
    inversify_1.injectable(),
    __param(0, inversify_1.inject(types_1.default.ConnectionsFetcherFactory)),
    __param(1, inversify_1.inject(types_1.default.Catalog)),
    __metadata("design:paramtypes", [Function, Catalog_1.default])
], ConnectionsProviderPassthrough);
exports.default = ConnectionsProviderPassthrough;
//# sourceMappingURL=ConnectionsProviderPassthrough.js.map