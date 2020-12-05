"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const asynciterator_1 = require("asynciterator");
require("jest");
const AsyncArrayIterator_1 = __importDefault(require("./AsyncArrayIterator"));
const BurstArrayIterator_1 = __importDefault(require("./BurstArrayIterator"));
const MergeIterator_1 = __importDefault(require("./MergeIterator"));
const createSources = (IteratorClass) => {
    const firstIterator = new IteratorClass([1, 8, 10, 13], 10);
    const secondIterator = new IteratorClass([4, 11], 10);
    const thirdIterator = new IteratorClass([3, 5, 6, 12, 18], 10);
    return [firstIterator, secondIterator, thirdIterator];
};
const expected = [1, 3, 4, 5, 6, 8, 10, 11, 12, 13, 18];
const uncondensedSelector = (numbers) => {
    let smallestIndex = -1;
    for (let i = 0; i < numbers.length; i++) {
        if (smallestIndex < 0 && numbers[i] !== undefined) {
            smallestIndex = i;
            continue;
        }
        if (numbers[i] !== undefined && numbers[i] < numbers[smallestIndex]) {
            smallestIndex = i;
        }
    }
    return smallestIndex;
};
const condensedSelector = (numbers) => {
    let smallestIndex = 0;
    for (let i = 1; i < numbers.length; i++) {
        if (numbers[i] !== undefined && numbers[i] < numbers[smallestIndex]) {
            smallestIndex = i;
        }
    }
    return smallestIndex;
};
describe("[MergeIterator]", () => {
    describe("sync sources", () => {
        it("uncondensed", (done) => {
            const mergeIterator = new MergeIterator_1.default(createSources(asynciterator_1.ArrayIterator), uncondensedSelector, false);
            let current = 0;
            mergeIterator.each((str) => {
                expect(expected[current++]).toBe(str);
            });
            mergeIterator.on("end", () => done());
        });
        it("condensed", (done) => {
            const mergeIterator = new MergeIterator_1.default(createSources(asynciterator_1.ArrayIterator), condensedSelector, true);
            let current = 0;
            mergeIterator.each((str) => {
                expect(expected[current++]).toBe(str);
            });
            mergeIterator.on("end", () => done());
        });
    });
    describe("async sources", () => {
        it("uncondensed", (done) => {
            const mergeIterator = new MergeIterator_1.default(createSources(AsyncArrayIterator_1.default), uncondensedSelector, false);
            let current = 0;
            mergeIterator.each((str) => {
                expect(expected[current++]).toBe(str);
            });
            mergeIterator.on("end", () => done());
        });
        it("condensed", (done) => {
            const mergeIterator = new MergeIterator_1.default(createSources(AsyncArrayIterator_1.default), condensedSelector, true);
            let current = 0;
            mergeIterator.each((str) => {
                expect(expected[current++]).toBe(str);
            });
            mergeIterator.on("end", () => done());
        });
    });
    describe("mixed sources", () => {
        it("uncondensed", (done) => {
            const mergeIterator = new MergeIterator_1.default(createSources(BurstArrayIterator_1.default), uncondensedSelector, false);
            let current = 0;
            mergeIterator.each((str) => {
                expect(expected[current++]).toBe(str);
            });
            mergeIterator.on("end", () => done());
        });
        it("condensed", (done) => {
            const mergeIterator = new MergeIterator_1.default(createSources(BurstArrayIterator_1.default), condensedSelector, true);
            let current = 0;
            mergeIterator.each((str) => {
                expect(expected[current++]).toBe(str);
            });
            mergeIterator.on("end", () => done());
        });
    });
});
//# sourceMappingURL=MergeIterator.test.js.map