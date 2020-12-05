"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class ProfileRule {
    static create(id) {
        return new ProfileRule(id);
    }
    constructor(id) {
        this.id = id;
    }
    getID() {
        return this.id;
    }
}
exports.default = ProfileRule;
//# sourceMappingURL=ProfileRule.js.map