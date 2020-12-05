"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class ProfileValueReference {
    static create(id) {
        return new ProfileValueReference(id);
    }
    constructor(id) {
        this.id = id;
    }
    getID() {
        return this.id;
    }
    resolve(element) {
        return element[this.from];
    }
}
exports.default = ProfileValueReference;
//# sourceMappingURL=ProfileValueReference.js.map