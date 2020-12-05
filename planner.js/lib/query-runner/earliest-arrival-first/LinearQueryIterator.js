"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const asynciterator_1 = require("asynciterator");
/**
 * This AsyncIterator emits [[IResolvedQuery]] instances with linear increasing `maximumArrivalTime`.
 */
class LinearQueryIterator extends asynciterator_1.AsyncIterator {
    constructor(baseQuery, a, b) {
        super();
        this.baseQuery = baseQuery;
        this.index = 1;
        this.a = a;
        this.b = b;
        this.timespan = a * this.index + b;
        this.readable = true;
    }
    read() {
        if (this.closed) {
            return null;
        }
        const { minimumDepartureTime } = this.baseQuery;
        const maximumArrivalTime = new Date(minimumDepartureTime.getTime() + this.timespan);
        this.index++;
        this.timespan = this.a * this.index + this.b;
        return Object.assign({}, this.baseQuery, { maximumArrivalTime });
    }
}
exports.default = LinearQueryIterator;
//# sourceMappingURL=LinearQueryIterator.js.map