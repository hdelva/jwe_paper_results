"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Dataset = void 0;
class Dataset {
    constructor(id) {
        this.id = id;
    }
    static create(id) {
        return new Dataset(id);
    }
}
exports.Dataset = Dataset;
//# sourceMappingURL=dataset.js.map