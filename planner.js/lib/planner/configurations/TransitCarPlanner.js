"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const transit_car_1 = __importDefault(require("../../configs/transit_car"));
const Planner_1 = __importDefault(require("./Planner"));
class TransitCarPlanner extends Planner_1.default {
    constructor() {
        super(transit_car_1.default);
        this.setProfileID("http://hdelva.be/profile/car");
    }
    query(query) {
        query.roadNetworkOnly = true;
        return super.query(query);
    }
}
exports.default = TransitCarPlanner;
//# sourceMappingURL=TransitCarPlanner.js.map