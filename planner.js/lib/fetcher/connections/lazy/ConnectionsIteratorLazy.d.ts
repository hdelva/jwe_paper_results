import LdFetch from "ldfetch";
import TravelMode from "../../../enums/TravelMode";
import FlatMapIterator from "../../../util/iterators/FlatMapIterator";
import IHydraPage from "../hydra/IHydraPage";
import IConnection from "../IConnection";
import IConnectionsIteratorOptions from "../IConnectionsIteratorOptions";
/**
 * Base class for fetching linked connections with LDFetch and letting the caller iterate over them asynchronously
 * through implementing the AsyncIterator protocol.
 * LDFetch returns documents as an array of RDF triples.
 * The meta Hydra triples are used for paginating to the next or previous page.
 * The triples that describe linked connections get deserialized to instances of [[IConnection]]
 */
export default class ConnectionsIteratorLazy extends FlatMapIterator<IHydraPage, IConnection> {
    constructor(baseUrl: string, travelMode: TravelMode, ldFetch: LdFetch, options: IConnectionsIteratorOptions);
}
