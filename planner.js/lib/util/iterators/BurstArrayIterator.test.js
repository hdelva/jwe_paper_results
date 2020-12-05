"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("jest");
const BurstArrayIterator_1 = __importDefault(require("./BurstArrayIterator"));
describe("[BurstArrayIterator]", () => {
    it("basic", (done) => {
        const expected = [1, 1, 2, 3, 4, 5, 5, 5, 5, 6, 1, 5, 3, 5, 8];
        const filterUniqueIterator = new BurstArrayIterator_1.default(expected, 20);
        let current = 0;
        filterUniqueIterator.each((str) => {
            expect(expected[current++]).toBe(str);
        });
        filterUniqueIterator.on("end", () => {
            expect(current).toBe(expected.length);
            done();
        });
    });
    it("smaller than burst", (done) => {
        const expected = [1, 1];
        const filterUniqueIterator = new BurstArrayIterator_1.default(expected, 20);
        let current = 0;
        filterUniqueIterator.each((str) => {
            expect(expected[current++]).toBe(str);
        });
        filterUniqueIterator.on("end", () => {
            expect(current).toBe(expected.length);
            done();
        });
    });
});
//# sourceMappingURL=BurstArrayIterator.test.js.map