"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const DropOffType_1 = __importDefault(require("../../../enums/DropOffType"));
const PickupType_1 = __importDefault(require("../../../enums/PickupType"));
const Rdf_1 = __importDefault(require("../../../util/Rdf"));
const Units_1 = __importDefault(require("../../../util/Units"));
/**
 * Parses the given array of triples into an array of [[IConnection]]s
 * It first builds up an array of entities, where each item is a 'subject',
 * its properties are 'predicates' and values are 'objects'
 * After, it filters those entities by type, only leaving 'linked connections'.
 */
class ConnectionsPageParser {
    constructor(documentIri, triples) {
        this.documentIri = documentIri;
        this.triples = triples;
    }
    getConnections(travelMode) {
        // group all entities together and
        const entities = this.getEntities(this.triples);
        // Find all Connections
        let connections = this.filterConnectionsFromEntities(entities);
        // Add travel mode
        connections = connections.map((connection) => {
            connection.travelMode = travelMode;
            return connection;
        });
        // Sort connections by departure time
        return connections.sort((connectionA, connectionB) => {
            return connectionA.departureTime.valueOf() - connectionB.departureTime.valueOf();
        });
    }
    filterConnectionsFromEntities(entities) {
        const typePredicate = "http://www.w3.org/1999/02/22-rdf-syntax-ns#type";
        // building block 2: every lc:Connection entity is taken from the page and processed
        return Object.values(entities)
            .filter((entity) => entity[typePredicate] && entity[typePredicate] === "http://semweb.mmlab.be/ns/linkedconnections#Connection");
    }
    transformPredicate(triple) {
        return Rdf_1.default.transformPredicate({
            "http://semweb.mmlab.be/ns/linkedconnections#departureTime": "departureTime",
            "http://semweb.mmlab.be/ns/linkedconnections#departureDelay": "departureDelay",
            "http://semweb.mmlab.be/ns/linkedconnections#arrivalDelay": "arrivalDelay",
            "http://semweb.mmlab.be/ns/linkedconnections#arrivalTime": "arrivalTime",
            "http://semweb.mmlab.be/ns/linkedconnections#departureStop": "departureStop",
            "http://semweb.mmlab.be/ns/linkedconnections#arrivalStop": "arrivalStop",
            "http://semweb.mmlab.be/ns/linkedconnections#nextConnection": "nextConnection",
            "http://vocab.gtfs.org/terms#route": "gtfs:route",
            "http://vocab.gtfs.org/terms#trip": "tripId",
            "http://vocab.gtfs.org/terms#dropOffType": "gtfs:dropOffType",
            "http://vocab.gtfs.org/terms#pickupType": "gtfs:pickupType",
            "http://vocab.gtfs.org/terms#headsign": "gtfs:headsign",
        }, triple);
    }
    transformObject(triple) {
        if (triple.predicate.value === "gtfs:dropOffType") {
            return Rdf_1.default.transformObject({
                "http://vocab.gtfs.org/terms#Regular": DropOffType_1.default.Regular,
                "http://vocab.gtfs.org/terms#NotAvailable": DropOffType_1.default.NotAvailable,
                "http://vocab.gtfs.org/terms#MustPhone": DropOffType_1.default.MustPhone,
                "http://vocab.gtfs.org/terms#MustCoordinateWithDriver": DropOffType_1.default.MustCoordinateWithDriver,
            }, triple);
        }
        if (triple.predicate.value === "gtfs:pickupType") {
            return Rdf_1.default.transformObject({
                "http://vocab.gtfs.org/terms#Regular": PickupType_1.default.Regular,
                "http://vocab.gtfs.org/terms#NotAvailable": PickupType_1.default.NotAvailable,
                "http://vocab.gtfs.org/terms#MustPhone": PickupType_1.default.MustPhone,
                "http://vocab.gtfs.org/terms#MustCoordinateWithDriver": PickupType_1.default.MustCoordinateWithDriver,
            }, triple);
        }
        return triple;
    }
    getEntities(triples) {
        return triples.reduce((entities, triple) => {
            triple = this.transformObject(this.transformPredicate(triple));
            const { subject: { value: subject }, predicate: { value: predicate }, object: { value: object } } = triple;
            let newObject;
            if (triple.predicate.value === "departureTime" || triple.predicate.value === "arrivalTime") {
                newObject = new Date(triple.object.value);
            }
            if (triple.predicate.value === "departureDelay" || triple.predicate.value === "arrivalDelay") {
                newObject = Units_1.default.fromSeconds(parseInt(triple.object.value, 10));
            }
            if (!entities[subject]) {
                entities[subject] = {
                    id: subject,
                };
            }
            // nextConnection should be an array
            // todo: test once nextConnection becomes available
            if (predicate === "nextConnection") {
                entities[subject][predicate] = entities[subject][predicate] || [];
                entities[subject][predicate].push(object);
            }
            else {
                entities[subject][predicate] = newObject || object;
            }
            return entities;
        }, {});
    }
}
exports.default = ConnectionsPageParser;
//# sourceMappingURL=ConnectionsPageParser.js.map