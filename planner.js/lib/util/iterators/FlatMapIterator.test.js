"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const asynciterator_1 = require("asynciterator");
require("jest");
const AsyncArrayIterator_1 = __importDefault(require("./AsyncArrayIterator"));
const FlatMapIterator_1 = __importDefault(require("./FlatMapIterator"));
const ALPHABET = "abc";
const expected = ["a", "b", "b", "c", "c", "c"];
describe("[FlatMapIterator]", () => {
    const runTest = (QueryIterator, ResultIterator, done) => {
        const queryIterator = new QueryIterator([1, 2, 3], 10);
        const flatMapIterator = new FlatMapIterator_1.default(queryIterator, (num) => {
            const array = Array(num).fill(ALPHABET[num - 1]);
            return new ResultIterator(array, 10);
        });
        let current = 0;
        flatMapIterator.each((str) => {
            expect(expected[current++]).toBe(str);
        });
        flatMapIterator.on("end", () => done());
    };
    it("Subqueries from ArrayIterator / Results from ArrayIterator", (done) => {
        runTest(asynciterator_1.ArrayIterator, asynciterator_1.ArrayIterator, done);
    });
    it("Subqueries from ArrayIterator / Results from BufferedIterator", (done) => {
        runTest(asynciterator_1.ArrayIterator, AsyncArrayIterator_1.default, done);
    });
    it("Subqueries from BufferedIterator / Results from BufferedIterator", (done) => {
        runTest(AsyncArrayIterator_1.default, AsyncArrayIterator_1.default, done);
    });
});
//# sourceMappingURL=FlatMapIterator.test.js.map