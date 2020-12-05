import { Triple } from "rdf-js";
import TravelMode from "../../../enums/TravelMode";
import IConnection from "../IConnection";
/**
 * Parses the given array of triples into an array of [[IConnection]]s
 * It first builds up an array of entities, where each item is a 'subject',
 * its properties are 'predicates' and values are 'objects'
 * After, it filters those entities by type, only leaving 'linked connections'.
 */
export default class ConnectionsPageParser {
    private readonly documentIri;
    private readonly triples;
    constructor(documentIri: string, triples: Triple[]);
    getConnections(travelMode: TravelMode): IConnection[];
    private filterConnectionsFromEntities;
    private transformPredicate;
    private transformObject;
    private getEntities;
}
