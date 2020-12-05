"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("jest");
const demo_1 = __importDefault(require("./demo"));
test("demo", async () => {
    jest.setTimeout(90000);
    const result = await demo_1.default(false);
    expect(result).toEqual(true);
});
//# sourceMappingURL=demo.test.js.map