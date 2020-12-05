"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const bus_train_1 = __importDefault(require("../../configs/bus_train"));
const Planner_1 = __importDefault(require("./Planner"));
class DelijnNmbsPlanner extends Planner_1.default {
    constructor() {
        super(bus_train_1.default);
    }
}
exports.default = DelijnNmbsPlanner;
//# sourceMappingURL=DelijnNmbsPlanner.js.map