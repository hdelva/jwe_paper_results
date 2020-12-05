"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("jest");
const Units_1 = __importDefault(require("./Units"));
test("[Units] toSpeed", () => {
    const distance = 10000;
    const duration = 3600000;
    const speed = Units_1.default.toSpeed(distance, duration);
    expect(speed).toBeDefined();
    expect(speed).toEqual(10);
});
test("[Units] toDuration", () => {
    const distance = 10000;
    const speed = 10;
    const duration = Units_1.default.toDuration(distance, speed);
    expect(duration).toBeDefined();
    expect(duration).toEqual(3600000);
});
test("[Units] toDistance", () => {
    const duration = 3600000;
    const speed = 10;
    const distance = Units_1.default.toDistance(speed, duration);
    expect(distance).toBeDefined();
    expect(distance).toEqual(10000);
});
test("[Units] fromHour", () => {
    const duration = Units_1.default.fromHours(1);
    expect(duration).toBeDefined();
    expect(duration).toEqual(3600000);
});
test("[Units] fromSeconds", () => {
    const duration = Units_1.default.fromSeconds(2);
    expect(duration).toBeDefined();
    expect(duration).toEqual(2000);
});
//# sourceMappingURL=Units.test.js.map