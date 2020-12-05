"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var EventType;
(function (EventType) {
    EventType["Query"] = "query";
    EventType["SubQuery"] = "sub-query";
    EventType["AbortQuery"] = "abort-query";
    EventType["InvalidQuery"] = "invalid-query";
    EventType["LDFetchGet"] = "ldfetch-get";
    EventType["Warning"] = "warning";
    EventType["ConnectionPrefetch"] = "connection-prefetch";
    EventType["ConnectionIteratorView"] = "connection-iterator-view";
    EventType["ConnectionScan"] = "connection-scan";
    EventType["FinalReachableStops"] = "final-reachable-stops";
    EventType["InitialReachableStops"] = "initial-reachable-stops";
    EventType["AddedNewTransferProfile"] = "added-new-transfer-profile";
})(EventType || (EventType = {}));
exports.default = EventType;
//# sourceMappingURL=EventType.js.map