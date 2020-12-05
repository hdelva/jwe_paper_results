"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("jest");
const ExpandingIterator_1 = __importDefault(require("./ExpandingIterator"));
describe("[ExpandingIterator]", () => {
    it("async push", (done) => {
        const expandingIterator = new ExpandingIterator_1.default();
        const expected = [1, 2, 3, 4, 5, 6, 8];
        let currentWrite = 0;
        let currentRead = 0;
        const interval = setInterval(() => {
            // console.log("Writing", expected[currentWrite]);
            expandingIterator.write(expected[currentWrite]);
            if (++currentWrite === expected.length) {
                // console.log("Closing");
                expandingIterator.close();
                clearInterval(interval);
            }
        }, 1);
        expandingIterator.each((str) => {
            // console.log("Reading", str);
            expect(expected[currentRead++]).toBe(str);
        });
        expandingIterator.on("end", () => done());
    });
    it("sync push", (done) => {
        const expandingIterator = new ExpandingIterator_1.default();
        const expected = [1, 2, 3, 4, 5, 6, 8];
        let currentWrite = 0;
        let currentRead = 0;
        for (; currentWrite < expected.length; currentWrite++) {
            // console.log("Writing", expected[currentWrite]);
            expandingIterator.write(expected[currentWrite]);
        }
        expandingIterator.close();
        expandingIterator.each((str) => {
            // console.log("Reading", str);
            expect(expected[currentRead++]).toBe(str);
        });
        expandingIterator.on("end", () => done());
    });
    it("mixed push", (done) => {
        const expandingIterator = new ExpandingIterator_1.default();
        const expected = [1, 2, 3, 4, 5, 6, 8];
        let currentWrite = 0;
        let currentRead = 0;
        for (; currentWrite < 3; currentWrite++) {
            // console.log("Writing", expected[currentWrite]);
            expandingIterator.write(expected[currentWrite]);
        }
        const interval = setInterval(() => {
            // console.log("Writing", expected[currentWrite]);
            expandingIterator.write(expected[currentWrite]);
            if (++currentWrite < expected.length) {
                // console.log("Writing", expected[currentWrite]);
                expandingIterator.write(expected[currentWrite]);
            }
            else {
                // console.log("Closing");
                expandingIterator.close();
                clearInterval(interval);
            }
            if (++currentWrite === expected.length) {
                // console.log("Closing");
                expandingIterator.close();
                clearInterval(interval);
            }
        }, 1);
        expandingIterator.each((str) => {
            // console.log("Reading", str);
            expect(expected[currentRead++]).toBe(str);
        });
        expandingIterator.on("end", () => done());
    });
});
//# sourceMappingURL=ExpandingIterator.test.js.map