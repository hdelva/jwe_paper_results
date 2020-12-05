"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class ProfileRule {
    static create(id) {
        return new ProfileRule(id);
    }
    constructor(url) {
        this.id = url;
    }
    getID() {
        return this.id;
    }
}
exports.default = ProfileRule;
//# sourceMappingURL=Rule.js.map