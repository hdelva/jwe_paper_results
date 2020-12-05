"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("jest");
const ArrayViewIterator_1 = __importDefault(require("./ArrayViewIterator"));
describe("[ArrayViewIterator]", () => {
    const sourceArray = [1, 2, 3, 4, 5, 6, 7, 8, 9];
    it("step +1 and start < stop", (done) => {
        const viewIterator = new ArrayViewIterator_1.default(sourceArray, 1, 5, +1);
        const expected = [2, 3, 4, 5, 6];
        let currentRead = 0;
        viewIterator.each((str) => {
            expect(expected[currentRead++]).toBe(str);
        });
        viewIterator.on("end", () => {
            expect(currentRead).toBe(expected.length);
            done();
        });
    });
    it("step +1 and start > stop", (done) => {
        const viewIterator = new ArrayViewIterator_1.default(sourceArray, 5, 1, +1);
        const each = jest.fn();
        viewIterator.each(each);
        viewIterator.on("end", () => {
            expect(each).not.toHaveBeenCalled();
            done();
        });
    });
    it("step -1 and start > stop", (done) => {
        const viewIterator = new ArrayViewIterator_1.default(sourceArray, 5, 1, -1);
        const expected = [2, 3, 4, 5, 6];
        let currentRead = expected.length - 1;
        viewIterator.each((str) => {
            expect(expected[currentRead--]).toBe(str);
        });
        viewIterator.on("end", () => {
            expect(currentRead).toBe(-1);
            done();
        });
    });
    it("step -1 and start < stop", (done) => {
        const viewIterator = new ArrayViewIterator_1.default(sourceArray, 1, 5, -1);
        const each = jest.fn();
        viewIterator.each(each);
        viewIterator.on("end", () => {
            expect(each).not.toHaveBeenCalled();
            done();
        });
    });
});
//# sourceMappingURL=ArrayViewIterator.test.js.map