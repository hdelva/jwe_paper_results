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
var ConnectionsProviderMerge_1;
Object.defineProperty(exports, "__esModule", { value: true });
const inversify_1 = require("inversify");
const Catalog_1 = __importDefault(require("../../Catalog"));
const types_1 = __importDefault(require("../../types"));
const MergeIterator_1 = __importDefault(require("../../util/iterators/MergeIterator"));
const ConnectionsProviderDefault_1 = __importDefault(require("./ConnectionsProviderDefault"));
let ConnectionsProviderMerge = ConnectionsProviderMerge_1 = class ConnectionsProviderMerge {
    constructor(connectionsFetcherFactory, catalog, templateFetcher) {
        this.defaultProviders = [];
        for (const { accessUrl, travelMode } of catalog.connectionsSourceConfigs) {
            const subCatalog = new Catalog_1.default();
            subCatalog.addConnectionsSource(accessUrl, travelMode);
            this.defaultProviders.push(new ConnectionsProviderDefault_1.default(connectionsFetcherFactory, subCatalog, templateFetcher));
        }
    }
    static forwardsConnectionSelector(connections) {
        if (connections.length === 1) {
            return 0;
        }
        let earliestIndex = 0;
        const earliest = connections[earliestIndex];
        for (let i = 1; i < connections.length; i++) {
            const connection = connections[i];
            if (connection.departureTime < earliest.departureTime) {
                earliestIndex = i;
            }
        }
        return earliestIndex;
    }
    static backwardsConnectionsSelector(connections) {
        if (connections.length === 1) {
            return 0;
        }
        let latestIndex = 0;
        const latest = connections[latestIndex];
        for (let i = 1; i < connections.length; i++) {
            const connection = connections[i];
            if (connection.departureTime > latest.departureTime) {
                latestIndex = i;
            }
        }
        return latestIndex;
    }
    prefetchConnections(lowerBound, upperBound) {
        for (const provider of this.defaultProviders) {
            provider.prefetchConnections(lowerBound, upperBound);
        }
    }
    async createIterator(options) {
        const iterators = await Promise.all(this.defaultProviders
            .map((provider) => provider.createIterator(options)));
        const selector = options.backward ?
            ConnectionsProviderMerge_1.backwardsConnectionsSelector
            :
                ConnectionsProviderMerge_1.forwardsConnectionSelector;
        if (options.excludedModes) {
            return new MergeIterator_1.default(iterators, selector, true).filter((item) => {
                return !options.excludedModes.has(item.travelMode);
            });
        }
        else {
            return new MergeIterator_1.default(iterators, selector, true);
        }
    }
    getByUrl(url) {
        // TODO, if needed this can delegate the call to one of the sub providers
        throw new Error("Not implemented yet");
    }
    getByTime(date) {
        throw new Error("Method not implemented because the semantics would be ambiguous.");
    }
};
ConnectionsProviderMerge = ConnectionsProviderMerge_1 = __decorate([
    inversify_1.injectable(),
    __param(0, inversify_1.inject(types_1.default.ConnectionsFetcherFactory)),
    __param(1, inversify_1.inject(types_1.default.Catalog)),
    __param(2, inversify_1.inject(types_1.default.HydraTemplateFetcher)),
    __metadata("design:paramtypes", [Function, Catalog_1.default, Object])
], ConnectionsProviderMerge);
exports.default = ConnectionsProviderMerge;
//# sourceMappingURL=ConnectionsProviderMerge.js.map