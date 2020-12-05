import { Triple } from "rdf-js";
import UriTemplate from "uritemplate";
import IHydraPage from "./IHydraPage";
/**
 * Searches the given array of triples for hydra meta data, like the search template and next/previous page iris
 * Also allows getting the contained [[IHydraPage]], which holds an array of [[IConnection]]s
 */
export default class HydraPageParser {
    private readonly triples;
    private readonly documentIri;
    constructor(triples: Triple[]);
    getPage(index: number): IHydraPage;
    getSearchTemplate(): UriTemplate;
    getNextPageIri(): string;
    getPreviousPageIri(): string;
    private getDocumentIri;
}
