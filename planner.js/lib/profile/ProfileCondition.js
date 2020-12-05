"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class ProfileCondition {
    static create(id) {
        return new ProfileCondition(id);
    }
    constructor(id) {
        this.id = id;
    }
    getID() {
        return this.id;
    }
}
exports.default = ProfileCondition;
//# sourceMappingURL=ProfileCondition.js.map