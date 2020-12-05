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
var ConnectionsProviderPrefetch_1;
Object.defineProperty(exports, "__esModule", { value: true });
const inversify_1 = require("inversify");
const Catalog_1 = __importDefault(require("../../../Catalog"));
const types_1 = __importDefault(require("../../../types"));
const ConnectionsProviderMerge_1 = __importDefault(require("../ConnectionsProviderMerge"));
const ConnectionsStore_1 = __importDefault(require("./ConnectionsStore"));
/**
 * This connections provider implements the [[IConnectionsProvider.prefetchConnections]] method.
 * When called, it asks an AsyncIterator from the instantiated [[IConnectionsFetcher]].
 * All items from that iterator get appended to a [[ConnectionsStore]]
 *
 * When [[IConnectionsProvider.createIterator]] is called, it returns an iterator *view* from the [[ConnectionsStore]]
 */
let ConnectionsProviderPrefetch = ConnectionsProviderPrefetch_1 = class ConnectionsProviderPrefetch {
    constructor(connectionsFetcherFactory, catalog) {
        if (catalog.connectionsSourceConfigs.length > 1) {
            this.connectionsFetcher = new ConnectionsProviderMerge_1.default(connectionsFetcherFactory, catalog);
        }
        else {
            const { accessUrl, travelMode } = catalog.connectionsSourceConfigs[0];
            this.connectionsFetcher = connectionsFetcherFactory(accessUrl, travelMode);
        }
        this.connectionsStore = new ConnectionsStore_1.default();
    }
    prefetchConnections(lowerBoundDate) {
        if (!this.startedPrefetching) {
            this.startedPrefetching = true;
            lowerBoundDate = lowerBoundDate || new Date();
            const options = {
                backward: false,
                lowerBoundDate,
            };
            this.connectionsFetcher.setIteratorOptions(options);
            this.connectionsIterator = this.connectionsFetcher.createIterator();
            this.connectionsStore.setSourceIterator(this.connectionsIterator);
            this.connectionsStore.startPrimaryPush(ConnectionsProviderPrefetch_1.MAX_CONNECTIONS);
        }
    }
    createIterator() {
        if (!this.startedPrefetching) {
            this.prefetchConnections(this.connectionsIteratorOptions.lowerBoundDate);
        }
        return this.connectionsStore.getIterator(this.connectionsIteratorOptions);
    }
    setIteratorOptions(options) {
        this.connectionsIteratorOptions = options;
    }
};
ConnectionsProviderPrefetch.MAX_CONNECTIONS = 20000;
ConnectionsProviderPrefetch = ConnectionsProviderPrefetch_1 = __decorate([
    inversify_1.injectable(),
    __param(0, inversify_1.inject(types_1.default.ConnectionsFetcherFactory)),
    __param(1, inversify_1.inject(types_1.default.Catalog)),
    __metadata("design:paramtypes", [Function, Catalog_1.default])
], ConnectionsProviderPrefetch);
exports.default = ConnectionsProviderPrefetch;
//# sourceMappingURL=ConnectionsProviderPrefetch.js.map