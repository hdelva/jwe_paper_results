"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const asynciterator_1 = require("asynciterator");
require("jest");
const ConnectionsStore_1 = __importDefault(require("./ConnectionsStore"));
describe("[ConnectionsStore]", () => {
    /**
     * In this test, departureTime dates are substituted for numbers for simplicity
     * Inside the ConnectionsStore, #valueOf() gets called on the connection.departureTime
     * and both Dates and Numbers return a number
     */
    let connectionsStore;
    let createIterator;
    beforeEach(() => {
        const fakeDepartureTimes = [1, 2, 3, 3, 5, 6, 6, 6, 6, 7, 7];
        // @ts-ignore
        const fakeConnections = fakeDepartureTimes
            .map((departureTime) => ({ departureTime }));
        const fakeSourceIterator = new asynciterator_1.ArrayIterator(fakeConnections);
        connectionsStore = new ConnectionsStore_1.default();
        connectionsStore.setSourceIterator(fakeSourceIterator);
        connectionsStore.startPrimaryPush(500);
        createIterator = (backward, lowerBoundDate, upperBoundDate) => {
            return new Promise((resolve) => {
                // Primary push start async, so get iterator async
                // Running a query is most often initiated by a user event, while prefetching start automatically
                setTimeout(() => {
                    const iteratorOptions = {
                        backward,
                    };
                    if (lowerBoundDate) {
                        iteratorOptions.lowerBoundDate = lowerBoundDate;
                    }
                    if (upperBoundDate) {
                        iteratorOptions.upperBoundDate = upperBoundDate;
                    }
                    resolve(connectionsStore.getIterator(iteratorOptions));
                }, 100);
            });
        };
    });
    describe("backward", () => {
        it("upperBoundDate is loaded & exists in store", async (done) => {
            const iteratorView = await createIterator(true, null, 6);
            const expected = [1, 2, 3, 3, 5, 6, 6, 6, 6];
            let current = expected.length - 1;
            iteratorView.each((str) => {
                expect(expected[current--]).toBe(str.departureTime);
            });
            iteratorView.on("end", () => {
                expect(current).toBe(-1);
                done();
            });
        });
        it("upperBoundDate is loaded but doesn\'t exist in store", async (done) => {
            const iteratorView = await createIterator(true, null, 4);
            const expected = [1, 2, 3, 3];
            let current = expected.length - 1;
            iteratorView.each((str) => {
                expect(expected[current--]).toBe(str.departureTime);
            });
            iteratorView.on("end", () => {
                expect(current).toBe(-1);
                done();
            });
        });
    });
    describe("forward", () => {
        it("lowerBoundDate is loaded & exists in store", async (done) => {
            const iteratorView = await createIterator(false, 3, 6);
            const expected = [3, 3, 5, 6, 6, 6, 6];
            let current = 0;
            iteratorView.each((str) => {
                expect(expected[current++]).toBe(str.departureTime);
            });
            iteratorView.on("end", () => {
                expect(current).toBe(expected.length);
                done();
            });
        });
        it("lowerBoundDate is loaded but doesn\'t exist in store", async (done) => {
            const iteratorView = await createIterator(false, 4, 6);
            const expected = [5, 6, 6, 6, 6];
            let current = 0;
            iteratorView.each((str) => {
                expect(expected[current++]).toBe(str.departureTime);
            });
            iteratorView.on("end", () => {
                expect(current).toBe(expected.length);
                done();
            });
        });
    });
});
//# sourceMappingURL=ConnectionsStore.test.js.map