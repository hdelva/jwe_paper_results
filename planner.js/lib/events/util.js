"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const inversify_config_1 = __importDefault(require("../inversify.config"));
const types_1 = __importDefault(require("../types"));
function getEventBus() {
    return inversify_config_1.default.get(types_1.default.EventBus);
}
exports.default = getEventBus;
//# sourceMappingURL=util.js.map