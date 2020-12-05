"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const uritemplate_1 = __importDefault(require("uritemplate"));
const Rdf_1 = __importDefault(require("../../../util/Rdf"));
/**
 * Searches the given array of triples for hydra meta data, like the search template and next/previous page iris
 * Also allows getting the contained [[IHydraPage]], which holds an array of [[IConnection]]s
 */
class HydraPageParser {
    constructor(triples) {
        this.triples = triples;
        this.documentIri = this.getDocumentIri();
    }
    getPage(index) {
        return {
            index,
            documentIri: this.documentIri,
            triples: this.triples,
        };
    }
    getSearchTemplate() {
        const searchTriple = this.triples.find(Rdf_1.default.matchesTriple(this.documentIri, "http://www.w3.org/ns/hydra/core#search", null));
        const templateTriple = this.triples.find(Rdf_1.default.matchesTriple(searchTriple.object.value, "http://www.w3.org/ns/hydra/core#template", null));
        const template = templateTriple.object.value;
        return uritemplate_1.default.parse(template);
    }
    getNextPageIri() {
        const nextPageTriple = this.triples.find(Rdf_1.default.matchesTriple(this.documentIri, "http://www.w3.org/ns/hydra/core#next", null));
        if (nextPageTriple && nextPageTriple.object.value.substr(0, 4) === "http") {
            return nextPageTriple.object.value;
        }
    }
    getPreviousPageIri() {
        const previousPageTriple = this.triples.find(Rdf_1.default.matchesTriple(this.documentIri, "http://www.w3.org/ns/hydra/core#previous", null));
        if (previousPageTriple && previousPageTriple.object.value.substr(0, 4) === "http") {
            return previousPageTriple.object.value;
        }
    }
    getDocumentIri() {
        // Type can be either http://www.w3.org/ns/hydra/core#PartialCollectionView
        // or http://www.w3.org/ns/hydra/core#PagedCollection
        let typeTriple = this.triples.find(Rdf_1.default.matchesTriple(null, "http://www.w3.org/1999/02/22-rdf-syntax-ns#type", "http://www.w3.org/ns/hydra/core#PartialCollectionView"));
        if (!typeTriple) {
            typeTriple = this.triples.find(Rdf_1.default.matchesTriple(null, "http://www.w3.org/1999/02/22-rdf-syntax-ns#type", "http://www.w3.org/ns/hydra/core#PagedCollection"));
        }
        if (!typeTriple) {
            throw new Error("Hydra page doesn`t have type triple");
        }
        return typeTriple.subject.value;
    }
}
exports.default = HydraPageParser;
//# sourceMappingURL=HydraPageParser.js.map