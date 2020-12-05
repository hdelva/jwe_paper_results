"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const asynciterator_1 = require("asynciterator");
const HydraPageParser_1 = __importDefault(require("./HydraPageParser"));
class HydraPageIterator extends asynciterator_1.BufferedIterator {
    constructor(baseUrl, ldFetch, config) {
        super({
            autoStart: true,
        });
        this.baseUrl = baseUrl;
        this.ldFetch = ldFetch;
        this.config = config;
    }
    _begin(done) {
        this.ldFetch.get(this.baseUrl)
            .then((response) => {
            const parser = new HydraPageParser_1.default(response.triples);
            const searchTemplate = parser.getSearchTemplate();
            const firstPageIri = searchTemplate.expand(this.config.initialTemplateVariables);
            this.loadPage(firstPageIri)
                .then(() => done());
        });
    }
    _read(count, done) {
        const pageIri = this.config.backward ?
            this.currentPage.previousPageIri : this.currentPage.nextPageIri;
        this.loadPage(pageIri)
            .then(() => done());
    }
    async loadPage(url) {
        await this.ldFetch.get(url)
            .then((response) => {
            const parser = new HydraPageParser_1.default(response.triples);
            const page = parser.getPage(0);
            if (this.config.backward) {
                page.previousPageIri = parser.getPreviousPageIri();
            }
            else {
                page.nextPageIri = parser.getNextPageIri();
            }
            this.currentPage = page;
            this._push(this.currentPage);
        });
    }
}
exports.default = HydraPageIterator;
//# sourceMappingURL=HydraPageIterator.js.map