"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const uri_1 = __importDefault(require("../uri/uri"));
const constants_1 = require("../uri/constants");
class SingleThingViewResult {
    addEntity(entity) {
        this.contents = entity;
    }
    getContents() {
        return this.contents;
    }
}
class IndexThingViewResult {
    constructor() {
        this.contents = {};
    }
    addEntity(entity) {
        this.contents[entity.id] = entity;
    }
    getContents() {
        return this.contents;
    }
}
class ThingView {
    constructor(entityType) {
        this.entityType = entityType;
        this.filters = [];
        this.mappings = {};
        this.nestedViews = {};
        this.showId = true;
        this.reset();
    }
    reset() {
        this.resultObject = this.createResultObject();
    }
    addEntity(entity) {
        this.resultObject.addEntity(entity);
    }
    getContents() {
        return this.resultObject.getContents();
    }
    hideId() {
        this.showId = false;
    }
    addFilter(fn) {
        this.filters.push(fn);
    }
    addMapping(from, to, view) {
        this.mappings[from] = to;
        this.nestedViews[from] = view;
    }
    _filter(entity) {
        let ok = true;
        for (let fn of this.filters) {
            if (!fn(entity)) {
                ok = false;
                break;
            }
        }
        return ok;
    }
    _makeList(element) {
        let current = element;
        let list = [current[uri_1.default.inNS(constants_1.RDF, "first")]];
        let rest = current[uri_1.default.inNS(constants_1.RDF, "rest")];
        while (rest && rest !== uri_1.default.inNS(constants_1.RDF, "nil")) {
            current = rest;
            list.push(current[uri_1.default.inNS(constants_1.RDF, "first")]);
            rest = current[uri_1.default.inNS(constants_1.RDF, "rest")];
        }
        return list;
    }
    _flattenLists(entity) {
        for (const kv of Object.entries(entity)) {
            let [field, entityValue] = kv;
            if (Array.isArray(entityValue)) {
                for (let valueElementIndex in entityValue) {
                    let valueElement = entityValue[valueElementIndex];
                    if (valueElement[uri_1.default.inNS(constants_1.RDF, "first")]) {
                        let list = this._makeList(valueElement);
                        entityValue[valueElementIndex] = list;
                    }
                }
            }
            if (entityValue[uri_1.default.inNS(constants_1.RDF, "first")]) {
                // this value should become an array
                entity[field] = this._makeList(entityValue);
            }
        }
    }
    _map(entity) {
        this._flattenLists(entity);
        let result;
        if (this.showId) {
            result = this.entityType(entity.id);
        }
        else {
            result = this.entityType();
        }
        for (const kv of Object.entries(entity)) {
            let [field, value] = kv;
            let fieldView = this.nestedViews[field];
            if (fieldView) {
                if (Array.isArray(value)) {
                    value = value.map((v) => fieldView.process(v));
                }
                else {
                    value = fieldView.process(value);
                }
            }
            let destinationField = this.mappings[field];
            if (destinationField) {
                result[destinationField] = value;
            }
        }
        return result;
    }
    process(entity) {
        if (this._filter(entity)) {
            return this._map(entity);
        }
    }
    createResultObject() {
        return new SingleThingViewResult();
    }
}
exports.ThingView = ThingView;
class IndexThingView extends ThingView {
    createResultObject() {
        return new IndexThingViewResult();
    }
}
exports.IndexThingView = IndexThingView;
//# sourceMappingURL=views.js.map