"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.backwardsConnectionsSelector = exports.forwardsConnectionSelector = void 0;
function forwardsConnectionSelector(connections) {
    if (connections.length === 1) {
        return 0;
    }
    let earliestIndex = 0;
    let earliest = connections[earliestIndex];
    for (let i = 1; i < connections.length; i++) {
        const connection = connections[i];
        if (connection === null || connection === undefined) {
            continue;
        }
        if (connection.departureTime < earliest.departureTime) {
            earliestIndex = i;
            earliest = connection;
        }
        else if (connection.departureTime === earliest.departureTime
            && connection.id < earliest.id) {
            earliestIndex = i;
            earliest = connection;
        }
    }
    return earliestIndex;
}
exports.forwardsConnectionSelector = forwardsConnectionSelector;
function backwardsConnectionsSelector(connections) {
    if (connections.length === 1) {
        return 0;
    }
    let latestIndex = 0;
    let latest = connections[latestIndex];
    for (let i = 1; i < connections.length; i++) {
        const connection = connections[i];
        if (connection === null || connection === undefined) {
            continue;
        }
        if (connection.departureTime > latest.departureTime) {
            latestIndex = i;
            latest = connection;
        }
    }
    return latestIndex;
}
exports.backwardsConnectionsSelector = backwardsConnectionsSelector;
//# sourceMappingURL=ConnectionSelectors.js.map