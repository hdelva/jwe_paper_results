"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HydraTemplate = void 0;
const uriTemplates = require("uri-templates");
class HydraTemplate {
    constructor(id) {
        this.id = id;
    }
    static create(id) {
        return new HydraTemplate(id);
    }
    fill(values) {
        const template = uriTemplates(this.template);
        const params = {};
        for (const mapping of this.mappings) {
            if (values[mapping.property]) {
                params[mapping.variable] = values[mapping.property];
            }
        }
        return template.fill(params);
    }
}
exports.HydraTemplate = HydraTemplate;
//# sourceMappingURL=search.js.map