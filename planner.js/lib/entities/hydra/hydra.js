"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HydraEntity = void 0;
class HydraEntity {
    constructor(id) {
        this.id = id;
    }
    static create(id) {
        return new HydraEntity(id);
    }
}
exports.HydraEntity = HydraEntity;
//# sourceMappingURL=hydra.js.map