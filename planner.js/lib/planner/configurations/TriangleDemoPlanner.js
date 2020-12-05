"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const triangle_demo_1 = __importDefault(require("../../configs/triangle_demo"));
const Planner_1 = __importDefault(require("./Planner"));
class TriangleDemoPlanner extends Planner_1.default {
    constructor() {
        super(triangle_demo_1.default);
    }
}
exports.default = TriangleDemoPlanner;
//# sourceMappingURL=TriangleDemoPlanner.js.map