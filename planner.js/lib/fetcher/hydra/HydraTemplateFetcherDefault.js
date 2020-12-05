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
const mapping_1 = require("../../entities/hydra/mapping");
const search_1 = require("../../entities/hydra/search");
const ldloader_1 = require("../../loader/ldloader");
const single_1 = require("../../loader/views/single");
const types_1 = __importDefault(require("../../types"));
const constants_1 = require("../../uri/constants");
const uri_1 = __importDefault(require("../../uri/uri"));
let HydraTemplateFetcherDefault = class HydraTemplateFetcherDefault {
    constructor(ldFetch) {
        this.ldFetch = ldFetch;
        this.ldLoader = new ldloader_1.LDLoader();
        // unordered collections
        this.ldLoader.defineCollection(uri_1.default.inNS(constants_1.HYDRA, "mapping"));
    }
    async get(url) {
        const rdfThing = await this.ldFetch.get(url);
        const triples = rdfThing.triples;
        const [profile] = this.ldLoader.process(triples, [
            this.getView(),
        ]);
        profile.id = url;
        return profile;
    }
    getView() {
        const view = new single_1.ThingView(search_1.HydraTemplate.create);
        view.addFilter((entity) => entity[uri_1.default.inNS(constants_1.HYDRA, "template")] !== undefined);
        view.addMapping(uri_1.default.inNS(constants_1.HYDRA, "template"), "template");
        view.addMapping(uri_1.default.inNS(constants_1.HYDRA, "mapping"), "mappings", this.getMappingView());
        return view;
    }
    getMappingView() {
        const view = new single_1.ThingView(mapping_1.HydraTemplateMapping.create);
        view.addFilter((entity) => entity[uri_1.default.inNS(constants_1.HYDRA, "variable")] !== undefined);
        view.addMapping(uri_1.default.inNS(constants_1.HYDRA, "variable"), "variable");
        view.addMapping(uri_1.default.inNS(constants_1.HYDRA, "required"), "required");
        view.addMapping(uri_1.default.inNS(constants_1.HYDRA, "property"), "property");
        return view;
    }
};
HydraTemplateFetcherDefault = __decorate([
    inversify_1.injectable(),
    __param(0, inversify_1.inject(types_1.default.LDFetch)),
    __metadata("design:paramtypes", [typeof (_a = typeof ldfetch_1.default !== "undefined" && ldfetch_1.default) === "function" ? _a : Object])
], HydraTemplateFetcherDefault);
exports.default = HydraTemplateFetcherDefault;
//# sourceMappingURL=HydraTemplateFetcherDefault.js.map