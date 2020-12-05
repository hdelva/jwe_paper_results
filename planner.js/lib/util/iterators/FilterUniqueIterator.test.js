"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const asynciterator_1 = require("asynciterator");
require("jest");
const FilterUniqueIterator_1 = __importDefault(require("./FilterUniqueIterator"));
describe("[FilterUniqueIterator]", () => {
    it("basic", (done) => {
        const numberIterator = new asynciterator_1.ArrayIterator([1, 1, 2, 3, 4, 5, 5, 5, 5, 6, 1, 5, 3, 5, 8]);
        const filterUniqueIterator = new FilterUniqueIterator_1.default(numberIterator, (a, b) => a === b);
        let current = 0;
        const expected = [1, 2, 3, 4, 5, 6, 8];
        filterUniqueIterator.each((str) => {
            expect(expected[current++]).toBe(str);
        });
        filterUniqueIterator.on("end", () => done());
    });
});
//# sourceMappingURL=FilterUniqueIterator.test.js.map