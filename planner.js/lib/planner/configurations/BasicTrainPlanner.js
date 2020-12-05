"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const basic_train_1 = __importDefault(require("../../configs/basic_train"));
const Planner_1 = __importDefault(require("./Planner"));
class BasicTrainPlanner extends Planner_1.default {
    constructor() {
        super(basic_train_1.default);
    }
}
exports.default = BasicTrainPlanner;
//# sourceMappingURL=BasicTrainPlanner.js.map