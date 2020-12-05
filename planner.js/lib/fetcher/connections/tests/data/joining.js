"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const DropOffType_1 = __importDefault(require("../../../../enums/DropOffType"));
const PickupType_1 = __importDefault(require("../../../../enums/PickupType"));
const TravelMode_1 = __importDefault(require("../../../../enums/TravelMode"));
const connections = [
    {
        value: {
            "id": "2a",
            "travelMode": TravelMode_1.default.Train,
            "arrivalStop": "http://irail.be/stations/NMBS/008891702",
            "departureStop": "http://irail.be/stations/NMBS/008892007",
            "departureTime": new Date("2017-12-19T16:22:00.000Z"),
            "arrivalTime": new Date("2017-12-19T16:30:00.000Z"),
            "tripId": "A",
            "gtfs:pickupType": PickupType_1.default.Regular,
            "gtfs:dropOffType": DropOffType_1.default.Regular,
        },
        done: false,
    },
    {
        value: {
            "id": "2b",
            "travelMode": TravelMode_1.default.Train,
            "arrivalStop": "http://irail.be/stations/NMBS/008891702",
            "departureStop": "http://irail.be/stations/NMBS/008812005",
            "departureTime": new Date("2017-12-19T16:23:00.000Z"),
            "arrivalTime": new Date("2017-12-19T16:34:00.000Z"),
            "tripId": "B",
            "nextConnection": ["1"],
            "gtfs:pickupType": PickupType_1.default.Regular,
            "gtfs:dropOffType": DropOffType_1.default.Regular,
        },
        done: false,
    },
    {
        value: {
            "id": "1",
            "travelMode": TravelMode_1.default.Train,
            "arrivalStop": "http://irail.be/stations/NMBS/008821006",
            "departureStop": "http://irail.be/stations/NMBS/008891702",
            "departureTime": new Date("2017-12-19T16:35:00.000Z"),
            "arrivalTime": new Date("2017-12-19T16:50:00.000Z"),
            "tripId": "A",
            "gtfs:pickupType": PickupType_1.default.Regular,
            "gtfs:dropOffType": DropOffType_1.default.Regular,
        },
        done: false,
    },
];
exports.default = connections;
//# sourceMappingURL=joining.js.map