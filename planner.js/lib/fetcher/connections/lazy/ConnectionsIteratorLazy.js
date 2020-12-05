"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const asynciterator_1 = require("asynciterator");
const FlatMapIterator_1 = __importDefault(require("../../../util/iterators/FlatMapIterator"));
const ConnectionsPageParser_1 = __importDefault(require("../hydra/ConnectionsPageParser"));
const HydraPageIterator_1 = __importDefault(require("../hydra/HydraPageIterator"));
/**
 * Base class for fetching linked connections with LDFetch and letting the caller iterate over them asynchronously
 * through implementing the AsyncIterator protocol.
 * LDFetch returns documents as an array of RDF triples.
 * The meta Hydra triples are used for paginating to the next or previous page.
 * The triples that describe linked connections get deserialized to instances of [[IConnection]]
 */
class ConnectionsIteratorLazy extends FlatMapIterator_1.default {
    constructor(baseUrl, travelMode, ldFetch, options) {
        const departureTimeDate = options.backward ?
            options.upperBoundDate : options.lowerBoundDate;
        const pageIteratorConfig = {
            backward: options.backward,
            initialTemplateVariables: {
                departureTime: departureTimeDate.toISOString(),
            },
        };
        const pageIterator = new HydraPageIterator_1.default(baseUrl, ldFetch, pageIteratorConfig);
        const parsePageConnections = (page) => {
            const connectionsParser = new ConnectionsPageParser_1.default(page.documentIri, page.triples);
            const connections = connectionsParser.getConnections(travelMode);
            if (options.backward) {
                connections.reverse();
            }
            return new asynciterator_1.ArrayIterator(connections);
        };
        super(pageIterator, parsePageConnections);
    }
}
exports.default = ConnectionsIteratorLazy;
//# sourceMappingURL=ConnectionsIteratorLazy.js.map