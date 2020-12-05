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
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
const inversify_1 = require("inversify");
const ldfetch_1 = __importDefault(require("ldfetch"));
const types_1 = __importDefault(require("../../../types"));
const ConnectionsIteratorLazy_1 = __importDefault(require("./ConnectionsIteratorLazy"));
/**
 * Wraps the [[ConnectionsIteratorLazy]]
 * @implements IConnectionsFetcher
 */
let ConnectionsFetcherLazy = class ConnectionsFetcherLazy {
    constructor(ldFetch) {
        this.ldFetch = ldFetch;
    }
    setTravelMode(travelMode) {
        this.travelMode = travelMode;
    }
    setAccessUrl(accessUrl) {
        this.accessUrl = accessUrl;
    }
    prefetchConnections() {
        return;
    }
    createIterator() {
        return new ConnectionsIteratorLazy_1.default(this.accessUrl, this.travelMode, this.ldFetch, this.options);
    }
    setIteratorOptions(options) {
        this.options = options;
    }
};
ConnectionsFetcherLazy = __decorate([
    inversify_1.injectable(),
    __param(0, inversify_1.inject(types_1.default.LDFetch)),
    __metadata("design:paramtypes", [typeof (_a = typeof ldfetch_1.default !== "undefined" && ldfetch_1.default) === "function" ? _a : Object])
], ConnectionsFetcherLazy);
exports.default = ConnectionsFetcherLazy;
//# sourceMappingURL=ConnectionsFetcherLazy.js.map